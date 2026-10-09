import type { Session } from './practice-model'
import { Icon } from './icons'

export function PracticeNavigation({ session, free, onBack, onJump }: {
  session: Session; free: boolean; onBack: () => void; onJump?: (index: number) => void;
}) {
  return (
    <>
      <div className="practice-topline">
        <button className="text-button" onClick={onBack}>
          {free ? '‹ Voltar ao banco' : '‹ Voltar à configuração'}
        </button>
        <span>Praticar <span className="breadcrumb-divider">/</span>
          {free ? 'Prática livre' : 'Seu teste'}</span>
      </div>
      {free && <div className="free-jump"><label htmlFor="question-jump">Ir para questão</label>
        <select id="question-jump" value={session.index}
          onChange={event => onJump?.(Number(event.currentTarget.value))}>
          {session.questions.map((question, index) => <option value={index} key={question.id}>
            {index + 1}. {question.topic}
          </option>)}
        </select>
        <span>Pratique sem nota</span>
      </div>}
    </>
  )
}

export function PracticeProgress({ session, free }: { session: Session; free: boolean }) {
  const answered = Object.keys(session.answers).length
  const position = session.index + 1
  const value = free ? position : answered
  const progressText = free ? 'Prática livre' : `${answered} ${answered === 1
    ? 'respondida' : 'respondidas'}`
  return (
    <div className="practice-progress">
      <div><strong>Questão {position} de {session.questions.length}</strong>
        <span>{progressText}</span></div>
      <div className="test-progress-track" role="progressbar"
        aria-label={free ? 'Posição no banco' : 'Questões respondidas'}
        aria-valuenow={value} aria-valuemin={0} aria-valuemax={session.questions.length}>
        <span style={{ width: `${value / session.questions.length * 100}%` }} />
      </div>
    </div>
  )
}

export function PracticeActions({ confirmed, ready, last, free, onNext, onConfirm }: {
  confirmed: boolean; ready: boolean; last: boolean; free: boolean;
  onNext: () => void; onConfirm: (unknown?: boolean) => void;
}) {
  const finalLabel = free ? 'Voltar à primeira questão' : 'Concluir prática'
  return (
    <div className="practice-actions">
      {confirmed ? <button className="primary-button" type="button" onClick={onNext}>
        {last ? finalLabel : 'Próxima questão'}<Icon name="arrow" size={18} />
      </button> : <>
        <button className="primary-button" type="submit" disabled={!ready}>Conferir resposta</button>
        <button className="outline-button" type="button" onClick={() => onConfirm(true)}>
          Não sei
        </button>
      </>}
    </div>
  )
}
