import { CalculationExplanation } from './calculation-explanation'
import { useEffect, useRef } from 'preact/hooks'
import { isAnswerReady, type Attempt, type Session } from './practice-model'
import type { Question } from './questions'
import { subjects } from './study-data'
import { Icon } from './icons'
import { PracticeActions, PracticeNavigation, PracticeProgress } from './practice-navigation'
import { ResultScreen } from './result-screen'
import { QuestionHint } from './question-hint'
import { QuestionContent, SolutionTables, questionFormat, originLabels } from './question-content'
import { SelfAssessment } from './self-assessment'

const feedbackLabels = {
  correct: 'Resposta correta', incorrect: 'Ainda não foi dessa vez',
  incomplete: 'Resposta incompleta', unknown: 'Vamos aprender esta juntos',
}

function AnswerField({ question, value, disabled, onChange }: {
  question: Question; value: string; disabled: boolean; onChange: (value: string) => void;
}) {
  if (question.tableAnswer) return <p id="answer-help">Preencha as cinco células da tabela.
    Use vírgula ou ponto e arredonde para duas casas decimais.</p>
  if (question.selfAssess) return <SelfAssessment key={question.id} question={question}
    value={value} disabled={disabled} onChange={onChange} />
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
      {attempt.usedHint && <p className="hint-review-note"><strong>Não decorada.</strong>
        Você usou a dica; esta questão fica na revisão até um acerto sem dica.</p>}
      {attempt.result === 'incomplete' && <p>A resposta incompleta não conta como acerto.</p>}
      {attempt.result !== 'correct' && <p className="correct-answer">
        Resposta esperada: <strong>{question.answer}</strong>
      </p>}
      <CalculationExplanation question={question} />
      <SolutionTables question={question} />
      <p>{question.explanation}</p>
      <div className="learning-note"><Icon name="bulb" size={18} />
        <p>{question.caution}</p>
      </div>
    </section>
  )
}

type Props = {
  session: Session
  onHint: () => void
  onDraft: (value: string) => void
  onConfirm: (unknown?: boolean) => void
  onNext: () => void
  onBack: () => void
  onRestart: () => void
  onReview: () => void
  onOpenBank: () => void
  free?: boolean
  onJump?: (index: number) => void
}

export function PracticeScreen(props: Props) {
  const { session, onDraft, onConfirm, onNext, onBack, onRestart, free = false } = props
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, [session.index, session.completed])
  if (session.completed) return (
    <ResultScreen session={session} onRestart={onRestart}
      onReview={props.onReview} onOpenBank={props.onOpenBank} />
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
          <div className="question-meta"><span>{questionFormat(question)}</span>
            <span>{free ? 'Sem pontuação' : `${points} pts`}</span></div>
          <p className="question-subject">
            {subjects.find(subject => subject.id === question.subject)?.name}
          </p>
          <h1 ref={heading} tabIndex={-1}>{question.topic}</h1>
          <p className="question-subject">{originLabels[question.origin ?? 'autoral']}</p>
          <QuestionContent question={question} draft={value} disabled={!!attempt}
            onChange={onDraft} />
          <QuestionHint question={question} used={session.hintedIds?.includes(question.id) ?? false}
            confirmed={!!attempt} onHint={props.onHint} />
          <form id="question-answer-form"
            onSubmit={event => { event.preventDefault(); if (!attempt) onConfirm() }}>
            <AnswerField question={question} value={value} disabled={!!attempt}
              onChange={onDraft} />
            {attempt && <Feedback question={question} attempt={attempt} />}
            <PracticeActions confirmed={!!attempt} ready={isAnswerReady(question, value)}
              last={last} free={free} onNext={onNext} onConfirm={onConfirm} />
          </form>
        </section>
        <aside className="practice-aside">
          <div className="study-reminder"><span className="reminder-icon">
            <Icon name="bulb" size={23} /></span><h2>Como funciona a dica</h2>
            <p>Use o botão “Dica” quando precisar de ajuda. Nos cálculos, ele mostra as
              equações básicas dos indicadores para você escolher a que se aplica.</p>
            <hr /><h3>Não decorada</h3>
            <p>Ao usar a dica, a questão fica marcada como “Não decorada” e entra na revisão
              mesmo se você acertar. O acerto continua valendo na nota.</p>
            <h3>Para sair da revisão</h3>
            <p>Responda corretamente em uma nova tentativa, sem consultar a dica.</p>
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
