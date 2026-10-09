import { Icon } from './icons'

export type Notice = { title: string; description: string } | null

export function Header({ onNotice, onHome }: {
  onNotice: (notice: Notice) => void; onHome: () => void;
}) {
  const modes = [
    { label: 'Praticar', icon: 'book' },
    { label: 'Explorar', icon: 'layers' },
    { label: 'Dicas', icon: 'bulb' },
    { label: 'Repetição espaçada', icon: 'repeat' },
  ] as const
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="./" aria-label="Técnica Dietética, início"
          onClick={event => { event.preventDefault(); onHome() }}>
          <span className="brand-mark"><Icon name="leaf" size={26} /></span>
          <span>Técnica Dietética<small>Seu espaço de estudo</small></span>
        </a>
        <nav aria-label="Modos de estudo">
          {modes.map((item, index) => (
            <button key={item.label} className={`nav-item ${index === 0 ? 'active' : ''}`}
              aria-current={index === 0 ? 'page' : undefined}
              onClick={() => index === 0 ? onHome() : onNotice({
                title: item.label,
                description: 'Este espaço será desenvolvido em uma próxima etapa. Por enquanto, você pode experimentar a configuração do teste.',
              })}>
              <Icon name={item.icon} size={18} />{item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}

