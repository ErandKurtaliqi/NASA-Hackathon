# Visual review of storytelling

## Recovery and scope

It recovered `origin/review/haroon-visual-storytelling` in `1056f91`, without previous local changes in this branch. The expected worktree was not registered in OFFICE; it was created from that remote commit, without changing the integration checkout. The five files saved already included SVG decorative terrain, hardware presentation, visual configuration, CSS and a Chrome capturer. Visual components were not yet mounted on the stories.

The two actual references of `Downloads/Imagenes_Mues` (Apollo 15 and Viking 1) were reviewed. They are used as a compositional guide, never as a complete background of the application or as scientific evidence.

New integration connects existing work with Apollo 15, Apollo 11 and Apollo 17. It does not modify scripts, records, scientific sources, storage, GIS/3D, homepage, browsers, IDs or routes. It does not integrate the Mars implementation of Workstream E or Apollo 16 of F. The safe catalog already excluded Perseverance from the routes published before this work; that inherited decision and its historical progress/code remain intact.

## Visual changes delivered

- Decorative lunar surface and horizon with SVG texture, existing starry sky and shade. The texture is cut to the surface to avoid a visible rectangular edge. It is not a geographic reconstruction or NASA photograph.
- Three desktop areas: hardware highlighted to the left, title/subtitle and narrative in the center, NASA evidence with light frame to the right. The introduction recovers the brand and top navigation by `scroll-margin-top`.
- The first paragraph takes precedence over the control deck. Other segments retain native flow and scroll; no wheel/touch captures or new hardware animations are added.
- Five chapters with short visual labels and full accessible names. Block/unlock, destinations, previous/following chapters and inter-segment navigation are preserved.
- Readable and rounded sound/reproduction buttons; Play has greater contrast. The player, its events, exclusivity, captions and activation rules remain unchanged.
- Two columns on tablet; one column on mobile, with compact hardware, flow controls and evidence within each segment as before. Full official chapters, attributions and links are preserved.
- Touch targets of at least 44 px in revised controls and links, including shared menu, brand and footer **only when these storytelling pages are present**. Homepage/explorer styles do not change.
- Notice of audios excluded from Apollo 11/17 in accessible native disclosure; specific omited and scientific review notices remain separate.

## Fidelity and Mission Status

**Apollo 15:** integrated composition, proven in real browser. It approaches Haroon's hierarchy and layout; it is not an exact replica of art. Hardware is the historical NASA photograph of LRV-1 with presentation cast, not the isolated rendering of the reference rover. The surface is decorative processural, not photographic terrain. Evidence keeps the verified images of each segment; a rollout photo is not converted into a take-off photo to mimic the reference. The opening paragraph comes from the existing script, without rewriting it.

**Apollo 17:** same visual system with its LRV-3/Harrison Schmitt photograph and self-evidence. The five chapters, activities, quiz, progress and editorial decisions are preserved. New private recordings are not in this branch; the final support for `StoryRecording` and their mappings remain prepared, regardless of private history or withdrawing the final narration.

**Apollo 11:** stationary experiment presentation. The existing 100 corner cubes educational diagram is clearly identified and links to NASA evidence; no rover or lunar vehicle from another mission is presented. Remote documentary photographs uploaded to Chrome. Excluded recordings and scientific retentions are indicated.

**Viking 1:** visual contract `world: mars`, `hardware: lander`, Viking 1 sign and reusable Mars terrain. No path, history, narrative, substitute portrait, pin or coordinate is created. The existing implementation of E is missing by means of an approved portrait, when such integration is authorized.

## Exact inventory of files

Modified files:

1. `scripts/story-browser-qa.mjs` — Chrome context disposable and more descriptive holdback errors.
2. `src/components/storytelling/Apollo15ScrollStory.tsx` — visual assembly, subtitle, accessible labels and control order.
3. `src/components/storytelling/Apollo15ScrollStory.module.css` — composition, text, controls and scoped accessibility.
4. `src/components/storytelling/MoonPackageStory.tsx` — Apollo mount 11/17 and revision disclosure.
5. `src/components/storytelling/MoonPackageStory.module.css` — accessible disclosure and evidence links.
6. `src/components/storytelling/RoverStoryLayout.module.css` — proportions, reading priority and breakpoints.
7. `src/components/storytelling/StoryEnvironment.tsx` — decorative texture and horizon with separate SVG resources.
8. `src/components/storytelling/StoryHardware.tsx` — accessible identity and explicit credits for photographs/diagram.
9. `src/components/storytelling/StoryPresentation.module.css` — hardware size/fund and responsive environment.
10. `src/features/storytelling/storyPresentation.ts` — Viking 1 future contract, no mission record.
11. `tests/apollo-progress-persistence.test.mjs` — accessible name search and hardware/evidence separation; store and actual test flow are retained.
12. `tests/application-routes.test.mjs` — reports the timeout path before aborting SSR; no extension of the limit or omission of routes.
13. `tests/helpers/story-visual-contract.mjs` — normalisation of exact fragments of authorised presentation; the logic of behaviour remains protected by historical snapshots.

New:

14. `scripts/story-visual-qa.mjs` — check real Chrome in isolated context, captures, audio, activity, maybe/progress and accessibility.
15. `tests/story-presentation.test.mjs` — hardware by mission, diagram, SVG IDs, Mars contract and accessible navigation.
16. `docs/haroon-visual-storytelling-review.md` — this report.

No MP3, PDF, ZIP, photographs, models, dependencies or lockfiles are added or modified. The captures and time profiles are out of Git history.

## Validation executed

- `node --test --test-concurrency=1 tests/*.test.mjs`: **214 passed, 0 failed, 0 skipped**.
- `npx.cmd tsc -b --pretty false`: correct. The build also executes `tsc -b`.
- `npm.cmd run build`: correct. Continues the known warning of size of the Bundle Three.js; does not alter GIS to silence it.
- `git diff --check`: correct; the index is checked before saving.
- Chrome real headless, production build in `http://127.0.0.1:5199`: 40 routes/variant catches and 2 activity and completion captures. The 15 chapters are reviewed at 1366×768 and 390×844, the three openings also at 360×800, 439×591 and 1024×768. Apollo 15 is included with reduced motion.
- All route captures: zero horizontal overflow, loaded images, one single `main`, navigation of available chapters and accessibility tree. Tree inspection does not amount to screen reader certification.
- MP3 Apollo 15: real playback after explicit activation, advance of `currentTime`, pause/resumption and segment change without autoplay. Human listening or revision of all recordings is not claimed.
- Real prediction form: selection, sending, evidence and absence of scriptures in progress.
- Real Quiz: answers, results, Complete Story, persistence after reloading and repetition without duplicating the badge. Synthetic data only in disposable incognito context; never cleans or uses the progress of the usual profile.
- Real Escape closes the mobile menu and returns focus; Tab reaches a native control. Emulated Swipe touch scrolls the document. Reduced motion preserves navigation.
- Zero exceptions to JavaScript, network load failures or app/media HTTP errors. Chrome asks for `/favicon.ico`, which answers 404: Incidence inherited from this redesign, without hiding it in the registry.

Incidences during preparation: the SSR route exceeded its five-second limit in initial run-in load; it also occurred before modifying code. That limit was maintained and the final suite passed complete. The first build found a temporary QA profile open within `dist`; that Chrome QA was closed only and started with an external profile to the build directory. Final builds pass. None of these incidents are presented as history flaw or as approved test before retry.

## Local evidence and reproduction

Actual records and captures remain at `$env:AURORALYS_QA_DIR` (external QA directory for this review). `verification.json` includes viewport, URL, images, targets, AX tree, captures and diagnoses. The adjacent development directory retains previous screenshots to compare; they are not automatically published.

From this worktree:

```powershell
npm.cmd run build
npm.cmd run preview -- --port 5199 --strictPort
```

In another terminal, start a separate Chrome QA, **without using a personal profile or saving your profile within dist**:

```powershell
$qaProfile = Join-Path $env:TEMP ('auroralys-story-qa-' + [guid]::NewGuid().ToString('N'))
Start-Process -FilePath $env:CHROME_EXE -WindowStyle Hidden -ArgumentList '--headless=new','--remote-debugging-port=9337',"--user-data-dir=$qaProfile",'--no-first-run','about:blank'
node scripts/story-visual-qa.mjs ../qa-artifacts/haroon-visual-production http://127.0.0.1:5199
```

Paths: `/story/apollo-15-rover/1`, `/story/apollo-11-reflector/1`, `/story/apollo-17-rover/1`. For a manual test with empty progress, proceed with Next Chapter to the quiz; do not delete existing storage to directly access Chapter 5.

## Remaining work

- Visual approval of Haroon: Fault/ground photography SVG does not reproduce the isolated rover and photorealistic soil of the reference. A presentation resource approved to close that difference is missing; one is not invented or downloaded without verification.
- Physical devices, Safari/iOS, human listening, NVDA/VoiceOver and real text zoom. Emulated mobile Chrome does not replace those checks.
- Timestamps/cues and editorial acceptance pending; no precise timings are generated or announced.
- Authorized publication/streaming of Apollo 11/17 private recordings and pending package permissions. They are not copied to the review even if the repository is private.
- Future integration of Viking 1 with E, independent of GIS and without replicating its implementation in this worktree.
- Favicon inherited and warning of bundle, out of visual reach.

The Git review checks private visibility of the repository, outgoing history and authorized text files. Backup is intended exclusively for `review/haroon-visual-storytelling` by normal push. Main/integration is not modified or private stories mixed; stashes and other worktrees are preserved.
