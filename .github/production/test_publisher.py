import importlib.util
from pathlib import Path
import unittest
from unittest import mock
import json
import os
import tempfile

ROOT = Path(__file__).resolve().parent

class ContextTests(unittest.TestCase):
    def test_context_is_fail_closed(self):
        self.assertTrue((ROOT / 'publisher.py').exists(), 'production guard missing')
        spec = importlib.util.spec_from_file_location('publisher', ROOT / 'publisher.py')
        assert spec and spec.loader
        p = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(p)
        good = dict(GITHUB_REPOSITORY='lespacito/tss-explore-forum', GITHUB_REF='refs/heads/master', GITHUB_EVENT_NAME='workflow_dispatch', RELEASE_SHA='a'*40)
        self.assertEqual(p.context(good), 'a'*40)
        for field, values in {'RELEASE_SHA':['a'*39, 'A'*40, 'a'*40+'\n', '../dev', ''], 'GITHUB_REPOSITORY':['fork/repo'], 'GITHUB_REF':['refs/heads/dev'], 'GITHUB_EVENT_NAME':['push','workflow_run']}.items():
            for value in values:
                with self.subTest(field=field, value=value), self.assertRaises(RuntimeError):
                    p.context(dict(good, **{field:value}))

class CITests(unittest.TestCase):
    def setUp(self):
        spec = importlib.util.spec_from_file_location('publisher', ROOT / 'publisher.py')
        assert spec and spec.loader
        self.p = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.p)
        self.sha = 'a'*40
        self.ci_run = dict(id=12, run_attempt=1, workflow_id=7, path=self.p.WORKFLOW, head_repository={'full_name':self.p.REPO}, event='push', head_branch='dev', head_sha=self.sha, status='completed', conclusion='success')
        self.dev = [self.sha, self.sha]
        self.ci_runs = [self.ci_run]

    def api(self, path):
        if path == 'git/ref/heads/dev':
            return {'object':{'sha':self.dev.pop(0)}}
        if path == 'actions/workflows/playwright.yml':
            return dict(id=7, path=self.p.WORKFLOW, name='Playwright Tests', state='active')
        if '/runs?' in path:
            self.assertNotIn('status=', path)  # no old-success fallback
            return {'workflow_runs':self.ci_runs}
        if path == 'actions/runs/12':
            return self.ci_run
        self.fail(path)

    def test_verified_identity_is_frozen(self):
        self.assertTrue(hasattr(self.p, 'verify_ci'), 'CI guard missing')
        self.assertEqual(self.p.verify_ci(self.api, self.sha), ('12','1'))

    def test_negative_ci_and_rechecks(self):
        self.assertTrue(hasattr(self.p, 'verify_ci'), 'CI guard missing')
        for field, value in [('conclusion','failure'),('status','in_progress'),('head_sha','b'*40),('workflow_id',99),('path','other.yml'),('event','pull_request'),('head_branch','master'),('head_repository',{'full_name':'fork/repo'})]:
            self.setUp()
            self.ci_run[field] = value
            with self.subTest(field=field), self.assertRaises(RuntimeError):
                self.p.verify_ci(self.api, self.sha)
        for dev in [['b'*40], [self.sha,'b'*40]]:
            self.setUp()
            self.dev = dev
            with self.assertRaises(RuntimeError):
                self.p.verify_ci(self.api, self.sha)
        for frozen in [('11','1'), ('12','2')]:
            self.setUp()
            with self.assertRaises(RuntimeError):
                self.p.verify_ci(self.api, self.sha, frozen)
        self.setUp()
        self.ci_runs = []
        with self.assertRaises(RuntimeError):
            self.p.verify_ci(self.api, self.sha)
        self.setUp()
        # The latest is pending; an older success must never rescue it.
        self.ci_run['status'] = 'queued'
        self.ci_runs.append(dict(self.ci_run, id=11, status='completed'))
        with self.assertRaises(RuntimeError):
            self.p.verify_ci(self.api, self.sha)

    def test_collision_only_404_means_absent(self):
        self.assertTrue(hasattr(self.p, 'require_absent'), 'registry guard missing')
        self.p.require_absent(404)
        for status in [200, 401, 403, 429, 500, 0]:
            with self.subTest(status=status), self.assertRaises(RuntimeError):
                self.p.require_absent(status)

class ArtifactTests(unittest.TestCase):
    def test_manifest_hashes_all_sql_and_config(self):
        import tempfile
        spec = importlib.util.spec_from_file_location('publisher', ROOT / 'publisher.py')
        assert spec and spec.loader
        p = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(p)
        self.assertTrue(hasattr(p, 'migration_manifest'), 'manifest verifier missing')
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root/'drizzle/meta').mkdir(parents=True)
            (root/'drizzle.config.ts').write_text('config')
            (root/'drizzle/meta/_journal.json').write_text('{"entries":[{"tag":"0000_init"}]}')
            sql = root/'drizzle/0000_init.sql'
            sql.write_text('SELECT 1;')
            before = p.migration_manifest(root)
            self.assertIn('drizzle/0000_init.sql', before)
            sql.write_text('SELECT 2;')
            self.assertNotEqual(before, p.migration_manifest(root))
            sql.unlink()
            with self.assertRaises((RuntimeError, FileNotFoundError)):
                p.migration_manifest(root)

    def test_workflow_contract(self):
        import yaml  # explicit pinned test dependency: requirements-tests.txt
        workflow = ROOT.parent/'workflows/production-ghcr.yml'
        self.assertTrue(workflow.exists(), 'production YAML missing')
        doc = yaml.load(workflow.read_text(), Loader=yaml.BaseLoader)
        self.assertEqual(set(doc['on']), {'workflow_dispatch'})
        self.assertEqual(doc['on']['workflow_dispatch']['inputs']['release_sha']['required'], 'true')
        self.assertEqual(doc['permissions'], {'contents':'read','actions':'read','packages':'write'})
        self.assertEqual(doc['concurrency']['cancel-in-progress'], 'false')
        job = doc['jobs']['publish']
        self.assertEqual(job['runs-on'], 'ubuntu-26.04')
        self.assertIn("github.ref == 'refs/heads/master'", job['if'])
        self.assertIn("github.repository == 'lespacito/tss-explore-forum'", job['if'])
        steps = job['steps']
        self.assertEqual(steps[0]['with']['ref'], '${{ github.sha }}')
        self.assertEqual(steps[0]['with']['path'], 'trusted')
        self.assertIn('trusted/.github/production/publisher.py', str(steps))
        checks = yaml.load((ROOT.parent/'workflows/production-ghcr-checks.yml').read_text(), Loader=yaml.BaseLoader)
        self.assertEqual(checks['permissions'], {'contents':'read'})
        self.assertEqual(checks['on']['pull_request']['branches'], ['master'])
        for text in [workflow.read_text(), (ROOT/'publisher.py').read_text()]:
            for forbidden in ['workflow_run:', 'docker compose', 'dokploy', 'ssh ', 'db:migrate', 'gh pr ', 'curl ']:
                self.assertNotIn(forbidden, text)
        for step in steps:
            if 'uses' in step:
                self.assertRegex(step['uses'], r'@[0-9a-f]{40}$')
        self.assertTrue(hasattr(publisher_module(), 'publish'), 'publisher orchestration missing')


class ExecutionTests(unittest.TestCase):
    def test_registry_http_status_and_credentials_stay_in_process(self):
        import urllib.error
        from email.message import Message
        p = publisher_module()
        for status in [200,404,401,403,429,500]:
            calls = []
            def get(url, headers):
                calls.append((url,headers))
                if '/token?' in url:
                    return {'token':'synthetic-test-bearer'}
                if status != 200:
                    raise urllib.error.HTTPError(url,status,'synthetic',Message(),None)
                return {}
            with self.subTest(status=status), mock.patch.dict(os.environ, GH_TOKEN='synthetic-test-token', GITHUB_ACTOR='test'), mock.patch.object(p,'request_json',side_effect=get):
                if status == 404:
                    p.registry_absent(p.IMAGES[0][0],'sha-'+'a'*40)
                else:
                    with self.assertRaises(RuntimeError):
                        p.registry_absent(p.IMAGES[0][0],'sha-'+'a'*40)
                self.assertTrue(all('synthetic-test' not in url for url,_ in calls))
                self.assertEqual(calls[1][1]['Authorization'], 'Bearer synthetic-test-bearer')

    def test_publish_rechecks_before_each_push_and_reports_real_results_only(self):
        p = publisher_module()
        with tempfile.TemporaryDirectory() as tmp:
            env = dict(GITHUB_REPOSITORY=p.REPO,GITHUB_REF='refs/heads/master',GITHUB_EVENT_NAME='workflow_dispatch',RELEASE_SHA='a'*40,RUNNER_TEMP=tmp,GITHUB_STEP_SUMMARY=tmp+'/summary')
            state = {'sha':'a'*40,'ci':['12','1'],'tags':['run','sha'],'images':[{'image':image,'labels':{},'local_id':'local'} for image,_,_ in p.IMAGES]}
            Path(tmp+'/production-state.json').write_text(json.dumps(state))
            events = []
            def command(*args):
                events.append(args)
                if args[:4] == ('docker','buildx','imagetools','inspect'):
                    return 'sha256:'+'b'*64
                return ''
            def ci(*args):
                events.append(('ci',))
            def absent(*args):
                events.append(('absent',)+args)
            with mock.patch.dict(os.environ,env), mock.patch.object(p,'command',side_effect=command), mock.patch.object(p,'check_image',return_value='local'), mock.patch.object(p,'verify_ci',side_effect=ci), mock.patch.object(p,'registry_absent',side_effect=absent):
                p.publish()
            pushes = [i for i,event in enumerate(events) if event[:2] == ('docker','push')]
            self.assertEqual(len(pushes),4)
            for i in pushes:
                self.assertEqual(events[i-1],('ci',))
                self.assertEqual(events[i-2][0],'absent')
            self.assertEqual(Path(tmp+'/summary').read_text().count('Verified `'),4)
            self.assertEqual(Path(tmp+'/summary').read_text().count('@sha256:'),4)
            # Any registry collision stops before the first push.
            events.clear()
            with mock.patch.dict(os.environ,env), mock.patch.object(p,'command',side_effect=command), mock.patch.object(p,'verify_ci'), mock.patch.object(p,'registry_absent',side_effect=RuntimeError('collision')):
                with self.assertRaises(RuntimeError):
                    p.publish()
            self.assertFalse(any(event[:2] == ('docker','push') for event in events))

    def test_partial_push_failure_never_invents_digest(self):
        p = publisher_module()
        with tempfile.TemporaryDirectory() as tmp:
            env = dict(GITHUB_REPOSITORY=p.REPO,GITHUB_REF='refs/heads/master',GITHUB_EVENT_NAME='workflow_dispatch',RELEASE_SHA='a'*40,RUNNER_TEMP=tmp,GITHUB_STEP_SUMMARY=tmp+'/summary')
            Path(tmp+'/production-state.json').write_text(json.dumps({'sha':'a'*40,'ci':['12','1'],'tags':['run','sha'],'images':[{'image':image,'labels':{},'local_id':'local'} for image,_,_ in p.IMAGES]}))
            def fail_push(*args):
                if args[:2] == ('docker','push'):
                    raise RuntimeError('synthetic failure')
                return ''
            with mock.patch.dict(os.environ,env), mock.patch.object(p,'command',side_effect=fail_push), mock.patch.object(p,'check_image',return_value='local'), mock.patch.object(p,'verify_ci'), mock.patch.object(p,'registry_absent'):
                with self.assertRaises(RuntimeError):
                    p.publish()
            summary = Path(tmp+'/summary').read_text()
            self.assertIn('Push attempted:',summary)
            self.assertNotIn('Verified `',summary)
            self.assertNotIn('@sha256:',summary)

    def test_build_pins_one_amd64_base_and_checks_offline_payload(self):
        p = publisher_module()
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root/'source'
            (source/'drizzle/meta').mkdir(parents=True)
            (source/'drizzle.config.ts').write_text('config')
            (source/'drizzle/meta/_journal.json').write_text('{"entries":[{"tag":"0000_init"}]}')
            (source/'drizzle/0000_init.sql').write_text('SELECT 1;')
            (source/'bun.lock').write_text('lock')
            (source/'Dockerfile').write_text('FROM oven/bun:1-alpine AS base\nFROM base AS builder\nFROM base AS runner\nARG VITE_APP_URL\nARG VITE_BETTER_AUTH_URL\n')
            manifest = p.migration_manifest(source)
            state = root/'production-state.json'
            state.write_text(json.dumps({'sha':'a'*40,'ci':['12','1']}))
            env = dict(GITHUB_REPOSITORY=p.REPO,GITHUB_REF='refs/heads/master',GITHUB_EVENT_NAME='workflow_dispatch',RELEASE_SHA='a'*40,RUNNER_TEMP=tmp,GITHUB_STEP_SUMMARY=tmp+'/summary',GITHUB_RUN_ID='42',GITHUB_RUN_ATTEMPT='1')
            calls = []
            version = ['1.4.2']
            payload = [manifest]
            def command(*args):
                calls.append(args)
                if args[:4] == ('git','-C','source','rev-parse'):
                    return 'a'*40
                if args[-1] == 'oven/bun:1.4.2-alpine':
                    return json.dumps({'manifests':[{'digest':'sha256:'+'b'*64,'platform':{'os':'linux','architecture':'amd64'}}]})
                if args[-1] == '--version':
                    return version[0]
                if args[:2] == ('docker','run') and '-e' in args:
                    return json.dumps(payload[0])
                return ''
            cwd = Path.cwd()
            try:
                os.chdir(tmp)
                with mock.patch.dict(os.environ,env), mock.patch.object(p,'command',side_effect=command), mock.patch.object(p,'check_image',return_value='local'):
                    p.build()
                    self.assertEqual(len(json.loads(state.read_text())['images']),2)
                    builds = [c for c in calls if c[:3] == ('docker','buildx','build')]
                    self.assertEqual(len(builds),2)
                    for c in builds:
                        self.assertIn('oven/bun:1-alpine=docker-image://docker.io/oven/bun@sha256:'+'b'*64,c)
                        self.assertIn('VITE_APP_URL=https://parlonsviolence.ch',c)
                        self.assertNotIn('--push',c)
                    for c in calls:
                        if c[:2] == ('docker','run'):
                            self.assertEqual(c[c.index('--network')+1],'none')
                    self.assertEqual(sum(c[-1] == 'oven/bun:1.4.2-alpine' for c in calls),1)
                    version[0] = '1.4.4'
                    with self.assertRaises(RuntimeError):
                        p.build()
                    version[0] = '1.4.2'
                    payload[0] = dict(manifest, **{'drizzle/0000_init.sql':'0'*64})
                    with self.assertRaises(RuntimeError):
                        p.build()
            finally:
                os.chdir(cwd)

    def test_wrong_architecture_or_labels_fail(self):
        p = publisher_module()
        expected = p.labels('a'*40,'docker.io/oven/bun@sha256:'+'b'*64,'title')
        info = dict(Id='local',Os='linux',Architecture='amd64',Config={'Labels':dict(expected)})
        with mock.patch.object(p,'command',side_effect=lambda *a: json.dumps([info])):
            self.assertEqual(p.check_image('test',expected),'local')
            info['Architecture'] = 'arm64'
            with self.assertRaises(RuntimeError):
                p.check_image('test',expected)
            info['Architecture'] = 'amd64'
            for label in expected:
                info['Config']['Labels'] = dict(expected, **{label:'wrong'})
                with self.subTest(label=label), self.assertRaises(RuntimeError):
                    p.check_image('test',expected)

    def test_subprocess_never_receives_tokens(self):
        p = publisher_module()
        with mock.patch.dict(os.environ,GH_TOKEN='synthetic',GITHUB_TOKEN='synthetic'), mock.patch.object(p.subprocess,'check_output',return_value='ok') as run:
            self.assertEqual(p.command('docker','version'),'ok')
            self.assertNotIn('GH_TOKEN',run.call_args.kwargs['env'])
            self.assertNotIn('GITHUB_TOKEN',run.call_args.kwargs['env'])
            self.assertNotIn('synthetic',str(run.call_args.args))

    def test_prepare_and_build_summary_exposes_frozen_ci_and_base(self):
        # Summary metadata must be written from validated state, not invented constants.
        source = (ROOT/'publisher.py').read_text()
        self.assertIn('Verified Playwright push CI:',source)
        self.assertIn('Verified base Bun 1.4.2:',source)


def publisher_module():
    spec = importlib.util.spec_from_file_location('publisher', ROOT / 'publisher.py')
    assert spec and spec.loader
    p = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(p)
    return p

if __name__ == '__main__':
    unittest.main()
