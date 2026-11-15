# Planet Back to Home review

Worktree: `C:\xampp\htdocs\NASA-Hackathon`.
Branch: `feat/final-mission-locations`, published base `3ffa46f` (Draft PR #1).
Following manual visual review, publication of this scoped addition to the
existing Draft PR #1 is authorized. Integration and merging remain unapproved.

## Reproduced cause and scoped correction

The desktop composition starts with a -24px margin and overlaps the breadcrumb.
Real Chrome hit testing on both planets found the roster intercepted six of nine
sample points across the visible 112.5×44px Back to Home link. Only its upper
edge consistently received clicks.

The breadcrumb now has `position: relative; z-index: 2`, above the composition
and below the header/menu (z-index 12). The original native Link, its 44px height,
focus outline, layout, negative composition margin and scene controls remain.
This is a local CSS fix; no global pointer-event override or click proxy is used.

Modified: `src/pages/ExplorerPage.module.css` (one rule).
Created: `tests/explorer-back-home.test.mjs` and this document.
No documentary source changes are included in this worktree. All final-location
records, five coordinate pairs, three location-only entries and map behavior from
PR #1 remain unchanged.

## Validation

- Four new focused tests plus the existing 17 location tests pass (21 total).
- Full suite: 309 total, 251 passed, the same 58 inherited failures.
- TypeScript, build and whitespace checks pass; existing large bundle warning.
- Chrome: nine of nine hit-test points on each planet at 1440×900, 390×844
  and 768×1024. Native mouse, keyboard/focus-visible and touch navigation to `/`
  passed. The entire 44px target works, including its lower/outer edges.
- The existing 40-case location/map browser regression passed at five sizes,
  including all eight View on 2D map actions, exact positions, location-only
  notices, keyboard, planet switching, mobile map interaction and NASA fallback.
  The external QA copy only adapts the Leaflet probe URL to the isolated Vite
  cache; the original PR #1 QA script is unchanged.

Preview: `http://127.0.0.1:5211/explore/moon` and
`http://127.0.0.1:5211/explore/mars`. The new preview uses an isolated cache;
use port 5211 for this review rather than an older running preview.
To restart from this worktree when the port is free:

```powershell
npm.cmd run dev -- --port 5211 --strictPort
```

Real captures, hit-test results and map regression logs are outside Git under
`C:\xampp\htdocs\NASA-Hackathon-rover-ux-QA`.
Physical multitouch and human screen-reader review remain pending.
