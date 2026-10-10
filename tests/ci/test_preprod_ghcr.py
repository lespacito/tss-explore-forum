"""Exercise the exact trusted guard embedded in the workflow, without network/pushes."""
import copy
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path
import types
import unittest
from unittest.mock import patch

WORKFLOW = Path(__file__).resolve().parents[2] / '.github/workflows/preprod-ghcr.yml'
TEXT = WORKFLOW.read_text()
CODE = TEXT.split("<<'CI_GUARD'\n", 1)[1].split('          CI_GUARD\n', 1)[0]
GUARD = types.ModuleType('guard')
exec('\n'.join(line[10:] for line in CODE.splitlines()), GUARD.__dict__)
SHA = 'a' * 40
REPO = 'lespacito/tss-explore-forum'
RUN = dict(id=123, run_attempt=1, head_sha=SHA, event='push', head_branch='dev',
           status='completed', conclusion='success', workflow_id=456,
           path='.github/workflows/playwright.yml', head_repository={'full_name': REPO})


class GuardTests(unittest.TestCase):
    def setUp(self):
        self.run = copy.deepcopy(RUN)
        self.event = {'action': 'completed', 'workflow_run': copy.deepcopy(RUN)}
        self.tip = SHA
        self.runs = [{'id': 123}]
        self.workflow = dict(id=456, path=RUN['path'], name='Playwright Tests', state='active')
        self.env = patch.dict(os.environ, {'GITHUB_REPOSITORY': REPO,
                              'GITHUB_REF': 'refs/heads/dev', 'GITHUB_SHA': SHA})
        self.env.start()
        self.addCleanup(self.env.stop)
        self.mock = patch.object(GUARD, 'api', side_effect=self.api)
        self.mock.start()
        self.addCleanup(self.mock.stop)

    def api(self, path):
        if path == 'git/ref/heads/dev':
            return {'object': {'sha': self.tip}}
        if path == 'actions/workflows/playwright.yml':
            return self.workflow
        if path.startswith('actions/workflows/456/runs?'):
            self.assertIn('head_sha=' + SHA, path)
            self.assertIn('event=push', path)
            self.assertIn('branch=dev', path)
            return {'workflow_runs': self.runs}
        if path == 'actions/runs/123':
            return self.run
        raise AssertionError(path)

    def verify(self, name='workflow_run', **kwargs):
        return GUARD.verify(name, self.event, **kwargs)

    def test_successful_dev_push_and_manual_use_tested_sha(self):
        self.assertEqual(self.verify(), (SHA, '123', '1'))
        self.assertEqual(self.verify('workflow_dispatch'), (SHA, '123', '1'))
        self.assertEqual(self.verify(source_sha=SHA, ci_run_id='123', ci_attempt='1'), (SHA, '123', '1'))

    def test_refuses_untrusted_or_unsuccessful_completion(self):
        for field, value in [('event', 'pull_request'), ('head_branch', 'master'),
                             ('status', 'in_progress'), ('conclusion', 'failure'),
                             ('head_sha', 'invalid'), ('head_repository', {'full_name': 'attacker/fork'})]:
            with self.subTest(field=field):
                self.event['workflow_run'] = copy.deepcopy(RUN)
                self.event['workflow_run'][field] = value
                with self.assertRaises(RuntimeError):
                    self.verify()
        self.event['action'] = 'requested'
        with self.assertRaises(RuntimeError):
            self.verify()

    def test_refuses_stale_dev(self):
        self.tip = 'b' * 40
        with self.assertRaisesRegex(RuntimeError, 'Obsolete source'):
            self.verify()

    def test_refuses_tip_change_during_api_checks(self):
        original = self.api
        def change_tip(path):
            result = original(path)
            if path == 'actions/runs/123':
                self.tip = 'b' * 40
            return result
        with patch.object(GUARD, 'api', side_effect=change_tip):
            with self.assertRaisesRegex(RuntimeError, 'Obsolete source'):
                self.verify()

    def test_refuses_wrong_latest_run_or_attempt(self):
        for field, value in [('id', 999), ('run_attempt', 2), ('head_sha', 'b' * 40),
                             ('workflow_id', 999), ('path', '.github/workflows/other.yml'),
                             ('event', 'pull_request'), ('head_branch', 'master'),
                             ('head_repository', {'full_name': 'attacker/fork'}),
                             ('status', 'in_progress'), ('conclusion', 'failure'),
                             ('conclusion', 'cancelled'), ('conclusion', 'skipped')]:
            with self.subTest(field=field):
                self.run = copy.deepcopy(RUN)
                self.run[field] = value
                with self.assertRaises(RuntimeError):
                    self.verify()

    def test_manual_requires_latest_successful_push_ci(self):
        for status, conclusion in [('in_progress', None), ('completed', 'failure')]:
            self.run.update(status=status, conclusion=conclusion)
            with self.assertRaises(RuntimeError):
                self.verify('workflow_dispatch')
        self.runs = []
        with self.assertRaisesRegex(RuntimeError, 'No push CI'):
            self.verify('workflow_dispatch')

    def test_recheck_locks_source_run_and_attempt(self):
        for kwargs in [dict(source_sha='b' * 40), dict(ci_run_id='999'), dict(ci_attempt='2')]:
            with self.subTest(kwargs=kwargs), self.assertRaises(RuntimeError):
                self.verify(**kwargs)

    def test_refuses_wrong_repository_manual_branch_and_trigger(self):
        with patch.dict(os.environ, {'GITHUB_REPOSITORY': 'attacker/fork'}):
            with self.assertRaises(RuntimeError):
                self.verify()
        with patch.dict(os.environ, {'GITHUB_REF': 'refs/heads/master'}):
            with self.assertRaises(RuntimeError):
                self.verify('workflow_dispatch')
        with self.assertRaises(RuntimeError):
            self.verify('push')

    def test_refuses_disabled_or_renamed_workflow_and_api_errors(self):
        for field, value in [('state', 'disabled_manually'), ('name', 'Other'), ('path', 'other.yml')]:
            with self.subTest(field=field):
                self.workflow = dict(id=456, path=RUN['path'], name='Playwright Tests', state='active')
                self.workflow[field] = value
                with self.assertRaises(RuntimeError):
                    self.verify()
        with patch.object(GUARD, 'api', side_effect=OSError('API unavailable')):
            with self.assertRaises(OSError):
                self.verify()

    def test_registry_collision_guard_blocks_duplicates_and_fails_closed(self):
        code = TEXT.split("<<'GUARD'\n", 1)[1].split('          GUARD\n', 1)[0]
        code = '\n'.join(line[10:] for line in code.splitlines())
        # Stub curl and jq inside bash: no registry access and no installed tools needed.
        stubs = """
        curl() {
          case " $* " in
            *'/token?'*) printf '%s' '{"token":"test-token"}' ;;
            *) printf '%s' "$TEST_REGISTRY_STATUS" ;;
          esac
        }
        jq() { cat >/dev/null; printf '%s' test-token; }
        """
        env = dict(os.environ, APP_IMAGE='ghcr.io/test/app', MIGRATE_IMAGE='ghcr.io/test/migrate',
                   SHA_TAG='sha-' + SHA, RUN_TAG='run-123', GITHUB_ACTOR='test', GHCR_TOKEN='fake')
        for status, success, message in [('404', True, ''), ('200', False, 'Refusing to overwrite'),
                                         ('401', False, 'Cannot prove absence'),
                                         ('403', False, 'Cannot prove absence'),
                                         ('500', False, 'Cannot prove absence')]:
            with self.subTest(status=status):
                result = subprocess.run(['bash', '-c', stubs + code],
                                        env=dict(env, TEST_REGISTRY_STATUS=status),
                                        capture_output=True, text=True)
                self.assertEqual(result.returncode == 0, success, result.stdout + result.stderr)
                self.assertIn(message, result.stdout)

    def test_buildkit_bootstrap_uses_digest_pinned_hub_mirror(self):
        setup = TEXT.split('      - name: Set up Buildx\n', 1)[1].split('\n      - name:', 1)[0]
        self.assertRegex(setup, r'(?m)^\s+image=moby/buildkit@sha256:[0-9a-f]{64}\s*$')
        self.assertIn('driver-opts:', setup)
        self.assertIn('docker/setup-buildx-action@8d2750c68a42422c14e847fe6c8ac0403b4cbd6f', setup)

    def test_buildkit_daemon_mirror_preserves_settings_and_rejects_invalid_config(self):
        self.assertIn("<<'DOCKER_MIRROR'", TEXT)
        code = TEXT.split("<<'DOCKER_MIRROR'\n", 1)[1].split('          DOCKER_MIRROR\n', 1)[0]
        code = '\n'.join(line[10:] for line in code.splitlines())
        for config in [{}, {'log-driver': 'json-file', 'features': {'containerd-snapshotter': True}},
                       {'registry-mirrors': ['https://other.example', 'https://mirror.gcr.io/']}]:
            with self.subTest(config=config), tempfile.TemporaryDirectory() as directory:
                path = Path(directory) / 'daemon.json'
                path.write_text(json.dumps(config))
                result = subprocess.run([sys.executable, '-c', code, str(path)], capture_output=True, text=True)
                self.assertEqual(result.returncode, 0, result.stderr)
                actual = json.loads(path.read_text())
                self.assertEqual(actual['registry-mirrors'][0], 'https://mirror.gcr.io')
                self.assertEqual({k: v for k, v in actual.items() if k != 'registry-mirrors'},
                                 {k: v for k, v in config.items() if k != 'registry-mirrors'})
                again = subprocess.run([sys.executable, '-c', code, str(path)], capture_output=True, text=True)
                self.assertEqual(again.returncode, 0, again.stderr)
                self.assertEqual(json.loads(path.read_text()), actual)
        for invalid in ['not json', '[]', '{"registry-mirrors":"invalid"}', '{"registry-mirrors":[123]}']:
            with self.subTest(invalid=invalid), tempfile.TemporaryDirectory() as directory:
                path = Path(directory) / 'daemon.json'
                path.write_text(invalid)
                result = subprocess.run([sys.executable, '-c', code, str(path)], capture_output=True, text=True)
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(path.read_text(), invalid)
        self.assertIn('test -z "$(docker ps -q)"', TEXT)
        checks = WORKFLOW.with_name('preprod-ghcr-checks.yml').read_text()
        self.assertIn('Configure the BuildKit mirror on the ephemeral CI runner', checks)

    def test_buildkit_probe_reads_the_publisher_pin_and_fails_closed(self):
        checks = WORKFLOW.with_name('preprod-ghcr-checks.yml').read_text()
        self.assertIn("<<'BUILDKIT_PIN'", checks)
        code = checks.split("<<'BUILDKIT_PIN'\n", 1)[1].split('          BUILDKIT_PIN\n', 1)[0]
        code = '\n'.join(line[10:] for line in code.splitlines())
        image_line = next(line for line in TEXT.splitlines() if 'image=moby/buildkit@' in line)
        expected = image_line.strip().removeprefix('image=')
        cases = [
            ('valid', TEXT, True),
            ('missing', TEXT.replace(image_line, ''), False),
            ('wrong registry', TEXT.replace('image=moby/buildkit@', 'image=other.example/moby/buildkit@'), False),
            ('mutable tag', TEXT.replace(expected, 'moby/buildkit:buildx-stable-1'), False),
            ('malformed digest', TEXT.replace(expected, 'moby/buildkit@sha256:bad'), False),
            ('duplicate', TEXT.replace(image_line, image_line + '\n' + image_line), False),
        ]
        for name, text, succeeds in cases:
            with self.subTest(name=name), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                (root / '.github/workflows').mkdir(parents=True)
                (root / '.github/workflows/preprod-ghcr.yml').write_text(text)
                output = root / 'output'
                result = subprocess.run([sys.executable, '-c', code], cwd=root,
                                        env=dict(os.environ, GITHUB_OUTPUT=str(output)),
                                        capture_output=True, text=True)
                self.assertEqual(result.returncode == 0, succeeds, result.stdout + result.stderr)
                if succeeds:
                    self.assertEqual(output.read_text(), 'image=' + expected + '\n')
                else:
                    self.assertFalse(output.exists())
        self.assertIn('image=${{ steps.buildkit.outputs.image }}', checks)
        self.assertNotIn('packages: write', checks)
        self.assertNotIn('docker push', checks)
        self.assertNotIn('docker buildx build', checks)

    def test_existing_publication_guards_remain(self):
        self.assertIn('group: parlons-violence-preprod-ghcr\n  cancel-in-progress: false', TEXT)
        self.assertIn('ref: ${{ env.SOURCE_SHA }}', TEXT)
        self.assertIn('image.revision=$SOURCE_SHA', TEXT)
        self.assertNotIn('image.revision=$GITHUB_SHA', TEXT)
        self.assertIn('Refusing to overwrite $image:$tag', TEXT)
        self.assertIn('Cannot prove absence of $image:$tag', TEXT)
        self.assertIn('test "$sha_digest" = "$run_digest"', TEXT)
        for tag in ['RUN_TAG', 'SHA_TAG']:
            self.assertIn('python3 "$RUNNER_TEMP/verify-preprod-ci.py"\n            docker push "$image:$' + tag + '"', TEXT)
        self.assertIn('docker run --rm --network none --read-only --cap-drop ALL', TEXT)


if __name__ == '__main__':
    unittest.main()
