import type { FormulaDraftUpdate } from './formula-assembly-model.ts'
import { nextFormulaCard, shuffledFormulaOrder, updateFormulaGroup, recoverFormulaGroups,
  recoverFormulaOrder, type GroupRecall } from './formula-scheduler.ts'
export { nextFormulaCard } from './formula-scheduler.ts'
import { formulaCards } from './formula-data.ts'

export const recallRatings = [
  { value: 1, label: 'Não lembrei', detail: 'Errei ou Precisei ver a resposta', gap: 1 },
  { value: 2, label: 'Lembrei pouco', detail: 'Confundi boa parte', gap: 3 },
  { value: 3, label: 'Lembrei com esforço', detail: 'Precisei pensar bastante', gap: 6 },
  { value: 4, label: 'Lembrei bem', detail: 'Hesitei um pouco', gap: 10 },
  { value: 5, label: 'Lembrei fácil', detail: 'Sem esforço ou consulta', gap: 0 },
] as const
export type RecallRating = typeof recallRatings[number]['value']
export type CardRecall = { rating: RecallRating; attempts: number; due: number }
export type FormulaProgress = { turn: number; cards: Record<string, CardRecall>;
  currentId: string | null; draft: string; revealed: boolean;
  seed: number; order: string[]; lastIds: string[]; groups: Record<string, GroupRecall> }
export function newFormulaProgress(seed = Math.floor(Math.random() * 4294967296)): FormulaProgress {
  const order = shuffledFormulaOrder(seed)
  return { turn: 0, cards: {}, currentId: order[0], draft: '', revealed: false,
    seed, order, lastIds: [], groups: {} }
}
export function masteredCount(progress: FormulaProgress) {
  return formulaCards.filter(card => progress.cards[card.id]?.rating === 5).length
}
export function rateFormulaCard(progress: FormulaProgress, id: string, rating: RecallRating) {
  if (!progress.revealed || progress.currentId !== id
    || !formulaCards.some(card => card.id === id)) return progress
  const option = recallRatings.find(item => item.value === rating)
  if (!option) return progress
  const turn = progress.turn + 1
  const next: FormulaProgress = { ...progress, turn,
    cards: { ...progress.cards, [id]: { rating,
      attempts: (progress.cards[id]?.attempts ?? 0) + 1, due: turn + option.gap } },
    draft: '', revealed: false, currentId: null,
    lastIds: [...progress.lastIds, id].slice(-4),
    groups: updateFormulaGroup(progress, id, rating) }
  const card = nextFormulaCard(next, id)
  next.currentId = card?.id ?? null
  // Advance the virtual queue when no other card is due; never impose a waiting timer.
  if (card) next.turn = Math.max(turn, next.cards[card.id]?.due ?? turn)
  return next
}
function validInteger(n: unknown): n is number {
  return Number.isSafeInteger(n) && (n as number) >= 0
    && (n as number) < Number.MAX_SAFE_INTEGER / 2
}
function validRecall(item: CardRecall | undefined): item is CardRecall {
  return !!item && recallRatings.some(option => option.value === item.rating)
    && validInteger(item.attempts) && item.attempts > 0 && validInteger(item.due)
}
function restoreCards(value: unknown) {
  const cards: Record<string, CardRecall> = {}
  const raw = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  for (const card of formulaCards) {
    const item = raw[card.id] as CardRecall | undefined
    if (validRecall(item)) {
      cards[card.id] = { rating: item.rating, attempts: item.attempts, due: item.due }
    }
  }
  return cards
}
function recoverRecentIds(value: unknown) {
  return Array.isArray(value) ? value.filter((id): id is string =>
    typeof id === 'string' && formulaCards.some(card => card.id === id)).slice(-4) : []
}
export function restoreFormulaProgress(value: unknown): FormulaProgress {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return newFormulaProgress()
  const saved = value as Record<string, unknown>
  const defaults = newFormulaProgress(validInteger(saved.seed) ? saved.seed : undefined)
  const cards = restoreCards(saved.cards)
  const progress = { ...defaults, cards, turn: validInteger(saved.turn) ? saved.turn : 0,
    order: recoverFormulaOrder(saved.order, defaults.order),
    lastIds: recoverRecentIds(saved.lastIds), groups: recoverFormulaGroups(saved.groups, cards) }
  const current = formulaCards.find(card => card.id === saved.currentId
    && cards[card.id]?.rating !== 5)
  progress.currentId = (current ?? nextFormulaCard(progress))?.id ?? null
  if (current) {
    progress.draft = typeof saved.draft === 'string' ? saved.draft : ''
    progress.revealed = saved.revealed === true
  }
  return progress
}


export function ensureFormulaProgress(
  value: FormulaProgress | undefined, fallback: FormulaProgress,
) {
  if (!value) return fallback
  return value.order && value.groups && value.lastIds ? value : restoreFormulaProgress(value)
}


export function editFormulaProgress(
  progress: FormulaProgress, cardId: string | null, update: FormulaDraftUpdate,
): FormulaProgress {
  if (progress.currentId !== cardId || progress.revealed) return progress
  return { ...progress, draft: typeof update === 'function' ? update(progress.draft) : update }
}
