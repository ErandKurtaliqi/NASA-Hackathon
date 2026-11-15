# Private review of Moon storytelling code

Branch: `review/moon-code-review-safe`. Base already published: `e9573dad6fd9e61f221a0bb7e1d07775c2da8974`. Source of the revised changes: Full local backup `4f6d3806e962dfcb3eaed12634d0e9fee9ec974b`, which **no** is incorporated as a parent and not pushed. This is a code review and an honest demo of scope without new media; ** is not a complete release or a public export of hackathon**.

## Scope and working features

- Current Catalog: Apollo 15 (`lrv-1`), Apollo 17 (`lrv`) and Apollo 11 (`apollo-11-lrrr`, stationary experiment), five chapters each. Same Story IDs, progress schema, existing rewards and save recovery. The reflector retains its passive identity.
- Reused narrative architecture, scroll and Previous/Next, previous responsive layouts, NASA sources, optional activities and quiz with final explanation/View Results/focus. Correction of the Temporary Permission of Complete Story after TRY AGAIN.
- Apollo 15 and homepage preserve their **22 MP3 existing** The private repository and its history still contain those inherited media: it is not a basis for public disclosure without another export process.
- Apollo 11/17: texts, evidence, activities, quiz and progress reviewable; its 38 new MP3 are ** excluded**. There is general and segmental notice, without controls announcing playback of missing files. There is no TTS substitute. Seven scientific retentions follow apart from this technical omission.
- Three new Apollo 11 images are referenced by official NASA URLs, with alt, credits and preserved fonts. HEAD returned 200/image/jpeg; its binaries were not copied. Fallback retains read/source to network failure. The ten legacy Apollo 15/17 image entries are unchanged.
- Approved homepage, astronaut voice/captions, explorers, coordinates, maps, GIS/3D and scientific data are preserved. The changes in transferred links/catalling correspond to the previous Moon range, not a new redesign.

`reviewMediaPolicy.ts` describes deliberate omissions from this branch; it is not a general availability detector or a production streaming architecture. Do not change it to declare the originals present without providing an authorized source and test it. Complete private development continues to use your files without this omission. This review adaptation should not be integrated as a final delivery policy: use the entire development/authorized resolution and maintain all approved narratives.

## Inventory and security

[transfer-inventory.json](transfer-inventory.json) lists the 45 code/test/metadata files transferred and the 64 excluded from the full diff `e9573da..4f6d380`. [changed-files.json](changed-files.json) contains the final list of the revision commit, including new adaptations and documentation.

Excluded: 38 new MP3s, four new PDFs, three new JPEGs, `.gitattributes` intended for those binaries, inventory scripts that need the private package and local reports that could be confused with the results of this demo. ZIP, node_modules, dist, caches, `.env`, credentials or private configuration are not copied. Only inventory/provenance metadata and text modules needed to review the UI are transferred; not original PDFs or data for access to storage.

The remote `ErandKurtaliqi/Auroralys` was checked **private** with authenticated API and write permission. Before the push the entire new range is audited from e9573da, its parents, new blobs, prohibited routes and known secret patterns. Pattern scan does not amount to exhaustive security/rights certification. Normal push only to this new branch, no force, merge or automatic PR. It does not move `main`, integration or Moon backup.

## Testing and reproduction

```powershell
npm.cmd ci
node --test tests/*.test.mjs
npx.cmd tsc -b --pretty false
npm.cmd run build
git diff --check
npm.cmd run preview -- --port 5197 --strictPort
```

In HOME, the existing installation was reused by ignored node_modules Junction; packages were not installed or changed lock/dependencies. A new clone needs `npm ci`. Snapshot tests use only history **published**; they do not need the private object 032ce7c or MP3/PDF excluded. Do not clone with insufficient depth for the historical suite checkspoints. The comparison of scripts normalizes only CRLF/LF; the 19 MP3 Apollo 15 continue to be compared byte a byte.

Result of this branch: **211 approved tests, zero failures and zero omitted**, TypeScript and build correct. The private integrity test of the 38 MP3/four PDFs is replaced in this branch by an explicit exclusion check and the 19 MP3 inherited; validation of media that are not present is not announced. Functional tests, audio mocks, store/persistence and render of 15 chapters are executed. Coverage of the review/absence of players notice is added in the ten chapters Apollo 11/17 and the limit of inherited history/medias. Complete local support passes **209 tests** independently, without modifying its commit; do not add both counts.

Known warnings: chunk Three.js large; optional symbol diagnosis `Group` unused in `RoverScene.tsx`, protected. Internals are not modified to clear those warnings. There is no streaming backend or deployment at this stage.

## Audio and science: progress and remaining work

[held-recordings.json](held-recordings.json) records the seven files, expected script, hashes, duration, original motif and mapping/listening states. Originals were verified in the local worktree without copying or altering them. No incorrect technical mapping proved.

[scientific-decisions.md](scientific-decisions.md) provides sources and decisions: NASA supports 14 m approximations, 35,9 km/4 h 26 min of driving, thermal indicator event and 158 m. The Apollo 11 individual attribution has conflicting NASA sources; age 3,7/3,6 requires consistent editorial treatment. There are seven confirmed scientific errors. No clues were activated for finding a reference: Haroon's listening/acceptance failure and measured cues.

The final website must reproduce all the approved narratives with private objects/controlled API or authorized URLs, Range, retry and server credentials. Audio delivered to the browser can be captured; no download is promised. No real hosting, backend/streaming, storage, rights and operation is missing. No backend is displayed or the entire development narrative is disabled to resolve this review.

## Browser, design, and integration work still pending

The CUA tool reports absence of native hosts and browser. It does not declare human listening, app screenshots, contrast/overflow, touch, console or real E2E. HTTP and SSR do not prove those aspects. [Short Chrome Checklist](chrome-checklist.md): routes, expectations and data to record in each bug; six sizes, activities, quiz/badges/reload and comparison with Haroon references. Apollo 15/Viking 1 references are compositional targets, not NASA assets. There is still a lack of approved isolated/surface machine and validation of real proportions/positions.

[OFFICE Private Plan](private-office-transfer.md): Bundles verified by SHA256/hashes complete, quarantine out of webroot and new incoming refs, without overwriting or integrating worktrees before E/F. Commits 814d044 and 44e6a65 remain absent. Do not recreate them.

Target scope remaining: Apollo 16, Sojourner, Opportunity and Viking 1 from their existing implementations; Ingenuity only when the approved package arrives. Perseverance is outside the history catalog, but still has references in atlas/pins/Sources: agree publication and attribution filter with Erand, without deleting Jezero or altering coordinates. Its historical progress is preserved.

## Priorities

1. Check this code and run Chrome/local listening acceptance; record decisions of the seven tracks and chapters.
2. Transfer E/F in private and receive the Ingenuity package. Review logs, dependencies, means and persistence before integrating.
3. Coordinate with Erand Perseverance filter and GIS/3D contract. Remote Master advanced to 095cd1b (camera/animation); the object was inspected without moving local refs and is not integrated here.
4. Confirm hosting/rights and prepare isolated streaming; keep the end narrated as a requirement. Solve event licenses/rules with responsible, preserving dates/authorship.
5. Approve visual resources and compare in browser before further settings. Do not start a new redesign or turn this incomplete media review into a final release.

P0: None confirmed within the automated scope. P1/ Blocks: audiovisual acceptance, E/F/Ingenuity, GIS filter, audio infrastructure/permission and delivery compliance. P2: Visual differences without measurement, captions pending, bundle/unused warnings. An outstanding verification is not declared proven functional defect or approved test.
