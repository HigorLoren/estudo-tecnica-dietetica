import { useEffect, useRef } from 'preact/hooks'
import { isAnswerReady, type Attempt, type Session } from './practice-model'
import type { Question } from './questions'
import { formats, subjects } from './study-data'
import { Icon } from './icons'
import { PracticeActions, PracticeNavigation, PracticeProgress } from './practice-navigation'

const feedbackLabels = {
  correct: 'Resposta correta', incorrect: 'Ainda não foi dessa vez',
  incomplete: 'Resposta incompleta', unknown: 'Vamos aprender esta juntos',
}

function AnswerField({ question, value, disabled, onChange }: {
  question: Question; value: string; disabled: boolean; onChange: (value: string) => void;
}) {
  if (question.options) {
    return (
      <fieldset className="answer-options" disabled={disabled}>
        <legend>{question.type === 1 ? 'A afirmação é verdadeira ou falsa?' : 'Escolha uma alternativa.'}
        </legend>
        {question.options.map((option, index) => (
          <label key={option} className={`answer-option ${value === option ? 'selected' : ''}`}>
            <input type="radio" name={question.id} value={option} checked={value === option}
              onChange={() => onChange(option)} />
            {question.type === 0 && <span className="option-letter">
              {String.fromCharCode(65 + index)}
            </span>}
            <span>{option}</span>
          </label>
        ))}
      </fieldset>
    )
  }
  const numeric = question.numeric !== undefined
  return (
    <div className="written-answer">
      <label htmlFor="answer">{numeric ? 'Seu resultado' : 'Sua resposta'}</label>
      <div className={`answer-input ${disabled ? 'locked' : ''}`}>
        <input id="answer" type="text" inputMode={numeric ? 'decimal' : 'text'}
          value={value} disabled={disabled} autoComplete="off" aria-describedby="answer-help"
          placeholder={numeric ? 'Digite o valor' : 'Digite sua resposta'}
          onInput={event => onChange(event.currentTarget.value)} />
        {question.unit && <span>{question.unit}</span>}
      </div>
      <p id="answer-help">{numeric
        ? 'Digite apenas o número. Use vírgula ou ponto e arredonde para duas casas decimais.'
        : 'Escreva o termo completo. Acentos e letras maiúsculas não alteram a correção.'}</p>
    </div>
  )
}

function Feedback({ question, attempt }: { question: Question; attempt: Attempt }) {
  return (
    <section className={`answer-feedback ${attempt.result}`} role="status"
      aria-live="polite" aria-atomic="true">
      <div className="feedback-heading">
        <span className="feedback-symbol">{attempt.result === 'correct' ? '✓' : '!'}</span>
        <h2>{feedbackLabels[attempt.result]}</h2>
      </div>
      {attempt.result === 'incomplete' && <p>A resposta incompleta não conta como acerto.</p>}
      {attempt.result !== 'correct' && <p className="correct-answer">
        Resposta esperada: <strong>{question.answer}</strong>
      </p>}
      {question.formula && <div className="worked-formula">{question.formula}</div>}
      <p>{question.explanation}</p>
      <div className="learning-note"><Icon name="bulb" size={18} />
        <p>{question.caution}</p>
      </div>
      <details className="question-source"><summary>Conteúdo e origem da questão</summary>
        <p>{question.source}</p>
      </details>
    </section>
  )
}

function Completion({ session, onBack }: { session: Session; onBack: () => void }) {
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => { title.current?.focus() }, [])
  const correct = Object.values(session.answers).filter(item => item.result === 'correct').length
  const score = (correct * 4 / session.questions.length).toLocaleString('pt-BR', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  })
  return (
    <section className="completion-card">
      <span className="completion-icon"><Icon name="check" size={30} /></span>
      <h1 ref={title} tabIndex={-1}>Prática concluída.</h1>
      <p>{correct === session.questions.length
        ? 'Você acertou todas as questões. Boa prática!'
        : 'Cada questão ajuda a reconhecer o que você já sabe e o que precisa retomar.'}</p>
      <div className="completion-score"><strong>{score}<span> / 4,00 pontos</span></strong>
        <p>{correct} de {session.questions.length} questões corretas</p></div>
      <button className="primary-button" onClick={onBack}>
        Montar outro teste<Icon name="arrow" size={18} />
      </button>
      <p className="completion-note">{correct === session.questions.length
        ? 'Escolha novos assuntos ou formatos para a próxima prática.'
        : 'As respostas não corretas já estão em “Revisar meus erros”.'}</p>
    </section>
  )
}

type Props = {
  session: Session
  onDraft: (value: string) => void
  onConfirm: (unknown?: boolean) => void
  onNext: () => void
  onBack: () => void
  onRestart: () => void
  free?: boolean
  onJump?: (index: number) => void
}

export function PracticeScreen(props: Props) {
  const { session, onDraft, onConfirm, onNext, onBack, onRestart, free = false } = props
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, [session.index, session.completed])
  if (session.completed) return (
    <main className="practice-container"><Completion session={session} onBack={onRestart} /></main>
  )
  const question = session.questions[session.index]
  const attempt = session.answers[question.id]
  const value = attempt?.answer ?? session.draft
  const last = session.index === session.questions.length - 1
  const points = (4 / session.questions.length).toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
  })
  return (
    <main className="practice-container">
      <PracticeNavigation session={session} free={free} onBack={onBack} onJump={props.onJump} />
      <PracticeProgress session={session} free={free} />
      <div className="practice-layout">
        <section className="practice-card" aria-label="Questão e resposta">
          <div className="question-meta"><span>{formats[question.type]}</span>
            <span>{free ? 'Sem pontuação' : `${points} pts`}</span></div>
          <p className="question-subject">
            {subjects.find(subject => subject.id === question.subject)?.name}
          </p>
          <h1 ref={heading} tabIndex={-1}>{question.topic}</h1>
          <p className="question-prompt">{question.prompt}</p>
          <form onSubmit={event => { event.preventDefault(); if (!attempt) onConfirm() }}>
            <AnswerField question={question} value={value} disabled={!!attempt}
              onChange={onDraft} />
            {attempt && <Feedback question={question} attempt={attempt} />}
            <PracticeActions confirmed={!!attempt} ready={isAnswerReady(question, value)}
              last={last} free={free} onNext={onNext} onConfirm={onConfirm} />
          </form>
        </section>
        <aside className="practice-aside">
          <div className="study-reminder"><span className="reminder-icon">
            <Icon name="bulb" size={23} /></span><h2>Faça no seu ritmo.</h2>
            <p>Leia o enunciado, organize as informações e só então responda.</p>
            <hr /><h3>Nos cálculos</h3>
            <p>Confira as unidades e a etapa do alimento. Você pode usar uma calculadora.</p>
            <h3>Ficou em dúvida?</h3>
            <p>Use “Não sei” para conhecer a resposta e entender o raciocínio.</p>
          </div>
          <p className="practice-session-note"><Icon name="clock" size={16} />
            {free ? 'Suas tentativas entram no histórico e ajudam a organizar a revisão.'
              : 'Volte à configuração para retomar o teste. Seu progresso fica neste navegador.'}
          </p>
        </aside>
      </div>
    </main>
  )
}
