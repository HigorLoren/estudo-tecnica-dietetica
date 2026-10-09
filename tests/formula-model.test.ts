import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formulaCards, formulaMethods, formulas } from '../src/formula-data.ts'
import { masteredCount, newFormulaProgress, rateFormulaCard,
  restoreFormulaProgress, nextFormulaCard, type FormulaProgress } from '../src/formula-model.ts'
import { defaultProgress, recoverProgress, serializeProgress } from '../src/storage.ts'

function rate(progress: FormulaProgress, value: 1 | 2 | 3 | 4 | 5) {
  return rateFormulaCard({ ...progress, revealed: true }, progress.currentId!, value)
}

test('todas as fórmulas têm os seis métodos e escolhas sem duplicatas', () => {
  assert.equal(formulaCards.length, formulas.length * 6)
  assert.equal(new Set(formulaCards.map(card => card.id)).size, formulaCards.length)
  for (const formula of formulas) {
    const cards = formulaCards.filter(card => card.formula.id === formula.id)
    assert.deepEqual(cards.map(card => card.method), formulaMethods.map(method => method.id))
    for (const card of cards) {
      assert.equal(new Set(card.options).size, 3)
      assert.ok(card.options.includes(formula.equation))
      assert.ok(card.answer)
    }
  }
})

test('não avalia antes de revelar nem duplica uma avaliação por clique repetido', () => {
  const initial = newFormulaProgress()
  assert.equal(rateFormulaCard(initial, initial.currentId!, 5), initial)
  const ready = { ...initial, revealed: true }
  const next = rateFormulaCard(ready, initial.currentId!, 5)
  assert.equal(next.cards[initial.currentId!].attempts, 1)
  assert.equal(rateFormulaCard(next, initial.currentId!, 5), next)
})

test('notas menores programam revisões mais próximas, respeitando a alternância de grupos', () => {
  for (const value of [1, 2, 3, 4] as const) {
    const initial = newFormulaProgress(42)
    const next = rate(initial, value)
    assert.equal(next.cards[initial.currentId!].due, 1 + [1, 3, 6, 10][value - 1])
    assert.notEqual(next.currentId, initial.currentId)
    const chosen = formulaCards.find(card => card.id === next.currentId)!
    const previous = formulaCards.find(card => card.id === initial.currentId)!
    assert.notEqual(chosen.formula.family, previous.formula.family)
  }
})

test('só termina com todos os cartões na nota máxima, incluindo o último difícil', () => {
  let progress = newFormulaProgress()
  const hardId = progress.currentId!
  progress = rate(progress, 4)
  for (let index = 0; index < formulaCards.length * 2; index++) {
    if (progress.currentId === hardId) progress = rate(progress, 4)
    else progress = rate(progress, 5)
    if (masteredCount(progress) === formulaCards.length - 1) break
  }
  assert.equal(masteredCount(progress), formulaCards.length - 1)
  assert.equal(progress.currentId, hardId)
  progress = rate(progress, 1)
  assert.equal(progress.currentId, hardId)
  assert.equal(masteredCount(progress), formulaCards.length - 1)
  progress = rate(progress, 5)
  assert.equal(progress.currentId, null)
  assert.equal(masteredCount(progress), formulaCards.length)
  assert.equal(restoreFormulaProgress(progress).currentId, null)
})

test('preserva notas, ordem, rascunho e resposta revelada sem alterar histórico das questões', () => {
  const initial = defaultProgress()
  const formulas = rate(newFormulaProgress(), 2)
  formulas.draft = 'FC = PB / PL'
  formulas.revealed = true
  const saved = { ...initial, formulas }
  const restored = recoverProgress(serializeProgress(saved)).progress
  assert.deepEqual(restored.formulas, formulas)
  assert.deepEqual(restored.history, initial.history)
  assert.deepEqual(restored.config, initial.config)
  assert.equal(restored.session, initial.session)
  assert.equal(recoverProgress(serializeProgress(initial)).progress.formulas, undefined)
})

test('descarta dados inválidos e cartões removidos e inclui cartões novos na fila', () => {
  const initial = newFormulaProgress(42)
  const restored = restoreFormulaProgress({ seed: 42, turn: -2, currentId: 'removido', draft: 'antigo',
    revealed: true, cards: { removido: { rating: 5, attempts: 1, due: 1 },
      [initial.currentId!]: { rating: 7, attempts: 1, due: 1 },
      [formulaCards[1].id]: { rating: 5, attempts: -1, due: 1 } } })
  assert.deepEqual(restored.cards, {})
  assert.equal(restored.turn, 0)
  assert.equal(restored.draft, '')
  assert.equal(restored.revealed, false)
  assert.equal(restored.seed, 42)
  assert.deepEqual(restored.order, initial.order)
  assert.ok(formulaCards.some(card => card.id === restored.currentId))
  const missing = newFormulaProgress()
  for (const card of formulaCards.slice(0, -1)) {
    missing.cards[card.id] = { rating: 5, attempts: 1, due: 1 }
  }
  const updated = restoreFormulaProgress(missing)
  assert.equal(updated.currentId, formulaCards.at(-1)!.id)
  assert.equal(updated.revealed, false)
})


test('embaralha com ordem persistida e alterna indicadores enquanto houver outros pendentes', () => {
  const initial = newFormulaProgress(42)
  assert.notDeepEqual(initial.order, formulaCards.map(card => card.id))
  assert.notDeepEqual(initial.order, newFormulaProgress(87).order)
  assert.equal(new Set(initial.order).size, formulaCards.length)
  let progress = initial
  const seen = new Set<string>()
  while (progress.currentId) {
    const current = formulaCards.find(card => card.id === progress.currentId)!
    assert.equal(seen.has(current.id), false)
    seen.add(current.id)
    const next = rate(progress, 5)
    const otherGroupPending = formulaCards.some(card => card.formula.family !== current.formula.family
      && next.cards[card.id]?.rating !== 5)
    if (otherGroupPending) {
      assert.notEqual(formulaCards.find(card => card.id === next.currentId)!.formula.family,
        current.formula.family)
    }
    progress = next
  }
  assert.equal(seen.size, formulaCards.length)
})

test('indicador esquecido aparece mais e cartões relacionados variam a fórmula e o método', () => {
  const family = 'Pesos e limpeza'
  const progress = newFormulaProgress(42)
  let difficult = 0
  let easy = 0
  for (let turn = 0; turn < 2000; turn++) {
    progress.turn = turn
    progress.groups[family] = { strength: 1, attempts: 10 }
    const hard = nextFormulaCard(progress)!
    if (hard.formula.family === family) difficult++
    progress.groups[family] = { strength: 5, attempts: 10 }
    if (nextFormulaCard(progress)!.formula.family === family) easy++
  }
  assert.ok(difficult > easy * 2, `${difficult} vs ${easy}`)
  // The shuffled order stays fixed; actual related cards vary as the learner answers them.
  let training = newFormulaProgress(42)
  const methods = new Set<string>()
  const formulaIds = new Set<string>()
  for (let index = 0; index < 100; index++) {
    const card = formulaCards.find(item => item.id === training.currentId)!
    if (card.formula.family === family) {
      methods.add(card.method); formulaIds.add(card.formula.id)
    }
    training = rate(training, card.formula.family === family ? 1 : 4)
  }
  assert.ok(methods.size > 1)
  assert.ok(formulaIds.size > 1)
})

test('notas recentes atualizam a frequência do grupo e a retomada mantém a seleção', () => {
  const initial = newFormulaProgress(42)
  const card = formulaCards.find(item => item.id === initial.currentId)!
  let progress = rate(initial, 1)
  assert.equal(progress.groups[card.formula.family].strength, 1)
  progress = { ...progress, currentId: card.id, revealed: true }
  progress = rate(progress, 5)
  assert.ok(progress.groups[card.formula.family].strength > 1)
  const restored = restoreFormulaProgress(progress)
  assert.deepEqual(restored, progress)
  assert.equal(nextFormulaCard(restored)?.id, nextFormulaCard(progress)?.id)
})

test('migra treino antigo sem apagar avaliações, rascunho ou cartão atual', () => {
  const card = formulaCards[0]
  const old = { turn: 7, cards: { [card.id]: { rating: 1, attempts: 3, due: 8 } },
    currentId: card.id, draft: 'PB', revealed: true }
  const progress = restoreFormulaProgress(old)
  assert.equal(progress.currentId, card.id)
  assert.equal(progress.draft, 'PB')
  assert.equal(progress.revealed, true)
  assert.deepEqual(progress.cards, old.cards)
  assert.equal(progress.groups[card.formula.family].strength, 1)
  assert.equal(progress.order.length, formulaCards.length)
})


test('recupera ordem e grupos malformados sem perder o cartão e sua resposta', () => {
  const initial = newFormulaProgress(42)
  const restored = restoreFormulaProgress({ ...initial, draft: 'resposta em andamento',
    order: ['removido', initial.currentId, initial.currentId],
    lastIds: ['removido', initial.currentId],
    groups: { 'Pesos e limpeza': { strength: 9, attempts: -1 } } })
  assert.equal(restored.currentId, initial.currentId)
  assert.equal(restored.draft, 'resposta em andamento')
  assert.equal(new Set(restored.order).size, formulaCards.length)
  assert.deepEqual(restored.lastIds, [initial.currentId])
  assert.deepEqual(restored.groups, {})
})
