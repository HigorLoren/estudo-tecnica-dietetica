import { formulaCards, type FormulaCard } from './formula-data.ts'
import type { FormulaProgress } from './formula-model.ts'

export type GroupRecall = { strength: number; attempts: number }
export function randomForTurn(seed: number, turn: number) {
  let value = (seed ^ Math.imul(turn + 1, 0x9e3779b1)) >>> 0
  value = Math.imul(value ^ value >>> 16, 0x21f0aaad)
  value = Math.imul(value ^ value >>> 15, 0x735a2d97)
  return ((value ^ value >>> 15) >>> 0) / 4294967296
}
export function shuffledFormulaOrder(seed: number) {
  const order = formulaCards.map(card => card.id)
  for (let index = order.length - 1; index > 0; index--) {
    const target = Math.floor(randomForTurn(seed, index) * (index + 1))
    ;[order[index], order[target]] = [order[target], order[index]]
  }
  return order
}
export function formulaGroup(id: string) {
  return formulaCards.find(card => card.id === id)?.formula.family
}
export function updateFormulaGroup(progress: FormulaProgress, id: string, rating: number) {
  const group = formulaGroup(id)!
  const previous = progress.groups[group]
  return { ...progress.groups, [group]: {
    strength: previous ? previous.strength * 0.6 + rating * 0.4 : rating,
    attempts: (previous?.attempts ?? 0) + 1,
  } }
}

function chooseGroup(progress: FormulaProgress, candidates: FormulaCard[]) {
  const groups = [...new Set(candidates.map(card => card.formula.family))]
  const weights = groups.map(group => 6 - (progress.groups[group]?.strength ?? 3))
  const total = weights.reduce((sum, weight) => sum + weight)
  let draw = randomForTurn(progress.seed, progress.turn) * total
  for (let index = 0; index < groups.length; index++) {
    draw -= weights[index]
    if (draw < 0) return groups[index]
  }
  return groups.at(-1)!
}
function chooseWithinGroup(progress: FormulaProgress, pool: FormulaCard[]) {
  const unseen = pool.filter(card => !progress.cards[card.id])
  const practiced = pool.filter(card => progress.cards[card.id])
  // Reinforce related unseen formulas and methods instead of repeating only the same card.
  const preferUnseen = randomForTurn(progress.seed ^ 0x5bd1e995, progress.turn) < 0.4
  const preferred = preferUnseen ? unseen : practiced
  const candidates = preferred.length ? preferred : pool
  return candidates.sort((a, b) => (progress.cards[a.id]?.due ?? progress.turn)
    - (progress.cards[b.id]?.due ?? progress.turn)
    || progress.order.indexOf(a.id) - progress.order.indexOf(b.id))[0]
}
export function nextFormulaCard(progress: FormulaProgress, previousId?: string) {
  const pending = formulaCards.filter(card => progress.cards[card.id]?.rating !== 5)
  if (!pending.length) return null
  const previous = previousId ?? progress.lastIds.at(-1)
  const previousGroup = previous ? formulaGroup(previous) : undefined
  const differentGroup = pending.filter(card => card.formula.family !== previousGroup)
  const differentCard = pending.filter(card => card.id !== previous)
  const diverse = differentGroup.length ? differentGroup : differentCard
  const pool = diverse.length ? diverse : pending
  const ready = pool.filter(card => (progress.cards[card.id]?.due ?? 0) <= progress.turn)
  if (!ready.length) return pool.sort((a, b) =>
    progress.cards[a.id].due - progress.cards[b.id].due)[0]
  const group = chooseGroup(progress, ready)
  return chooseWithinGroup(progress, ready.filter(card => card.formula.family === group))
}

export function recoverFormulaGroups(value: unknown, cards: FormulaProgress['cards']) {
  const raw = value && typeof value === 'object' ? value as Record<string, GroupRecall> : {}
  const groups: Record<string, GroupRecall> = {}
  for (const family of new Set(formulaCards.map(card => card.formula.family))) {
    const saved = raw[family]
    if (saved && Number.isFinite(saved.strength) && saved.strength >= 1 && saved.strength <= 5
      && Number.isSafeInteger(saved.attempts) && saved.attempts > 0) {
      groups[family] = { strength: saved.strength, attempts: saved.attempts }
      continue
    }
    const ratings = formulaCards.filter(card => card.formula.family === family)
      .flatMap(card => cards[card.id] ? [cards[card.id]] : [])
    if (ratings.length) groups[family] = {
      strength: ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length,
      attempts: ratings.reduce((sum, item) => sum + item.attempts, 0),
    }
  }
  return groups
}
export function recoverFormulaOrder(value: unknown, defaults: string[]) {
  const saved = Array.isArray(value) ? value.filter((id): id is string =>
    typeof id === 'string' && defaults.includes(id)) : []
  return [...new Set([...saved, ...defaults])]
}
