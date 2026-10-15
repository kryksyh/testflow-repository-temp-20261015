# Temporary TestFlow repository

This repository contains cases for the Audacity TestFlow repository prototype.

| Case | Expected result |
| --- | --- |
| `smoke-pass` | Passed. One step reads the execution context. |
| `audacity-11660-paste-selection` | Paste creates a clip at the time selection, with the playhead elsewhere. |
| `audacity-12485-clip-label` | Add Label creates a region label across the selected clip. |

The smoke case is an example. Its issue URL ends in `/issues/0` and is a placeholder. Review states are stored in each case's metadata and apply to the recorded content revision.

The other cases refer to reported Audacity issues [#11660](https://github.com/audacity/audacity/issues/11660) and [#12485](https://github.com/audacity/audacity/issues/12485). Their current revisions require review in Audacity. Source inspection supports the reported behavior, but it does not confirm reproduction. The metadata records the source revision and check limits. Codex created these cases.

## Use in Audacity

Open the TestFlow scripts dialog, select Repository, and enter `kryksyh/testflow-repository-temp-20261015`. The interface uses branch `main`. Select the refresh icon, then download a case. If a downloaded case has changed, use Update local copy before you run it. Toolbar icons have tooltips.

Start each issue case in a new empty project. Each case generates a two-second Chirp clip. No external audio files are required. If a project contains tracks, setup stops without removing them. The case leaves its generated content open for inspection. Use a new empty project for the next case.

The paste case covers Case 1 of #11660. It uses the explicit overlap paste action, so it does not depend on paste preferences. The label case focuses the clip navigation control, uses the object selection action, and dispatches Add Label directly. These checks do not cover mouse input or shortcut mapping.

Use Verify test to approve the test itself. Use Reject test with a reason to mark a case for correction. Issue reproduction has a separate note field. Confirm reproduction only when a failed run of the current test revision matches the reported issue. A confirmation for the smoke case is demonstration evidence only.

Shared changes use the local GitHub CLI login. Use `gh auth login` once. The selected account must have write access to this repository. The prototype submits changes directly to `main`.

## Edit outside Audacity

Each case contains `main.js` and `metadata.json`. Helpers and small data files can be placed inside the same case directory. After an external edit, regenerate the catalog before committing:

```sh
python3 tools/update_catalog.py .
```

Use `python3 tools/update_catalog.py . --check` to check catalog consistency. The catalog tool does not execute scripts.

The scripts require an Audacity build with TestFlow enabled. Publication checks script syntax and catalog consistency. It does not execute the cases. The temporary repository contains no application source changes or workflows.

The initial scripts, catalog tool, and this README were created with Codex.
