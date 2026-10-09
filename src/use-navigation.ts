import { useEffect, useState } from 'preact/hooks'
import { pageFromSearch } from './tips-model'

export type Screen = 'configuration' | 'practice' | 'bank' | 'free' | 'dicas' | 'explore' | 'formulas'

function currentPage(): Screen {
  const search = window.location.search
  return new URLSearchParams(search).get('pagina') === 'formulas'
    ? 'formulas' : pageFromSearch(search)
}
export function useNavigation() {
  const [screen, setScreen] = useState<Screen>(currentPage)
  useEffect(() => {
    const onPopState = () => setScreen(currentPage())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
  const navigate = (next: Screen) => {
    const url = new URL(window.location.href)
    if (next === 'formulas') { url.searchParams.set('pagina', 'formulas'); url.hash = '' }
    else if (next === 'dicas') url.searchParams.set('pagina', 'dicas')
    else if (['dicas', 'formulas'].includes(url.searchParams.get('pagina') ?? '')) {
      url.searchParams.delete('pagina')
      url.hash = ''
    }
    if (url.href !== window.location.href) window.history.pushState(null, '', url)
    setScreen(next)
  }
  return [screen, navigate] as const
}
