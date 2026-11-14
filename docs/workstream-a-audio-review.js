/* Local-only editorial aid. No network requests except loading one chosen local
 * audio/image; no storage, autoplay, uploads or progress changes. */
(() => {
  const data = window.apollo15AudioReview, byId = id => document.getElementById(id)
  const audio = byId('audio'), picker = byId('recording'), transcript = byId('transcript')
  const drafts = new Map()
  let selected = 0
  // The reviewer lives in /docs and is served by a plain static server, which
  // does not apply Vite's public-directory URL mapping. The same relative path
  // resolves correctly from both file:// and the documented HTTP location.
  const asset = path => `../public${path}`
  const track = () => data.recordings[selected]
  const draft = () => {
    if (!drafts.has(track().path)) drafts.set(track().path, { transcript: track().candidateScript, reviewer: '', reviewed: false, cues: [] })
    return drafts.get(track().path)
  }
  data.recordings.forEach((item, index) => {
    const option = document.createElement('option'); option.value = String(index)
    option.textContent = `${item.chapter}.${item.segment} — ${item.title}`; picker.append(option)
  })
  const capture = () => Math.round(audio.currentTime * 1000) / 1000
  function validation() {
    const cues = draft().cues
    if (!cues.length) return 'Add and check sentence cues before a reviewed export.'
    if (!Number.isFinite(audio.duration)) return 'Load and listen to this recording before reviewing its decoded time range.'
    let previousEnd = 0
    for (let i = 0; i < cues.length; i++) {
      const cue = cues[i]
      if (!cue.text.trim()) return `Cue ${i + 1} needs checked transcript text.`
      if (!Number.isFinite(cue.start) || !Number.isFinite(cue.end) || cue.start < previousEnd || cue.end <= cue.start || cue.end > audio.duration) return `Cue ${i + 1} needs ordered start/end times inside this recording. Gaps are allowed; overlaps are not.`
      if (cue.mediaId && !Object.hasOwn(data.media, cue.mediaId)) return `Cue ${i + 1} has unknown evidence.`
      previousEnd = cue.end
    }
    if (!draft().reviewer.trim() || !draft().reviewed) return 'Enter the reviewer name and confirm the listening review to enable reviewed export.'
    return ''
  }
  function refreshValidation() {
    const message = validation()
    byId('validation').textContent = message || 'Ready for a manually reviewed export. No automated verification is implied.'
    byId('export-reviewed').disabled = Boolean(message)
  }
  function evidenceOptions(select, selectedId, optional = true) {
    if (optional) { const option = document.createElement('option'); option.value = ''; option.textContent = 'No timed image change'; select.append(option) }
    Object.entries(data.media).forEach(([id, media]) => {
      const option = document.createElement('option'); option.value = id; option.textContent = `${media.title} — ${media.kind}`; select.append(option)
    })
    select.value = selectedId || (optional ? '' : 'rover')
  }
  function renderCues() {
    const list = byId('cues'); list.replaceChildren()
    if (!draft().cues.length) { const p = document.createElement('p'); p.textContent = 'No timed cues. This recording remains pending.'; list.append(p) }
    draft().cues.forEach((cue, index) => {
      const card = document.createElement('article'), heading = document.createElement('h3')
      heading.textContent = `Cue ${index + 1}`; card.append(heading)
      const textLabel = document.createElement('label'); textLabel.textContent = 'Checked sentence text '
      const text = document.createElement('textarea'); text.value = cue.text; text.addEventListener('input', () => { cue.text = text.value; draft().reviewed = false; byId('reviewed').checked = false; refreshValidation() }); textLabel.append(text); card.append(textLabel)
      const row = document.createElement('div'); row.className = 'row'
      for (const field of ['start', 'end']) {
        const label = document.createElement('label'); label.textContent = `${field === 'start' ? 'Start' : 'End'} seconds `
        const input = document.createElement('input'); input.type = 'number'; input.min = '0'; input.step = '.001'; input.value = cue[field] ?? ''
        const update = value => { cue[field] = value; draft().reviewed = false; byId('reviewed').checked = false; refreshValidation() }
        input.addEventListener('input', () => update(input.value === '' ? null : Number(input.value)))
        label.append(input); row.append(label)
        const button = document.createElement('button'); button.type = 'button'; button.textContent = `Capture ${field} at current playback time`
        button.addEventListener('click', () => { const seconds = capture(); input.value = String(seconds); update(seconds) }); row.append(button)
      }
      card.append(row)
      const label = document.createElement('label'); label.textContent = 'Optional verified image '
      const image = document.createElement('select'); evidenceOptions(image, cue.mediaId)
      image.addEventListener('change', () => { cue.mediaId = image.value; draft().reviewed = false; byId('reviewed').checked = false; refreshValidation() }); label.append(image); card.append(label)
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'danger'; remove.textContent = `Remove cue ${index + 1}`
      remove.addEventListener('click', () => { draft().cues.splice(index, 1); draft().reviewed = false; byId('reviewed').checked = false; renderCues(); byId('add-cue').focus() }); card.append(remove); list.append(card)
    })
    refreshValidation()
  }
  function previewEvidence() {
    const media = data.media[byId('evidence').value]
    byId('image').src = asset(media.src); byId('image').alt = media.alt
    const caption = byId('credit'); caption.replaceChildren()
    caption.append(document.createTextNode(`${media.kind}. ${media.caption} Credit: ${media.credit}. `))
    const source = document.createElement('a'); source.href = media.sourceUrl; source.textContent = 'Official source'; source.target = '_blank'; source.rel = 'noreferrer'; caption.append(source)
  }
  function choose(index, focus = true) {
    audio.pause(); selected = index; picker.value = String(index); audio.src = asset(track().path); audio.load()
    byId('recording-title').textContent = `Chapter ${track().chapter}, segment ${track().segment}: ${track().title}`
    byId('metadata').textContent = `${track().frames} MPEG frames; encoded duration ${track().encodedDurationSeconds.toFixed(3)} seconds (not sentence timing). SHA-256 ${track().sha256}`
    byId('question-context').textContent = track().questionContext ? `Question context only — not an audio transcript: ${track().questionContext}` : ''
    transcript.value = draft().transcript
    byId('script-status').textContent = track().candidateScriptSource
    byId('load-asr').disabled = !track().asrCandidate
    byId('reviewer').value = draft().reviewer; byId('reviewed').checked = draft().reviewed
    byId('audio-error').hidden = true
    const sources = byId('script-sources'); sources.replaceChildren()
    for (const source of track().originalScriptSources) { const p = document.createElement('p'), a = document.createElement('a'); a.href = source.url; a.textContent = source.label; a.target = '_blank'; a.rel = 'noreferrer'; p.append(a); sources.append(p) }
    byId('evidence').value = track().contextualMediaId || 'rover'; previewEvidence(); renderCues()
    byId('previous').disabled = index === 0; byId('next').disabled = index === data.recordings.length - 1
    if (focus) byId('recording-title').focus()
  }
  function download(reviewed) {
    if (reviewed && validation()) return
    const cues = draft().cues.map(cue => ({ start: cue.start, end: cue.end, text: cue.text.trim(), ...(cue.mediaId ? { mediaId: cue.mediaId } : {}) }))
    const output = { recordingPath: track().path, recordingSha256: track().sha256, transcript: draft().transcript,
      timing: reviewed ? { status: 'verified', reviewedBy: draft().reviewer.trim(), reviewedOn: new Date().toISOString().slice(0, 10), cues } : { status: 'candidate-not-approved', cues },
      note: 'Exported locally by a human reviewer; not automatically integrated or independently certified.' }
    const url = URL.createObjectURL(new Blob([JSON.stringify(output, null, 2) + '\n'], { type: 'application/json' }))
    const link = document.createElement('a'); link.href = url; link.download = `apollo15-${track().chapter}-${track().segment}-${reviewed ? 'reviewed' : 'draft'}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  picker.addEventListener('change', () => choose(Number(picker.value)))
  byId('previous').addEventListener('click', () => choose(selected - 1)); byId('next').addEventListener('click', () => choose(selected + 1))
  transcript.addEventListener('input', () => { draft().transcript = transcript.value; draft().reviewed = false; byId('reviewed').checked = false; refreshValidation() })
  byId('add-cue').addEventListener('click', () => { draft().cues.push({ start: null, end: null, text: transcript.value.slice(transcript.selectionStart, transcript.selectionEnd), mediaId: '' }); draft().reviewed = false; byId('reviewed').checked = false; renderCues(); byId('cues').lastElementChild.querySelector('textarea').focus() })
  byId('load-asr').addEventListener('click', () => {
    const asr = track().asrCandidate
    if (!asr) return
    draft().transcript = asr.transcript; transcript.value = asr.transcript; draft().reviewed = false; byId('reviewed').checked = false
    draft().cues = asr.sentenceCandidates.map(cue => ({ start: cue.start, end: cue.end, text: cue.text, mediaId: '' }))
    byId('script-status').textContent = 'Local ASR candidate loaded. All words and timestamps remain unreviewed. Loading a draft never approves it.'
    renderCues()
  })
  byId('reviewer').addEventListener('input', () => { draft().reviewer = byId('reviewer').value; refreshValidation() })
  byId('reviewed').addEventListener('change', () => { draft().reviewed = byId('reviewed').checked; refreshValidation() })
  byId('export-draft').addEventListener('click', () => download(false)); byId('export-reviewed').addEventListener('click', () => download(true))
  byId('evidence').addEventListener('change', previewEvidence)
  audio.addEventListener('timeupdate', () => { byId('clock').textContent = `Playback time: ${audio.currentTime.toFixed(3)} seconds` })
  audio.addEventListener('loadedmetadata', refreshValidation)
  audio.addEventListener('error', () => { byId('audio-error').hidden = false })
  document.addEventListener('visibilitychange', () => { if (document.hidden) audio.pause() })
  window.addEventListener('pagehide', () => audio.pause())
  evidenceOptions(byId('evidence'), 'rover', false); choose(0, false)
})()
