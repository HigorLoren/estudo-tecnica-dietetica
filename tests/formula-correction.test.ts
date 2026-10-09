import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formulaCards } from '../src/formula-data.ts'
import { gradeFormulaCard, hasFormulaCorrection,
  formulaCorrectionMessage } from '../src/formula-correction.ts'
import { recoverProgress, serializeProgress, defaultProgress } from '../src/storage.ts'
import { newFormulaProgress } from '../src/formula-model.ts'

test('escolher pelo enunciado distingue alternativa correta, incorreta e ausência de seleção', () => {
  for (const card of formulaCards.filter(card => card.method === 'apply')) {
    assert.equal(hasFormulaCorrection(card), true)
    for (const option of card.options) {
      assert.equal(gradeFormulaCard(card, option),
        option === card.formula.equation ? 'correct' : 'incorrect', card.id)
    }
    assert.equal(gradeFormulaCard(card, ''), 'unknown')
    assert.equal(gradeFormulaCard(card, '  '), 'unknown')
    assert.match(formulaCorrectionMessage(card, 'correct'), /acertou/)
    assert.match(formulaCorrectionMessage(card, 'incorrect'), /escolhida está incorreta/)
    assert.match(formulaCorrectionMessage(card, 'unknown'), /não escolheu/)
  }
})

test('retomada mantém alternativa selecionada e feedback sem alterar a nota de lembrança', () => {
  const card = formulaCards.find(card => card.method === 'apply')!
  const formulas = { ...newFormulaProgress(42), currentId: card.id,
    draft: card.formula.wrong, revealed: true }
  const saved = { ...defaultProgress(), formulas }
  const restored = recoverProgress(serializeProgress(saved)).progress.formulas!
  assert.deepEqual(restored, formulas)
  assert.equal(gradeFormulaCard(card, restored.draft), 'incorrect')
  assert.deepEqual(restored.cards, {})
})

test('correção automática permanece apenas nos três métodos definidos', () => {
  for (const card of formulaCards) {
    assert.equal(hasFormulaCorrection(card), ['assemble', 'repair', 'apply'].includes(card.method))
  }
})
