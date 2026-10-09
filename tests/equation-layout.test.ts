import assert from 'node:assert/strict'
import { test } from 'node:test'
import { alignEquations } from '../src/equation-layout.ts'
import { questions } from '../src/questions.ts'

test('purchase values align with their terms, keeping the margin together', () => {
  const [formula, values] = questions.find(question => question.id === 'compra-uan')!.formula!.split('\n')
  const aligned = alignEquations(formula, values)!
  assert.equal(aligned.formula[2], 'nº de refeições')
  assert.equal(aligned.substitution[2], '100')
  assert.equal(aligned.formula[8], '(1 + margem)')
  assert.equal(aligned.substitution[8], '(1 + 0,10)')
  assert.equal(aligned.result, '= 15,84 kg')
})

test('parenthesized division stays together and incompatible equations fall back', () => {
  const aligned = alignEquations('Rendimento = PL × IC', 'Rendimento = (200 ÷ 1,20) × 0,76 ≈ 126,67 kg')!
  assert.equal(aligned.substitution[2], '(200 ÷ 1,20)')
  assert.equal(aligned.result, '≈ 126,67 kg')
  assert.equal(alignEquations('FC = PB ÷ PL', 'FC = 12 × 10 = 120'), null)
  assert.equal(alignEquations('sem fórmula', '12'), null)
})
