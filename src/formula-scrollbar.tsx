import { useRef } from 'preact/hooks'

export function FormulaScrollbar({ maximum, position, onScroll }: {
  maximum: number; position: number; onScroll: (position: number) => void;
}) {
  const gesture = useRef<{
    pointer: number; x: number; position: number; moved: boolean;
  } | null>(null)
  if (maximum <= 1) return null
  return <div className="formula-scroll-control">
    <input type="range" className="formula-scrollbar" min={0} max={maximum} step={1}
      value={position} aria-label="Rolar fórmula horizontalmente"
      aria-valuetext={`${Math.round(position / maximum * 100)}% da rolagem da fórmula`}
      onPointerDown={event => {
        if (event.pointerType !== 'touch') return
        event.preventDefault()
        gesture.current = { pointer: event.pointerId, x: event.clientX, position, moved: false }
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={event => {
        const current = gesture.current
        if (!current || current.pointer !== event.pointerId) return
        const distance = event.clientX - current.x
        if (Math.abs(distance) > 2) current.moved = true
        const width = Math.max(1, event.currentTarget.clientWidth - 28)
        onScroll(Math.max(0, Math.min(maximum, current.position + distance * maximum / width * 2)))
      }}
      onPointerUp={event => {
        const current = gesture.current
        if (!current || current.pointer !== event.pointerId) return
        gesture.current = null
        if (!current.moved) {
          const bounds = event.currentTarget.getBoundingClientRect()
          const fraction = (event.clientX - bounds.left - 14) / Math.max(1, bounds.width - 28)
          onScroll(Math.max(0, Math.min(maximum, fraction * maximum)))
        }
        event.currentTarget.releasePointerCapture(event.pointerId)
      }}
      onPointerCancel={() => { gesture.current = null }}
      onLostPointerCapture={() => { gesture.current = null }}
      onInput={event => {
        if (!gesture.current) onScroll(Number(event.currentTarget.value))
      }} />
    <span aria-hidden="true">Deslize para ver o restante da fórmula</span>
  </div>
}
