import assert from 'node:assert/strict'
import { test } from 'node:test'
import { questions } from '../src/questions.ts'
import { isAnswerReady, gradeAnswer, createSession, confirmSession,
  revealQuestionHint } from '../src/practice-model.ts'
import { defaultProgress, recoverProgress, serializeProgress } from '../src/storage.ts'
import { displayStudentAnswer } from '../src/result-model.ts'

const question = questions.find(item => item.id === 'lista-original-10')!
const cells = { '0:0:2': '47,62', '0:1:3': '1.32', '0:2:1': '49,78',
  '0:3:3': '1,69', '0:4:2': '18,35' }

test('table grading requires five numeric cells and checks each rounded result', () => {
  assert.equal(question.selfAssess, false)
  assert.equal(question.tableAnswer, true)
  assert.equal(isAnswerReady(question, JSON.stringify(cells)), true)
  assert.equal(gradeAnswer(question, JSON.stringify(cells)), 'correct')
  assert.equal(isAnswerReady(question, JSON.stringify({ ...cells, '0:1:3': '' })), false)
  assert.equal(isAnswerReady(question, JSON.stringify({ ...cells, '0:1:3': 'abc' })), false)
  assert.equal(isAnswerReady(question, 'Respondi corretamente'), false)
  assert.equal(isAnswerReady(question, '[]'), false)
  assert.equal(gradeAnswer(question, JSON.stringify({ ...cells, '0:1:3': '1,33' })), 'incorrect')
})

test('table draft, confirmed cells and hint usage survive a resumed test', () => {
  const progress = defaultProgress()
  progress.session = createSession([question])
  progress.session.draft = JSON.stringify({ '0:0:2': '47,62' })
  const pending = recoverProgress(serializeProgress(progress)).progress.session!
  assert.equal(pending.draft, progress.session.draft)
  assert.equal(confirmSession(pending), null)
  const hinted = revealQuestionHint(pending)!
  hinted.draft = JSON.stringify(cells)
  const confirmed = confirmSession(hinted)!
  assert.equal(confirmed.result, 'correct')
  assert.equal(confirmed.usedHint, true)
  progress.session = confirmed.session
  const restored = recoverProgress(serializeProgress(progress)).progress.session!
  assert.equal(restored.answers[question.id].answer, JSON.stringify(cells))
  const display = displayStudentAnswer(question, restored.answers[question.id])
  assert.ok(display.includes('Feijão carioca · PL (Kg): 47,62'))
  assert.ok(display.includes('Acém sem osso · FC: 1.32'))
})
