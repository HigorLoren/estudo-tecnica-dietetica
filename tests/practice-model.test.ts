import assert from 'node:assert/strict'
import { test } from 'node:test'
import { questions } from '../src/questions.ts'
import { getAvailability, getEligibleQuestions, subjects } from '../src/study-data.ts'
import {
  confirmSession, createSession, gradeAnswer, isAnswerReady, recordAttempt, selectQuestions,
  revealQuestionHint,
} from '../src/practice-model.ts'

const byId = (id: string) => questions.find(question => question.id === id)!
const categoryIds = subjects.map(subject => subject.id)

test('counts and eligibility reflect the real bank and combined filters', () => {
  assert.equal(new Set(questions.map(question => question.id)).size, questions.length)
  assert.equal(getAvailability(categoryIds, [0, 1, 2], false), 58)
  assert.equal(getAvailability(['indicadores'], [0, 1, 2], false), 36)
  assert.equal(getAvailability(['indicadores'], [2], false), 32)
  assert.equal(getAvailability([], [0, 1, 2], false), 0)
  assert.equal(getAvailability(categoryIds, [], false), 0)
  assert.equal(getAvailability(categoryIds, [0, 1, 2], true), 0)
  assert.equal(subjects.reduce((sum, subject) =>
    sum + subject.counts.reduce((total, count) => total + count, 0), 0), questions.length)
})

test('calculations match independent formulas and accept Brazilian decimals', () => {
  const values = {
    'fc-calculo': 12 / 10,
    'fc-peso-liquido': 18 / 1.5,
    'fc-peso-bruto': 8 * 1.25,
    'ic-calculo': 7.5 / 10,
    'ic-rendimento': 600 * 0.7,
    'porcao-calculo': 60 * 2.5,
    'rendimento-total': 150 * 200 / 1000,
    'compra-uan': 100 * 120 * 1.2 * 1.1 / 1000,
    'custo-real': 8 * 1.25,
    'ier-calculo': 1000 / 500,
  }
  for (const [id, value] of Object.entries(values)) {
    const question = byId(id)
    assert.ok(Math.abs(question.numeric! - value) < 1e-10)
    assert.equal(gradeAnswer(question, value.toFixed(2).replace('.', ',')), 'correct')
    assert.equal(gradeAnswer(question, value.toFixed(2)), 'correct')
  }
  assert.equal(gradeAnswer(byId('fc-calculo'), '0,83'), 'incorrect')
  assert.equal(gradeAnswer(byId('ic-calculo'), '1,33'), 'incorrect')
  assert.equal(gradeAnswer(byId('compra-uan'), '14,40'), 'incorrect')
  assert.equal(gradeAnswer(byId('rendimento-total'), '30000'), 'incorrect')
})

test('empty and malformed numeric answers cannot be confirmed', () => {
  for (const value of ['', ' ', '1,', 'NaN', 'Infinity', '12 kg', '1,2,3', '-1']) {
    assert.equal(isAnswerReady(byId('fc-calculo'), value), false)
  }
  assert.equal(isAnswerReady(byId('fc-calculo'), ' 1,20 '), true)
  assert.equal(gradeAnswer(byId('fc-calculo'), '1,21'), 'incorrect')
})

test('text correction normalizes whitespace and distinguishes incomplete answers', () => {
  const question = byId('pre-preparo-organizacao')
  assert.equal(gradeAnswer(question, '  MISE  EN PLACE! '), 'correct')
  assert.equal(gradeAnswer(question, 'mise'), 'incomplete')
  assert.equal(gradeAnswer(question, 'cocção'), 'incorrect')
  assert.equal(gradeAnswer(byId('coccao-transferencia'), 'CONVECCAO'), 'correct')
})

test('errors enter review and a new correct attempt removes them while preserving history', () => {
  let history = recordAttempt({}, 'fc-calculo', 'incorrect')
  history = recordAttempt(history, 'ic-calculo', 'unknown')
  history = recordAttempt(history, 'pre-preparo-organizacao', 'incomplete')
  assert.equal(getAvailability(categoryIds, [0, 1, 2], true, history), 3)
  assert.equal(getAvailability(['indicadores'], [2], true, history), 2)
  history = recordAttempt(history, 'fc-calculo', 'correct')
  assert.deepEqual(history['fc-calculo'], { attempts: 2, errors: 1, lastCorrect: true })
  assert.equal(getAvailability(categoryIds, [0, 1, 2], true, history), 2)
})

test('test sampling respects quantity, availability, uniqueness and review priority', () => {
  const pool = getEligibleQuestions(['indicadores'], [2], false)
  for (let run = 0; run < 10; run++) {
    const selection = selectQuestions(pool, 5)
    assert.equal(selection.length, 5)
    assert.equal(new Set(selection.map(question => question.id)).size, 5)
    assert.ok(selection.every(question => question.subject === 'indicadores' && question.type === 2))
  }
  assert.equal(selectQuestions(pool, 999).length, pool.length)
  let history = recordAttempt({}, 'fc-calculo', 'incorrect')
  history = recordAttempt(history, 'fc-calculo', 'incorrect')
  history = recordAttempt(history, 'ic-calculo', 'incorrect')
  const reviewPool = getEligibleQuestions(categoryIds, [2], true, history)
  assert.equal(selectQuestions(reviewPool, 1, history)[0].id, 'fc-calculo')
  assert.deepEqual(createSession(pool), {
    questions: pool, index: 0, answers: {}, draft: '', completed: false,
  })
})


test('confirmation locks an attempt and a repeated confirmation cannot record it again', () => {
  const session = createSession([byId('fc-calculo')])
  assert.equal(confirmSession(session), null)
  session.draft = '1,20'
  const confirmed = confirmSession(session)!
  assert.equal(confirmed.result, 'correct')
  assert.equal(confirmSession(confirmed.session), null)
  assert.equal(confirmSession(confirmed.session, true), null)
})

test('a correct answer with a hint remains in review until an unaided correct attempt', () => {
  const session = revealQuestionHint(createSession([byId('fc-calculo')]))!
  assert.equal(revealQuestionHint(session), null)
  session.draft = '1,20'
  const confirmed = confirmSession(session)!
  assert.equal(confirmed.result, 'correct')
  assert.equal(confirmed.session.answers['fc-calculo'].usedHint, true)
  let history = recordAttempt({}, confirmed.id, confirmed.result, confirmed.usedHint)
  assert.equal(history['fc-calculo'].errors, 0)
  assert.equal(getAvailability(['indicadores'], [2], true, history), 1)
  assert.equal(revealQuestionHint(confirmed.session), null)
  history = recordAttempt(history, confirmed.id, 'correct')
  assert.equal(getAvailability(['indicadores'], [2], true, history), 0)
  assert.equal(history['fc-calculo'].usedHint, undefined)
})

test('hints belong to one question and cannot be opened after completion', () => {
  const session = revealQuestionHint(createSession([byId('fc-calculo'), byId('ic-calculo')]))!
  session.index = 1
  session.draft = '0,75'
  assert.equal(confirmSession(session)!.usedHint, false)
  session.completed = true
  assert.equal(revealQuestionHint(session), null)
})
