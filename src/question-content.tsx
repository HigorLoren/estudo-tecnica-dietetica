import type { Question } from './questions'
import type { QuestionTable } from './original-list-tables'
import './question-content.css'
import { parseTableAnswer } from './table-answer'

type TableEditor = {
  values: Record<string, string>; disabled: boolean;
  onChange: (key: string, value: string) => void;
}

function TableValue({ table, rowIndex, colIndex, cell, reveal, editor, tableIndex }: {
  table: QuestionTable; rowIndex: number; colIndex: number; cell: string;
  reveal: boolean; editor?: TableEditor; tableIndex: number;
}) {
  const solution = table.solutions?.[rowIndex]?.includes(colIndex)
  if (!solution || reveal) return <>{cell}</>
  if (!editor) return <span aria-label="A preencher">?</span>
  const key = `${tableIndex}:${rowIndex}:${colIndex}`
  return <input className="table-answer-input" type="text" inputMode="decimal"
    aria-label={`${table.rows[rowIndex][0]} · ${table.headers[colIndex]}`}
    aria-describedby="answer-help" form="question-answer-form" autoComplete="off"
    placeholder="?" value={editor.values[key] ?? ''} disabled={editor.disabled}
    onInput={event => editor.onChange(key, event.currentTarget.value)} />
}

export const originLabels = {
  professora: 'Lista da professora', derivada: 'Derivadas da lista', autoral: 'Questões autorais',
}
export function questionFormat(question: Question) {
  if (question.tableAnswer) return 'Preenchimento de tabela'
  return question.selfAssess ? 'Resposta discursiva · autoavaliação'
    : ['Múltipla escolha', 'Verdadeiro ou falso', 'Resposta curta'][question.type]
}

export function OriginalTable({ table, reveal = false, editor, tableIndex = 0 }: {
  table: QuestionTable; reveal?: boolean; editor?: TableEditor; tableIndex?: number;
}) {
  return (
    <div className="question-table-scroll" role="region" aria-label={table.caption} tabIndex={0}>
      <table className="question-table">
        <caption>{table.caption}</caption>
        <thead>{table.groups && <tr>{table.groups.map(group => <th key={group.label}
          scope="colgroup" colSpan={group.span} rowSpan={group.rows}>{group.label}</th>)}</tr>}
        <tr>{table.headers.map((header, index) => header || !table.groups
          ? <th key={index} scope="col">{header}</th> : null)}</tr>
        </thead>
        <tbody>{table.rows.map((row, rowIndex) => <tr key={rowIndex}>
          {row.map((cell, colIndex) => {
            const solution = table.solutions?.[rowIndex]?.includes(colIndex)
            const content = <TableValue table={table} rowIndex={rowIndex} colIndex={colIndex}
              cell={cell} reveal={reveal} editor={editor} tableIndex={tableIndex} />
            return colIndex === 0 ? <th key={colIndex} scope="row">{content}</th>
              : <td key={colIndex} className={solution && reveal ? 'table-solution' : ''}>
                {content}</td>
          })}
        </tr>)}</tbody>
      </table>
    </div>
  )
}
export function QuestionContent({ question, draft = '', disabled = false, onChange }: {
  question: Question; draft?: string; disabled?: boolean; onChange?: (value: string) => void;
}) {
  const values = parseTableAnswer(draft)
  const editor = question.tableAnswer ? {
    values, disabled: disabled || !onChange,
    onChange: (key: string, value: string) =>
      onChange?.(JSON.stringify({ ...values, [key]: value })),
  } : undefined
  return <div className="question-content">
    <p className="question-prompt">{question.prompt}</p>
    {question.tables?.map((table, index) => <OriginalTable key={table.caption} table={table}
      editor={editor} tableIndex={index} />)}
  </div>
}
export function SolutionTables({ question }: { question: Question }) {
  return <>{question.tables?.filter(table => table.solutions).map(table => <OriginalTable
    key={table.caption} table={table} reveal />)}</>
}
