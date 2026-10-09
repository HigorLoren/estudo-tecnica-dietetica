import { calculatePreparation, formatWeight, type Preparation } from './explore-model'

export function ExploreDiagram({ values }: { values: Preparation }) {
  const result = calculatePreparation(values)
  const largest = Math.max(result.gross, result.liquid, result.cooked)
  const stages = [
    { label: 'Como comprado', symbol: 'PB', weight: result.gross, className: 'gross',
      description: 'Antes da limpeza' },
    { label: 'Limpo e cru', symbol: 'PL', weight: result.liquid, className: 'liquid',
      description: 'Pronto para preparar' },
    { label: 'Após o preparo', symbol: 'Cozido', weight: result.cooked, className: 'cooked',
      description: 'Pronto para consumir' },
  ]
  const change = Math.abs(result.cookingChange)
  const cookingLabel = result.cookingChange < 0 ? 'perdidos na cocção'
    : result.cookingChange > 0 ? 'ganhos na cocção' : 'de mudança na cocção'
  return (
    <section className="explore-visual" aria-labelledby="explore-visual-title">
      <div className="explore-panel-heading"><h2 id="explore-visual-title">O caminho do peso</h2>
        <p>A altura de cada coluna representa a quantidade de alimento.</p></div>
      <div className="weight-stages">
        {stages.map(stage => <div className={`weight-stage ${stage.className}`} key={stage.symbol}>
          <div className="weight-column-space" aria-hidden="true">
            <div className="weight-column" style={{ height: `${stage.weight / largest * 100}%` }}>
              <span>{stage.symbol}</span></div></div>
          <strong>{formatWeight(stage.weight)} <small>kg</small></strong>
          <h3>{stage.label}</h3><p>{stage.description}</p>
        </div>)}
      </div>
      <div className="weight-transitions">
        <div><span>Limpeza</span><strong>PB ÷ FC = PL</strong>
          <p>{formatWeight(result.cleaningLoss)} kg retirados
            <small>{formatWeight(result.cleaningLossPercent)}% do peso bruto</small></p></div>
        <div><span>Cocção</span><strong>PL × IC = peso cozido</strong>
          <p>{formatWeight(change)} kg {cookingLabel}
            <small>{values.conversion < 1 ? 'IC < 1: perda de peso'
              : values.conversion > 1 ? 'IC > 1: ganho de peso' : 'IC = 1: peso mantido'}</small></p></div>
      </div>
      <p className="explore-scale-note">Escala relativa ao maior peso deste exemplo.
        Os cálculos usam os valores completos; a exibição é arredondada para duas casas.</p>
    </section>
  )
}
