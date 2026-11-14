import { useEffect, useRef, useState } from 'react'
import { retryProgressSave, useProgressPersistence } from '../../store'

/** Visible from any chapter; no progress/schema changes and no scene reflow. */
export default function DocumentarySaveWarning() {
  const { status, reason } = useProgressPersistence()
  const [recovered, setRecovered] = useState(false), [attempts, setAttempts] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { if (status === 'error') { setRecovered(false); heading.current?.focus({ preventScroll: true }) } }, [status, reason])
  if (status !== 'error' && !recovered) return null
  return <section aria-label="Progress storage warning" data-documentary-save-warning>
    <h2 ref={heading} tabIndex={-1}>{recovered ? 'Progress saved on this device' : 'Progress is not saved on this device'}</h2>
    <p role={recovered ? 'status' : 'alert'}>{recovered ? 'Your session progress has now been saved.' : reason === 'read' ? 'Existing progress could not be loaded. Saving is paused to protect it. Allow storage, then reload; unsaved session changes will be lost.' : 'Your latest changes are only in this session. Keep this page open, allow browser storage or free space, then retry. Previously saved progress remains intact.'}</p>
    {reason === 'read' ? <button type="button" onClick={() => window.location.reload()}>Reload saved progress</button> : <button type="button" onClick={() => { if (recovered) { setRecovered(false); document.querySelector<HTMLElement>('[data-documentary-reader]')?.focus({ preventScroll: true }) } else if (retryProgressSave()) setRecovered(true); else setAttempts(n => n + 1) }}>{recovered ? 'Return to story' : 'Retry saving'}</button>}
    {attempts > 0 && !recovered && <p role="status">Retry {attempts} failed. Keep this page open.</p>}
  </section>
}
