"""Offline tests: no network, deployment hooks, registry, or database access."""
import copy
import io
import importlib.util
import json
import subprocess
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from types import SimpleNamespace
from typing import Any
import unittest
from unittest.mock import patch

SCRIPT = Path(__file__).with_name("admission.py")
SHA = "a" * 40
REPO = "lespacito/tss-explore-forum"


def load_guard():
    spec = importlib.util.spec_from_file_location("staging_admission", SCRIPT)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def fixture() -> dict[str, Any]:
    return dict(
        tip=SHA,
        workflow=dict(id=456, name="Playwright Tests", state="active",
                      path=".github/workflows/playwright.yml"),
        runs=[{"id": 123}],
        run=dict(id=123, run_attempt=1, head_sha=SHA, event="push", head_branch="dev",
                 status="completed", conclusion="success", workflow_id=456,
                 path=".github/workflows/playwright.yml",
                 head_repository={"full_name": REPO}),
    )


class AdmissionTests(unittest.TestCase):
    def setUp(self):
        self.assertTrue(SCRIPT.is_file(), "Missing read-only staging admission guard")
        self.guard = load_guard()
        self.data = fixture()
        self.paths = []

    def api(self, path) -> dict[str, Any]:
        self.paths.append(path)
        if path == "git/ref/heads/dev":
            return {"object": {"sha": self.data["tip"]}}
        if path == "actions/workflows/playwright.yml":
            return copy.deepcopy(self.data["workflow"])
        if path.startswith("actions/workflows/456/runs?"):
            self.assertIn("head_sha=" + SHA, path)
            self.assertIn("branch=dev", path)
            self.assertIn("event=push", path)
            self.assertIn("per_page=1", path)
            return {"workflow_runs": copy.deepcopy(self.data["runs"])}
        if path == "actions/runs/123":
            return copy.deepcopy(self.data["run"])
        self.fail("Unexpected endpoint: " + path)

    def test_successful_current_dev_push_returns_non_deploying_receipt(self):
        receipt = self.guard.evaluate(SHA, self.api)
        self.assertEqual(receipt["source_sha"], SHA)
        self.assertEqual(receipt["ci_run_id"], 123)
        self.assertEqual(receipt["ci_run_attempt"], 1)
        self.assertEqual(receipt["mode"], "dry-run")
        self.assertIs(receipt["deployment_performed"], False)
        self.assertEqual(self.paths.count("git/ref/heads/dev"), 2)

    def test_refuses_invalid_sha_before_api_access(self):
        for value in ["", "A" * 40, "a" * 39, "a" * 41, SHA + "\n", " dev", None, 1]:
            with self.subTest(value=value):
                self.paths.clear()
                with self.assertRaises(RuntimeError):
                    self.guard.evaluate(value, self.api)
                self.assertEqual(self.paths, [])

    def test_refuses_unverified_run_metadata(self):
        for field, value in [
            ("id", 999), ("id", True), ("run_attempt", 0), ("run_attempt", True),
            ("head_sha", "b" * 40), ("event", "pull_request"), ("head_branch", "master"),
            ("status", "queued"), ("status", "in_progress"),
            ("conclusion", "failure"), ("conclusion", "cancelled"),
            ("conclusion", "skipped"), ("conclusion", "neutral"),
            ("workflow_id", 999), ("path", ".github/workflows/other.yml"),
            ("head_repository", {"full_name": "attacker/fork"}),
            ("head_repository", None),
        ]:
            with self.subTest(field=field, value=value):
                self.data = fixture()
                self.data["run"][field] = value
                with self.assertRaises(RuntimeError):
                    self.guard.evaluate(SHA, self.api)

    def test_refuses_stale_tip_before_and_after_ci_reads(self):
        self.data["tip"] = "b" * 40
        with self.assertRaisesRegex(RuntimeError, "dev"):
            self.guard.evaluate(SHA, self.api)
        self.data = fixture()
        original = self.api

        def advance(path):
            result = original(path)
            if path == "actions/runs/123":
                self.data["tip"] = "b" * 40
            return result

        with self.assertRaisesRegex(RuntimeError, "dev"):
            self.guard.evaluate(SHA, advance)

    def test_refuses_untrusted_workflow(self):
        for field, value in [("id", 0), ("id", True), ("state", "disabled_manually"),
                             ("name", "Other"), ("path", "other.yml")]:
            with self.subTest(field=field):
                self.data = fixture()
                self.data["workflow"][field] = value
                with self.assertRaises(RuntimeError):
                    self.guard.evaluate(SHA, self.api)

    def test_refuses_missing_or_malformed_evidence(self):
        for field, value in [("runs", []), ("runs", None), ("runs", [{}]),
                             ("runs", [{"id": "123"}]), ("runs", [{"id": True}]),
                             ("workflow", {}), ("workflow", None),
                             ("run", {}), ("run", None)]:
            with self.subTest(field=field, value=value):
                self.data = fixture()
                self.data[field] = value
                with self.assertRaises(RuntimeError):
                    self.guard.evaluate(SHA, self.api)

    def test_refuses_ci_change_during_admission(self):
        for change in ["new_run", "new_attempt", "rerun_running"]:
            with self.subTest(change=change):
                self.data = fixture()
                counts = {}

                def changing(path):
                    counts[path] = counts.get(path, 0) + 1
                    result = self.api(path)
                    if counts[path] == 2:
                        if change == "new_run" and "/runs?" in path:
                            return {"workflow_runs": [{"id": 999}]}
                        if path == "actions/runs/123":
                            if change == "new_attempt":
                                result["run_attempt"] = 2
                            elif change == "rerun_running":
                                result["status"] = "in_progress"
                                result["conclusion"] = None
                    return result

                with self.assertRaises(RuntimeError):
                    self.guard.evaluate(SHA, changing)

    def test_refuses_api_failures(self):
        def unavailable(_):
            raise OSError("untrusted response with possible sensitive detail")

        with self.assertRaises(RuntimeError):
            self.guard.evaluate(SHA, unavailable)

    def test_cli_outputs_only_a_dry_run_receipt(self):
        output = io.StringIO()
        with patch.object(self.guard, "github_read", self.api, create=True), redirect_stdout(output):
            self.assertTrue(callable(getattr(self.guard, "main", None)), "Missing dry-run CLI")
            self.assertEqual(self.guard.main(["--sha", SHA]), 0)
        self.assertIs(json.loads(output.getvalue())["deployment_performed"], False)

    def test_cli_denies_without_echoing_api_details(self):
        output, error = io.StringIO(), io.StringIO()
        with patch.object(self.guard, "github_read", side_effect=OSError("SECRET"), create=True):
            with redirect_stdout(output), redirect_stderr(error):
                self.assertTrue(callable(getattr(self.guard, "main", None)), "Missing dry-run CLI")
                self.assertEqual(self.guard.main(["--sha", SHA]), 1)
        self.assertEqual(output.getvalue(), "")
        self.assertNotIn("SECRET", error.getvalue())
        self.assertIn("denied", error.getvalue())

    def test_cli_has_no_apply_mode(self):
        with redirect_stderr(io.StringIO()):
            self.assertTrue(callable(getattr(self.guard, "main", None)), "Missing dry-run CLI")
            with self.assertRaises(SystemExit) as error:
                self.guard.main(["--sha", SHA, "--apply"])
        self.assertEqual(error.exception.code, 2)

    def test_github_adapter_uses_only_explicit_get_without_shell(self):
        self.assertTrue(callable(getattr(self.guard, "github_read", None)), "Missing GitHub GET adapter")
        result = SimpleNamespace(returncode=0, stdout='{"ok":true}', stderr="")
        with patch("subprocess.run", return_value=result) as run:
            self.assertEqual(self.guard.github_read("git/ref/heads/dev"), {"ok": True})
        args, kwargs = run.call_args
        self.assertEqual(args[0], ["gh", "api", "--hostname", "github.com", "--method", "GET",
                                  "repos/" + REPO + "/git/ref/heads/dev"])
        self.assertFalse(kwargs.get("shell", False))
        self.assertEqual(kwargs["stdin"], subprocess.DEVNULL)
        self.assertEqual(kwargs["timeout"], 30)

    def test_github_adapter_fails_closed_without_echoing_errors(self):
        self.assertTrue(callable(getattr(self.guard, "github_read", None)), "Missing GitHub GET adapter")
        results = [SimpleNamespace(returncode=1, stdout="SECRET", stderr="SECRET"),
                   SimpleNamespace(returncode=0, stdout="SECRET", stderr=""),
                   SimpleNamespace(returncode=0, stdout="[]", stderr="")]
        for result in results:
            with self.subTest(result=result), patch("subprocess.run", return_value=result):
                with self.assertRaises(RuntimeError) as error:
                    self.guard.github_read("git/ref/heads/dev")
                self.assertNotIn("SECRET", str(error.exception))
        for error in [FileNotFoundError("SECRET"), subprocess.TimeoutExpired("SECRET", 30)]:
            with self.subTest(error=error), patch("subprocess.run", side_effect=error):
                with self.assertRaises(RuntimeError) as denied:
                    self.guard.github_read("git/ref/heads/dev")
                self.assertNotIn("SECRET", str(denied.exception))


class WorkflowTests(unittest.TestCase):
    def test_ci_only_runs_offline_tests_with_read_only_permissions(self):
        workflow = SCRIPT.parents[1] / "workflows/staging-admission-dry-run.yml"
        self.assertTrue(workflow.is_file(), "Missing offline dry-run CI workflow")
        text = workflow.read_text()
        self.assertIn("permissions:\n  contents: read", text)
        self.assertIn("python3 -m unittest discover -s .github/staging -v", text)
        self.assertIn("persist-credentials: false", text)
        self.assertIn("branches: [dev]", text)
        self.assertNotIn("workflow_run:", text)
        self.assertNotIn("pull_request_target:", text)
        self.assertNotIn("workflow_dispatch:", text)
        for forbidden in ["secrets.", "write", "docker ", "curl ", "admission.py --sha", "gh api"]:
            self.assertNotIn(forbidden, text)


if __name__ == "__main__":
    unittest.main()
