# Homepage first-visit introduction

Homepage review, 2026-11-14. Final repository: `ErandKurtaliqi/NASA-Hackathon`.
Branch: `feat/home-intro-first-visit`; base `origin/main`:
`a912a7e7ef646a43cdd81ad16ada7af243dde494`.

## Behavior

- The first homepage entry in a tab shows the original introduction captions
  and attempts `/audio/home/intro.mp3` through normal browser playback policy.
- `sessionStorage['auroralys-home-intro-seen-v1']` records entry, independently
  of audio success. This never changes mission progress or localStorage keys.
- A blocked autoplay promise is handled, releases its media and leaves the
  first-visit captions readable. The visible status explains how to enable
  narration using the existing accessible **Turn sound on** control.
- Muting stops playback immediately and releases pending requests. First-visit
  captions remain readable through the existing manual caption controls.
- Returning from a route or refreshing the same tab shows the astronaut without
  a default introduction speech bubble, and makes no automatic narration request.
- On a return, enabling sound without selecting a world only arms narration.
  An explicit world selection can play its own existing recording; it does not
  replay Welcome. Hover previews remain text-only.
- Navigating through home links stops audio and clears dialogue before exit
  animations complete. Modified/new-tab clicks, downloads and same-page links
  retain their normal behavior. History/pagehide and unmount also clean up.
- Deferred first-entry setup is canceled by Strict Mode's probe cleanup. Only
  the surviving mount claims the visit and plays. Late promises and media events
  cannot revive disposed or muted narration.

Only the small-screen audio notice layout changes visually: it occupies a row
inside the header instead of covering the headline on short mobile viewports.
Branding, planet scenes, navigation destinations, animation settings, scripts,
caption timing and all three original MP3 files remain unchanged.

## Files

Modified:

- `src/pages/HomePage.tsx`: immediate home-link navigation cleanup and notice class.
- `src/pages/HomePage.module.css`: responsive audio-notice row.
- `src/components/home/AstronautGuide.tsx`: omit the default bubble on returns.
- `src/components/home/homeNarration.ts`: first entry, policy failure, stop and cleanup.
- `src/components/home/useHomeNarration.ts`: tab visit and Strict Mode lifecycle.

Created:

- `src/components/home/homeIntroductionSession.ts`: guarded tab-session marker.
- `tests/home-introduction.test.mjs`: 16 focused regression tests.
- `scripts/home-introduction-qa.mjs`: real Chrome QA using existing CDP tooling.
- This document.

Rover Stories, Planet Explorer, scientific data, progress, assets and dependencies
are not changed. The locations branch and draft PR #1 are separate and untouched.

## Validation

- 16 new introduction tests plus 12 existing narration tests: **28/28 passed**.
- Clean main baseline: 288 tests, 230 passed, **58 failed**.
- Current full suite: 304 tests, 246 passed, **the same 58 failed**. Comparing
  failing names found no new or resolved failures. The complete suite is not green.
- TypeScript and production build pass; the existing large Three.js chunk warning
  remains. Whitespace checks pass with the repository's Windows CRLF handling.
- Installed Chrome 157 headless, default autoplay restrictions: **33 checks pass**,
  no runtime exceptions. Sizes: 1440×900, 768×1024, 360×800, 390×844 and 439×591.
- A fresh direct visit is blocked with `NotAllowedError`; captions and sound-on
  recovery work. Real keyboard activation starts audio and real pointer activation
  mutes it. The first home entry after a genuine in-app navigation can autoplay
  with ordinary user activation. No autoplay flags, synthetic DOM clicks,
  permission changes or media-policy bypasses are used.
- Browser checks cover Strict Mode attempt count, immediate mute, route cleanup,
  Mars/Moon/Rover returns, same-tab refresh, reduced motion, 44px controls,
  horizontal overflow and a notice that does not cover the headline.

Screenshots and JSON logs remain outside Git:
`C:\xampp\htdocs\NASA-Hackathon-home-intro-QA-20261114`.
`first-1440.jpg`, `first-390.jpg`, `return-1440.jpg`, `return-390.jpg`
are actual rendered screenshots taken after entry animations settle.

## Local review

The independent worktree is `C:\xampp\htdocs\NASA-Hackathon-home-intro`.
Preview: `http://127.0.0.1:5200/`. Port 5199 belongs to the separate locations demo.

To start a preview if port 5200 is free:

```powershell
Set-Location C:\xampp\htdocs\NASA-Hackathon-home-intro
npm.cmd run dev -- --port 5200 --strictPort
```

Existing dependencies are reused through a local node_modules junction. When
running both worktrees concurrently, a separate Vite cache avoids interference;
the current preview was started using:

```powershell
node --input-type=module -e "const {createServer}=await import('vite');const app=await createServer({cacheDir:'node_modules/.vite-home-intro',server:{host:'127.0.0.1',port:5200,strictPort:true}});await app.listen();app.printUrls()"
```

Use a fresh tab/private window to test the first entry. If autoplay is blocked,
read the captions and activate sound by keyboard or touch. Mute, open Mars/Moon
or a Rover story, return Home, and refresh: no Welcome replay or default bubble
should appear. Explicit planet interactions should still show the matching text.

For automated browser QA, launch an installed Chrome with a new external QA
profile, loopback debugging port 9339 and normal autoplay policy, then run:

```powershell
node scripts/home-introduction-qa.mjs C:\path\outside-checkout\qa http://127.0.0.1:5200 9339
node --test tests/home-introduction.test.mjs tests/homepage-narration.test.mjs
node --test tests/*.test.mjs
npx.cmd tsc -b --pretty false
npm.cmd run build
git diff --check
```

Run browser QA against stable source files; Vite reloads triggered by edits or
build metadata invalidate a live document being inspected.

## Limits

Audible autoplay cannot be guaranteed on every browser; the explicit fallback is
required. With session storage denied, an in-memory fallback prevents repeats
during SPA navigation, but cannot remember a visit across a full reload without
some permitted storage. Browser session restoration may retain sessionStorage.
Caption timing remains the existing approximate phrase timing, not new verified
word timestamps. Physical mobile audio, Safari/iOS, human listening and screen
reader review remain manual checks. The 58 inherited suite failures are unchanged.

Initial validation was performed locally without publication. Subsequent approval
authorizes a feature-branch commit, push and Draft PR targeting main. Keep the PR
in Draft until Haroon reviews the behavior. Merging or modifying main remains
unauthorized; the locations worktree and PR #1 must remain untouched.
