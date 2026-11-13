"""Read-only, point-in-time staging admission checks. Never deploys."""
import argparse
import json
import re
import subprocess
import sys
from urllib.parse import urlencode

REPO = "lespacito/tss-explore-forum"
WORKFLOW = ".github/workflows/playwright.yml"


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def read_object(api, path):
    try:
        result = api(path)
    except (OSError, ValueError, RuntimeError):
        raise RuntimeError("GitHub evidence unavailable") from None
    require(isinstance(result, dict), "Invalid GitHub evidence object")
    return result


def require_current_dev(source_sha, api):
    ref = read_object(api, "git/ref/heads/dev")
    require(isinstance(ref.get("object"), dict)
            and ref["object"].get("sha") == source_sha, "Candidate is not current dev")


def evaluate(source_sha, api):
    require(isinstance(source_sha, str) and re.fullmatch(r"[0-9a-f]{40}", source_sha),
            "Expected exactly 40 lowercase hexadecimal SHA characters")
    require_current_dev(source_sha, api)
    workflow = read_object(api, "actions/workflows/playwright.yml")
    require(type(workflow.get("id")) is int and workflow["id"] > 0
            and workflow.get("path") == WORKFLOW
            and workflow.get("name") == "Playwright Tests"
            and workflow.get("state") == "active", "Unexpected or inactive CI workflow")
    query = urlencode(dict(branch="dev", event="push", head_sha=source_sha, per_page=1))
    runs = read_object(api, f"actions/workflows/{workflow['id']}/runs?{query}").get("workflow_runs")
    require(isinstance(runs, list) and len(runs) == 1 and isinstance(runs[0], dict),
            "No unambiguous latest dev push CI")
    selected_id = runs[0].get("id")
    require(type(selected_id) is int and selected_id > 0, "Invalid latest CI identity")
    run = read_object(api, f"actions/runs/{selected_id}")
    require(type(run.get("id")) is int and run["id"] == selected_id, "CI run identity mismatch")
    require(type(run.get("run_attempt")) is int and run["run_attempt"] > 0, "Invalid CI attempt")
    require(run.get("head_sha") == source_sha and run.get("head_branch") == "dev"
            and run.get("event") == "push", "CI source mismatch")
    require(run.get("status") == "completed" and run.get("conclusion") == "success",
            "Latest push CI is not successful")
    require(type(run.get("workflow_id")) is int
            and run["workflow_id"] == workflow["id"] and run.get("path") == WORKFLOW,
            "CI workflow mismatch")
    require(isinstance(run.get("head_repository"), dict)
            and run["head_repository"].get("full_name") == REPO, "Foreign CI repository")
    latest = read_object(api, f"actions/workflows/{workflow['id']}/runs?{query}").get("workflow_runs")
    require(isinstance(latest, list) and len(latest) == 1 and isinstance(latest[0], dict)
            and type(latest[0].get("id")) is int and latest[0]["id"] == selected_id,
            "Latest CI run changed during admission")
    again = read_object(api, f"actions/runs/{selected_id}")
    require(type(again.get("id")) is int and type(again.get("run_attempt")) is int
            and type(again.get("workflow_id")) is int
            and all(again.get(key) == run.get(key) for key in (
                "id", "run_attempt", "head_sha", "event", "head_branch", "status",
                "conclusion", "workflow_id", "path", "head_repository")),
            "CI evidence changed during admission")
    require_current_dev(source_sha, api)
    return dict(mode="dry-run", deployment_performed=False, source_sha=source_sha,
                repository=REPO, environment="staging", ci_run_id=run["id"],
                ci_run_attempt=run["run_attempt"])


def github_read(path):
    """Use the existing gh authentication; capture, never echo, API diagnostics."""
    try:
        result = subprocess.run(
            ["gh", "api", "--hostname", "github.com", "--method", "GET", f"repos/{REPO}/{path}"],
            stdin=subprocess.DEVNULL, capture_output=True, text=True, timeout=30,
        )
        require(result.returncode == 0, "GitHub GET failed")
        data = json.loads(result.stdout)
    except (OSError, subprocess.TimeoutExpired, ValueError):
        raise RuntimeError("GitHub GET unavailable or invalid") from None
    require(isinstance(data, dict), "Invalid GitHub GET object")
    return data


def main(argv=None):
    parser = argparse.ArgumentParser(description="Read-only staging CI admission dry-run; never deploys")
    parser.add_argument("--sha", required=True, help="Exact current dev SHA, 40 lowercase hex characters")
    args = parser.parse_args(argv)
    try:
        receipt = evaluate(args.sha, github_read)
    except RuntimeError as error:
        print(json.dumps({"mode": "dry-run", "deployment_performed": False,
                          "decision": "denied", "reason": str(error)}), file=sys.stderr)
        return 1
    print(json.dumps(receipt, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
