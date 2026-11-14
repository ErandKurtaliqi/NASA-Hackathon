import { useEffect, useRef, useState } from 'react'
import { createHomeNarration, silentNarration } from './homeNarration'

export default function useHomeNarration() {
  const [state, setState] = useState(silentNarration)
  const session = useRef<ReturnType<typeof createHomeNarration> | null>(null)

  useEffect(() => {
    const controller = createHomeNarration(setState)
    session.current = controller
    return () => { session.current = null; controller.dispose() }
  }, [])

  return {
    ...state,
    toggle: () => session.current?.toggle(),
    select: (planet: 'moon' | 'mars') => session.current?.select(planet),
    seekCaption: (index: number) => session.current?.seekCaption(index) ?? false,
  }
}
