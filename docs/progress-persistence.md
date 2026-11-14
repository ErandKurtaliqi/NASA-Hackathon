# Progress persistence reliability

## Cause and correction

Zustand's persist middleware updates memory before calling `localStorage.setItem`.
A rejected write previously threw after the chapter was already complete in memory.
Perseverance's completion UI (and the quiz practice notice) treated that memory as
proof of a saved mission, even if the badge write had never happened.

`src/store.ts` now uses a synchronous storage adapter and a separate, non-persisted
`useProgressPersistence` store. Progress actions invalidate the save acknowledgement
before memory subscribers receive new progress. Only a successful storage write
sets the acknowledgement to `saved`; rejected writes set `error` and keep the
session usable. `retryProgressSave` writes the current full snapshot through the
existing middleware without replaying chapter or badge actions. A subsequent
successful normal action also saves earlier session changes.

The storage key remains `beyond-earth-progress`, version 0. Serialized fields,
chapter records, legacy flat records and badge identifiers are unchanged. The
original progress action bodies and successful Apollo behavior are preserved.
The adapter does not remove existing records on failure. If the initial read or
JSON parsing fails, writes are blocked to protect unread records; recovery requires
restoring storage access and reloading (the UI explains the loss of session-only
changes on reload).

## Completion UI

Perseverance Chapter 5 distinguishes session completion from saved completion.
An accessible alert explains rejected writes and offers **Retry saving**. Repeated
failures announce their attempt number; a successful retry restores the saved
confirmation and focuses the existing completion heading. Quiz answers, score and
retry behavior remain independent. The quiz's practice notice describes completion
in this session and refers to the mission record for save status.

No homepage, brand, menu, explorer, 3D, science or NASA credit changes are included.

## Automated validation

Run `node --test tests/*.test.mjs`, `npm.cmd run build` and `git diff --check`.
Tests use the actual Zustand store and the existing component/hook test harness.
They cover successful saves, quota rejection, blocked storage access, partial
chapter/badge saves, repeated failed retries, recovery, reload, legacy progress,
schema stability, idempotent badges, quiz practice, dashboard and other story routes.
They also check that memory observers never receive new data with a stale `saved`
acknowledgement. Browser-native focus and screen-reader speech remain manual QA.

## Manual browser check

1. In a separate browser test profile, complete Chapters 1–4 and the quiz.
2. In DevTools, temporarily reject writes to this key:

   ```js
   window.auroralysOriginalSetItem = Storage.prototype.setItem;
   Storage.prototype.setItem = function (key, value) {
     if (key === 'beyond-earth-progress') {
       throw new DOMException('Test storage rejection', 'QuotaExceededError');
     }
     return window.auroralysOriginalSetItem.call(this, key, value);
   };
   ```

3. Choose **Complete Story**. Verify the warning, session-only badge wording, quiz
   results and absence of saved confirmations. Choose **Retry saving** twice;
   verify the failure announcements with a screen reader and keyboard focus.
4. Restore writes without reloading:

   ```js
   Storage.prototype.setItem = window.auroralysOriginalSetItem;
   delete window.auroralysOriginalSetItem;
   ```

5. Retry saving. Verify the saved confirmation, then reload and check the dashboard,
   completed chapters and single reward. Quiz practice must not change those records.
6. Check the warning at mobile widths, 200% zoom and with reduced motion enabled.

Saving acknowledges the browser storage operation on this device, not cloud sync
or protection from later browser-data deletion. Existing cross-tab last-writer
behavior is unchanged. The recovery alert is scoped to Perseverance Chapter 5;
this change does not introduce notifications across other pages.
