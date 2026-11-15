# Integration of master and continuous documentaries

> Initial checkpoint record, prior to compact adjustment and closure authorization. Your outstanding commit/publication mentions and section 18 procedure are historical. Validation status, limited approval to Apollo 15 and the existing premaster gats are in [master-integration-finalization.md](master-integration-finalization.md). Subsequent instruction authorizes completion of the local merge and only publish the integration branch, keeping pending the mandatory QA before the final master Merge.

**Status: locally resolved and prepared merger; approved automated validation; pending browser real QA. No integration commit, published branch, opened PR nor updated master/main.**

The order requires verification of integration before commit. The access available does not allow the actual browser QA. Therefore, the current, reviewable and conflict-free merge is retained, instead of presenting an integration as fully validated.

1. **Original and updated Master.** `origin/master`: `3b45e8f2324e8af85e55d81a1020306e95e1706e`. A second `git fetch origin` confirmed the same SHA. Private Repository `ErandKurtaliqi/Auroralys`, with push permission in the GitHub connection. The API of the branch returned `protected: false`; query rules returned HTTP 403 by the capabilities of the plan. Rules must be rechecked before final publication.

2. **Continuestorytelling original.** `origin/review/continuous-storytelling-office`: `ddb458657e1fa5fca0bd117f265e95b444090712`, also unchanged in the second match. Common base: `a0048e918a7a6549600f5159ab6c8b584d0f59d2`. Divergence: 5 exclusive master committs and 22 storytelling.

3. **New worktree and worktree.** `integration/haroon-master-continuous-storytelling`, in `master-integration`. Both names were free. Worktree started clean and exactly in the above master SHA. No branch was changed, no existing worktree was reset or edited. The previous ten worktrees retained zero tracked changes; untracked directories of the original checkout already existed. The new branch has no upstream until its future explicit publication.

4. **Real strategy.** `git merge --no-ff --no-commit origin/review/continuous-storytelling-office` was executed from the new branch based on master. It is a real Git fusion pending commit, with master as first parent and storytelling in `MERGE_HEAD`. No reset, force-push, global selection ours/they, or cherry-picks of private branches were used. The master tree was not replaced by that of the other branch.

5. **Conflicts and resolutions.**

   File | Resolution
   |---|---|
   `src/App.tsx` | Continuous documentary paths; exclusive dispatcher for Perseverance; optional cinematic expeditions under `/inspection/:storyId/:chapter?`; hardware of both branches; movement controls and accessible menu.
   `src/components/MachineStoryPage.tsx` | Revised readers, activities and quizzes; master celebration; explicit and validated entry to Perseverance reader; optional callback of quiz result.
   `src/components/MissionDashboard.tsx` | Eight documentaries and forty chapters; cinematographic tours and master badges; separate card with progress and resumption of Perseverance.
   `src/components/home/PlanetGateway.tsx` | Movement and poster master together with explicit audio intention, touch support and callbacks of the other branch.
   `src/pages/HomePage.tsx` | Narration and pause controls are in place, also respecting the calm-motion preference of master.
   `src/store.ts` | Master actions `roverJourneys` together with reliable storage, errors/reintenses and documentary progress.

   Semantic conflicts were also corrected without Git markers: master reassigned Apollo 15 using Apollo 17 as a base and duplicated `lrv-1`. Master cinematographic data now have a separate catalog; documentaries retain their approved data. LRV-1 hardware input is unified without losing master parking information. Esri is incorporated into the current browser, with adaptive container and touch activation.

6. **Preserved master changes.**Five commits are maintained: NASA/Esri integration (`4f0a44f`), background and zoom limits (`4d31563`), rover documentaries (`b0f4089`), animation/planetary cameras (`095cd1b`) and metallic finish (`3b45e8f`). Regressions compare directly with master the components of balloon, map, effects, rover, LRV, film scene, challenges, narration and animations. NASA models, added fonts and all master markers are maintained. Their code preservation is verified; their actual GPU render is browser-pending.

7. **Eight missions and forty chapters.**The eight canonical routes and the forty links `/1`…`/5` They render their complete documents in SSR tests with the actual components. The five logical chapters, 126 narrative segments and original quizzes/activities are preserved.

   Mission | Route ID | original MP3 locally available
   |---|---|---|
   Apollo 11 | `apollo-11-reflector` | 0; 18 track interface preserved
   Apollo 15 | `apollo-15-rover` | 19; already present in the published history
   | Apollo 16 | `apollo-16-rover` | 18; outside Git |
   Apollo 17 | `apollo-17-rover` | 0; 20 track interface preserved
   | Sojourner | `sojourner` | 19; outside Git |
   | Opportunity | `opportunity` | 19; outside Git |
   | Viking 1 | `viking-1` | 18; outside Git |
   | Ingenuity | `ingenuity` | 19; outside Git |

8. **Haroon Documentary Contract.**Routes `/story/<id>` and their old links use a single page per mission. They do not change the path when scrolling, nor `?view=reader` can replace a documentary approved by the cinematic implementation. Hardware/static background, central reading, evidence to the right, a single narrator, explicit sound activation, persistent pause and activities/quiz within the document are preserved. Layout and audio controller remain identical to the published checkpoint. The documentary shell adds only the capture/visualization of the saved result of the quiz. The actual visual stability when scrolling remains browser-pending.

9. **Rover/3D and Perseverance.**Perseverance remains accessible in `/story/follow-perseverance/1`...`/5`, in Hardware Lab, Mars Explorer and Dashboard. Optional expeditions `/inspection/apollo-15-rover/1` and `/inspection/apollo-17-rover/1` retain master experience and its 3D inspector. Moon/Mars balloons, scientific maps, zoom, models and Esri remain accessible. Prototype IDs and unknown paths are rejected. SSR checks these entries; camera interaction, drag, GPU and remote iframe require real QA.

10. **Progress and compatibility.**The key remains `beyond-earth-progress`, version `0`. Hydration does not rewrite saved earlier. `completedChapters`, `storyProgress`, `roverJourneys`, locations, instruments, badges, completion and existing additional fields, including quiz metadata. Added `storyProgress[id].quizResult` with responses, score and total when explicitly pressing Complete Story. View results or start a retry does not erase or save achievements. There are regressions of old saves, master, documentaries and combined, recharge, idempotency and write errors/reintenses. No personal storage of the user was migrated or restarted.

11. **Automated tests and build.**

   Test executed | Result
   |---|---|
   | `node --test tests/*.test.mjs` | **286 passed, 0 failed, 0 skipped, 0 cancelled** |
   `npm.cmd run test:rover` | PASS: completion requirements, duplicates, maybe, persistence, previous saved and reset
   TypeScript, `tsc -b` | Approved; also run on the build
   `npm.cmd run build` | Approved; warning of chunks greater than 500 kB
   Integrity/Audio HTTP Ranges | 112/112 tracks, ranges and bytes correct; 56 hashes also contrasted with previous inventories
   Insulation of originals in preview | Approved even by defining the development variable
   Diff, bookmarks and index resolution | No whitespace errors or markers; no conflict entries pending

   The 269 inherited tests were retained and 17 regressions were added. Fixtures are extended for APIs added by master and the storage additive field. Historical comparisons use exact hashes of revised integration modifications; a non-recognized modification fails. Functional tests of paths, data, quizzes and storage use the integrated code without that standardization. No evidence was removed or omitted.

12. **Real browser QA: NOT EXECUTED in this integration.**Automatic revision refused to start Chrome by remote debugging terminal; the returned reason was “blocked by policy”. The browser tool returned an empty inventory and the integrated browser attempt returned “Browser is not available: iab”. No attempt was made to circumvent the rejection. No new screenshots or measurements of desktop/tablet/mobile, audible playback, scroll, gestures, focus, interactive quizzes, GPU or Esri from this integration. Browser reports from previous branches are background and do not validate this merge. Safari and physical devices are also unavailable.

   Before creating the commit, run the real QA on desktop, tablet and mobile: eight documentaries, forty old links, scroll forward/back without moving hardware/back/back/controls, evidence and narration sync, navigation/hidden cancellation, pause, quizzes and activities, save/reload/dashboard, home/hardware navigation, Perseverance and optional expeditions, 3D inspector, Moon/Mars balloons, scientific map and Esri. `scripts/story-continuous-qa.mjs` retains the automation available for stories when there is an authorized QA Chrome. Do not confuse SSR or HTTP transport with those checks.

13. **Private audit and security.** `master-integration-audit.json` records the inspection of the 27 incoming commit and the prepared tree. Zero matches of known secret patterns, zero detected personal paths, zero unrecognized media, zero PDF/ZIP tracked and zero prohibited private ancestors imported. 22 MP3 tracked are the 19 Apollo 15 and 3 homepage already published. Poster/model Mars comes from master; incoming images are already part of the published storytelling. Their hashes are contrasted with both parents. The 93 external MP3 and PDF/ZIP packages were not copied. It is an audit of patterns, hashes and ancestors, not an exhaustive certification of credentials or licenses.

   The middleware accepts only defined track names, loopback addresses, local Host/Origin, GET/HEAD and actual paths contained in the configured directory; maintains ranges, non-store and nosniff. Your hook `configurePreviewServer` was removed: the external originals are only being used in development. The build does not include the external directory. See also `master-integration-media.json` and the audit reproducible scripts.

14. **Open scientific and editorial issues.**The review preserves scripts and notes and uses the existing voice recordings. See `mission-integration/README.md` and `review-safe/scientific-decisions.md` for Viking 1 (1981/1982 and the limits of the biological interpretations), Apollo 16 (technical descriptions, the separate UV camera, metaphors, and figures), Sojourner (geology, the modem and white soil, operations, and sols versus Earth days), and Ingenuity (ridges and fluids as distinct from evidence of groundwater, the accident context, and timescales). Haroon must approve script corrections and re-recordings before narrated delivery. Three Apollo 11 tracks and four Apollo 17 tracks remain on hold for review, and the level of evidence varies by claim.

15. **Audio and remaining delivery.**There are 112 local originals in six missions; Apollo 11 and Apollo 17 are still without available local originals. Routes, mappings and controls are preserved, without TTS replacements. Production lacks verifiable distribution authorization, authorized delivery of the 93 external tracks, authorized procurement of Apollo 11/17, editorial/auditive editing and actual timing of captions. Hosting must serve routes `/audio/<mission>/chapter-N/N.mp3` with MIME and correct ranges, or an authorized CDN with proper configuration. A fallback SPA that responds HTML for a missing MP3 is not audio delivery. Reproduction errors keep reading available.

16. **New commit SHA.** **Pending; not yet existing.** `HEAD` remains the original master and `MERGE_HEAD` the original storytelling. It cannot yet be claimed that both are HEAD ancestors: that property is obtained by creating the merge commit after the actual QA. This branch is not labeled as approved for publication.

17. **Git Status.**Local Fusion in progress, six conflicts resolved and changes prepared in the index. The integration worktree retains changes intentionally because the commit is conditioned to the pending QA; it is not clean. The other workstrees were not modified. There is no push, PR, remote merge, force-push or main/master update.

18. **Safe final procedure, conditioned to QA.**Run from this new worktree. First complete and register the actual QA. If master or storytelling have changed, integrate them by merge and repeat tests/QA before continuing. Do not run the post while that gate is pending.

```powershell
Set-Location (git rev-parse --show-toplevel)
git fetch origin
git rev-parse origin/master origin/review/continuous-storytelling-office
# They must continue to match the two SHAs documented above.
# If changed, stop this procedure and update/revalidate the merge.
node --test tests/*.test.mjs
npm.cmd run test:rover
npx.cmd tsc -b --pretty false
npm.cmd run build
git diff --cached --check
git diff --cached --stat
# Proceed only after browser QA is approved and the Git index has been reviewed:
git commit -m "Merge continuous mission documentaries with latest master"
git merge-base --is-ancestor origin/master HEAD
if ($LASTEXITCODE -ne 0) { throw 'The integration is missing the updated master branch' }
git merge-base --is-ancestor origin/review/continuous-storytelling-office HEAD
if ($LASTEXITCODE -ne 0) { throw 'The integration is missing the updated storytelling branch' }
git status --short
git rev-parse HEAD
# The worktree must be clean and both ancestry checks must pass.
git push -u origin integration/haroon-master-continuous-storytelling
```

The recommended review has **base `master`**and head `integration/haroon-master-continuous-storytelling`. Open it manually after publishing; it did not open automatically. Use a merge to preserve both commit histories, avoiding squash or rebase if ancestry preservation is required. The original master will be able to advance by fast-forward to the integration commit if it does not change in the meantime; currently there is not yet that commit.

As a final alternative to PR review, only if the current rules allow direct push and integration is already approved:

```powershell
git fetch origin
git merge-base --is-ancestor origin/master HEAD
if ($LASTEXITCODE -ne 0) { throw 'Master changed. Integrate it and rerun validation before publishing.' }
git push origin HEAD:refs/heads/master
```

That push is normal, without force; a concurrent diverging master advance must be rejected. Do not check out or reset an existing protected worktree, or update main. Do not automatically run any of these final steps.
