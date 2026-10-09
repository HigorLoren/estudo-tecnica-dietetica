import { useEffect, useRef, useState } from 'preact/hooks'
import { Icon } from './icons'
import { ExploreDiagram } from './explore-diagram'
import { calculatePreparation, formatWeight, preparationExamples,
  type Preparation } from './explore-model'
import './explore.css'

const controls = [
  { key: 'gross', label: 'Peso bruto (PB)', min: 1, max: 30, step: 0.5, unit: 'kg',
    hint: 'Quantidade como comprada, antes da limpeza.' },
  { key: 'correction', label: 'Fator de correção (FC)', min: 1, max: 3, step: 0.05, unit: '',
    hint: 'Neste modelo de limpeza, FC ≥ 1. Quanto maior, mais perda no pré-preparo.' },
  { key: 'conversion', label: 'Índice de conversão (IC)', min: 0.2, max: 4, step: 0.05, unit: '',
    hint: 'Abaixo de 1 perde peso; acima de 1 ganha peso.' },
] as const

function ExploreControls({ values, onChange, onReset }: {
  values: Preparation; onChange: (next: Preparation) => void; onReset: () => void;
}) {
  return (
    <section className="explore-controls" aria-labelledby="explore-controls-title">
      <div className="explore-panel-heading"><h2 id="explore-controls-title">Experimente mudar</h2>
        <p>Ajuste um valor e compare as etapas.</p></div>
      {controls.map(control => <div className="explore-control" key={control.key}>
        <div><label htmlFor={`explore-${control.key}`}>{control.label}</label>
          <output htmlFor={`explore-${control.key}`}>
            {formatWeight(values[control.key])} {control.unit}</output></div>
        <input id={`explore-${control.key}`} type="range" min={control.min} max={control.max}
          step={control.step} value={values[control.key]}
          aria-describedby={`hint-${control.key}`}
          aria-valuetext={`${formatWeight(values[control.key])} ${control.unit}`}
          onInput={event => onChange({ ...values,
            [control.key]: Number(event.currentTarget.value) })} />
        <p id={`hint-${control.key}`}>{control.hint}</p>
      </div>)}
      <button className="text-button" onClick={onReset}><Icon name="repeat" size={16} />
        Restaurar exemplo</button>
    </section>
  )
}

export function ExploreScreen({ onPractice, onTips }: {
  onPractice: () => void; onTips: () => void;
}) {
  const [exampleId, setExampleId] = useState(preparationExamples[0].id)
  const [values, setValues] = useState<Preparation>(preparationExamples[0])
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => { title.current?.focus() }, [])
  const example = preparationExamples.find(item => item.id === exampleId)!
  const result = calculatePreparation(values)
  const onSelect = (id: string) => {
    const selected = preparationExamples.find(item => item.id === id)
    if (!selected) return
    setExampleId(id); setValues(selected)
  }
  return (
    <main className="page-container explore-page">
      <div className="page-intro"><div>
        <span className="intro-label"><Icon name="layers" size={17} />Explore os indicadores</span>
        <h1 ref={title} tabIndex={-1}>Do alimento comprado ao prato</h1>
        <p>Veja onde o peso muda e entenda por que FC e IC usam divisões diferentes.</p>
      </div></div>
      <div className="explore-examples" role="group" aria-label="Exemplos de preparo">
        {preparationExamples.map(item => <button key={item.id}
          aria-pressed={exampleId === item.id} onClick={() => onSelect(item.id)}>
          <strong>{item.name}</strong><span>{item.detail}</span>
        </button>)}
      </div>
      <p className="explore-example-note">Exemplos ilustrativos de cálculo.
        Os índices variam conforme o alimento e o preparo;
        estes valores não são uma tabela técnica.</p>
      <div className="explore-layout">
        <ExploreDiagram values={values} />
        <ExploreControls values={values} onChange={setValues} onReset={() => setValues(example)} />
      </div>
      <p className="visually-hidden" role="status" aria-live="polite">
        Peso bruto: {formatWeight(result.gross)} kg. Peso líquido: {formatWeight(result.liquid)} kg.
        Peso cozido: {formatWeight(result.cooked)} kg.
      </p>
      <section className="explore-reading" aria-labelledby="explore-reading-title">
        <div><h2 id="explore-reading-title">Compare sempre as mesmas etapas</h2>
          <p><strong>FC = PB ÷ PL.</strong> Compara o alimento comprado com o alimento limpo.
            <br /><strong>IC = peso cozido ÷ PL cru.</strong> Compara o resultado do preparo
            com o alimento limpo, antes da cocção.</p>
        </div>
        <div className="explore-actions">
          <button className="primary-button" onClick={onPractice}>Praticar indicadores
            <Icon name="arrow" size={18} /></button>
          <button className="outline-button" onClick={onTips}>Consultar dicas</button>
        </div>
      </section>
    </main>
  )
}
