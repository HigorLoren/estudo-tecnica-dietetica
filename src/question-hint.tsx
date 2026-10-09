import type { Question } from './questions'
import { Icon } from './icons'

const equations = [
  { name: 'Fator de correção (FC)', lines: ['FC = PB ÷ PL', 'PB = FC × PL', 'PL = PB ÷ FC'] },
  { name: 'Perda no pré-preparo', lines: ['Perda (%) = (PB − PL) ÷ PB × 100'] },
  { name: 'Índice de conversão (IC)', lines: ['IC = peso cozido ÷ PL cru',
    'Peso cozido = PL cru × IC', 'PL cru = peso cozido ÷ IC'] },
  { name: 'Reidratação (IR / IER)', lines: ['IR = peso hidratado escorrido ÷ peso seco',
    'Peso hidratado = peso seco × IR', 'Peso seco = peso hidratado ÷ IR'] },
  { name: 'Per capita e porção', lines: ['Porção = per capita × IC',
    'Per capita = porção ÷ IC'] },
  { name: 'Rendimento e refeições', lines: ['Rendimento total = porção × nº de refeições',
    'Nº de refeições = rendimento total ÷ porção'] },
  { name: 'Quantidade adquirida', lines: ['Compra = nº de refeições × per capita × FC',
    'Com margem de 10%: compra × 1,10'] },
  { name: 'Custo real', lines: ['Custo por kg líquido = preço por kg bruto × FC'] },
]

export function QuestionHint({ question, used, confirmed, onHint }: {
  question: Question; used: boolean; confirmed: boolean; onHint: () => void;
}) {
  const calculation = question.numeric !== undefined || question.tables?.some(table =>
    table.solutions !== undefined)
  return (
    <div className="question-hint">
      <button type="button" className="outline-button" disabled={confirmed || used}
        aria-expanded={used} aria-controls={`hint-${question.id}`} onClick={onHint}>
        <Icon name="bulb" size={17} />{used ? 'Dica utilizada' : 'Dica'}
      </button>
      {used && <section className="hint-panel" id={`hint-${question.id}`}
        aria-label="Dica da questão">
        <p className="hint-review-note"><strong>Não decorada.</strong> Esta questão entra na
          revisão mesmo com a resposta certa.</p>
        {question.id === 'revisao-densidade' ? <p>Densidade = massa ÷ volume</p> : calculation ? <>
          <h2>Equações básicas dos indicadores</h2>
          <p>PB: peso bruto. PL: peso líquido cru.
            Per capita: quantidade individual crua e limpa.</p>
          <dl className="hint-equations">{equations.map(equation => <div key={equation.name}>
            <dt>{equation.name}</dt>
            {equation.lines.map(line => <dd key={line}>{line}</dd>)}
          </div>)}</dl>
          <p>Use unidades compatíveis. Para passar de g para kg, divida por 1.000.
            Arredonde apenas o resultado final.
            A margem de segurança só entra se for solicitada.</p>
        </> : <><h2>Lembrete</h2><p>{question.caution}</p></>}
      </section>}
    </div>
  )
}
