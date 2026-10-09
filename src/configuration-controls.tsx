import { Icon } from './icons'
import { formats, subjects } from './study-data'

type Mode = 'test' | 'review'

export function ModeSelector({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  return (
    <fieldset className="form-section mode-section">
      <legend>Como você quer praticar?</legend>
      <div className="mode-options">
        <label className={`mode-option ${mode === 'test' ? 'selected' : ''}`}>
          <input type="radio" name="mode" checked={mode === 'test'}
            onChange={() => onChange('test')} />
          <Icon name="book" size={23} />
          <span><strong>Montar um teste</strong>
            <small>Uma nova seleção para praticar.</small></span>
        </label>
        <label className={`mode-option ${mode === 'review' ? 'selected' : ''}`}>
          <input type="radio" name="mode" checked={mode === 'review'}
            onChange={() => onChange('review')} />
          <Icon name="repeat" size={23} />
          <span><strong>Revisar meus erros</strong>
            <small>Volte ao que precisa de atenção.</small></span>
        </label>
      </div>
    </fieldset>
  )
}

export function SubjectSelector({ selected, onChange }: {
  selected: string[]; onChange: (selected: string[]) => void;
}) {
  const allSelected = selected.length === subjects.length
  return (
    <fieldset className="form-section">
      <legend>O que vamos estudar?</legend>
      <div className="section-description">
        <p>Escolha os assuntos que quer incluir no teste.</p>
        <button className="text-button" type="button"
          onClick={() => onChange(allSelected ? [] : subjects.map(subject => subject.id))}>
          {allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
        </button>
      </div>
      <div className="subject-grid">
        {subjects.map(subject => (
          <label key={subject.id}
            className={`subject-option ${selected.includes(subject.id) ? 'selected' : ''}`}>
            <input type="checkbox" checked={selected.includes(subject.id)}
              onChange={() => onChange(selected.includes(subject.id)
                ? selected.filter(id => id !== subject.id) : [...selected, subject.id])} />
            <span><strong>{subject.name}</strong><small>{subject.detail}</small></span>
            <span className="subject-count">{subject.counts.reduce((sum, n) => sum + n, 0)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function FormatSelector({ selected, onChange }: {
  selected: number[]; onChange: (selected: number[]) => void;
}) {
  return (
    <fieldset className="form-section formats-section">
      <legend>Tipos de questão</legend>
      <p className="muted">Misture os formatos para variar a prática.</p>
      <div className="format-options">
        {formats.map((format, index) => (
          <label key={format} className={selected.includes(index) ? 'selected' : ''}>
            <input type="checkbox" checked={selected.includes(index)}
              onChange={() => onChange(selected.includes(index)
                ? selected.filter(id => id !== index) : [...selected, index])} />
            {format}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function TestSummary({ available, quantity, setQuantity, mode, onStart }: {
  available: number; quantity: number; setQuantity: (value: number) => void;
  mode: Mode; onStart: () => void;
}) {
  const effective = Math.min(quantity, available)
  const points = effective ? (4 / effective).toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
  }) : '0'
  return (
    <section className="summary-card" aria-labelledby="summary-title">
      <div className="summary-heading"><Icon name="book" /><h2 id="summary-title">
        Seu {mode === 'review' ? 'plano de revisão' : 'teste'}
      </h2></div>
      <label className="quantity-label" htmlFor="quantity">Quantas questões?</label>
      <div className="quantity-control">
        <button aria-label="Diminuir quantidade" disabled={quantity <= 1}
          onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
        <input id="quantity" type="number" min="1" max="999" value={quantity}
          onInput={event => setQuantity(Math.min(999,
            Math.max(1, Math.floor(Number(event.currentTarget.value) || 1))))} />
        <button aria-label="Aumentar quantidade" disabled={quantity >= 999}
          onClick={() => setQuantity(Math.min(999, quantity + 1))}>+</button>
      </div>
      <div className="quick-quantities" aria-label="Quantidades sugeridas">
        {[5, 10, 15, 20].map(count => (
          <button className={quantity === count ? 'selected' : ''} key={count}
            aria-pressed={quantity === count} onClick={() => setQuantity(count)}>{count}</button>
        ))}
      </div>
      <div className="summary-details" aria-live="polite" aria-atomic="true">
        <dl>
          <div><dt>Disponíveis na seleção</dt><dd>{available}</dd></div>
          <div><dt>Questões no teste</dt><dd>{effective}</dd></div>
          <div><dt>Valor por questão</dt><dd>{points} pts</dd></div>
          <div className="total-row"><dt>Nota máxima</dt><dd>4,00 <span>pts</span></dd></div>
        </dl>
        {!available && <p className="availability-note">{mode === 'review'
          ? 'Nenhum erro nesta seleção. Amplie os filtros ou monte um novo teste.'
          : 'Selecione ao menos um assunto e um tipo de questão para começar.'}</p>}
        {available > 0 && quantity > available && <p className="availability-note">
          O teste terá {available} {available === 1 ? 'questão disponível' : 'questões disponíveis'},
          sem repetições.
        </p>}
      </div>
      <button className="primary-button" disabled={!effective} onClick={onStart}>
        {mode === 'review' ? 'Começar revisão' : 'Começar teste'}<Icon name="arrow" size={18} />
      </button>
      <p className="replacement-note">Se houver um teste em andamento, começar outro o substitui.</p>
      <div className="summary-footnote"><Icon name="check" size={16} />
        Cada resposta é uma oportunidade de aprender.
      </div>
    </section>
  )
}

