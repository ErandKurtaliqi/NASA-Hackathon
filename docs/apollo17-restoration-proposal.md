# Apollo 17 original-text restoration proposal

**Status: proposed, not approved.** The user confirmed that Haroon has not
explicitly approved the four individual original recordings. These paragraphs
are copied from the existing package scripts, not newly transcribed or rewritten.
They are not deployed as approved narrative. Original MP3 bytes are preserved.

The independently deployable fix enforces Apollo 17's existing editorial holds
and adds the verified references to Mission sources. Current alternate readings
remain in the published narrative while approval is pending. A held original
must not play alongside a different reading.

## Three Journeys, One Moon — chapter 2, segment 4

> Three journeys...one world, around 4 hours 26 minutes of exploring! With Cernan and Schmitt beside me, I travelled around 35.9 km across the Moon. Together, we turned a distant world into a place of discovery!

Source: [NASA NSSDCA rover overview](https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_lrv.html).
The figures refer to **driving time**, not total lunar EVA activity. Haroon must
accept the original phrase "of exploring" with that explicit context, or approve
a revised script and a matching corrected recording. File: `/audio/apollo-17/chapter-2/4.mp3`.

## A Warning from My Battery — chapter 3, segment 2

> On my third Moonwalk, my second battery's temperature gauge failed! The astronauts used the first battery and my earlier readings to track its heat. But I kept rolling!

Source: [Apollo 17 Mission Report](https://ntrs.nasa.gov/api/citations/19730015117/downloads/19730015117.pdf),
section 9.1, printed page 9-1, PDF page 129. The fault affected the **temperature
indicator**, not the battery's power supply. The complete source page was
text-extracted and checked. File: `/audio/apollo-17/chapter-3/2.mp3`.

## Mystery of Orange Soil — chapter 3, segment 3

> As we reached Shorty Crater, Schmitt spotted something amazing—orange soil! Those tiny glass beads were born from ancient lunar volcanoes, around 3.7 billions of years ago!

Source: [NASA SP-350, chapter 14.6](https://www.nasa.gov/wp-content/uploads/static/history/SP-350/ch-14-6.html),
which reports historical cooling ages of **3.5–3.7 billion years**, and the
[NASA Lunar Sample Compendium for 74220](https://www.lpi.usra.edu/lunar/samples/atlas/compendium/74220.pdf),
which records multiple age determinations. Other NASA summaries use about 3.6
billion years. Haroon must approve the historical approximation/source and the
original wording, or choose another formulation with a corrected recording.
The original's grammar is preserved here because this is the supplied script,
not a fabricated verbatim ASR transcript. File: `/audio/apollo-17/chapter-3/3.mp3`.

## My Final Place — chapter 4, segment 1

> The goodbye was coming... Cernan carefully parked me about 158 meters from Challenger. Mission Control aimed my camera toward the sky. I was ready to watch my friends rise... while I remained alone on the Moon

Source: [NASA History's Apollo 17 surface account](https://www.nasa.gov/history/50-years-ago-apollo-17-lands-at-taurus-littrow/).
It supports the final VIP parking position **approximately 158 meters** from the
lunar module and the camera's liftoff coverage. File: `/audio/apollo-17/chapter-4/1.mp3`.

## Verification and release condition

All four files match the original inventory SHA-256 values. MPEG frames and full
decoded audio samples are valid. Local ASR corroborates the expected content,
including "exploring", the temperature gauge, 3.7 billion years, and 158 meters;
it remains a machine candidate and is not human listening approval.

The local review artifacts contain `proposed-texts.json`,
`proposed-moonRecordings.ts`, and `restoration-proposal.patch` under
`../qa-artifacts/apollo17-alignment/`. The patch proposes only removing the four
alternate `readingText` overrides. It does not change MP3 bytes or enable
playback. No proposal is automatically applied by the application or build.

Before restoring/enabling any original, record Haroon's explicit per-recording
decision, source/context choice, and full listening confirmation. Preserve the
scientific note and source link. The approval already recorded for Apollo 11
4/4 remains valid and does not extend to these Apollo 17 clips.
