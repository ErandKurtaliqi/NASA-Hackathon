import { useEffect, useRef, useState } from 'react'
import { createHomeNarration, silentNarration } from './homeNarration'
import { homeIntroductionSession } from './homeIntroductionSession'

export default function useHomeNarration() {
  const [state, setState] = useState(() => ({ ...silentNarration, introVisible: !homeIntroductionSession.seen() }))
  const session = useRef<ReturnType<typeof createHomeNarration> | null>(null)

  useEffect(() => {
    const controller = createHomeNarration(setState)
    session.current = controller
    let mounted = true
    // Strict Mode cleans up its probe effect before microtasks run. Only the
    // surviving mount claims the visit and attempts playback, exactly once.
    queueMicrotask(() => {
      if (mounted) controller.enter(homeIntroductionSession.claim())
    })
    const leave = () => controller.stopForNavigation()
    const historyChange = () => { if (window.location.pathname !== '/') leave() }
    const events = typeof window !== 'undefined' && typeof window.addEventListener === 'function'
    if (events) {
      window.addEventListener('pagehide', leave)
      window.addEventListener('popstate', historyChange)
    }
    return () => {
      mounted = false
      if (events) {
        window.removeEventListener('pagehide', leave)
        window.removeEventListener('popstate', historyChange)
      }
      session.current = null
      controller.dispose()
    }
  }, [])

  return {
    ...state,
    toggle: () => session.current?.toggle(),
    stopForNavigation: () => session.current?.stopForNavigation(),
    select: (planet: 'moon' | 'mars') => session.current?.select(planet),
    seekCaption: (index: number) => session.current?.seekCaption(index) ?? false,
  }
}
