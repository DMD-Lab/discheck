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

  // Un seul album au total
  if (total === 1) {
    if (albumFull === 1) return pick([
      `Un seul album fini pour l'instant — mais ça suffit pour voir que tu vas au bout.`,
      `T'as écouté un album en entier. La suite dira si tu es plutôt album ou track listener.`,
    ], seed)
    return pick([
      `T'as commencé un album sans le finir — trop tôt pour te ranger dans une case.`,
      `T'as pioché quelques tracks, mais pas encore terminé un album en entier.`,
    ], seed)
  }

  // Pure album listener (100%)
  if (albumPartial === 0) {
    return pick([
      `T'écoutes toujours les albums en entier — t'es clairement un album listener.`,
      `100% d'albums finis : tu respectes le format, pas de tracks à la carte.`,
      `T'as jamais laissé un album à moitié — tu vas au bout à chaque fois.`,
    ], seed)
  }

  // Pure track listener (0%)
  if (albumFull === 0) {
    return pick([
      `T'as jamais fini un album entier — tu picores les tracks qui t'intéressent.`,
      `Aucun album écouté complètement : t'es dans une logique de tracks, pas d'albums.`,
      `Tu n'écoutes pas les albums, tu choisis tes tracks. C'est une façon d'écouter comme une autre.`,
    ], seed)
  }

  // Très album listener (>= 75%)
  if (albumFullPct >= 75) {
    return pick([
      `T'as une vraie culture album — tu vas au bout de la plupart de ce que tu écoutes.`,
      `Majoritairement album listener : tu prends le temps d'écouter les projets entiers.`,
      `T'écoutes les albums comme ils ont été pensés — du début à la fin.`,
    ], seed)
  }

  // Plutôt album listener (55-74%)
  if (albumFullPct >= 55) {
    return pick([
      `Plutôt album listener, avec quelques exceptions où tu ne gardes que le meilleur.`,
      `T'as tendance à finir tes albums, mais tu sais aussi piocher quand ça t'arrange.`,
      `Tu vas au bout plus souvent qu'autrement — l'album reste ton format de référence.`,
    ], seed)
  }

  // Équilibré (45-54%)
  if (albumFullPct >= 45) {
    return pick([
      `Ni album ni track listener — t'oscilles entre les deux selon l'humeur.`,
      `Profil équilibré : autant d'albums finis que de projets explorés partiellement.`,
      `T'as pas de mode par défaut — parfois tu finis, parfois tu picores. Les deux coexistent.`,
    ], seed)
  }

  // Plutôt track listener (albumPartialPct 55-74%)
  if (albumPartialPct >= 55) {
    return pick([
      `Tu picores plus souvent que tu ne finis — t'es plutôt dans une logique de tracks.`,
      `Tendance track listener : tu gardes ce qui t'intéresse sans forcément aller au bout.`,
      `T'explores beaucoup d'albums mais en retiens surtout les highlights.`,
    ], seed)
  }

  // Très track listener (>= 75% partial)
  return pick([
    `Clairement track listener — les albums te servent de réservoir de bonnes tracks.`,
    `T'écoutes rarement un album entier, tu vas droit à ce qui t'intéresse.`,
    `La logique playlist plutôt qu'album — t'assembles tes écoutes track par track.`,
  ], seed)
}
