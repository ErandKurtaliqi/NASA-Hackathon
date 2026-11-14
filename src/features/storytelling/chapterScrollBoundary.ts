/** Cross one chapter boundary only after a deliberate downward reading gesture.
 * No scroll interception, snapping, timer, or completion on mount/resize/audio end.
 */
export function createChapterScrollBoundary(target: Window, boundary: () => HTMLElement | null, allowed: () => boolean, advance: () => void) {
  let intent = false, crossed = false, lastY = target.scrollY
  const gesture = (event: Event) => {
    intent = false
    if (event.defaultPrevented) return
    if (event.type === 'wheel') intent = (event as WheelEvent).deltaY > 0
    else if (event.type === 'keydown') {
      const key = event as KeyboardEvent
      const tag = (key.target as HTMLElement | null)?.tagName
      if (tag && ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A', 'AUDIO'].includes(tag)) return
      intent = ['ArrowDown', 'PageDown', ' '].includes(key.key) && !key.shiftKey
    } else intent = true
  }
  const read = () => {
    const downward = target.scrollY > lastY
    lastY = target.scrollY
    const rect = boundary()?.getBoundingClientRect()
    if (!crossed && intent && downward && allowed() && rect && rect.top <= target.innerHeight * .7 && rect.bottom >= 0) {
      crossed = true; advance()
    }
    intent = false
  }
  target.addEventListener('wheel', gesture, { passive: true })
  target.addEventListener('touchmove', gesture, { passive: true })
  target.addEventListener('keydown', gesture)
  target.addEventListener('scroll', read, { passive: true })
  return () => {
    target.removeEventListener('wheel', gesture); target.removeEventListener('touchmove', gesture)
    target.removeEventListener('keydown', gesture); target.removeEventListener('scroll', read)
  }
}
