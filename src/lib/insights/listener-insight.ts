export type ListenerStats = {
  albumFull: number
  albumPartial: number
  albumFullPct: number
  albumPartialPct: number
}

function pick<T>(items: T[], seed: string): T {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return items[hash % items.length]
}

export function getListenerInsight(stats: ListenerStats): string {
  const { albumFull, albumPartial, albumFullPct, albumPartialPct } = stats
  const total = albumFull + albumPartial
  if (total === 0) return ''

  const seed = `${albumFullPct}${total}`

  if (total === 1) {
    if (albumFull === 1) return pick([
      `Un seul album fini pour l'instant, mais ça suffit pour voir que tu vas au bout.`,
      `Tu as écouté un album en entier. La suite dira si tu es plutôt album ou track listener.`,
    ], seed)
    return pick([
      `Tu as commencé un album sans le finir, trop tôt pour te ranger dans une case.`,
      `Tu as pioché quelques tracks, mais pas encore terminé un album en entier.`,
    ], seed)
  }

  if (albumPartial === 0) {
    return pick([
      `Tu écoutes toujours les albums en entier. Tu es clairement un album listener.`,
      `100% d'albums finis : tu respectes le format, pas de tracks à la carte.`,
      `Tu n'as jamais laissé un album à moitié. Tu vas au bout à chaque fois.`,
    ], seed)
  }

  if (albumFull === 0) {
    return pick([
      `Tu n'as jamais fini un album entier. Tu picores les tracks qui t'intéressent.`,
      `Aucun album écouté complètement : tu es dans une logique de tracks, pas d'albums.`,
      `Tu n'écoutes pas les albums, tu choisis tes tracks. C'est une façon d'écouter comme une autre.`,
    ], seed)
  }

  if (albumFullPct >= 75) {
    return pick([
      `Tu as une vraie culture album. Tu vas au bout de la plupart de ce que tu écoutes.`,
      `Majoritairement album listener : tu prends le temps d'écouter les projets entiers.`,
      `Tu écoutes les albums comme ils ont été pensés, du début à la fin.`,
    ], seed)
  }

  if (albumFullPct >= 55) {
    return pick([
      `Plutôt album listener, avec quelques exceptions où tu ne gardes que le meilleur.`,
      `Tu as tendance à finir tes albums, mais tu sais aussi piocher quand ça t'arrange.`,
      `Tu vas au bout plus souvent qu'autrement. L'album reste ton format de référence.`,
    ], seed)
  }

  if (albumFullPct >= 45) {
    return pick([
      `Ni album ni track listener. Tu oscilles entre les deux selon l'humeur.`,
      `Profil équilibré : autant d'albums finis que de projets explorés partiellement.`,
      `Tu n'as pas de mode par défaut. Parfois tu finis, parfois tu picores. Les deux coexistent.`,
    ], seed)
  }

  if (albumPartialPct >= 55) {
    return pick([
      `Tu picores plus souvent que tu ne finis. Tu es plutôt dans une logique de tracks.`,
      `Tendance track listener : tu gardes ce qui t'intéresse sans forcément aller au bout.`,
      `Tu explores beaucoup d'albums mais en retiens surtout les highlights.`,
    ], seed)
  }

  return pick([
    `Clairement track listener. Les albums te servent de réservoir de bonnes tracks.`,
    `Tu écoutes rarement un album entier, tu vas droit à ce qui t'intéresse.`,
    `La logique playlist plutôt qu'album. Tu assembles tes écoutes track par track.`,
  ], seed)
}
