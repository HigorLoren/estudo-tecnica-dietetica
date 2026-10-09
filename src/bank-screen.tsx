import { useEffect, useRef } from 'preact/hooks'
import { questions, type Question } from './questions'
import { filterBankQuestions, formats, subjects, type BankFilters } from './study-data'
import type { History } from './practice-model'
import { Icon } from './icons'

function QuestionItem({ question, history, onOpen }: {
  question: Question; history: History; onOpen: (id: string) => void;
}) {
  const previous = history[question.id]
  return (
    <button className="bank-question" onClick={() => onOpen(question.id)}>
      <span className="bank-question-content">
        <strong>{question.topic}</strong>
        <span className="bank-question-prompt">{question.prompt}</span>
        <span className="bank-question-meta">{formats[question.type]}
          <span>{question.source.split(' · ').slice(0, 2).join(' · ')}</span>
        </span>
      </span>
      <span className="bank-question-end">
        {previous && <span className={`history-badge ${previous.lastCorrect ? 'correct' : ''}`}>
          {previous.lastCorrect ? 'Praticada' : 'Revisar'}
        </span>}
        <Icon name="arrow" size={18} />
      </span>
    </button>
  )
}

export function BankScreen({ filters, onFilter, history, onOpen, onBack }: {
  filters: BankFilters; onFilter: (filters: BankFilters) => void;
  history: History; onOpen: (id: string) => void; onBack: () => void;
}) {
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => { title.current?.focus() }, [])
  const filtered = filterBankQuestions(filters)
  return (
    <main className="page-container bank-page">
      <div className="page-intro bank-intro">
        <div><span className="intro-label"><Icon name="layers" size={17} />Pratique por assunto</span>
          <h1 ref={title} tabIndex={-1}>Banco de questões</h1>
          <p>Escolha uma pergunta e estude no seu ritmo, sem montar um teste.</p>
        </div>
        <button className="outline-button" onClick={onBack}>Montar teste
          <Icon name="arrow" size={18} /></button>
      </div>
      <section className="bank-filters" aria-label="Filtros do banco">
        <div><label htmlFor="bank-subject">Assunto</label>
          <select id="bank-subject" value={filters.subject}
            onChange={event => onFilter({ ...filters, subject: event.currentTarget.value })}>
            <option value="all">Todos os assuntos</option>
            {subjects.map(subject => <option value={subject.id} key={subject.id}>
              {subject.name}
            </option>)}
          </select>
        </div>
        <div><label htmlFor="bank-type">Tipo de questão</label>
          <select id="bank-type" value={filters.type}
            onChange={event => onFilter({ ...filters, type: event.currentTarget.value })}>
            <option value="all">Todos os tipos</option>
            {formats.map((format, index) => <option value={index} key={format}>{format}</option>)}
          </select>
        </div>
        <p role="status" aria-live="polite"><strong>{filtered.length}</strong>
          {filtered.length === 1 ? ' questão encontrada' : ' questões encontradas'}</p>
      </section>
      <div className="bank-groups">
        {subjects.map(subject => {
          const items = filtered.filter(question => question.subject === subject.id)
          if (!items.length) return null
          return (
            <section className="bank-group" key={subject.id} aria-labelledby={`group-${subject.id}`}>
              <div className="bank-group-heading"><h2 id={`group-${subject.id}`}>{subject.name}</h2>
                <span>{items.length} {items.length === 1 ? 'questão' : 'questões'}</span></div>
              <div className="bank-question-list">{items.map(question => <QuestionItem
                key={question.id} question={question} history={history} onOpen={onOpen} />)}</div>
            </section>
          )
        })}
        {!filtered.length && <section className="bank-empty"><Icon name="book" size={30} />
          <h2>Nenhuma questão nesta seleção.</h2>
          <p>Escolha outro assunto ou tipo de questão para continuar.</p>
          <button className="outline-button" onClick={() => onFilter({ subject: 'all', type: 'all' })}>
            Limpar filtros
          </button>
        </section>}
      </div>
      <footer className="page-footer"><span>Técnica Dietética</span>
        <p>Suas tentativas também ajudam a organizar a revisão.</p>
        <span>{questions.length} questões no banco inicial</span></footer>
    </main>
  )
}
