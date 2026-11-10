"""Trusted production publisher. No application code is imported or executed on host."""
import os
import re
import urllib.parse
import urllib.request
import urllib.error
import base64
import hashlib
import json
from pathlib import Path
import subprocess
import sys


def migration_manifest(root):
    journal = json.loads((root / 'drizzle/meta/_journal.json').read_text())
    require(bool(journal['entries']), 'Empty migration journal')
    paths = {'drizzle.config.ts', 'drizzle/meta/_journal.json'}
    for entry in journal['entries']:
        require(re.fullmatch('[A-Za-z0-9_-]+', entry['tag']) is not None, 'Invalid migration tag')
        paths.add(f'drizzle/{entry["tag"]}.sql')
    paths.update(str(path.relative_to(root)) for path in (root/'drizzle').glob('*.sql'))
    result = {}
    for name in sorted(paths):
        path = root / name
        require(not path.is_symlink() and path.stat().st_size > 0, 'Invalid migration file')
        result[name] = hashlib.sha256(path.read_bytes()).hexdigest()
    return result


def request_json(url, headers):
    # Do not forward credentials through redirects or expose HTTP bodies/errors.
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None
    opener = urllib.request.build_opener(NoRedirect)
    with opener.open(urllib.request.Request(url, headers=headers), timeout=30) as response:
        return json.load(response)


def github_api(path):
    return request_json(f'https://api.github.com/repos/{REPO}/{path}', {
        'Authorization': 'Bearer ' + os.environ['GH_TOKEN'],
        'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28'})


def registry_absent(image, tag):
    repository = image.removeprefix('ghcr.io/')
    credentials = base64.b64encode((os.environ['GITHUB_ACTOR'] + ':' + os.environ['GH_TOKEN']).encode()).decode()
    token = request_json('https://ghcr.io/token?' + urllib.parse.urlencode({
        'service':'ghcr.io', 'scope':f'repository:{repository}:pull'}),
        {'Authorization':'Basic ' + credentials})
    bearer = token.get('token') or token.get('access_token')
    require(isinstance(bearer, str) and bool(bearer), 'Registry authentication failed')
    try:
        request_json(f'https://ghcr.io/v2/{repository}/manifests/{tag}', {
            'Authorization':'Bearer ' + bearer,
            'Accept':'application/vnd.oci.image.index.v1+json, application/vnd.oci.image.manifest.v1+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.docker.distribution.manifest.v2+json'})
        status = 200
    except urllib.error.HTTPError as error:
        status = error.code
    require_absent(status)


def command(*args):
    # Never hand GitHub credentials to Docker build processes or source commands.
    env = {k:v for k,v in os.environ.items() if k not in {'GH_TOKEN','GITHUB_TOKEN','RELEASE_SHA'}}
    return subprocess.check_output(args, text=True, env=env).strip()


def state_path():
    return Path(os.environ['RUNNER_TEMP']) / 'production-state.json'


def labels(sha, base, title):
    return {'org.opencontainers.image.revision':sha,
            'org.opencontainers.image.source':f'https://github.com/{REPO}',
            'org.opencontainers.image.title':title,
            'org.opencontainers.image.base.name':base,
            'org.opencontainers.image.base.digest':base.split('@')[1]}


def check_image(image, expected):
    info = json.loads(command('docker', 'image', 'inspect', image))[0]
    require(info['Os'] == 'linux' and info['Architecture'] == 'amd64', 'Wrong image platform')
    require(all(info['Config']['Labels'].get(k) == v for k,v in expected.items()), 'Image labels mismatch')
    return info['Id']


OFFLINE = ['--rm', '--network', 'none', '--read-only', '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges']
IMAGES = [('ghcr.io/lespacito/parlons-violence-production-app', 'runner', 'Parlons Violence production application'),
          ('ghcr.io/lespacito/parlons-violence-production-migrate', 'builder', 'Parlons Violence production migrations')]


def prepare():
    sha = context(os.environ)
    identity = verify_ci(github_api, sha)
    state_path().write_text(json.dumps({'sha':sha, 'ci':identity}))
    with open(os.environ['GITHUB_ENV'], 'a') as stream:
        stream.write(f'SOURCE_SHA={sha}\n')
    with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as stream:
        stream.write(f'\nVerified Playwright push CI: {identity[0]} / attempt {identity[1]}; release `{sha}`.\n')


def build():
    sha = context(os.environ)
    state = json.loads(state_path().read_text())
    require(sha == state['sha'], 'Release changed')
    source = Path('source')
    require(command('git','-C',str(source),'rev-parse','HEAD') == sha, 'Source mismatch')
    require(not command('git','-C',str(source),'status','--porcelain','--untracked-files=all'), 'Dirty source')
    dockerfile = (source/'Dockerfile').read_text()
    require(dockerfile.splitlines()[0] == 'FROM oven/bun:1-alpine AS base', 'Base contract changed')
    for line in ['FROM base AS builder','FROM base AS runner', 'ARG VITE_APP_URL', 'ARG VITE_BETTER_AUTH_URL']:
        require(line in dockerfile.splitlines(), 'Dockerfile contract changed')
    require((source/'bun.lock').stat().st_size > 0, 'Lockfile missing')
    manifest = migration_manifest(source)
    index = json.loads(command('docker','buildx','imagetools','inspect','--raw','oven/bun:1.4.2-alpine'))
    manifests = [m['digest'] for m in index['manifests'] if m.get('platform',{}).get('os') == 'linux' and m['platform'].get('architecture') == 'amd64']
    require(len(manifests) == 1 and re.fullmatch('sha256:[0-9a-f]{64}', manifests[0]), 'Ambiguous amd64 base')
    base = 'docker.io/oven/bun@' + manifests[0]
    command('docker','pull','--platform','linux/amd64',base)
    require(command('docker','run',*OFFLINE,'--entrypoint','bun',base,'--version') == '1.4.2', 'Wrong base Bun')
    run_tag = f'sha-{sha}-run-{os.environ["GITHUB_RUN_ID"]}-attempt-{os.environ["GITHUB_RUN_ATTEMPT"]}'
    state.update(base=base, tags=[run_tag, f'sha-{sha}'], images=[])
    common = ['--platform','linux/amd64','--load','--provenance=false','--file','source/Dockerfile',
              '--build-context', f'oven/bun:1-alpine=docker-image://{base}']
    for arg in ['VITE_APP_NAME=Parlons Violence','VITE_APP_URL=https://parlonsviolence.ch','VITE_BETTER_AUTH_URL=https://parlonsviolence.ch','VITE_ENABLE_OAUTH=false']:
        common += ['--build-arg',arg]
    for image, target, title in IMAGES:
        expected = labels(sha,base,title)
        flags = [part for pair in expected.items() for part in ('--label', '='.join(pair))]
        command('docker','buildx','build',*common,*flags,'--target',target,'--tag',f'{image}:{run_tag}','source')
        local_id = check_image(f'{image}:{run_tag}', expected)
        require(command('docker','run',*OFFLINE,'--entrypoint','bun',f'{image}:{run_tag}','--version') == '1.4.2', 'Wrong target Bun')
        if target == 'builder':
            script = r'''
const fs = require('node:fs'); const crypto = require('node:crypto'); const assert = require('node:assert/strict');
const kit = JSON.parse(fs.readFileSync('/app/node_modules/drizzle-kit/package.json','utf8'));
assert(kit.name === 'drizzle-kit' && kit.version);
fs.accessSync('/app/node_modules/.bin/drizzle-kit', fs.constants.X_OK);
const files = ['drizzle.config.ts','drizzle/meta/_journal.json', ...fs.readdirSync('/app/drizzle').filter(x=>x.endsWith('.sql')).map(x=>'drizzle/'+x)];
console.log(JSON.stringify(Object.fromEntries(files.sort().map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync('/app/'+p)).digest('hex')]))));
'''
            actual = json.loads(command('docker','run',*OFFLINE,'--entrypoint','bun',f'{image}:{run_tag}','-e',script))
            require(actual == manifest, 'Migration payload differs from exact source')
        state['images'].append(dict(image=image, labels=expected, local_id=local_id))
    state_path().write_text(json.dumps(state))
    with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as stream:
        stream.write(f'\nVerified base Bun 1.4.2: `{base}`; linux/amd64. Migration source manifest (SHA-256):\n```json\n{json.dumps(manifest, sort_keys=True, indent=2)}\n```\n')


def publish():
    sha = context(os.environ)
    state = json.loads(state_path().read_text())
    require(sha == state['sha'] and len(state['images']) == 2, 'Incomplete build')
    frozen = tuple(state['ci'])
    verify_ci(github_api, sha, frozen)
    for entry in state['images']:
        for tag in state['tags']:
            registry_absent(entry['image'], tag)
    # Registry lacks atomic create-if-absent: restrict external package writers.
    for entry in state['images']:
        image = entry['image']
        original = f'{image}:{state["tags"][0]}'
        require(check_image(original,entry['labels']) == entry['local_id'], 'Local image changed')
        for tag in state['tags']:
            ref = f'{image}:{tag}'
            command('docker','tag',original,ref)
            registry_absent(image,tag)
            verify_ci(github_api,sha,frozen)  # immediately before EVERY push
            with open(os.environ['GITHUB_STEP_SUMMARY'],'a') as summary:
                summary.write(f'\nPush attempted: `{ref}` (not yet verified).\n')
            command('docker','push',ref)
            digest = command('docker','buildx','imagetools','inspect',ref,'--format','{{.Manifest.Digest}}')
            require(re.fullmatch('sha256:[0-9a-f]{64}',digest), 'Invalid registry digest')
            require(entry.get('digest',digest) == digest, 'Tags resolve to different manifests')
            entry['digest'] = digest
            immutable = f'{image}@{digest}'
            command('docker','pull','--platform','linux/amd64',immutable)
            require(check_image(immutable,entry['labels']) == entry['local_id'], 'Registry image differs from verified local build')
            with open(os.environ['GITHUB_STEP_SUMMARY'],'a') as summary:
                summary.write(f'\nVerified `{ref}` → `{immutable}`; linux/amd64, source/base/title labels verified.\n')


def main():
    try:
        {'prepare':prepare, 'build':build, 'publish':publish}[sys.argv[1]]()
    except Exception:
        # HTTP errors and subprocess exceptions may contain sensitive data.
        print('::error::Production publisher failed closed; no exception body or credentials logged.')
        raise SystemExit(1)


def verify_ci(api, sha, frozen=None):
    require(api('git/ref/heads/dev')['object']['sha'] == sha, 'dev advanced')
    workflow = api('actions/workflows/playwright.yml')
    require(workflow['path'] == WORKFLOW and workflow['name'] == 'Playwright Tests'
            and workflow['state'] == 'active', 'Wrong CI workflow')
    query = urllib.parse.urlencode(dict(branch='dev', event='push', head_sha=sha, per_page=1))
    runs = api(f'actions/workflows/{workflow["id"]}/runs?{query}')['workflow_runs']
    require(bool(runs), 'No CI for release')
    run = api(f'actions/runs/{runs[0]["id"]}')
    require(run['id'] == runs[0]['id'] and run['workflow_id'] == workflow['id']
            and run['path'] == WORKFLOW, 'CI identity mismatch')
    require(run['head_repository']['full_name'] == REPO and run['event'] == 'push'
            and run['head_branch'] == 'dev' and run['head_sha'] == sha, 'CI source mismatch')
    require(run['status'] == 'completed' and run['conclusion'] == 'success', 'Latest CI not successful')
    identity = (str(run['id']), str(run['run_attempt']))
    require(frozen is None or identity == frozen, 'CI run/attempt changed')
    require(api('git/ref/heads/dev')['object']['sha'] == sha, 'dev advanced during check')
    return identity


def require_absent(status):
    require(status == 404, f'Cannot prove registry tag absent (HTTP {status})')

REPO = 'lespacito/tss-explore-forum'
WORKFLOW = '.github/workflows/playwright.yml'


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def context(env):
    require(env.get('GITHUB_REPOSITORY') == REPO, 'Unexpected repository')
    require(env.get('GITHUB_REF') == 'refs/heads/master', 'Dispatch must target master')
    require(env.get('GITHUB_EVENT_NAME') == 'workflow_dispatch', 'Manual dispatch only')
    sha = env.get('RELEASE_SHA', '')
    require(re.fullmatch('[0-9a-f]{40}', sha) is not None, 'Invalid release SHA')
    return sha


if __name__ == '__main__':
    main()
