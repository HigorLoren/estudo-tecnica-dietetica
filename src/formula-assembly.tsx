import { useFormulaViewport } from './use-formula-viewport'
import { FormulaScrollbar } from './formula-scrollbar'
import { useFormulaDrag } from './use-formula-drag'
import { placeFormulaToken, readFormulaPieces, dropFormulaToken } from './formula-assembly-model'
import { useRef, useState } from 'preact/hooks'

export function FormulaAssembly({ tokens, draft, revealed, onEdit }: {
  tokens: string[]; draft: string; revealed: boolean;
  onEdit: (update: (current: string[]) => string[]) => void;
}) {
  const pieces = readFormulaPieces(draft)
  const board = useRef<HTMLDivElement>(null)
  const viewport = useFormulaViewport(board, draft)
  const [selected, setSelected] = useState<number | null>(null)
  const save = (edit: (current: string[]) => string[]) => { onEdit(edit); setSelected(null) }
  const hit = (x: number, y: number) => {
    const element = document.elementFromPoint(x, y)
    if (!element || !board.current?.contains(element)) return null
    const slot = element.closest<HTMLElement>('[data-insert-index]')
    if (!slot || slot.classList.contains('last')) return Infinity
    const index = Number(slot.dataset.insertIndex)
    const bounds = slot.getBoundingClientRect()
    return slot.classList.contains('formula-piece-position') && x > bounds.left + bounds.width / 2
      ? index + 1 : index
  }
  const { ghost, dropIndex, start, consumeDragClick } = useFormulaDrag({
    enabled: !revealed, hit,
    onDrop: (token, at, from) => {
      save(current => dropFormulaToken(current, token, at, from))
    },
  })
  const click = (token: string, from?: number) => {
    if (consumeDragClick()) return
    if (from === undefined) save(current => [...current, token])
    else setSelected(from)
  }
  const shift = (index: number, direction: number) => {
    const target = index + direction
    if (target < 0 || target >= pieces.length) return
    save(current => {
      if (index >= current.length || target >= current.length) return current
      return placeFormulaToken(current, current[index], direction > 0 ? target + 1 : target, index)
    })
    requestAnimationFrame(() => {
      board.current?.querySelectorAll<HTMLButtonElement>('.formula-piece')[target]?.focus()
    })
  }
  const remove = (index: number) => save(current => current.filter((_, i) => i !== index))
  const piece = (token: string, from?: number) => <button type="button"
    className={`formula-piece ${selected === from && from !== undefined ? 'selected' : ''}`}
    disabled={revealed} aria-label={from === undefined ? `Adicionar ${token}` : `Termo ${from + 1}: ${token}`}
    aria-describedby={revealed ? undefined : 'assembly-help'}
    onPointerDown={event => {
      if (event.button !== 0) return
      start(token, from, event.pointerId,
        { x: event.clientX, y: event.clientY }, event.currentTarget)
    }}
    onDragStart={event => event.preventDefault()}
    onClick={() => click(token, from)}
    onKeyDown={event => {
      if (from === undefined) return
      if (event.key === 'ArrowLeft') { event.preventDefault(); shift(from, -1) }
      if (event.key === 'ArrowRight') { event.preventDefault(); shift(from, 1) }
      if (['Delete', 'Backspace'].includes(event.key)) { event.preventDefault(); remove(from) }
    }}>{token}</button>
  return <div className="formula-assembly">
    {!revealed && <div className="formula-token-list" role="group" aria-label="Peças disponíveis">
      {tokens.map(token => <span key={token}>{piece(token)}</span>)}
    </div>}
    <h3>Sua fórmula</h3>
    <div ref={board} className={`formula-drop-area ${ghost ? 'dragging' : ''}`}
      onScroll={viewport.updateScroll}
      role="group" aria-label="Área de montagem da fórmula" aria-describedby={revealed ? undefined : 'assembly-help'}>
      {pieces.map((token, index) => <span className="formula-piece-position" key={index}
        data-insert-index={index}>
        <span className={`formula-drop-slot ${dropIndex === index ? 'active' : ''}`} />
        {piece(token, index)}
      </span>)}
      <span data-insert-index={pieces.length}
        className={`formula-drop-slot last ${dropIndex === pieces.length || dropIndex === Infinity ? 'active' : ''}`}>
        {!pieces.length && 'Arraste as peças para cá'}
      </span>
    </div>
    <FormulaScrollbar maximum={viewport.maximum} position={viewport.position}
      onScroll={viewport.scrollTo} />
    {!revealed && <>
      <p id="assembly-help" className="formula-assembly-help">Arraste para adicionar ou mudar a ordem.
        Arraste para fora da caixa para remover um termo.
        Você também pode tocar nas peças para adicionar e selecionar.
        No teclado, use Enter para adicionar, as setas para mover e Delete para remover.</p>
      {selected !== null && <div className="formula-piece-actions" role="group"
        aria-label="Editar termo selecionado">
        <button className="outline-button" disabled={selected === 0}
          onClick={() => shift(selected, -1)}>Mover para esquerda</button>
        <button className="outline-button" disabled={selected === pieces.length - 1}
          onClick={() => shift(selected, 1)}>Mover para direita</button>
        <button className="outline-button" onClick={() => remove(selected)}>Remover termo</button>
      </div>}
      <button className="text-button" disabled={!pieces.length}
        onClick={() => save(current => current.slice(0, -1))}>Desfazer último termo</button>
      <button className="text-button" disabled={!pieces.length} onClick={() => save(() => [])}>Limpar</button>
    </>}
    {ghost && <div className="formula-drag-ghost" aria-hidden="true"
      style={{ left: ghost.x, top: ghost.y }}>{ghost.token}</div>}
    <span className="visually-hidden" role="status">Fórmula montada: {pieces.join(' ') || 'vazia'}</span>
  </div>
}
