# Seven recordings on hold — evidence and decisions

## Current Apollo 11 decision

This update supersedes the historical Apollo 11 playback state below. The
original recordings are present in current `ErandKurtaliqi/NASA-Hackathon` main.
No MP3 bytes were changed.

- **Chapter 2 / segment 3 - Carried Out by Hand:** remains held. The original
  attributes transport to Buzz and deployment to Neil. Sources A and B disagree
  about deployment attribution. No corrected, approved recording is available.
  The reading continues to credit the crew collectively, with its source note.
- **Chapter 2 / segment 4 - Set Down Once, Forever:** remains held for the same
  individual attribution. Source A supports the approximate 14-meter placement;
  distance is no longer the reason for this hold. Reconcile attribution with the
  primary chronology and provide/approve a recording consistent with the chosen
  account. The original is preserved and is not silently enabled.
- **Chapter 4 / segment 4 - More Than a Mirror:** approved and enabled. The user
  explicitly confirmed that Haroon listened to and approved the complete original
  recording (about 19.3 seconds), SHA-256
  `4166f8c94a0b51b81bc113f1c81c31f6fc39c67621d76eda5eaabc3283d47bc4`.
  Approval was confirmed on 2026-11-15. Source A supports placement approximately
  14 meters from Eagle. The displayed reading now uses the approved original
  script. Mission sources retains a provenance note explaining passive reflection.
  Human listening approval comes from Haroon, relayed by the user; automated
  transcription is not represented as human listening by the agent.

The first two holds are editorial, not missing files or playback failures.
Approval for 4/4 does not apply to 2/3, 2/4, or Apollo 17. Caption timing remains
pending. Meet Me's duplicate heading is removed only from the displayed script;
the original audio and source archive remain unchanged.

## Current Apollo 17 decision and restoration proposal

The user explicitly confirmed that individual listening/editorial approval for
the four Apollo 17 originals has **not** been obtained. Haroon requested that
the text/audio mismatch be corrected; that request is not recorded as approval
of the individual original recordings. The original scripts are prepared for
review, not published as editorially approved. Existing alternate readings are
retained until confirmation. All original MP3 bytes remain unchanged.

The continuous reader previously ignored `review-required` for Apollo 17, even
though the recording metadata retained those holds. It now enforces the same
per-recording decision for Apollo 11 and Apollo 17. An alternate reading no
longer plays alongside a held, different original. The approval for Apollo 11
4/4 remains valid and its playback is unchanged.

- **2/4, Three Journeys, One Moon:** Source C supports 35.9 km and 4 h 26 min of
  driving across the traverses. This is not the total lunar EVA time. The
  proposed original says "of exploring"; Haroon must explicitly accept that
  wording with its driving-time context or approve revised text and a matching
  corrected recording. The supported numbers themselves are not the blocker.
- **3/2, A Warning from My Battery:** The complete mission report was downloaded
  and its PDF page 129, printed page 9-1, section 9.1, was text-extracted. It
  describes battery 2's temperature indication going off-scale low, a probable
  thermistor fault, and monitoring using battery 1 and earlier trends. The
  original correctly describes a temperature gauge, not a loss of battery
  power. Listening/editorial confirmation is still required for restoration.
- **3/3, Mystery of Orange Soil:** The recording says approximately 3.7 billion
  years. [NASA SP-350, chapter 14.6](https://www.nasa.gov/wp-content/uploads/static/history/SP-350/ch-14-6.html)
  gives cooling ages of 3.5 to 3.7 billion years. The [NASA Lunar Sample Compendium,
  sample 74220](https://www.lpi.usra.edu/lunar/samples/atlas/compendium/74220.pdf)
  reports multiple age estimates, including approximately 3.6 and 3.7 billion
  years. This supports a historical approximation; it does not make all published
  estimates identical. Source E's approximately 3.6-billion-year summary remains
  preserved. Haroon must approve the selected source/approximation and original
  wording, or approve a corrected recording. No 3.6-billion-year text is labeled
  as a verbatim transcript of the original.
- **4/1, My Final Place:** Source F supports the approximate 158-meter final VIP
  parking position and televising liftoff. The original approximation is
  supported; listening/editorial approval is still required for restoration.

Local ASR was run against the four unchanged originals. It corroborates the
expected script content, including "exploring", "temperature gauge", 3.7 billion
years, and 158 meters. This is a machine candidate, not human listening approval
or a replacement transcript/caption. The four direct source links and scientific
precisions are available in Mission sources. No clarification boxes were added
back into the narrative.

## Historical review record

This review updates the earlier classification. It leaves scripts, recordings, and playback permissions intact. The files, chapter and segment assignments, and SHA-256 hashes for all seven tracks match the local inventory. Listening is still required to confirm what the recordings say. [held-recordings.json](held-recordings.json) contains the complete expected scripts, hashes, MPEG durations, and current reading text from `4f6d380`.

The seven segments are silent in the local backup and display explanatory text. This GitHub review excludes all 38 new Apollo 11 and Apollo 17 recordings. File availability and scientific review are separate conditions. There is no text-to-speech fallback. Apollo 15 and the homepage retain their published recordings.

## Primary sources consulted

- **A — [NASA/ALSJ, Apollo 11 Moonwalk Pictures](https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11_eva_thumbs.html)**: The deployment section near photographs AS11-40-5942–5945 attributes deployment to Aldrin and places the reflector about 14 m away. The page's authorship is credited. This report uses a citation and paraphrase.
- **B — [NASA History, One Small Step, One Giant Leap](https://www.nasa.gov/history/50-years-ago-one-small-step-one-giant-leap/)**: The EASEP account attributes transport to Aldrin and the reflector to Armstrong. This attribution differs from source A.
- **C — [NASA/NSSDCA, The Apollo Lunar Roving Vehicle](https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_lrv.html)**: Apollo 17 drove about 35.9 km over 4 h 26 min. The figure measures driving across the three EVAs.
- **D — [NASA, Apollo 17 Mission Report, section 9.1, printed page 9-1](https://ntrs.nasa.gov/api/citations/19730015117/downloads/19730015117.pdf)**: Battery 2's temperature indication went off-scale at the start of EVA 3, probably because of a shorted thermistor. The report describes monitoring battery 1 and using previous trends from battery 2. The review verified the passage indexed by NASA search. The 14.8 MB PDF could not be opened for visual inspection. The earlier ALSJ link returned 404.
- **E — [NASA Science, History of Lunar Exploration](https://science.nasa.gov/solar-system/moon/history-of-lunar-exploration/)**: The Apollo 17 section describes orange volcanic material around 3.6 billion years old. Use wording consistent with the selected source and account for other published estimates.
- **F — [NASA History, Apollo 17 Lands at Taurus-Littrow](https://www.nasa.gov/history/50-years-ago-apollo-17-lands-at-taurus-littrow/)**: The paragraph about the VIP site puts the final parking spot approximately 158 m from the lunar module, where the rover could televise the ascent.

## Review by file

All audio paths are relative to the private local worktree `moon-storytelling-qa`. The recordings are outside this review branch.

| Mission / file | Expected script claim | Current classification and evidence | Audio decision |
| --- | --- | --- | --- |
| Apollo 11 `public/audio/apollo-11/chapter-2/3.mp3` | Buzz carried the reflector and Neil deployed it on July 21, 1969 | A and B disagree on who placed it. July 21 may be the UTC date | Keep the reading's crew attribution until the primary transcripts and chronology are reconciled. If approval changes the named astronaut, review the audio separately and retain the original |
| Apollo 11 `public/audio/apollo-11/chapter-2/4.mp3` | Neil placed it about 14 m away, leveled it, and oriented it | A supports the distance. A and B differ on attribution | Retain the supported distance. Resolve attribution before approving audio. The reading can continue to credit the crew collectively |
| Apollo 11 `public/audio/apollo-11/chapter-4/4.mp3` | It remains about 14 m from Eagle | A supports the figure. Editorial approval and listening remain pending | Haroon can approve the original after checking the complete recording |
| Apollo 17 `public/audio/apollo-17/chapter-2/4.mp3` | 35.9 km and about 4 h 26 min of exploration | C supports the figures and identifies the duration as driving time. Reconcile the sources and rounding behind 35.7 and 35.9 km | Clarify driving time using C. Haroon decides whether the recording needs revised wording. Hold the original clip pending review |
| Apollo 17 `public/audio/apollo-17/chapter-3/2.mp3` | Battery 2's temperature indicator failed in the third EVA. The crew used battery 1 and earlier readings to estimate the temperature | D supports the event and method. Battery 2 continued to supply power. The thermistor diagnosis is probable | No file mapping problem or required script edit was found. Check that the clip describes the indicator and compare it with page 9-1 before approval |
| Apollo 17 `public/audio/apollo-17/chapter-3/3.mp3` | Orange volcanic glass around 3.7 billion years old | E and the current reading use roughly 3.6 billion years. File integrity checks cannot resolve the discrepancy | Approve wording that matches the selected source. If 3.6 billion is selected, the clip stating 3.7 billion cannot be captioned as if it said 3.6 billion. Keep the hold until an editorial decision |
| Apollo 17 `public/audio/apollo-17/chapter-4/1.mp3` | Cernan parked approximately 158 m from Challenger | F supports the distance and the purpose of the TV camera. An internal note requesting omission of distances does not invalidate the NASA source | The distance requires no scientific edit. Haroon can approve the original after listening to the location, camera, and farewell in context |

**Technical results:** The review found zero required file mapping fixes, changed zero MP3s, invented zero cues, and enabled zero tracks. The seven recordings await human acceptance. The corroborated claims should be credited accordingly.

## Decisions for Haroon

1. Apollo 11 2/3 and 2/4: resolve individual attribution using the primary chronology or approve crew-wide attribution. Preserve both recordings.
2. Apollo 11 4/4: accept the supported approximation of 14 m after listening and confirming rights.
3. Apollo 17 2/4: select a source and distance convention, distinguish driving from EVA duration, and assess the original wording in context.
4. Apollo 17 3/2: accept the indicator event documented on page 9-1 after confirming the clip does not claim that battery power was lost.
5. Apollo 17 3/3: choose the age, source, and audio treatment. Make the discrepancy clear in the reading and narration.
6. Apollo 17 4/1: accept the NASA-supported 158 m approximation after hearing the full clip.

## Listening checkpoints

Open each original track in the local worktree by filename and SHA. Listen in full and record the reviewer, date, and result. Audio approval requires access to the original recordings.

- 11 2/3 (~17.40 s of MPEG frames): check Buzz and Neil, the verbs for carrying and deploying, the date and time zone, and any cuts or content from another mission.
- 11 2/4 (~14.99 s): check who placed it, “about 14 meters,” leveling, and orientation. Compare with the source text to resolve attribution.
- 11 4/4 (~19.33 s): check “about 14 meters” and that the clip describes a passive reflector. Approve if the full script and audio agree.
- 17 2/4 (~17.79 s): check 35.9 km and 4 h 26 min of driving in the context of all surface work. Verify units and context.
- 17 3/2 (~11.47 s): check the second battery's indicator, the third EVA, and the estimate using the first battery. Distinguish the sensor from the power supply.
- 17 3/3 (~14.68 s): check Shorty, Schmitt, volcanic glass, and the exact audible number. Record any discrepancy with the captions.
- 17 4/1 (~18.05 s): check Cernan, Challenger, “about 158 meters,” and the camera pointed toward the ascent. Confirm the chapter assignment.

The durations are sums of MPEG frame lengths. After approving the text and listening, measure the actual phrase start and end times and associate them with the same file hash. Derive caption timings from the recording.
