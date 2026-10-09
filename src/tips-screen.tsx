import { useEffect, useRef, useState } from 'preact/hooks'
import { tips, tipSources, type Tip } from './tips-data'
import { groupTips, validTipAnchor } from './tips-model'
import { Icon } from './icons'

function TipCard({ tip }: { tip: Tip }) {
  return (
    <article className="tip-card" aria-labelledby={`tip-${tip.id}`}>
      <h3 id={`tip-${tip.id}`}>{tip.title}</h3>
      <p className="tip-concept">{tip.concept}</p>
      {tip.formula && <div className="tip-formula">{tip.formula}</div>}
      <div className="tip-example"><h4>Como aplicar</h4><p>{tip.example}</p></div>
      {tip.memory && <div className="tip-memory"><Icon name="bulb" size={18} />
        <div><h4>Macete de memorização</h4><p>{tip.memory}</p>
          <small>Associação para estudar, não uma definição técnica.</small></div></div>}
      <div className="tip-caution"><strong>Atenção</strong><p>{tip.caution}</p></div>
      <div className="tip-references"><span>Fontes</span>
        {tip.sources.map(source => <a href={`#fonte-${source.id}`} key={source.id}>
          {tipSources.find(item => item.id === source.id)?.title} <span>({source.passage})</span>
        </a>)}
      </div>
    </article>
  )
}

function Sources() {
  return (
    <section id="fontes" className="tips-sources" aria-labelledby="sources-title">
      <h2 id="sources-title">Material e fontes</h2>
      <p>Conteúdo organizado a partir das transcrições revisadas e das anotações da disciplina.
        Os exemplos numéricos são aplicações das fórmulas apresentadas nas aulas.</p>
      <div>{tipSources.map(source => <article id={`fonte-${source.id}`} key={source.id}>
        <span><Icon name="book" size={18} /></span>
        <div><h3>{source.title}</h3><p>{source.description}</p></div>
      </article>)}</div>
      <p className="tips-sources-note">Os macetes são sugestões de memorização.
        As fontes sustentam os conceitos e fórmulas; não indicam garantia de cobrança na prova.</p>
    </section>
  )
}

export function TipsScreen() {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(() => validTipAnchor(window.location.hash) ?? '')
  const [scrollRequest, setScrollRequest] = useState(() => active ? 1 : 0)
  const searchInput = useRef<HTMLInputElement>(null)
  const title = useRef<HTMLHeadingElement>(null)
  const groups = groupTips(query)
  const found = groups.reduce((sum, group) => sum + group.items.length, 0)
  useEffect(() => { if (!window.location.hash) title.current?.focus() }, [])
  useEffect(() => {
    const onHash = () => {
      const id = validTipAnchor(window.location.hash)
      setActive(id ?? '')
      if (!id) return
      setQuery(''); setActive(id); setScrollRequest(value => value + 1)
    }
    window.addEventListener('popstate', onHash)
    window.addEventListener('hashchange', onHash)
    return () => {
      window.removeEventListener('popstate', onHash)
      window.removeEventListener('hashchange', onHash)
    }
  }, [])
  useEffect(() => {
    if (!scrollRequest) return
    document.getElementById(active)?.scrollIntoView({ block: 'start' })
  }, [scrollRequest, active])
  const onSelect = (id: string) => {
    const url = new URL(window.location.href)
    url.hash = id
    if (url.href !== window.location.href) window.history.pushState(null, '', url)
    setQuery(''); setActive(id); setScrollRequest(value => value + 1)
  }
  const clearSearch = () => { setQuery(''); searchInput.current?.focus() }
  return (
    <main className="page-container tips-page">
      <div className="page-intro"><div>
        <span className="intro-label"><Icon name="bulb" size={17} />Consulte, compare, entenda</span>
        <h1 ref={title} tabIndex={-1}>Dicas e consulta rápida</h1>
        <p>Fórmulas, exemplos e lembretes para destravar as dúvidas do estudo.</p>
      </div></div>
      <div className="tips-search-row">
        <div className="tips-search"><label htmlFor="tips-search">O que você quer entender?</label>
          <div><Icon name="book" size={19} />
            <input id="tips-search" ref={searchInput} type="search" value={query}
              placeholder="Busque por FC, porção, compra, cocção…"
              onInput={event => setQuery(event.currentTarget.value)} />
            {query && <button aria-label="Limpar busca" onClick={clearSearch}>
              <Icon name="close" size={17} /></button>}
          </div>
        </div>
        <p role="status" aria-live="polite"><strong>{found}</strong>
          {found === 1 ? ' tópico encontrado' : ' tópicos encontrados'}
          <span>de {tips.length} tópicos no guia</span></p>
      </div>
      <div className="tips-layout">
        <aside className="tips-index"><h2>Nesta página</h2>
          <nav aria-label="Assuntos das dicas">
            {groups.map(group => <a href={`#${group.id}`} key={group.id}
              aria-current={active === group.id ? 'location' : undefined}
              onClick={event => { event.preventDefault(); onSelect(group.id) }}>
              <span>{group.title}</span><small>{group.items.length}</small>
            </a>)}
            <a href="#fontes" aria-current={active === 'fontes' ? 'location' : undefined}
              onClick={event => { event.preventDefault(); onSelect('fontes') }}>Material e fontes
              <Icon name="book" size={15} /></a>
          </nav>
          <p>Comece pela dúvida de agora. Depois, volte à prática para fixar o conteúdo.</p>
        </aside>
        <div className="tips-content">
          {groups.map(group => <section id={group.id} key={group.id} className="tips-group"
            aria-labelledby={`heading-${group.id}`}>
            <div className="tips-group-heading"><h2 id={`heading-${group.id}`}>{group.title}</h2>
              <p>{group.description}</p></div>
            {group.items.map(tip => <TipCard tip={tip} key={tip.id} />)}
          </section>)}
          {!found && <section className="tips-empty"><Icon name="bulb" size={28} />
            <h2>Nenhum tópico encontrado.</h2>
            <p>Tente outro termo, como “rendimento”, “FC” ou “porção”.</p>
            <button className="outline-button" onClick={clearSearch}>Limpar busca</button>
          </section>}
          <Sources />
        </div>
      </div>
    </main>
  )
}
