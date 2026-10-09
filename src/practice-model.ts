import type { Question } from './questions'

export type Result = 'correct' | 'incorrect' | 'incomplete' | 'unknown'
export type Attempt = { answer: string; result: Result }
export type History = Record<string, { attempts: number; errors: number; lastCorrect: boolean }>
export type Session = {
  questions: Question[]
  index: number
  answers: Record<string, Attempt>
  draft: string
  completed: boolean
}

export function normalizeAnswer(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/\s+/g, ' ').replace(/[.!]+$/, '')
}

export function isAnswerReady(question: Question, value: string) {
  if (question.numeric !== undefined) return /^\d+(?:[,.]\d+)?$/.test(value.trim())
  return value.trim().length > 0
}

export function gradeAnswer(question: Question, value: string): Result {
  if (question.numeric !== undefined) {
    if (!isAnswerReady(question, value)) return 'incorrect'
    const number = Number(value.trim().replace(',', '.'))
    return Math.abs(number - question.numeric) <= 0.005000001 ? 'correct' : 'incorrect'
  }
  const normalized = normalizeAnswer(value)
  const accepted = question.accepted ?? [question.answer]
  if (accepted.some(answer => normalizeAnswer(answer) === normalized)) return 'correct'
  if (question.incomplete?.some(answer => normalizeAnswer(answer) === normalized)) {
    return 'incomplete'
  }
  return 'incorrect'
}

export function recordAttempt(history: History, id: string, result: Result): History {
  const previous = history[id] ?? { attempts: 0, errors: 0, lastCorrect: false }
  return {
    ...history,
    [id]: {
      attempts: previous.attempts + 1,
      errors: previous.errors + (result === 'correct' ? 0 : 1),
      lastCorrect: result === 'correct',
    },
  }
}

function shuffle<T>(items: T[]) {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index--) {
    const target = Math.floor(Math.random() * (index + 1))
    const current = shuffled[index]
    shuffled[index] = shuffled[target]
    shuffled[target] = current
  }
  return shuffled
}

export function selectQuestions(eligible: Question[], quantity: number, history?: History) {
  const pool = [...eligible]
  if (history) pool.sort((a, b) => history[b.id].errors - history[a.id].errors)
  const selected = history ? pool.slice(0, quantity) : pool
  return prepareQuestions(shuffle(selected).slice(0, quantity))
}

export function prepareQuestions(pool: Question[]) {
  return pool.map(question => ({
    ...question,
    options: question.type === 0 && question.options ? shuffle(question.options) : question.options,
  }))
}

export function createSession(questions: Question[]): Session {
  return { questions, index: 0, answers: {}, draft: '', completed: false }
}

export function confirmSession(session: Session, unknown = false) {
  const question = session.questions[session.index]
  if (session.answers[question.id]) return null
  if (!unknown && !isAnswerReady(question, session.draft)) return null
  const result = unknown ? 'unknown' : gradeAnswer(question, session.draft)
  const answer = unknown ? 'Não sei' : session.draft
  return {
    id: question.id, result,
    session: { ...session, answers: { ...session.answers, [question.id]: { answer, result } } },
  }
}
