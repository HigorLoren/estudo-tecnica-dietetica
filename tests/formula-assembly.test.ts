import { editFormulaProgress, newFormulaProgress } from '../src/formula-model.ts'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { placeFormulaToken, dropFormulaToken, readFormulaPieces, gradeFormulaAssembly, formulaPieceDraft, editFormulaPieces, isFormulaDrag } from '../src/formula-assembly-model.ts'
import { equationTokens, formulas } from '../src/formula-data.ts'

test('montagem insere peças repetidas no início, entre termos e no fim', () => {
  const original = ['PB', '=', 'PL']
  assert.deepEqual(placeFormulaToken(original, 'FC', 0), ['FC', 'PB', '=', 'PL'])
  assert.deepEqual(placeFormulaToken(original, '×', 2), ['PB', '=', '×', 'PL'])
  assert.deepEqual(placeFormulaToken(original, 'PL', 3), ['PB', '=', 'PL', 'PL'])
  assert.deepEqual(original, ['PB', '=', 'PL'])
})

test('reordenação move peças sem duplicar e respeita as posições de inserção', () => {
  const tokens = ['PL', '=', 'PB', '÷', 'FC']
  assert.deepEqual(placeFormulaToken(tokens, 'PL', 5, 0), ['=', 'PB', '÷', 'FC', 'PL'])
  assert.deepEqual(placeFormulaToken(tokens, 'FC', 0, 4), ['FC', 'PL', '=', 'PB', '÷'])
  assert.deepEqual(placeFormulaToken(tokens, 'PB', 2, 2), tokens)
  assert.deepEqual(placeFormulaToken(tokens, 'PB', 3, 2), tokens)
})

test('rascunho mantém termos com várias palavras e operadores ao retomar', () => {
  const tokens = ['Peso pronto', '=', 'PL cru', '×', 'IC']
  assert.deepEqual(equationTokens(tokens.join(' ')), tokens)
  assert.deepEqual(equationTokens('Perda (%) = ( PB − PL ) ÷ PB × 100'),
    ['Perda', '(', '%', ')', '=', '(', 'PB', '−', 'PL', ')', '÷', 'PB', '×', '100'])
})


test('salva peças adjacentes e repetidas sem fundir variáveis ao retomar', () => {
  const pieces = ['FC', 'PB', '=', 'PL cru', 'PL cru', '×']
  assert.deepEqual(readFormulaPieces(JSON.stringify(pieces)), pieces)
  assert.deepEqual(readFormulaPieces('PB = PL × FC'), ['PB', '=', 'PL', '×', 'FC'])
  assert.deepEqual(readFormulaPieces(''), [])
  assert.deepEqual(readFormulaPieces('[]'), [])
})

test('corrige as montagens de todas as fórmulas e distingue resposta ausente', () => {
  for (const formula of formulas) {
    const draft = JSON.stringify(equationTokens(formula.equation))
    assert.equal(gradeFormulaAssembly(draft, formula.equation), 'correct', formula.id)
    assert.equal(gradeFormulaAssembly(formula.wrong, formula.equation), 'incorrect', formula.id)
  }
  assert.equal(gradeFormulaAssembly('', 'FC = PB ÷ PL'), 'unknown')
  assert.equal(gradeFormulaAssembly('[]', 'FC = PB ÷ PL'), 'unknown')
  assert.equal(gradeFormulaAssembly('["FC"]', 'FC = PB ÷ PL'), 'incorrect')
})

test('aceita ordem dos fatores e lados invertidos, preservando razões e parênteses', () => {
  assert.equal(gradeFormulaAssembly('PB = FC × PL', 'PB = PL × FC'), 'correct')
  assert.equal(gradeFormulaAssembly('PL × FC = PB', 'PB = PL × FC'), 'correct')
  assert.equal(gradeFormulaAssembly('FC = PL ÷ PB', 'FC = PB ÷ PL'), 'incorrect')
  assert.equal(gradeFormulaAssembly('Perda = PL − PB', 'Perda = PB − PL'), 'incorrect')
  assert.equal(gradeFormulaAssembly('PB = = PL × FC', 'PB = PL × FC'), 'incorrect')
  assert.equal(gradeFormulaAssembly('Perda (%) = PB − PL ÷ PB × 100',
    'Perda (%) = ( PB − PL ) ÷ PB × 100'), 'incorrect')
})


test('encontrar erro começa com peças incorretas e valida a correção de cada fórmula', () => {
  for (const formula of formulas) {
    const card = { method: 'repair' as const, prompt: formula.wrong }
    const initial = formulaPieceDraft(card, '')
    assert.deepEqual(readFormulaPieces(initial), equationTokens(formula.wrong))
    assert.equal(gradeFormulaAssembly(initial, formula.equation), 'incorrect')
    const corrected = JSON.stringify(equationTokens(formula.equation))
    assert.equal(formulaPieceDraft(card, corrected), corrected)
    assert.equal(gradeFormulaAssembly(corrected, formula.equation), 'correct')
    assert.equal(formulaPieceDraft(card, '[]'), '[]')
    assert.equal(gradeFormulaAssembly(formulaPieceDraft(card, '[]'), formula.equation), 'unknown')
    assert.equal(formulaPieceDraft(card, formula.equation), formula.equation)
  }
  assert.equal(formulaPieceDraft({ method: 'assemble', prompt: 'FC' }, ''), '')
})


test('soltar fora remove apenas a peça da fórmula, inclusive a primeira ou uma repetida', () => {
  const pieces = ['PB', '=', 'PL', '×', 'PL']
  assert.deepEqual(dropFormulaToken(pieces, 'PB', null, 0), ['=', 'PL', '×', 'PL'])
  assert.deepEqual(dropFormulaToken(pieces, 'PL', null, 4), ['PB', '=', 'PL', '×'])
  assert.deepEqual(dropFormulaToken(['FC'], 'FC', null, 0), [])
  assert.equal(dropFormulaToken(pieces, 'FC', null), pieces)
  assert.deepEqual(dropFormulaToken(pieces, 'FC', 5), [...pieces, 'FC'])
  assert.deepEqual(dropFormulaToken(pieces, 'PB', 5, 0), ['=', 'PL', '×', 'PL', 'PB'])
  assert.deepEqual(pieces, ['PB', '=', 'PL', '×', 'PL'])
})


test('ações rápidas acumulam no estado atual sem depender de uma nova renderização', () => {
  const card = { method: 'assemble' as const, prompt: 'FC' }
  let latest = newFormulaProgress(42)
  const id = latest.currentId
  // These handlers are created once, as if no render happened between input events.
  const add = (token: string) => {
    latest = editFormulaProgress(latest, id, current =>
      editFormulaPieces(card, current, pieces => [...pieces, token]))
  }
  const discard = () => {
    latest = editFormulaProgress(latest, id, current =>
      editFormulaPieces(card, current, pieces => dropFormulaToken(pieces, pieces[0], null, 0)))
  }
  for (let index = 0; index < 100; index++) add(String(index))
  assert.deepEqual(readFormulaPieces(latest.draft), Array.from({ length: 100 }, (_, i) => String(i)))
  for (let index = 0; index < 50; index++) { discard(); add(`novo${index}`) }
  assert.deepEqual(readFormulaPieces(latest.draft), [
    ...Array.from({ length: 50 }, (_, i) => String(i + 50)),
    ...Array.from({ length: 50 }, (_, i) => `novo${i}`),
  ])
  for (let index = 0; index < 100; index++) discard()
  assert.deepEqual(readFormulaPieces(latest.draft), [])
  const confirmed = { ...latest, revealed: true }
  assert.equal(editFormulaProgress(confirmed, id, 'mudança atrasada'), confirmed)
  assert.equal(editFormulaProgress(latest, 'cartão antigo', 'mudança atrasada'), latest)
})

test('arraste rápido é reconhecido na soltura mesmo sem evento intermediário de movimento', () => {
  assert.equal(isFormulaDrag({ x: 10, y: 10 }, { x: 100, y: 100 }), true)
  assert.equal(isFormulaDrag({ x: 10, y: 10 }, { x: 12, y: 12 }), false)
  assert.equal(isFormulaDrag({ x: 10, y: 10 }, { x: 10, y: 10 }, true), true)
})
