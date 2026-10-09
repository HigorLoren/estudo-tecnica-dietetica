import type { Configuration } from './configuration-screen'
import { needsReview, type Attempt, type Session } from './practice-model.ts'
import type { Question } from './questions'

export function getTestResult(session: Session) {
  const total = session.questions.length
  const pointsPerQuestion = total ? 4 / total : 0
  const rows = session.questions.map(question => {
    const attempt = session.answers[question.id] ?? { answer: 'Não sei', result: 'unknown' }
    return { question, attempt, points: attempt.result === 'correct' ? pointsPerQuestion : 0 }
  })
  const correct = rows.filter(row => row.attempt.result === 'correct').length
  return { total, correct, pending: rows.filter(row => needsReview(row.attempt)).length,
    pointsPerQuestion, score: correct * pointsPerQuestion, rows }
}

export function formatPoints(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function displayStudentAnswer(question: Question, attempt: Attempt) {
  if (attempt.result === 'unknown' || !attempt.answer.trim()) return 'Não sei'
  if (!question.unit) return attempt.answer
  return question.unit === 'R$' ? `R$ ${attempt.answer}` : `${attempt.answer} ${question.unit}`
}

export function createReviewConfiguration(session: Session): Configuration {
  const pending = getTestResult(session).rows.filter(row => needsReview(row.attempt))
  return {
    mode: 'review', selected: [...new Set(pending.map(row => row.question.subject))],
    types: [...new Set(pending.map(row => row.question.type))],
    quantity: Math.max(1, pending.length),
  }
}
