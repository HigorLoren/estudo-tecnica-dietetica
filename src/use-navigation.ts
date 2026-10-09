import { useEffect, useState } from 'preact/hooks'
import { pageFromSearch } from './tips-model'

export type Screen = 'configuration' | 'practice' | 'bank' | 'free' | 'dicas' | 'explore'

export function useNavigation() {
  const [screen, setScreen] = useState<Screen>(() => pageFromSearch(window.location.search))
  useEffect(() => {
    const onPopState = () => setScreen(pageFromSearch(window.location.search))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
  const navigate = (next: Screen) => {
    const url = new URL(window.location.href)
    if (next === 'dicas') url.searchParams.set('pagina', 'dicas')
    else if (url.searchParams.get('pagina') === 'dicas') {
      url.searchParams.delete('pagina')
      url.hash = ''
    }
    if (url.href !== window.location.href) window.history.pushState(null, '', url)
    setScreen(next)
  }
  return [screen, navigate] as const
}
