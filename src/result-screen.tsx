import { CalculationExplanation } from './calculation-explanation'
import { useEffect, useRef, useState } from 'preact/hooks'
import { needsReview, type Session } from './practice-model'
import { displayStudentAnswer, formatPoints, getTestResult } from './result-model'
import { formats } from './study-data'
import { Icon } from './icons'

type ResultRow = ReturnType<typeof getTestResult>['rows'][number]
const resultLabels = {
  correct: 'Correta', incorrect: 'Incorreta', incomplete: 'Incompleta', unknown: 'Não sei',
}

function QuestionCorrection({ row, index, pointsPerQuestion }: {
  row: ResultRow; index: number; pointsPerQuestion: number;
}) {
  const { question, attempt, points } = row
  return (
    <details className={`result-question ${attempt.result}`}>
      <summary>
        <span className="result-number">{index + 1}</span>
        <span className="result-question-title"><strong>{question.topic}</strong>
          <span className="result-prompt-preview">{question.prompt}</span></span>
        <span className="result-question-status">
          <span className={`result-badge ${attempt.result}`}>
            <span aria-hidden="true">{attempt.result === 'correct' ? '✓' : '!'}</span>
            {attempt.usedHint ? 'Não decorada' : resultLabels[attempt.result]}
          </span>
          <span className="result-row-points">{formatPoints(points)} / {formatPoints(pointsPerQuestion)} pts</span>
        </span>
        <span className="result-chevron" aria-hidden="true">⌄</span>
      </summary>
      <div className="result-question-details">
        <p className="result-format">{formats[question.type]}</p>
        <p className="result-full-prompt">{question.prompt}</p>
        <div className="answer-comparison">
          <div><h3>Sua resposta</h3><p>{displayStudentAnswer(question, attempt)}</p></div>
          <div><h3>Resposta correta</h3><p>{question.answer}</p></div>
        </div>
        {attempt.result === 'incomplete' && <p className="result-incomplete-note">
          Sua resposta está incompleta e não conta como acerto. Veja o termo completo no gabarito.
        </p>}
        {attempt.usedHint && <p className="hint-review-note">Você usou a dica.
          Esta questão fica na revisão até um acerto sem dica.</p>}
        <div className="result-explanation"><h3>Entenda a resposta</h3>
          <CalculationExplanation question={question} />
          <p>{question.explanation}</p>
          <div className="learning-note"><Icon name="bulb" size={18} />
            <p>{question.caution}</p></div>
        </div>
      </div>
    </details>
  )
}

function ResultSummary({ session }: { session: Session }) {
  const result = getTestResult(session)
  return (
    <section className="result-summary" aria-label="Resumo do desempenho">
      <div className="result-score"><span>Sua nota</span>
        <strong>{formatPoints(result.score)}<small> / 4,00</small></strong>
        <p>{result.correct === result.total
          ? 'Todas as questões corretas. Boa prática!'
          : 'Use as correções para preparar sua próxima prática.'}</p>
      </div>
      <dl className="result-statistics">
        <div><dt>Acertos</dt><dd>{result.correct} <span>de {result.total}</span></dd></div>
        <div><dt>Para revisar</dt><dd>{result.pending} <span>
          {result.pending === 1 ? 'questão' : 'questões'}</span></dd></div>
        <div><dt>Valor por questão</dt><dd>{formatPoints(result.pointsPerQuestion)} <span>pts</span>
        </dd></div>
      </dl>
    </section>
  )
}

export function ResultScreen({ session, onRestart, onReview, onOpenBank }: {
  session: Session; onRestart: () => void; onReview: () => void; onOpenBank: () => void;
}) {
  const title = useRef<HTMLHeadingElement>(null)
  const [onlyErrors, setOnlyErrors] = useState(false)
  useEffect(() => { title.current?.focus() }, [])
  const result = getTestResult(session)
  const visible = result.rows.filter(row => !onlyErrors || needsReview(row.attempt))
  return (
    <main className="page-container result-page">
      <div className="page-intro">
        <div><span className="intro-label"><Icon name="check" size={17} />Seu teste terminou</span>
          <h1 ref={title} tabIndex={-1}>Prática concluída</h1>
          <p>Confira seu desempenho e entenda o raciocínio por trás de cada resposta.</p>
        </div>
      </div>
      <ResultSummary session={session} />
      <section className="result-corrections" aria-labelledby="corrections-title">
        <div className="result-list-heading"><div><h2 id="corrections-title">Suas respostas</h2>
          <p>Abra uma questão para comparar sua resposta e consultar a explicação.</p></div>
          <div className="result-filters" aria-label="Filtrar correções">
            <button aria-pressed={!onlyErrors} onClick={() => setOnlyErrors(false)}>
              Todas ({result.total})
            </button>
            <button aria-pressed={onlyErrors} onClick={() => setOnlyErrors(true)}>
              Para revisar ({result.pending})
            </button>
          </div>
        </div>
        <p className="result-count" role="status" aria-live="polite">
          {visible.length} {visible.length === 1 ? 'questão exibida' : 'questões exibidas'}
        </p>
        <div className="result-question-list">
          {result.rows.map((row, index) => {
            if (onlyErrors && !needsReview(row.attempt)) return null
            return <QuestionCorrection key={row.question.id} row={row} index={index}
              pointsPerQuestion={result.pointsPerQuestion} />
          })}
          {!visible.length && <div className="result-empty"><Icon name="check" size={25} />
            <h3>Nenhuma questão para revisar neste teste.</h3>
            <p>Você acertou todas. Escolha novos assuntos para continuar praticando.</p>
          </div>}
        </div>
      </section>
      <div className="result-actions">
        {result.pending > 0 && <button className="primary-button" onClick={onReview}>
          <Icon name="repeat" size={18} />Revisar questões
        </button>}
        <button className={result.pending ? 'outline-button' : 'primary-button'} onClick={onRestart}>
          Montar outro teste<Icon name="arrow" size={18} />
        </button>
        <button className="text-button" onClick={onOpenBank}>Abrir banco de questões</button>
      </div>
      <p className="result-footer-note">Seu histórico de tentativas foi atualizado.
        Erros e questões respondidas com dica ficam disponíveis na revisão.</p>
    </main>
  )
}
