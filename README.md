# Temporary TestFlow repository

This public repository contains two example cases for the Audacity TestFlow repository prototype.

| Case | Expected result |
| --- | --- |
| `smoke-pass` | Passed. One step reads the execution context. |
| `smoke-fail` | Failed. One step throws an intentional error. |

Both cases start as unverified. They do not reproduce reported application issues. The issue URLs end in `/issues/0` and are placeholders.

## Use in Audacity

Open the TestFlow scripts dialog, select Repository, and enter `kryksyh/testflow-repository-temp-20261015` with branch `main`. Select Refresh. Download a case before you run it.

Use Mark verified to approve the test itself. Use Reject test with a reason to mark a case for correction. Reproduction confirmation records an observed failure separately from test review. Any such confirmation in this repository is demonstration evidence only.

Shared changes use the local GitHub CLI login. Use `gh auth login` once. The selected account must have write access to this repository. The prototype submits changes directly to `main`.

## Edit outside Audacity

Each case contains `main.js` and `metadata.json`. Helpers and small data files can be placed inside the same case directory. After an external edit, regenerate the catalog before committing:

```sh
python3 tools/update_catalog.py .
```

Use `python3 tools/update_catalog.py . --check` to check catalog consistency. The catalog tool does not execute scripts.

The scripts have not been executed as part of repository creation. They require an Audacity build with TestFlow enabled. The temporary repository contains no application source changes or workflows.

The initial scripts, catalog tool, and this README were created with Codex.
