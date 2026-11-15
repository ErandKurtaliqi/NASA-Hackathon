# AURORALYS — Publication candidate after cleanup

## Scope and provenance

Branch: `review/eight-mission-release-safe`. Published base: `8a77514c8841c6f518b0b2d71421f455b6ef9702`. Functional and visual snapshot of origin: `f0996303f9e899aa5913db2cbb169a393a49dc9b`.

The final tree was moved by `git merge --squash --no-commit review/eight-mission-cinematic` over a clean new worktree based on 8a77514. There were no conflicts. A single commit child is created from that base; the original local commits are neither merged nor cherry-picked. The original branches and backups are preserved.

No mission was redesigned. All `src/`, `public/`, dependencies and build configurations retain the same blobs as f099630. Eight missions and forty chapters are maintained, their approved scenes, narrative, audio/captions, activities/quizzes, navigation, accessibility, progress and badges. Homepage, GIS/3D, coordinates and maps remain intact.

## Authorized cleanup

Personal profile paths and fixed paths of the computer are replaced by relative paths or explicit configuration in documentation and QA. Real names of users or personal folders are not included as example values.

- `docs/mission-integration/README.md`, `docs/visual-correction-review.md` and `scripts/story-design-qa.mjs`: Personal packet and reference locations are removed.
- The routes of the other reports/checklists and the private transfer procedure are made portable. Private values are configured outside Git by means of environment variables.
- The visual script requires an external QA directory and an existing reference. It rejects checkout as a destination and also junctions or symlinks that resolve within it before creating the directory. Output names remain confined to the chosen QA directory.
- Three tests depended on unpublished Git objects. Their regression contracts are retained with SHA-256 revised in `tests/fixtures/release-source-baselines.json`, normalizing LF or canonical JSON as the case may be. No additional original scripts, recordings or PDFs are copied to the fixtures. The Hashes of origin are metadata, not Git ancestors.
- `tests/release-safety.test.mjs` checks mandatory arguments, environment settings, output containment and loopback source restriction.

The variables used are `AURORALYS_QA_DIR`, `AURORALYS_APOLLO15_REFERENCE`, `AURORALYS_QA_BASE_URL` and `CHROME_QA_PORT`; old operating instructions also identify variables for worktrees and private inputs. No private packages are required to compile or execute the tests of this revision.

## Current Validation

- New complete suite: **260 approved tests, zero failures/missed**.
- TypeScript (`npx.cmd tsc -b --pretty false`) and production (`npm.cmd run build`): correct. Pre-warning of chunk Three.js is maintained.
- Five new QA configuration/confining tests, plus complete regressions of eight missions and persistence.

Chrome on the build of this candidate verified the forty paths to desktop and mobile, the eight openings in small/tablet sizes and reduced motion: 106 captures of routes/variant, more evidence of activities/finalization. No horizontal overflow, broken images, JavaScript errors or private recordings required. Available reproduction of Apollo 15, Pause/Resume, segment change without autoplay, quizzes, completion, recharge, idempotent badges, Escape/Tab/Enter and emulated touch was checked. The inherited favicon.ico continues to return 404.

`story-design-qa.mjs` was actually executed with CLI arguments and again using only environment variables, both against the candidate: each pass validated 1440×900, 1024×768 and 390×844, comparatives and access to audio controls after switching segments. OLD captures are byte-identical copies of previous records; no false BEFORE was generated since the new build.

The additional comparison of Apollo 15 against the source build confirmed geometry, fonts and colors in seven main elements at 1440×900 and 390×844. The equality of application blobs is the criterion of snapshot preservation; no byte equality per byte of the artifacts generated is affirmed, whose hashes may vary with end of line of checkout.

New records, comparatives and privacy reports remain in the configured external QA directory, without being added to Git. Reproduction of an independent cloning is recorded in those artifacts upon completion of delivery. Existing historical evidence requires complete cloning with references already published; they do not need the three discarded local committs.

## Portable reproduction

From the root of the new worktree:

```powershell
node --test --test-concurrency=1 tests/*.test.mjs
npx.cmd tsc -b --pretty false
npm.cmd run build
npm.cmd run preview -- --port 5206 --strictPort
```

For QA, set `CHROME_EXE` with the installed executable, `AURORALYS_QA_DIR` with an external folder and `AURORALYS_APOLLO15_REFERENCE` with the local authorized reference. Do not save those personal values to versioned files. Copy authentic OLD captures to the QA directory before running the comparison script; do not replace them with candidate captures.

```powershell
$env:CHROME_QA_PORT = '9342'
$env:AURORALYS_QA_BASE_URL = 'http://127.0.0.1:5206'
if (-not $env:CHROME_EXE) { throw 'Configurar CHROME_EXE' }
$qaProfile = Join-Path $env:TEMP ('auroralys-release-qa-' + [guid]::NewGuid().ToString('N'))
Start-Process -FilePath $env:CHROME_EXE -WindowStyle Hidden -ArgumentList '--headless=new','--remote-debugging-port=9342',"--user-data-dir=$qaProfile",'--no-first-run','about:blank'
node scripts/story-visual-qa.mjs "$env:AURORALYS_QA_DIR/routes" http://127.0.0.1:5206 --all-missions
node scripts/story-design-qa.mjs
```

The last line uses the environment settings. It also accepts explicit arguments: QA directory, reference file and local URL.

## Media, privacy and boundaries

No MP3, PDF, ZIP, binary images, models, caches or secrets are added. 22 legacy MP3s and other public resources are identical to the published database. NASA URLs and their credits are preserved; manifests contain references/hashes, not private files.

Apollo 11/16/17, Sojourner, Opportunity, Viking 1 and Ingenuity retain interfaces and reading, but their seven sets of recordings remain deliberately excluded by existing policy and adapter. Audio, TTS, precise synchronization, or redistribution authorization are not invented. Outstanding editorial/scientific observations, voice/PDF rights and physical testing/Safari/screenreaders remain delivery limits, not new approvals.

Only the local commit of this candidate is allowed. This preparation does not authorize push, PR, merge in protected branches or publication of excluded media. The outgoing history should be audited as exactly a commit on origin/review/haroon-visual-storytelling prior to any human publication authorization.
