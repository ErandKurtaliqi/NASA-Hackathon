import { useEffect, useState } from 'react'

export function observeMotionPreference(query: MediaQueryList, update: (value: boolean) => void) {
  update(query.matches)
  const change = (event: MediaQueryListEvent) => update(event.matches)
  query.addEventListener('change', change)
  return () => query.removeEventListener('change', change)
}

export function useStoryReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    if (!window.matchMedia) return
    return observeMotionPreference(window.matchMedia('(prefers-reduced-motion: reduce)'), setReduced)
  }, [])
  return reduced
}
