import { useCallback, useEffect, useRef, useState } from 'react'
import { createScrollStoryController } from './scrollController'

export function useScrollStory(count: number, onEngage: () => void) {
  const [active, setActive] = useState(0)
  const cards = useRef<(HTMLElement | null)[]>([])
  const engage = useRef(onEngage)
  const controller = useRef<ReturnType<typeof createScrollStoryController> | null>(null)
  useEffect(() => { engage.current = onEngage }, [onEngage])

  useEffect(() => {
    const instance = createScrollStoryController(window, () => cards.current.slice(0, count), setActive, () => engage.current())
    controller.current = instance
    return () => {
      instance.dispose()
      controller.current = null
    }
  }, [count])

  const select = useCallback((index: number) => {
    controller.current?.select(index)
  }, [])

  return { active, cards, select }
}
