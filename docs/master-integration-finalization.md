# Finalizing the existing integration

This release brings together the two stories through the merge commit that contains this report. The review branch is `integration/haroon-master-continuous-storytelling` and its PR is based on **master**. It does not authorize an immediate merge to master: the mandatory QA described below is still pending. Main is not updated nor is it made direct push to master.

## Preserved history

- First parent/master verified after `git fetch origin`: `3b45e8f2324e8af85e55d81a1020306e95e1706e`.
- Segundo padre/storytelling: `ddb458657e1fa5fca0bd117f265e95b444090712`.
- Worktree original: `master-integration`.
- The already open merge was continued. No other worktree was created, restarted, aborted, reset or replaced the tree of any developer.
- The three layout modifications, their regression and documentation were reviewed and prepared. It was found that the other entries in the original index retained their blobs.
- The exact SHA of this delivery is obtained with `git log -1 --format=%H`; your parents with `git show -s --format=%P HEAD`. Ancestry checks must approve for both previous SHAs.

## Preserved functionality

The eight documentaries (Apollo 11, 15, 16, 17, Sojourner, Opportunity, Viking 1 and Ingenuity), its forty chapters and 126 segments remain available. They keep the continuous scroll, static hardware and background, NASA evidence, segment synchronization, accessible compact controls, quizzes, activities, badges and consistent progress compatible. The tests protect the rules of the panels and the audio life cycle outside of the authorized visual change.

Perseverance, optional cinematic expeditions and 3D inspection, models/animations/master cameras, Moon/Mars explorers, scientific maps, Esri, homepage, educational content in `/discover`, hardware and dashboard are also retained. Canonic routes of the eight documentaries are not replaced by optional expeditions.

## Automated validation

| Check | Result |
|---|---|
| `node --test tests/*.test.mjs` | **286 passed, 0 failed, 0 skipped, 0 cancelled** |
| `npm.cmd run test:rover` | Passed |
| `npx.cmd tsc -b --pretty false` | Passed |
| `npm.cmd run build` | Approved; warning of chunks greater than 500 kB |
| `git diff --cached --check` and conflict markers | No errors or markers |
| Index stages | No unresolved conflicts |
| History and Tree Audit | Approved within documented scope |
| Integrity/Runnel Ranges of Local Originals | 112/112; 56 hashes also contrasted with previous inventories |
| External audio insulation in preview | Approved even with the defined development variable |

The SSR render of the routes uses the actual components, isolating GPU/maps when applicable. It does not constitute proof of rendering or interaction in a browser.

## Real browser coverage and user approval

** User-approved:** manual revision in Chrome of the new compact Apollo 15 design. No record of exact sizes, captures, all chapters, all interactions or audible playback of that revision is available. Its scope is not extended by inference.

**Actor executed during this shutdown:** no real browser test. Tool returned `apps: []` and `browsers: []`. The available automated tests are Node/SSR/controllers/storage and HTTP transport, with the coverage described above. Catches from other branches are not presented as evidence of this integration. Safari and physical devices are not available.

**Required checks before merging into master:** check the eight missions and the forty chapter links in 1440×900, 1366×768, 1024×768 and 390×844. Include scroll forward/back, hardware/back/back/panels/control immobility, absence of overlaps, synchronized evidence and narration, Play/Pause/cancellation when browsing or hiding, focus/keyboarding/touch, quizzes and activities, progress after reloading and dashboard. Check home/hardware navigation, Perseverance, 3D inspector, both balloons, scientific maps and Esri. Register results and correct any bugs before marking the PR ready for merge.

## Security, media, and science

`master-integration-audit.json` audits the 27 divergent commit and the final tree. It does not detect known patterns of credentials, personal paths, unrecognized media or forbidden private ancestors. The 22 MP3s tracked are the 19 Apollo 15 and three homepages already published; no original MP3 private, PDF or ZIP is added. Other binary resources are contrasted with the two published parents. The scope is known patterns, hashes, routes and ancestors; it is not exhaustive certification of credentials or licenses.

The 93 external MP3s remain outside Git/dist. The external middleware is only logged in and restricts real names/paths, loopback, Host/Origin, methods and ranges. There is no external audio hook in preview/production. View `master-integration-media.json` for HTTP results; they do not involve human listening or browser playback.

The original recordings of **Apollo 11 and Apollo 17** are still missing locally. They are not replaced with synthetic voice. Haroon must resolve the distribution and delivery authorization of the external/lack tracks, hearing review, script fixes and measured timings of chapters before a complete narrated delivery.

The existing scientific and editorial issues remain open for Viking 1 (chronology and biological limits), Apollo 16 (technical and scientific descriptions), Sojourner (geology and operations), and Ingenuity (geological interpretations and context). The Apollo 11 and 17 recordings on hold remain withheld. Script revisions and corresponding re-recordings require Haroon’s approval. See `mission-integration/README.md` and `review-safe/scientific-decisions.md`.

## Review and final merge

Publish only `integration/haroon-master-continuous-storytelling` and keep the PR against master in draft while the required QA is missing. Partial visual approval does not mean authorizing the final merge. Do not use force-push or update main.

After the full QA, re-run `git fetch origin` and check `git merge-base --is-ancestor origin/master HEAD`. If master advanced and is not ancestor, integrate your changes in a reviewable way and repeat the checks before the final merge; do not overwrite it. Maintain a Merge method that preserves both stories. The final release results and the PR URL are checked in GitHub and communicated separately.
