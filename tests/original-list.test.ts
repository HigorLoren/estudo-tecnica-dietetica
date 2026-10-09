import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { questions, questionCatalog } from '../src/questions.ts'
import { originalListItems } from '../src/original-list-data.ts'
import { createSession, confirmSession, gradeAnswer, isAnswerReady,
  revealQuestionHint } from '../src/practice-model.ts'
import { defaultProgress, recoverProgress, serializeProgress } from '../src/storage.ts'

const original = questionCatalog.filter(question => question.origin === 'professora')
const whitespace = (text: string) => text.replace(/\s+/g, ' ').trim()

test('all 36 original prompts match the visually checked PDF transcription', () => {
  const fixture = JSON.parse(readFileSync(new URL('./fixtures/professora-enunciados.json',
    import.meta.url), 'utf8')) as { number: string; prompt: string }[]
  assert.equal(original.length, 36)
  for (const [index, expected] of fixture.entries()) {
    assert.equal(whitespace(original[index].prompt), expected.prompt)
    assert.ok(original[index].topic.includes(`questão ${expected.number}`))
    assert.equal(original[index].source.includes('adaptada'), false)
  }
  assert.equal(new Set(original.map(question => question.id)).size, 36)
  assert.equal(originalListItems.filter(item => item.number === '24').length, 2)
  assert.equal(originalListItems.filter(item => item.number === '25').length, 2)
})

test('tables preserve all source rows, units, group headers and answer locations', () => {
  const table = original.find(question => question.id === 'lista-original-10')!.tables![0]
  assert.deepEqual(table.headers, ['Alimento', 'PB (Kg)', 'PL (Kg)', 'FC'])
  assert.deepEqual(table.rows[2], ['Melancia', '49,78', '27,5', '1,81'])
  assert.deepEqual(table.solutions, [[2], [3], [1], [3], [2]])
  const supplier = original.find(question => question.id === 'lista-34-fornecedor')!
  assert.equal(supplier.tables![0].rows.length, 3)
  assert.equal(supplier.tables![0].solutions, undefined)
  assert.equal(gradeAnswer(supplier, 'Lavoura encantada'), 'correct')
  const recipe = original.find(question => question.id === 'lista-original-macarrao')!
  assert.equal(recipe.tables![0].groups![2].rows, 2)
  assert.deepEqual(recipe.tables![0].rows[1], ['Alho', '7 dts', '36', '30', '1,2',
    '2,1', '7,17', '0,06'])
  assert.ok(recipe.caution.includes('não está validada'))
})

test('discursive assessment contributes to grading, hint review and persistence', () => {
  const question = original.find(question => question.id === 'lista-original-01')!
  assert.equal(isAnswerReady(question, question.answer), false)
  assert.equal(gradeAnswer(question, 'Preciso revisar'), 'incorrect')
  const session = revealQuestionHint(createSession([question]))!
  session.draft = 'Respondi corretamente'
  const confirmation = confirmSession(session)!
  assert.equal(confirmation.result, 'correct')
  assert.equal(confirmation.usedHint, true)
  const progress = defaultProgress()
  progress.session = confirmation.session
  const restored = recoverProgress(serializeProgress(progress)).progress.session!
  assert.equal(restored.answers[question.id].result, 'correct')
  assert.equal(restored.answers[question.id].usedHint, true)
})

test('the two complete recipe exercises are excluded from the active bank', () => {
  const active = questions.filter(question => question.origin === 'professora')
  assert.equal(active.length, 34)
  assert.ok(!active.some(question => question.id === 'lista-original-macarrao'))
  assert.ok(!active.some(question => question.id === 'lista-original-biscoito'))
  assert.ok(active.some(question => question.id === 'lista-original-10'))
  assert.ok(questions.some(question => question.id === 'lista-biscoito-porcoes'))
})
