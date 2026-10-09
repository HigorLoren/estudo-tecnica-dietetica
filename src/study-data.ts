import { questions } from './questions.ts'
import type { History } from './practice-model'

const categories = [
  { id: 'fundamentos', name: 'Fundamentos', detail: 'Objetivos da Técnica Dietética' },
  { id: 'pesos', name: 'Pesos e medidas', detail: 'Pesagem e padronização' },
  { id: 'pre-preparo', name: 'Técnicas de cozinha', detail: 'Operações de pré-preparo' },
  { id: 'indicadores', name: 'Indicadores culinários', detail: 'FC, IC, IER, rendimento e compra' },
  { id: 'coccao', name: 'Métodos de cocção', detail: 'Preparo e transferência de calor' },
  { id: 'ficha', name: 'Ficha técnica', detail: 'Ingredientes e pesos na receita' },
]

export const subjects = categories.map(category => ({
  ...category,
  counts: [0, 1, 2].map(type => questions.filter(
    question => question.subject === category.id && question.type === type,
  ).length),
}))
export const formats = ['Múltipla escolha', 'Verdadeiro ou falso', 'Resposta curta']
export const totalQuestions = questions.length

export function getEligibleQuestions(
  selected: string[], types: number[], review: boolean, history: History = {},
) {
  return questions.filter(question => selected.includes(question.subject)
    && types.includes(question.type)
    && (!review || history[question.id]?.lastCorrect === false))
}

export function getAvailability(
  selected: string[], types: number[], review: boolean, history: History = {},
) {
  return getEligibleQuestions(selected, types, review, history).length
}

export type BankFilters = { subject: string; type: string }
export function filterBankQuestions(filters: BankFilters) {
  return questions.filter(question => (filters.subject === 'all'
    || question.subject === filters.subject) && (filters.type === 'all'
    || question.type === Number(filters.type)))
}
