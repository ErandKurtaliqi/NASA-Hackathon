const storageKey = 'auroralys-home-intro-seen-v1'
type VisitStorage = Pick<Storage, 'getItem' | 'setItem'>

/** A tab-scoped visit, independent of mission progress and audio permission. */
export function createHomeIntroductionSession(storage: () => VisitStorage | undefined = () =>
  typeof window === 'undefined' ? undefined : window.sessionStorage) {
  // Storage can be denied or full. Still suppress repeats during SPA navigation.
  let consumed = false
  return {
    seen() {
      if (consumed) return true
      try { return storage()?.getItem(storageKey) === '1' } catch { return false }
    },
    claim() {
      if (this.seen()) return false
      consumed = true
      try { storage()?.setItem(storageKey, '1') } catch { /* In-memory tab fallback. */ }
      return true
    },
  }
}

export const homeIntroductionSession = createHomeIntroductionSession()
