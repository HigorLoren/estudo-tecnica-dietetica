import type { FormulaCard } from './formula-data.ts'
import { formulaPieceDraft, gradeFormulaAssembly } from './formula-assembly-model.ts'

export function hasFormulaCorrection(card: FormulaCard) {
  return ['assemble', 'repair', 'apply'].includes(card.method)
}
export function gradeFormulaCard(card: FormulaCard, draft: string) {
  if (card.method === 'apply') {
    if (!draft.trim()) return 'unknown'
    return draft === card.formula.equation ? 'correct' : 'incorrect'
  }
  return gradeFormulaAssembly(formulaPieceDraft(card, draft), card.formula.equation)
}
export function formulaCorrectionMessage(
  card: FormulaCard, result: ReturnType<typeof gradeFormulaCard>,
) {
  if (result === 'correct') return '✓ Você acertou a fórmula!'
  if (card.method === 'apply') return result === 'unknown'
    ? 'Você não escolheu uma fórmula. Veja a resposta abaixo.'
    : '× A fórmula escolhida está incorreta. Compare com a resposta abaixo.'
  return result === 'unknown' ? 'Você não montou uma fórmula. Veja a resposta abaixo.'
    : '× A fórmula montada está incorreta. Compare com a resposta abaixo.'
}
