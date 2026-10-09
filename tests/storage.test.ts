import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  defaultProgress, loadProgress, recoverProgress, saveProgress, serializeProgress, STORAGE_KEY,
} from '../src/storage.ts'
import { createSession, recordAttempt, revealQuestionHint, confirmSession } from '../src/practice-model.ts'
import { questions, questionCatalog } from '../src/questions.ts'
import { filterBankQuestions } from '../src/study-data.ts'

function sampleProgress() {
  const progress = defaultProgress()
  const optionsQuestion = questions.find(question => question.type === 0)!
  const textQuestion = questions.find(question => question.id === 'fc-calculo')!
  progress.config = { mode: 'review', selected: ['indicadores'], types: [0, 2], quantity: 3 }
  progress.session = createSession([
    { ...optionsQuestion, options: optionsQuestion.options!.toReversed() }, textQuestion,
  ])
  progress.session.answers[optionsQuestion.id] = {
    answer: optionsQuestion.answer, result: 'correct',
  }
  progress.session.index = 1
  progress.session.draft = '1,2'
  progress.history = recordAttempt({}, optionsQuestion.id, 'correct')
  return progress
}

test('restores config, history, question order, choices, confirmed answer and draft', () => {
  const progress = sampleProgress()
  const restored = recoverProgress(serializeProgress(progress))
  assert.deepEqual(restored.progress, progress)
  assert.equal(restored.message, null)
  assert.equal(restored.unavailable, false)
  const data = JSON.parse(serializeProgress(progress))
  assert.equal(data.version, 1)
  assert.deepEqual(data.session.ids, progress.session!.questions.map(question => question.id))
  assert.equal(data.session.questions, undefined)
})

test('completion clears persisted session while retaining attempts and configuration', () => {
  const progress = sampleProgress()
  progress.session!.completed = true
  const restored = recoverProgress(serializeProgress(progress)).progress
  assert.equal(restored.session, null)
  assert.deepEqual(restored.history, progress.history)
  assert.deepEqual(restored.config, progress.config)
})

test('removes deleted questions and maintains current question and its draft', () => {
  const data = JSON.parse(serializeProgress(sampleProgress()))
  data.session.ids.unshift('removed-question')
  data.session.index += 1
  data.session.answers['removed-question'] = { answer: 'old', result: 'incorrect' }
  const recovery = recoverProgress(JSON.stringify(data))
  assert.equal(recovery.progress.session!.index, 1)
  assert.equal(recovery.progress.session!.draft, '1,2')
  assert.equal(recovery.progress.session!.questions.length, 2)
  assert.equal(recovery.progress.session!.answers['removed-question'], undefined)
  assert.ok(recovery.message)
})

test('restarts at a changed earlier question without discarding unaffected answers', () => {
  const progress = sampleProgress()
  const data = JSON.parse(serializeProgress(progress))
  const id = progress.session!.questions[0].id
  data.signatures[id] = 'outdated content'
  const recovery = recoverProgress(JSON.stringify(data))
  assert.equal(recovery.progress.session!.index, 0)
  assert.equal(recovery.progress.session!.answers[id], undefined)
  assert.equal(recovery.progress.session!.draft, '')
  assert.equal(recovery.progress.history[id], undefined)
  assert.ok(recovery.message)
})

test('removing the current question clears its draft instead of attaching it to another', () => {
  const data = JSON.parse(serializeProgress(sampleProgress()))
  data.session.ids[1] = 'removed-current-question'
  const restored = recoverProgress(JSON.stringify(data)).progress.session!
  assert.equal(restored.questions.length, 1)
  assert.equal(restored.index, 0)
  assert.equal(restored.draft, '')
})

test('recovers malformed values and preserves intentionally empty selections', () => {
  const data = JSON.parse(serializeProgress(sampleProgress()))
  data.config = { mode: 'bad', selected: [], types: [], quantity: -10 }
  data.session.ids = ['fc-calculo', 'fc-calculo']
  data.session.index = 999
  data.session.options = { 'fc-calculo': ['unexpected'] }
  data.session.answers = { 'fc-calculo': { answer: 123, result: 'correct' } }
  data.history = { 'fc-calculo': { attempts: 2, errors: -3, lastCorrect: 'yes' } }
  const restored = recoverProgress(JSON.stringify(data)).progress
  assert.deepEqual(restored.config, { mode: 'test', selected: [], types: [], quantity: 1 })
  assert.equal(restored.session!.questions.length, 1)
  assert.equal(restored.session!.index, 0)
  assert.deepEqual(restored.session!.answers, {})
  assert.deepEqual(restored.history, {})
})

test('invalid JSON and unsupported versions recover without crashing', () => {
  for (const raw of ['invalid json', JSON.stringify({ version: 999 }), 'null']) {
    const result = loadProgress({ getItem: () => raw, setItem: () => {} })
    assert.deepEqual(result.progress, defaultProgress())
    assert.ok(result.message)
    assert.equal(result.unavailable, false)
  }
})

test('storage failures are reported and usable state remains in memory', () => {
  const unavailable = {
    getItem: () => { throw new Error('Denied') },
    setItem: () => { throw new Error('Quota exceeded') },
  }
  const result = loadProgress(unavailable)
  assert.equal(result.unavailable, true)
  assert.deepEqual(result.progress, defaultProgress())
  assert.equal(saveProgress(unavailable, sampleProgress()), false)
  let key = ''
  let raw = ''
  assert.equal(saveProgress({ getItem: () => null,
    setItem: (nextKey, nextRaw) => { key = nextKey; raw = nextRaw } }, sampleProgress()), true)
  assert.equal(key, STORAGE_KEY)
  assert.deepEqual(recoverProgress(raw).progress, sampleProgress())
})

test('bank combines filters and finds an empty selection without altering the full bank', () => {
  assert.equal(filterBankQuestions({ subject: 'all', type: 'all' }).length, questions.length)
  const numeric = filterBankQuestions({ subject: 'indicadores', type: '2' })
  assert.equal(numeric.length, 42)
  assert.ok(numeric.every(question => question.type === 2 && question.subject === 'indicadores'))
  assert.equal(filterBankQuestions({ subject: 'fundamentos', type: '2' }).length, 1)
})

test('removed duplicate questions leave resumed sessions without losing their history', () => {
  const progress = sampleProgress()
  const hidden = questionCatalog.find(question => question.id === 'revisao-padronizacao')!
  progress.session!.questions.unshift(hidden)
  progress.session!.index += 1
  progress.history = recordAttempt(progress.history, hidden.id, 'incorrect')
  const restored = recoverProgress(serializeProgress(progress)).progress
  assert.ok(!restored.session!.questions.some(question => question.id === hidden.id))
  assert.deepEqual(restored.history[hidden.id], progress.history[hidden.id])
  assert.equal(restored.session!.draft, progress.session!.draft)
})

test('hidden sensory questions retain history and leave resumed sessions and selections', () => {
  const progress = sampleProgress()
  const hidden = questionCatalog.find(question => question.subject === 'sensorial')!
  progress.config.selected.push('sensorial')
  progress.session!.questions.push(hidden)
  progress.history = recordAttempt(progress.history, hidden.id, 'incorrect')
  const restored = recoverProgress(serializeProgress(progress)).progress
  assert.ok(!restored.config.selected.includes('sensorial'))
  assert.ok(!restored.session!.questions.some(question => question.id === hidden.id))
  assert.deepEqual(restored.history[hidden.id], progress.history[hidden.id])
})

test('hint usage survives reload both before and after confirming a correct answer', () => {
  const progress = sampleProgress()
  progress.session = revealQuestionHint(createSession([
    questions.find(question => question.id === 'fc-calculo')!,
  ]))!
  const resumed = recoverProgress(serializeProgress(progress)).progress
  assert.deepEqual(resumed.session!.hintedIds, ['fc-calculo'])
  resumed.session!.draft = '1,20'
  const confirmed = confirmSession(resumed.session!)!
  resumed.session = confirmed.session
  resumed.history = recordAttempt({}, confirmed.id, confirmed.result, confirmed.usedHint)
  const restored = recoverProgress(serializeProgress(resumed)).progress
  assert.equal(restored.session!.answers['fc-calculo'].usedHint, true)
  assert.equal(restored.history['fc-calculo'].lastCorrect, false)
  assert.equal(restored.history['fc-calculo'].usedHint, true)
})

test('cut questions are excluded from restored sessions while preserving old history', () => {
  const progress = sampleProgress()
  const cut = questionCatalog.find(question => question.id === 'revisao-brunoise')!
  progress.session!.questions.push(cut)
  progress.history = recordAttempt(progress.history, cut.id, 'incorrect')
  const restored = recoverProgress(serializeProgress(progress)).progress
  assert.ok(!restored.session!.questions.some(question => question.id === cut.id))
  assert.deepEqual(restored.history[cut.id], progress.history[cut.id])
})
