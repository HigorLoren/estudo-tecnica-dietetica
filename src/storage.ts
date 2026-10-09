import { questions, type Question } from './questions.ts'
import { subjects } from './study-data.ts'
import type { Configuration } from './configuration-screen'
import type { Attempt, History, Session } from './practice-model'

export const STORAGE_KEY = 'tecnica-dietetica:progresso'
export type Progress = { config: Configuration; history: History; session: Session | null }
export type StorageAccess = Pick<Storage, 'getItem' | 'setItem'>
type Data = Record<string, unknown>
export type Recovery = { progress: Progress; message: string | null; unavailable: boolean }

function object(value: unknown): Data {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Data : {}
}

export function defaultProgress(): Progress {
  return {
    config: { mode: 'test', selected: subjects.map(subject => subject.id),
      types: [0, 1, 2], quantity: 10 },
    history: {}, session: null,
  }
}

function signature(question: Question) {
  return JSON.stringify([question.prompt, question.type, question.answer, question.numeric,
    question.unit, question.accepted, question.incomplete, question.options?.toSorted()])
}

function restoreConfig(value: unknown): Configuration {
  const config = object(value)
  const defaults = defaultProgress().config
  return {
    mode: config.mode === 'review' ? 'review' : 'test',
    selected: Array.isArray(config.selected) ? subjects.map(subject => subject.id)
      .filter(id => config.selected instanceof Array && config.selected.includes(id))
      : defaults.selected,
    types: Array.isArray(config.types) ? [0, 1, 2].filter(type =>
      config.types instanceof Array && config.types.includes(type)) : defaults.types,
    quantity: typeof config.quantity === 'number' && Number.isFinite(config.quantity)
      ? Math.min(999, Math.max(1, Math.floor(config.quantity))) : defaults.quantity,
  }
}

function restoreHistory(value: unknown, changed: Set<string>): History {
  const history = object(value)
  const entries = questions.filter(question => !changed.has(question.id)).flatMap(question => {
    const item = object(history[question.id])
    const valid = Number.isSafeInteger(item.attempts) && (item.attempts as number) > 0
      && Number.isSafeInteger(item.errors) && (item.errors as number) >= 0
      && (item.errors as number) <= (item.attempts as number)
      && typeof item.lastCorrect === 'boolean'
    return valid ? [[question.id, item]] : []
  })
  return Object.fromEntries(entries) as History
}

function restoreAnswers(value: unknown, ids: string[], changed: Set<string>) {
  const answers = object(value)
  const results = ['correct', 'incorrect', 'incomplete', 'unknown']
  return Object.fromEntries(ids.filter(id => !changed.has(id)).flatMap(id => {
    const item = object(answers[id])
    return typeof item.answer === 'string' && typeof item.result === 'string'
      && results.includes(item.result) ? [[id, item as Attempt]] : []
  }))
}

function restoreOptions(question: Question, value: unknown): Question {
  if (!question.options || !Array.isArray(value)) return question
  const valid = value.every(option => typeof option === 'string')
    && JSON.stringify(value.toSorted()) === JSON.stringify(question.options.toSorted())
  return valid ? { ...question, options: value } : question
}

function restoreSession(value: unknown, changed: Set<string>): Session | null {
  const saved = object(value)
  if (!Array.isArray(saved.ids)) return null
  const ids = [...new Set(saved.ids.filter((id): id is string =>
    typeof id === 'string' && questions.some(question => question.id === id)))]
  if (!ids.length) return null
  const oldIndex = Number.isSafeInteger(saved.index) ? Math.max(0, saved.index as number) : 0
  const currentId = saved.ids[oldIndex]
  const previousCount = saved.ids.slice(0, oldIndex).filter(id => ids.includes(id)).length
  let index = ids.includes(currentId) ? ids.indexOf(currentId)
    : Math.min(previousCount, ids.length - 1)
  const answers = restoreAnswers(saved.answers, ids, changed)
  const firstPending = ids.findIndex(id => !answers[id])
  if (firstPending >= 0 && firstPending < index) index = firstPending
  const options = object(saved.options)
  return {
    questions: ids.map(id => restoreOptions(questions.find(question => question.id === id)!,
      options[id])),
    index, answers,
    draft: !changed.has(ids[index]) && currentId === ids[index] && typeof saved.draft === 'string'
      ? saved.draft : '',
    completed: false,
  }
}

export function serializeProgress(progress: Progress) {
  const session = progress.session?.completed ? null : progress.session
  return JSON.stringify({
    version: 1, config: progress.config, history: progress.history,
    signatures: Object.fromEntries(questions.map(question => [question.id, signature(question)])),
    session: session ? {
      ids: session.questions.map(question => question.id), index: session.index,
      answers: session.answers, draft: session.draft,
      options: Object.fromEntries(session.questions.map(question =>
        [question.id, question.options])),
    } : null,
  })
}

export function recoverProgress(raw: string): Recovery {
  const data = object(JSON.parse(raw))
  if (data.version !== 1) throw new Error('Unsupported version')
  const signatures = object(data.signatures)
  const changed = new Set(questions.filter(question =>
    signatures[question.id] !== signature(question)).map(question => question.id))
  const saved = object(data.session)
  const removed = Array.isArray(saved.ids) && saved.ids.some(id =>
    !questions.some(question => question.id === id))
  return {
    progress: { config: restoreConfig(data.config), history: restoreHistory(data.history, changed),
      session: restoreSession(data.session, changed) },
    message: changed.size || removed
      ? 'O conteúdo foi atualizado. Mantivemos as questões disponíveis; perguntas alteradas precisam de uma nova resposta.' : null,
    unavailable: false,
  }
}

export function loadProgress(storage: StorageAccess): Recovery {
  let raw: string | null
  try { raw = storage.getItem(STORAGE_KEY) } catch {
    return { progress: defaultProgress(), message: null, unavailable: true }
  }
  if (!raw) return { progress: defaultProgress(), message: null, unavailable: false }
  try { return recoverProgress(raw) } catch {
    return { progress: defaultProgress(), unavailable: false,
      message: 'Não foi possível recuperar o progresso anterior. Você pode começar uma nova prática.' }
  }
}

export function saveProgress(storage: StorageAccess, progress: Progress) {
  try {
    storage.setItem(STORAGE_KEY, serializeProgress(progress))
    return true
  } catch { return false }
}
