import { useState } from 'preact/hooks'
import type { Question } from './questions'
import { SolutionTables } from './question-content'
import { CalculationExplanation } from './calculation-explanation'

export function SelfAssessment({ question, value, disabled, onChange }: {
  question: Question; value: string; disabled: boolean; onChange: (value: string) => void;
}) {
  const [revealed, setRevealed] = useState(false)
  return <div className="self-assessment">
    <p>Responda com suas palavras ou faça os cálculos no papel.
      Depois, compare com a resposta de apoio e avalie sua resposta.</p>
    <label htmlFor={`notes-${question.id}`}>Rascunho temporário (opcional, não salvo)</label>
    <textarea id={`notes-${question.id}`} rows={4} disabled={disabled}
      placeholder="Escreva sua resposta ou anote seus cálculos." />
    {!disabled && <>
      <button className="outline-button" type="button" aria-expanded={revealed}
        onClick={() => setRevealed(true)}>Comparar com a resposta</button>
      {revealed && <section className="self-assessment-support" aria-label="Resposta de apoio">
        <h2>Resposta de apoio</h2><p>{question.answer}</p><p>{question.caution}</p>
        <CalculationExplanation question={question} />
        <SolutionTables question={question} />
        <fieldset className="answer-options"><legend>Como foi sua resposta?</legend>
          {['Respondi corretamente', 'Preciso revisar'].map(option => <label
            className="answer-option" key={option}>
            <input type="radio" name={question.id} checked={value === option}
              onChange={() => onChange(option)} />{option}
          </label>)}
        </fieldset>
      </section>}
    </>}
    {disabled && <p>Autoavaliação: {value}</p>}
  </div>
}
