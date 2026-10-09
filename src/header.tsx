import { Icon } from './icons'

export function Header({ onHome, onTips, onExplore, onFormulas, activeMode }: {
  onHome: () => void;
  onTips: () => void; onExplore: () => void; onFormulas: () => void; activeMode: number;
}) {
  const modes = [
    { label: 'Praticar', icon: 'book' },
    { label: 'Explorar', icon: 'layers' },
    { label: 'Dicas', icon: 'bulb' },
    { label: 'Decorar fórmulas', icon: 'repeat' },
  ] as const
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="./" aria-label="Técnica Dietética, início"
          onClick={event => { event.preventDefault(); onHome() }}>
          Técnica Dietética
        </a>
        <nav aria-label="Modos de estudo">
          {modes.map((item, index) => (
            <button key={item.label} className={`nav-item ${activeMode === index ? 'active' : ''}`}
              aria-current={activeMode === index ? 'page' : undefined}
              onClick={() => index === 0 ? onHome() : index === 1 ? onExplore()
                : index === 2 ? onTips() : onFormulas()}>
              <Icon name={item.icon} size={18} /><span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
