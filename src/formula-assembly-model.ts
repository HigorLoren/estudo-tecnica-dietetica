export type FormulaDraftUpdate = string | ((current: string) => string)
import { equationTokens, type FormulaCard } from './formula-data.ts'

export function placeFormulaToken(tokens: string[], token: string, at: number, from?: number) {
  const next = [...tokens]
  if (from !== undefined) next.splice(from, 1)
  const position = from !== undefined && from < at ? at - 1 : at
  next.splice(Math.max(0, Math.min(position, next.length)), 0, token)
  return next
}


export function dropFormulaToken(
  tokens: string[], token: string, at: number | null, from?: number,
) {
  if (at !== null) return placeFormulaToken(tokens, token, at, from)
  return from === undefined ? tokens : tokens.filter((_, index) => index !== from)
}

export function readFormulaPieces(draft: string): string[] {
  try {
    const value: unknown = JSON.parse(draft)
    if (Array.isArray(value) && value.every(token => typeof token === 'string')) return value
  } catch { /* Older drafts used plain equations. */ }
  return equationTokens(draft)
}

function normalizeFormula(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/\s+/g, '').replaceAll('*', '×').replaceAll('/', '÷')
}

// Reordering factors at the same parenthesis depth does not change a product.
// Keep divisions and subtraction intact to avoid accepting inverted ratios.
function canonicalSide(side: string) {
  const factors: string[] = []
  let depth = 0
  let start = 0
  for (let index = 0; index < side.length; index++) {
    if (side[index] === '(') depth++
    if (side[index] === ')') depth--
    if (side[index] === '×' && depth === 0) {
      factors.push(side.slice(start, index)); start = index + 1
    }
  }
  factors.push(side.slice(start))
  return factors.sort().join('×')
}

function canonicalEquation(equation: string) {
  const sides = normalizeFormula(equation).split('=')
  if (sides.length !== 2 || sides.some(side => !side)) return null
  return sides.map(canonicalSide).sort().join('=')
}

export function gradeFormulaAssembly(draft: string, expected: string) {
  const pieces = readFormulaPieces(draft)
  if (!pieces.length) return 'unknown'
  const answer = canonicalEquation(pieces.join(' '))
  return answer !== null && answer === canonicalEquation(expected) ? 'correct' : 'incorrect'
}


export function formulaPieceDraft(card: Pick<FormulaCard, 'method' | 'prompt'>, draft: string) {
  return card.method === 'repair' && draft === ''
    ? JSON.stringify(equationTokens(card.prompt)) : draft
}


export function editFormulaPieces(
  card: Pick<FormulaCard, 'method' | 'prompt'>, draft: string,
  edit: (current: string[]) => string[],
) {
  return JSON.stringify(edit(readFormulaPieces(formulaPieceDraft(card, draft))))
}

export function isFormulaDrag(
  start: { x: number; y: number }, end: { x: number; y: number }, alreadyDragging = false,
) {
  return alreadyDragging || Math.hypot(end.x - start.x, end.y - start.y) >= 6
}
