import { Dialog, DialogContent, DialogTitle } from '@mui/material'
import { useRef, useState } from 'preact/hooks'
import { Header, type Notice } from './header'
import { ConfigurationScreen } from './configuration-screen'
import { PracticeScreen } from './practice-screen'
import { BankScreen } from './bank-screen'
import { getEligibleQuestions, type BankFilters } from './study-data'
import { questions } from './questions'
import { confirmSession, createSession, prepareQuestions, recordAttempt,
  selectQuestions,
  type Session } from './practice-model'
import { useProgress } from './use-progress'
import { createReviewConfiguration } from './result-model'
import { TipsScreen } from './tips-screen'
import { useNavigation } from './use-navigation'

export function App() {
  const { progress, getProgress, updateProgress, storageUnavailable, recoveryMessage,
    dismissRecovery } = useProgress()
  const { config, session, history } = progress
  const [notice, setNotice] = useState<Notice>(null)
  const [screen, setScreen] = useNavigation()
  const [filters, setFilters] = useState<BankFilters>({ subject: 'all', type: 'all' })
  const [freeSession, setFreeSession] = useState<Session | null>(null)
  const freeCurrent = useRef<Session | null>(null)
  const updateFree = (next: Session) => { freeCurrent.current = next; setFreeSession(next) }
  const free = screen === 'free'
  const active = free ? freeSession : session
  const onBack = () => setScreen('configuration')
  const onStart = () => {
    const eligible = getEligibleQuestions(
      config.selected, config.types, config.mode === 'review', history,
    )
    if (!eligible.length) return
    const selected = selectQuestions(eligible, config.quantity,
      config.mode === 'review' ? history : undefined)
    updateProgress(current => ({ ...current, session: createSession(selected) }))
    setScreen('practice')
  }
  const onConfirm = (unknown = false) => {
    const currentSession = free ? freeCurrent.current : getProgress().session
    if (!currentSession) return
    const confirmed = confirmSession(currentSession, unknown)
    if (!confirmed) return
    if (free) updateFree(confirmed.session)
    updateProgress(current => ({ ...current,
      session: free ? current.session : confirmed.session,
      history: recordAttempt(current.history, confirmed.id, confirmed.result) }))
  }
  const onJump = (index: number) => {
    if (!freeSession) return
    updateFree({ ...freeSession, index, answers: {}, draft: '' })
  }
  const onNext = () => {
    if (!active || !active.answers[active.questions[active.index].id]) return
    const last = active.index === active.questions.length - 1
    if (free) { onJump(last ? 0 : active.index + 1); return }
    updateProgress(current => ({ ...current, session: { ...active,
      index: last ? active.index : active.index + 1, draft: '', completed: last } }))
  }
  const onDraft = (draft: string) => {
    if (!active) return
    if (free) { updateFree({ ...active, draft }); return }
    updateProgress(current => ({ ...current, session: { ...active, draft } }))
  }
  const onOpenQuestion = (id: string) => {
    const next = createSession(prepareQuestions(questions))
    next.index = next.questions.findIndex(question => question.id === id)
    updateFree(next)
    setScreen('free')
  }
  const onRestart = () => {
    updateProgress(current => ({ ...current, config: { ...current.config, mode: 'test' } }))
    onBack()
  }
  const onReview = () => {
    if (!session) return
    updateProgress(current => ({ ...current, config: createReviewConfiguration(session) }))
    onBack()
  }
  return (
    <>
      <Header onNotice={setNotice} onHome={onBack}
        onTips={() => setScreen('dicas')} tipsActive={screen === 'dicas'} />
      {storageUnavailable && <div className="app-status warning" role="status">
        Não foi possível salvar o progresso neste navegador. Você pode continuar estudando;
        os novos dados ficam disponíveis apenas enquanto esta página estiver aberta.
      </div>}
      {recoveryMessage && <div className="app-status" role="status"><span>{recoveryMessage}</span>
        <button className="text-button" onClick={dismissRecovery}>Entendi</button></div>}
      {screen === 'dicas' ? <TipsScreen /> : (screen === 'practice' || free) && active ? <PracticeScreen session={active}
        onDraft={onDraft} onConfirm={onConfirm} onNext={onNext} free={free} onJump={onJump}
        onBack={free ? () => setScreen('bank') : onBack} onRestart={onRestart}
        onReview={onReview} onOpenBank={() => setScreen('bank')} />
        : screen === 'bank' ? <BankScreen filters={filters} onFilter={setFilters} history={history}
          onOpen={onOpenQuestion} onBack={onBack} />
        : <ConfigurationScreen config={config}
          onChange={next => updateProgress(current => ({ ...current, config: next }))}
          history={history} session={session} onStart={onStart}
          onResume={() => setScreen('practice')} onOpenBank={() => setScreen('bank')}
          storageUnavailable={storageUnavailable} />}
      <Dialog open={notice !== null} onClose={() => setNotice(null)}
        aria-labelledby="preview-title" maxWidth="xs" fullWidth>
        <DialogTitle id="preview-title">{notice?.title}</DialogTitle>
        <DialogContent><p className="dialog-description">{notice?.description}</p>
          <button className="primary-button" onClick={() => setNotice(null)}>Entendi</button>
        </DialogContent>
      </Dialog>
    </>
  )
}
