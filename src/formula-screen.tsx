import { hasFormulaCorrection, gradeFormulaCard, formulaCorrectionMessage } from './formula-correction'
import { formulaPieceDraft, editFormulaPieces, type FormulaDraftUpdate } from './formula-assembly-model'
import { FormulaAssembly } from './formula-assembly'
import { useEffect, useRef, useState } from 'preact/hooks'
import { formulaCards, formulaMethods, formulas, type FormulaCard } from './formula-data'
import { masteredCount, newFormulaProgress, rateFormulaCard, recallRatings,
  editFormulaProgress, type FormulaProgress } from './formula-model'
import './formula.css'


function FormulaExercise({ card, progress, onDraft }: {
  card: FormulaCard; progress: FormulaProgress; onDraft: (value: FormulaDraftUpdate) => void;
}) {
  if (['assemble', 'repair'].includes(card.method)) return <FormulaAssembly tokens={card.tokens}
    draft={formulaPieceDraft(card, progress.draft)}
    revealed={progress.revealed}
    onEdit={edit => onDraft(current =>
      editFormulaPieces(card, current, edit))} />
  return <>
    {card.method === 'apply' ? <fieldset className="formula-options" disabled={progress.revealed}>
      <legend>Qual fórmula você usaria?</legend>
      {card.options.map(option => <label key={option}>
        <input type="radio" name="formula-option" value={option}
          checked={progress.draft === option} onChange={() => onDraft(option)} />{option}
      </label>)}
    </fieldset> : <label className="formula-draft" htmlFor="formula-draft">
      {card.method === 'explain' ? 'Sua explicação' : 'Sua resposta'}
      <textarea id="formula-draft" rows={card.method === 'explain' ? 4 : 2}
        value={progress.draft} disabled={progress.revealed}
        placeholder="Tente lembrar antes de revelar"
        onInput={event => onDraft(event.currentTarget.value)} />
    </label>}
  </>
}


function FormulaCorrection({ card, draft }: { card: FormulaCard; draft: string }) {
  if (!hasFormulaCorrection(card)) return null
  const result = gradeFormulaCard(card, draft)
  return <p className={`formula-correction ${result}`} role="status">
    {formulaCorrectionMessage(card, result)}</p>
}

type Change = (update: (current: FormulaProgress) => FormulaProgress) => void
function FormulaFeedback({ card, progress, onChange }: {
  card: FormulaCard; progress: FormulaProgress; onChange: Change;
}) {
  const answer = useRef<HTMLHeadingElement>(null)
  useEffect(() => { if (progress.revealed) answer.current?.focus() }, [progress.revealed])
  return <>
    {!progress.revealed ? <div className="formula-reveal">
      <p>Não lembrou? Você pode revelar mesmo sem preencher.</p>
      <button className="primary-button" onClick={() => onChange(current =>
        ({ ...current, revealed: true }))}>
        {hasFormulaCorrection(card) ? 'Conferir fórmula' : 'Revelar resposta'}</button>
    </div> : <>
      <div className="formula-answer">
        <h3 ref={answer} tabIndex={-1}>Confira e compare</h3>
        <FormulaCorrection card={card} draft={progress.draft} />
        <p className={card.method === 'explain' ? '' : 'formula-equation'}>
          {card.answer}</p>
        {card.method === 'complete' && <p>{card.formula.equation}</p>}
        {card.method !== 'explain' && <p>{card.explanation}</p>}
        <p>A avaliação é sua: considere o que lembrou antes de revelar.</p>
      </div>
      <fieldset className="formula-ratings"><legend>Como foi lembrar?</legend>
        {recallRatings.map(rating => <button key={rating.value}
          onClick={() => onChange(current =>
            rateFormulaCard(current, card.id, rating.value))}>
          <span className="formula-rating-number">{rating.value}</span>
          <strong>{rating.label}</strong><small>{rating.detail}</small>
        </button>)}
      </fieldset>
    </>}
  </>
}

export function FormulaScreen({ progress, onChange }: {
  progress: FormulaProgress; onChange: Change;
}) {
  const [confirmReset, setConfirmReset] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const card = formulaCards.find(item => item.id === progress.currentId)
  const mastered = masteredCount(progress)
  const method = formulaMethods.find(item => item.id === card?.method)
  useEffect(() => { heading.current?.focus() }, [progress.currentId])
  const draft = (value: FormulaDraftUpdate) => onChange(current =>
    editFormulaProgress(current, progress.currentId, value))
  const reset = () => { onChange(() => newFormulaProgress()); setConfirmReset(false) }
  return <main className="page-container formula-page">
    <div className="page-intro"><div>
      <h1>Decorar fórmulas</h1>
      <p>Lembre, confira e diga como foi. Os cartões mais difíceis voltam antes.</p>
    </div></div>
    <div className="formula-layout">
      <section className="formula-training" aria-label="Treino de memorização">
        <div className="formula-progress">
          <span>{mastered} de {formulaCards.length} cartões com “Lembrei fácil”</span>
          <progress value={mastered} max={formulaCards.length} aria-label="Cartões memorizados" />
        </div>
        {card && method ? <article className="formula-card" key={card.id}>
          <div className="formula-card-meta"><span>{card.formula.family}</span>
            <span>{method.label}</span></div>
          <h2 ref={heading} tabIndex={-1}>{card.method === 'complete' || card.method === 'repair'
            ? card.formula.name : card.prompt}</h2>
          <p>{method.instruction}</p>
          {card.method === 'complete'
            && <p className="formula-equation">{card.prompt}</p>}
          <FormulaExercise card={card} progress={progress} onDraft={draft} />
          <FormulaFeedback card={card} progress={progress} onChange={onChange} />
        </article> : <div className="formula-complete" role="status">
          <h2 ref={heading} tabIndex={-1}>
            Você lembrou todas as fórmulas com facilidade.</h2>
          <p>Todos os {formulaCards.length} cartões receberam a nota máxima nos seis métodos.
            Seu progresso está salvo. Você pode começar outro treino quando quiser.</p>
          <button className="primary-button" onClick={() => setConfirmReset(true)}>Treinar novamente</button>
        </div>}
      </section>
      <aside className="formula-sidebar">
        <h2>Um cartão por vez</h2>
        <p>{formulas.length} fórmulas, em seis formas de praticar.
          Cada combinação tem sua própria nota.</p>
        <ul>{formulaMethods.map(item => <li key={item.id}>{item.label}</li>)}</ul>
        <h3>Seu ritmo de revisão</h3>
        <p>Misturamos os indicadores para variar o treino. Quanto mais difícil lembrar,
          mais cartões daquele indicador aparecem. Ao lembrar melhor, eles aparecem menos.</p>
        <p>A nota 5, “Lembrei fácil”, retira o cartão do treino.
          Só terminamos quando todos chegarem a 5.</p>
        <p>Pode sair e voltar: a resposta atual e suas avaliações ficam salvas neste navegador.</p>
        {!confirmReset && card && <button className="text-button"
          onClick={() => setConfirmReset(true)}>Reiniciar progresso deste modo</button>}
        {confirmReset && <div className="formula-reset" role="group" aria-label="Confirmar reinício">
          <p>Apagar as avaliações deste modo e começar de novo?</p>
          <button className="outline-button" onClick={() => setConfirmReset(false)}>Cancelar</button>
          <button className="primary-button" onClick={reset}>Reiniciar treino</button>
        </div>}
      </aside>
    </div>
  </main>
}
