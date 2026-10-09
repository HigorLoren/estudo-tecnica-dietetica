import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fitFormulaText, MIN_FORMULA_FONT_SIZE } from '../src/formula-layout-model.ts'

test('mantém o texto normal quando a fórmula já cabe', () => {
  assert.deepEqual(fitFormulaText(14, () => true), { size: 14, tracking: 0 })
})
test('compacta letras antes de reduzir fonte e respeita o mínimo', () => {
  assert.deepEqual(fitFormulaText(14, style => style.tracking <= -0.15),
    { size: 14, tracking: -0.15 })
  assert.deepEqual(fitFormulaText(14, style => style.size <= 13), { size: 13, tracking: -0.3 })
  const attempted: number[] = []
  const fallback = fitFormulaText(14, style => { attempted.push(style.size); return false })
  assert.equal(fallback.size, MIN_FORMULA_FONT_SIZE)
  assert.ok(attempted.every(size => size >= MIN_FORMULA_FONT_SIZE))
  assert.deepEqual(fitFormulaText(16, () => false), { size: 12, tracking: -0.3 })
})
