import assert from 'node:assert/strict'
import { test } from 'node:test'
import { questions } from '../src/questions.ts'
import { createSession } from '../src/practice-model.ts'
import {
  createReviewConfiguration, displayStudentAnswer, formatPoints, getTestResult,
} from '../src/result-model.ts'

const byId = (id: string) => questions.find(question => question.id === id)!

function mixedSession() {
  const session = createSession([
    byId('fundamentos-objetivos'), byId('ic-calculo'),
    byId('pre-preparo-organizacao'), byId('compra-uan'),
  ])
  session.answers = {
    'fundamentos-objetivos': { answer: byId('fundamentos-objetivos').answer, result: 'correct' },
    'ic-calculo': { answer: '1,33', result: 'incorrect' },
    'pre-preparo-organizacao': { answer: 'mise', result: 'incomplete' },
    'compra-uan': { answer: 'Não sei', result: 'unknown' },
  }
  session.completed = true
  return session
}

test('result includes each question in order with points for correct answers only', () => {
  const session = mixedSession()
  session.answers.unrelated = { answer: 'old answer', result: 'correct' }
  const before = JSON.stringify(session)
  const result = getTestResult(session)
  assert.equal(result.total, 4)
  assert.equal(result.correct, 1)
  assert.equal(result.pending, 3)
  assert.equal(result.score, 1)
  assert.equal(result.pointsPerQuestion, 1)
  assert.deepEqual(result.rows.map(row => row.points), [1, 0, 0, 0])
  assert.deepEqual(result.rows.map(row => row.question.id),
    session.questions.map(question => question.id))
  assert.equal(JSON.stringify(session), before)
})

test('score keeps full precision instead of summing rounded per-question values', () => {
  const session = createSession(questions.slice(0, 3))
  for (const question of session.questions.slice(0, 2)) {
    session.answers[question.id] = { answer: question.answer, result: 'correct' }
  }
  const result = getTestResult(session)
  assert.equal(result.score, 8 / 3)
  assert.equal(formatPoints(result.pointsPerQuestion), '1,33')
  assert.equal(formatPoints(result.score), '2,67')
  assert.equal(result.pending, 1)
})

test('review configuration uses only non-correct subjects and formats from the completed test', () => {
  assert.deepEqual(createReviewConfiguration(mixedSession()), {
    mode: 'review', selected: ['indicadores', 'pre-preparo'], types: [2], quantity: 3,
  })
})

test('student answers display units appropriately and never attach units to Não sei', () => {
  assert.equal(displayStudentAnswer(byId('fc-peso-bruto'),
    { answer: '8,00', result: 'incorrect' }), '8,00 kg')
  assert.equal(displayStudentAnswer(byId('custo-real'),
    { answer: '10', result: 'correct' }), 'R$ 10')
  assert.equal(displayStudentAnswer(byId('compra-uan'),
    { answer: 'Não sei', result: 'unknown' }), 'Não sei')
  assert.equal(displayStudentAnswer(byId('pre-preparo-organizacao'),
    { answer: 'mise', result: 'incomplete' }), 'mise')
})

test('all-correct result reaches four points and missing attempts safely receive zero', () => {
  const session = createSession(questions)
  for (const question of questions) {
    session.answers[question.id] = { answer: question.answer, result: 'correct' }
  }
  const full = getTestResult(session)
  assert.equal(full.score, 4)
  assert.equal(full.pending, 0)
  delete session.answers[session.questions[0].id]
  const missing = getTestResult(session)
  assert.equal(missing.rows[0].attempt.result, 'unknown')
  assert.equal(missing.rows[0].points, 0)
  assert.equal(missing.pending, 1)
  const empty = getTestResult(createSession([]))
  assert.equal(empty.score, 0)
  assert.equal(empty.pointsPerQuestion, 0)
})

test('hint-assisted correct answers earn points and appear in the review configuration', () => {
  const session = createSession([byId('fc-calculo')])
  session.answers['fc-calculo'] = { answer: '1,20', result: 'correct', usedHint: true }
  const result = getTestResult(session)
  assert.equal(result.correct, 1)
  assert.equal(result.score, 4)
  assert.equal(result.pending, 1)
  assert.deepEqual(createReviewConfiguration(session), {
    mode: 'review', selected: ['indicadores'], types: [2], quantity: 1,
  })
})
