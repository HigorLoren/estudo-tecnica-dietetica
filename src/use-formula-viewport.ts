import { useCallback, useLayoutEffect, useState } from 'preact/hooks'
import type { RefObject } from 'preact'
import { fitFormulaText } from './formula-layout-model'

export function useFormulaViewport(board: RefObject<HTMLDivElement>, draft: string) {
  const [scroll, setScroll] = useState({ position: 0, maximum: 0 })
  const updateScroll = useCallback(() => {
    const element = board.current
    if (!element) return
    const maximum = Math.max(0, element.scrollWidth - element.clientWidth)
    const position = Math.max(0, Math.min(maximum, element.scrollLeft))
    setScroll(current => current.position === position && current.maximum === maximum
      ? current : { position, maximum })
  }, [board])
  const fit = useCallback(() => {
    const element = board.current
    if (!element) return
    const max = Number(getComputedStyle(element).getPropertyValue('--formula-max-font-size')) || 16
    const apply = (size: number, tracking: number) => {
      element.style.setProperty('--formula-fit-size', `${size}px`)
      element.style.setProperty('--formula-fit-tracking', `${tracking}px`)
    }
    const style = fitFormulaText(max, candidate => {
      apply(candidate.size, candidate.tracking)
      return element.scrollWidth <= element.clientWidth + 1
    })
    apply(style.size, style.tracking)
    updateScroll()
  }, [board, updateScroll])
  useLayoutEffect(() => { fit() }, [fit, draft])
  useLayoutEffect(() => {
    const element = board.current
    if (!element) return
    const observer = new ResizeObserver(fit)
    observer.observe(element)
    let active = true
    void document.fonts.ready.then(() => { if (active) fit() })
    window.addEventListener('resize', fit)
    return () => { active = false; observer.disconnect(); window.removeEventListener('resize', fit) }
  }, [board, fit])
  const scrollTo = (position: number) => {
    if (board.current) board.current.scrollLeft = position
    updateScroll()
  }
  return { ...scroll, updateScroll, scrollTo }
}
