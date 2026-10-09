import { tipGroups, tips, type Tip } from './tips-data.ts'

export function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .trim().replace(/\s+/g, ' ')
}

export function filterTips(query: string, content: Tip[] = tips) {
  const terms = normalizeSearch(query).split(' ').filter(Boolean)
  return content.filter(tip => {
    const groupTitle = tipGroups.find(group => group.id === tip.group)?.title ?? ''
    const text = normalizeSearch([tip.title, tip.concept, tip.formula, tip.example,
      tip.memory, tip.caution, groupTitle, ...tip.sources.map(source => source.passage)].join(' '))
    return terms.every(term => text.includes(term))
  })
}

export function groupTips(query: string) {
  const filtered = filterTips(query)
  return tipGroups.map(group => ({ ...group,
    items: filtered.filter(tip => tip.group === group.id),
  })).filter(group => group.items.length)
}

export function validTipAnchor(hash: string) {
  const id = hash.replace(/^#/, '')
  return tipGroups.some(group => group.id === id) || id === 'fontes' ? id : null
}

export function pageFromSearch(search: string) {
  return new URLSearchParams(search).get('pagina') === 'dicas' ? 'dicas' : 'configuration'
}
