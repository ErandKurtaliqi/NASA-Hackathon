import { findReadingStep } from './pilot'

export function createScrollStoryController(target: Window, getCards: () => (HTMLElement | null)[], onSelect: (index: number) => void, onEngage: () => void) {
  let active = 0
  let frame = 0
  let disposed = false
  const read = () => {
    frame = 0
    if (disposed) return
    const next = findReadingStep(getCards().map(card => card?.getBoundingClientRect() ?? { top: Infinity, bottom: Infinity }), target.innerHeight)
    if (next !== null && next !== active) {
      active = next
      onSelect(next)
      if (next > 0) onEngage()
    }
  }
  const schedule = () => { if (!frame && !disposed) frame = target.requestAnimationFrame(read) }
  // Observation only: never handle wheel/touch events, prevent scrolling, or snap.
  target.addEventListener('scroll', schedule, { passive: true })
  target.addEventListener('resize', schedule)
  return {
    select(index: number) {
      const cards = getCards()
      if (disposed || !Number.isInteger(index) || index < 0 || index >= cards.length) return
      active = index
      onSelect(index)
      onEngage()
      // Same instant, focused navigation for mouse, keyboard and reduced motion.
      cards[index]?.scrollIntoView({ behavior: 'instant', block: 'center' })
      cards[index]?.focus({ preventScroll: true })
    },
    dispose() {
      disposed = true
      target.removeEventListener('scroll', schedule)
      target.removeEventListener('resize', schedule)
      target.cancelAnimationFrame(frame)
    },
  }
}
