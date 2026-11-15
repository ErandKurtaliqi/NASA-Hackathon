# Final corrections to the documentary

## Baseline and scope

Repository: `ErandKurtaliqi/NASA-Hackathon`. The baseline was verified with fetch,
worktree list, status, switch main, and pull --ff-only:
`24dcbecb00ae0cd565612d34cec4cfe0b7a9b248`.

The checkout that existed in `Auroralys/Auroralys` points to another repository,
`ErandKurtaliqi/Auroralys`, with several workstrees. It was preserved in full and the requested
repository was cloned in `Auroralys/NASA-Hackathon`, over `main`. No branches were created or
modified in the previous three PRs.

## Changes

- The Scientific clarification boxes were removed from the articles. Each original note, identified
  by chapter and segment, and its scientific link remains available in the Scientific review notes
  and sources drop-down of Mission sources. They did not change scripts, scientific data, or audio
  retentions by revision. The audio notice now indicates that location.
- Apollo 16 had two children in a grid designed for three: icon, paragraph and button. The paragraph
  fell in the 22 px column destined for the icon. A class of its own corrects that grid even outside
  of the continuous documentary. The general quiz retains its original structure.
- Within the reader, perhaps and results grow with their content, without the global minimum of 580
  px or their excessive padding. Feedback uses flex with line setting; the next button can pass
  under the paragraph. Answers and explanations use 16 px. The reader keeps the native scroll and
  focus.
- The title shares the header on desktop and occupies its next row on mobile. Padding and margins
  with responsive sizes were reduced; Sources and Sound remain accessible. Mission Control is still
  available on mobile via the dashboard link at the end of the documentary; it is avoided to
  duplicate it in the header.
- They did not change scores, responses, persistence, activities, chapter completion buttons,
  timeline, or return destinations to the planet.

Actual measurements of Apollo 16 in 1600×667:

| Medida | Before | After |
| --- | ---: | ---: |
| Reader height | 347,94 px | 470,89 px |
| Stage height and evidence panel | 373,53 px | 496,48 px |
| Width of incorrect feedback paragraph | 22 px | 591,13 px |

## Automated validation

- `npm ci`: correct, no change in dependencies.
- `node --test tests/documentary-layout.test.mjs tests/documentary-quiz-results.test.mjs tests/documentary-ux.test.mjs tests/progress-persistence.test.mjs`: **39 approved, 0 failed**. The
  nine new tests verify the preservation of notes and fonts throughout the catalog, including Eagle
  as extra coverage.
- `npx tsc --project tsconfig.app.json --noEmit --incremental false`: passed.
- `npm run build`: correct. Keep the warning of chunks greater than 500 kB.
- `node --test tests/*.test.mjs`: the baseline had **269/342 passes and 73 failures**. The updated branch had **278/351 passes and the same 73 failures**. Comparing failing test names showed **0 new regressions**. The 58 failures mentioned in the request differ from the baseline observed in this repository and environment. Missing historical references, contracts from earlier versions, and incompatible legacy fixtures were outside this work.

## Real QA in browser

Chrome real headless versus `vite preview`, production compilation, no app, audio, storage, or
network mocks. **40 approved paths, 0 failed**:

| Stories | Resolutions |
| --- | --- |
| Apollo 11 LRRR, Apollo 15, Apollo 16, Apollo 17 | 1600×667, 1366×768, 1440×900, 1024×768, 390×844 |
| Ingenuity, Sojourner, Opportunity, Viking 1 | The same five resolutions |

Each tour checks: absence of boxes in the story, notes and preserved fonts, five buttons in the
timeline, scroll with PageDown and wheel, real playback and mute, selection of the quiz recording,
correct and incorrect answers, focus and advance with Tab/Enter, Next Question and View Results,
result 2/3, Complete Story, badge, persistence, retry without deleting the result, reloading and
absence of horizontal overflow in feedback and results. Destinations `/explore/moon` and
`/explore/mars` are checked. There were no JavaScript errors or unexpected transport errors;
abortions for changing segments are normal.

Real captures of Apollo 16: correct and incorrect feedback on the five resolutions and clean
narrative; also captured the Viking narrative 1. Local artifacts in
`../qa-artifacts/urgent-final-qa/production-browser/`, with measurements and results of the 40 cases
in `results.json`.

Play the QA: start `npm run preview -- --port 5179 --strictPort` after the build, have Playwright in
the QA environment and run:

```powershell
$env:AURORALYS_PLAYWRIGHT_MODULE = 'C:\ruta\node_modules\playwright\index.mjs'
$env:AURORALYS_CHROME_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$env:AURORALYS_QA_URL = 'http://127.0.0.1:5179'
$env:AURORALYS_QA_OUTPUT = 'C:\ruta\artefactos-qa'
node scripts/verify-documentary-layout.mjs
```

Implementation files: `ContinuousStoryPage.tsx`, `ContinuousStoryPage.module.css`,
`Apollo16Quiz.tsx`, `ApolloQuiz.module.css` and `DocumentaryAudio.tsx`, all in
`src/components/storytelling/`. Coverage and documentation: `tests/documentary-layout.test.mjs`,
`scripts/verify-documentary-layout.mjs` and this report.

Legacy pending: the 73 baseline bugs and the Bundle size notice. No new problems detected in the
eight requested stories.
