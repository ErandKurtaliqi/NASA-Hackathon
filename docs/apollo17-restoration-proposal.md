# Apollo 17 original-text restoration - approved

**Status: approved restoration.** The user supplied Haroon's explicit response:
"Yes. We must have to match our text with narration." The four paragraphs below
are restored from the existing package scripts, not newly transcribed or
rewritten. Their matching original recordings are enabled without changing MP3
bytes. Editorial approval is distinct from machine spoken-content verification.

The general editorial-hold guard remains in place. The four approved Apollo 17
records are enabled individually and their alternate reading overrides are
removed. Scientific context and references remain separately in Mission sources.
This approval does not extend to the pending Apollo 11 deployment recordings.

## Three Journeys, One Moon — chapter 2, segment 4

> Three journeys...one world, around 4 hours 26 minutes of exploring! With Cernan and Schmitt beside me, I travelled around 35.9 km across the Moon. Together, we turned a distant world into a place of discovery!

Source: [NASA NSSDCA rover overview](https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_lrv.html).
The figures refer to **driving time**, not total lunar EVA activity. The approved
original phrase "of exploring" is preserved; that distinction remains in Mission
sources. File: `/audio/apollo-17/chapter-2/4.mp3`.

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
billion years. The approved original approximation and wording are restored with
the historical range and other estimates retained as separate scientific context.
The original's grammar is preserved here because this is the supplied script,
not a fabricated verbatim ASR transcript. File: `/audio/apollo-17/chapter-3/3.mp3`.

## My Final Place — chapter 4, segment 1

> The goodbye was coming... Cernan carefully parked me about 158 meters from Challenger. Mission Control aimed my camera toward the sky. I was ready to watch my friends rise... while I remained alone on the Moon

Source: [NASA History's Apollo 17 surface account](https://www.nasa.gov/history/50-years-ago-apollo-17-lands-at-taurus-littrow/).
It supports the final VIP parking position **approximately 158 meters** from the
lunar module and the camera's liftoff coverage. File: `/audio/apollo-17/chapter-4/1.mp3`.

## Verification and approval record

All four files match the original inventory SHA-256 values. MPEG frames and full
decoded audio samples are valid. Local small/base ASR corroborates the content,
including "exploring", the temperature gauge, 3.7 billion years, and 158 meters;
it remains machine verification and is not a human-listening certificate.

The historical proposal artifacts remain under
`../qa-artifacts/apollo17-alignment/`. Current verification evidence is under
`../qa-artifacts/apollo17-approved/`. The application now implements the approved
four-text restoration and explicit playback decisions; no external patch is
automatically applied by the application or build.

Haroon's approval is recorded per Apollo 17 original in `held-recordings.json`
and `moonRecordings.ts`. No separate personal listening confirmation is inferred.
The existing Apollo 11 4/4 approval remains valid. Apollo 11 2/3 and 2/4 remain
held for their independent deployment-attribution review.
