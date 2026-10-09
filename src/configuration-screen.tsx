import { Icon } from './icons'
import { FormatSelector, ModeSelector, SubjectSelector, TestSummary } from './configuration-controls'
import { getAvailability, totalQuestions } from './study-data'
import type { History, Session } from './practice-model'

export type Configuration = { mode: 'test' | 'review'; selected: string[]; types: number[]; quantity: number }
type Props = {
  config: Configuration
  onChange: (config: Configuration) => void
  history: History
  session: Session | null
  onStart: () => void
  onResume: () => void
  onOpenBank: () => void
  storageUnavailable: boolean
}

function ResumeBanner({ session, onResume }: { session: Session; onResume: () => void }) {
  const answered = Object.keys(session.answers).length
  const percent = answered / session.questions.length * 100
  return (
    <section className="resume-banner" aria-label="Teste em andamento">
      <span className="resume-icon"><Icon name="clock" size={23} /></span>
      <div className="resume-copy"><strong>Vamos continuar de onde você parou?</strong>
        <p>{answered} de {session.questions.length} questões respondidas</p>
      </div>
      <div className="resume-progress" aria-label={`${Math.round(percent)}% respondido`}>
        <span style={{ width: `${percent}%` }} />
      </div>
      <button className="outline-button" onClick={onResume}>
        Continuar teste<Icon name="arrow" size={17} />
      </button>
    </section>
  )
}

export function ConfigurationScreen(props: Props) {
  const { config, onChange, history, session, onStart, onResume, onOpenBank } = props
  const available = getAvailability(config.selected, config.types, config.mode === 'review', history)
  const practiced = Object.keys(history).length
  const pending = Object.values(history).filter(item => !item.lastCorrect).length
  return (
    <main className="page-container">
      <div className="page-intro">
        <div><span className="intro-label"><span />Um pouco de prática, todos os dias</span>
          <h1>Seu próximo passo começa aqui.</h1>
          <p>Escolha os assuntos, ajuste o ritmo e transforme conteúdo em conhecimento.</p>
        </div>
        <span className="prototype-label">Banco inicial · conteúdo da P1</span>
      </div>
      {session && !session.completed && <ResumeBanner session={session} onResume={onResume} />}
      <div className="study-layout">
        <section className="configuration-card" aria-label="Configuração do teste">
          <ModeSelector mode={config.mode} onChange={mode => onChange({ ...config, mode })} />
          <SubjectSelector selected={config.selected}
            onChange={selected => onChange({ ...config, selected })} />
          <FormatSelector selected={config.types}
            onChange={types => onChange({ ...config, types })} />
        </section>
        <aside className="study-sidebar">
          <TestSummary available={available} quantity={config.quantity} mode={config.mode}
            setQuantity={quantity => onChange({ ...config, quantity })} onStart={onStart} />
          <div className="progress-overview">
            <div><span className="stat-icon"><Icon name="check" size={17} /></span>
              <strong>{practiced}<small>{practiced === 1 ? 'questão praticada' : 'questões praticadas'}</small></strong></div>
            <div><span className="stat-icon review"><Icon name="repeat" size={17} /></span>
              <strong>{pending}<small>para revisar</small></strong></div>
          </div>
          <p className="session-note">{props.storageUnavailable
            ? 'O progresso está disponível apenas enquanto esta página estiver aberta.'
            : 'Progresso salvo neste navegador e dispositivo. Limpar os dados do site o remove.'}</p>
        </aside>
      </div>
      <section className="question-bank">
        <span className="bank-icon"><Icon name="layers" size={25} /></span>
        <div><h2>Um primeiro banco para a sua prova</h2>
          <p>{totalQuestions} questões, com foco em FC, IC, rendimento e cálculos de compra.</p>
        </div>
        <button className="text-button bank-button" onClick={onOpenBank}>Abrir banco de questões<Icon name="arrow" size={18} /></button>
      </section>
      <footer className="page-footer"><span>Técnica Dietética</span>
        <p>Um espaço para aprender no seu ritmo.</p><span>Sem cadastro. Só estudo.</span></footer>
    </main>
  )
}
