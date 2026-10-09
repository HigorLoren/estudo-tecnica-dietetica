import type { Question } from './questions'

export function parseTableAnswer(value: string): Record<string, string> {
  try {
    const parsed: unknown = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return Object.fromEntries(Object.entries(parsed).filter(([, entry]) => typeof entry === 'string'))
  } catch { return {} }
}

export function tableAnswerCells(question: Question) {
  return question.tables?.flatMap((table, tableIndex) => table.rows.flatMap((row, rowIndex) =>
    (table.solutions?.[rowIndex] ?? []).map(colIndex => ({
      key: `${tableIndex}:${rowIndex}:${colIndex}`, expected: row[colIndex],
      label: `${row[0]} · ${table.headers[colIndex]}`,
    })))) ?? []
}

export function isTableAnswerReady(question: Question, value: string) {
  const values = parseTableAnswer(value)
  const cells = tableAnswerCells(question)
  return cells.length > 0 && cells.every(cell => /^\d+(?:[,.]\d+)?$/.test(
    (values[cell.key] ?? '').trim(),
  ))
}

export function gradeTableAnswer(question: Question, value: string) {
  if (!isTableAnswerReady(question, value)) return 'incorrect' as const
  const values = parseTableAnswer(value)
  const correct = tableAnswerCells(question).every(cell =>
    Math.abs(Number(values[cell.key].trim().replace(',', '.'))
      - Number(cell.expected.replace(',', '.'))) <= 0.005000001)
  return correct ? 'correct' as const : 'incorrect' as const
}

export function displayTableAnswer(question: Question, value: string) {
  const values = parseTableAnswer(value)
  return tableAnswerCells(question).map(cell => `${cell.label}: ${values[cell.key] ?? '—'}`).join('; ')
}
