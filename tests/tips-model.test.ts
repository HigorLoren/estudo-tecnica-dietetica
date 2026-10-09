import assert from 'node:assert/strict'
import { test } from 'node:test'
import { tips, tipSources } from '../src/tips-data.ts'
import { filterTips, groupTips, pageFromSearch, validTipAnchor } from '../src/tips-model.ts'

test('search ignores accents, case and excess spaces and requires every term', () => {
  assert.deepEqual(filterTips('  REIDRATACAO  ').map(tip => tip.id), ['reidratacao'])
  assert.deepEqual(filterTips('reidratação'), filterTips('REIDRATACAO'))
  assert.ok(filterTips('porcao').some(tip => tip.id === 'per-capita-e-porcao'))
  assert.deepEqual(filterTips('reidratacao inexistente'), [])
})

test('search includes formulas, examples and cautions and removes empty groups', () => {
  assert.ok(filterTips('1,10').some(tip => tip.id === 'compra-uan'))
  assert.ok(filterTips('numerador').some(tip => tip.id === 'indice-de-conversao'))
  assert.equal(filterTips('').length, 11)
  assert.deepEqual(groupTips('inexistente'), [])
  assert.equal(groupTips('reidratacao').length, 1)
})

test('direct navigation accepts the tips page and only existing section anchors', () => {
  assert.equal(pageFromSearch('?pagina=dicas&outro=1'), 'dicas')
  assert.equal(pageFromSearch('?pagina=inexistente'), 'configuration')
  assert.equal(validTipAnchor('#planejamento'), 'planejamento')
  assert.equal(validTipAnchor('#fontes'), 'fontes')
  assert.equal(validTipAnchor('#inexistente'), null)
})

test('every tip has a unique identifier and references an existing source', () => {
  assert.equal(new Set(tips.map(tip => tip.id)).size, tips.length)
  for (const tip of tips) {
    assert.ok(tip.sources.length > 0, tip.id)
    for (const source of tip.sources) {
      assert.ok(tipSources.some(item => item.id === source.id), source.id)
      assert.ok(source.passage.length > 0)
    }
  }
})
