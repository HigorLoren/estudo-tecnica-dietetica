import { isFormulaDrag } from './formula-assembly-model'
import { useCallback, useLayoutEffect, useRef, useState } from 'preact/hooks'

type Drag = { token: string; from?: number; pointer: number; x: number; y: number;
  active: boolean; target: HTMLButtonElement }
export function useFormulaDrag({ enabled, hit, onDrop }: {
  enabled: boolean; hit: (x: number, y: number) => number | null;
  onDrop: (token: string, at: number | null, from?: number) => void;
}) {
  const drag = useRef<Drag | null>(null)
  const suppressClick = useRef(false)
  const [ghost, setGhost] = useState<{ token: string; x: number; y: number } | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const cancel = useCallback(() => {
    const current = drag.current
    // Clear first: releasing capture can synchronously emit lostpointercapture.
    drag.current = null
    setGhost(null); setDropIndex(null)
    if (current?.target.hasPointerCapture(current.pointer)) {
      current.target.releasePointerCapture(current.pointer)
    }
  }, [])
  const start = (token: string, from: number | undefined, pointer: number,
    point: { x: number; y: number }, target: HTMLButtonElement) => {
    if (!enabled || drag.current) return
    suppressClick.current = false
    drag.current = { token, from, pointer, ...point, target, active: false }
    target.setPointerCapture(pointer)
  }
  const finish = useCallback((event: PointerEvent) => {
    const current = drag.current
    if (!current || event.pointerId !== current.pointer) return
    const at = hit(event.clientX, event.clientY)
    const active = isFormulaDrag(current, { x: event.clientX, y: event.clientY }, current.active)
    // Always remove the preview, including drops outside the answer area.
    cancel()
    if (!active) return
    suppressClick.current = true
    onDrop(current.token, at, current.from)
  }, [cancel, hit, onDrop])
  const move = useCallback((event: PointerEvent) => {
    const current = drag.current
    if (!current || event.pointerId !== current.pointer) return
    // Recover even if the release happened outside the browser and pointerup was lost.
    if (event.buttons === 0) { finish(event); return }
    const { clientX: x, clientY: y } = event
    if (!isFormulaDrag(current, { x, y }, current.active)) return
    current.active = true
    setGhost({ token: current.token, x, y }); setDropIndex(hit(x, y))
  }, [finish, hit])
  useLayoutEffect(() => {
    const interrupted = (event: PointerEvent) => {
      if (event.pointerId === drag.current?.pointer) cancel()
    }
    const lostCapture = (event: PointerEvent) => {
      const current = drag.current
      if (current?.pointer === event.pointerId
        && !current.target.hasPointerCapture(current.pointer)) cancel()
    }
    const hidden = () => { if (document.hidden) cancel() }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') cancel() }
    window.addEventListener('pointermove', move, true)
    window.addEventListener('pointerup', finish, true)
    window.addEventListener('pointercancel', interrupted, true)
    window.addEventListener('lostpointercapture', lostCapture, true)
    window.addEventListener('blur', cancel)
    window.addEventListener('keydown', escape)
    document.addEventListener('visibilitychange', hidden)
    return () => {
      window.removeEventListener('pointermove', move, true)
      window.removeEventListener('pointerup', finish, true)
      window.removeEventListener('pointercancel', interrupted, true)
      window.removeEventListener('lostpointercapture', lostCapture, true)
      window.removeEventListener('blur', cancel)
      window.removeEventListener('keydown', escape)
      document.removeEventListener('visibilitychange', hidden)
    }
  }, [cancel, finish, move])
  useLayoutEffect(() => { if (!enabled) cancel() }, [enabled, cancel])
  useLayoutEffect(() => () => cancel(), [cancel])
  const consumeDragClick = () => {
    const suppressed = suppressClick.current
    suppressClick.current = false
    return suppressed
  }
  return { ghost, dropIndex, start, consumeDragClick }
}
