import type { Question } from './questions'
import { alignEquations } from './equation-layout'

function EquationPair({ formula, substitution }: { formula: string; substitution: string }) {
  const aligned = alignEquations(formula, substitution)
  if (!aligned) return <div className="equation-fallback"><p>{formula}</p><p>{substitution}</p></div>
  return (
    <div className="equation-pair">
      <div className="equation-scroll">
        <table className="equation-table" aria-label="Fórmula e valores substituídos">
          <tbody>
            <tr aria-label="Fórmula">{aligned.formula.map((term, index) =>
              <td key={index} className={index % 2 ? 'equation-operator' : ''}>{term}</td>)}</tr>
            <tr aria-label="Substituição">{aligned.substitution.map((term, index) =>
              <td key={index} className={index % 2 ? 'equation-operator' : ''}>{term}</td>)}</tr>
          </tbody>
        </table>
      </div>
      {aligned.result && <p className="equation-result">Resultado {aligned.result}</p>}
    </div>
  )
}

export function CalculationExplanation({ question }: { question: Question }) {
  if (!question.formula) return null
  const [general, ...steps] = question.formula.split('\n')
  const formulas = general.split(';').map(part => part.trim())
  return (
    <div className="worked-formula">
      {steps.length ? <>
        <h3>Fórmula e substituição</h3>
        {steps.flatMap(step => step.split(';')).map((step, index) => <EquationPair
          key={index} formula={formulas[index] ?? general} substitution={step.trim()} />)}
      </> : <p>{general}</p>}
    </div>
  )
}
