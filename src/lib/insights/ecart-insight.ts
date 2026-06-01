export type EcartItem = {
  albumDeezerId: number
  title: string
  artistName: string
  coverXl: string
  albumRating: number
  trackAvg: number
  diff: number // albumRating - trackAvg
}

export function getEcartInsight(items: EcartItem[]): string | null {
  const n = items.length
  if (n === 0) return null

  const diffs = items.map(i => i.diff)
  const avgDiff = diffs.reduce((a, b) => a + b, 0) / n
  const maxAbsDiff = Math.max(...diffs.map(Math.abs))
  const minDiff = Math.min(...diffs)
  const maxDiff = Math.max(...diffs)

  // jamais de note album < tracks (à ±0.25 près)
  const allNonNegative = minDiff >= -0.25
  // jamais de note album > tracks (à ±0.25 près)
  const allNonPositive = maxDiff <= 0.25
  // vrais écarts dans les deux sens
  const hasRealContrast = minDiff < -0.5 && maxDiff > 0.5

  if (n === 1) {
    const [diff] = diffs
    if (Math.abs(diff) < 0.25) return "Ton seul album entièrement noté correspond parfaitement à la moyenne de ses titres."
    if (diff >= 3) return "Tu ressens cet album comme bien plus fort que la somme de ses morceaux. Un vrai ovni dans ta collection."
    if (diff >= 1.5) return "Cet album te touche plus que ses morceaux pris un par un. Tu lui accordes un crédit global que les titres seuls n'expliquent pas."
    if (diff > 0.25) return "Tu notes cet album légèrement plus haut que la moyenne de ses titres pris séparément."
    if (diff <= -3) return "Tes titres te plaisent bien plus que l'album dans son ensemble. Ce projet ne tient pas vraiment la route à tes yeux."
    if (diff <= -1.5) return "Tes morceaux méritent mieux que la note que tu donnes à cet album. Quelque chose dans ce projet te dérange globalement."
    return "Tu notes cet album légèrement en dessous de la moyenne de ses titres."
  }

  // notes quasi identiques partout
  if (maxAbsDiff < 0.25) {
    if (n >= 5) return "Chaque album que tu notes correspond presque exactement à la moyenne de ses titres. Tu évalues avec une cohérence vraiment impressionnante."
    return "Tes notes d'albums collent parfaitement à la moyenne de tes titres. Tu évalues avec beaucoup de cohérence."
  }

  // toujours album >= tracks
  if (allNonNegative) {
    if (avgDiff < 0.5) return "Tes notes d'albums et de titres se tiennent de très près. Tu accordes parfois un léger bonus à l'expérience globale, mais tes jugements restent cohérents et sans vraies contradictions."
    if (avgDiff < 1.0) return "Tu notes toujours tes albums légèrement au-dessus de tes titres. L'expérience d'écoute complète compte pour toi, de façon assez régulière."
    if (avgDiff < 2.0) return "Tu accordes systématiquement un bonus notable à l'album par rapport à ses morceaux. Pour toi, un projet dans son ensemble vaut toujours plus que la somme de ses titres."
    return "Tu accordes toujours bien plus à l'album qu'à ses morceaux pris individuellement. L'expérience d'écoute globale te touche bien plus que les titres séparément."
  }

  // toujours album <= tracks
  if (allNonPositive) {
    if (avgDiff > -0.5) return "Tes notes d'albums et de titres sont très proches. Tu accordes parfois un léger avantage à tes titres, mais sans vraies contradictions."
    if (avgDiff > -1.0) return "Tu notes tes albums légèrement en dessous de la moyenne de leurs titres, de façon assez constante. Les morceaux comptent un peu plus que le projet global pour toi."
    if (avgDiff > -2.0) return "Tu notes systématiquement tes albums en dessous de leurs titres. Ce sont les morceaux qui te conquièrent, pas les projets dans leur ensemble."
    return "Tes morceaux t'impressionnent systématiquement bien plus que les albums dans leur ensemble. Ce sont toujours les titres qui font la différence pour toi."
  }

  // vrais écarts dans les deux sens
  if (maxAbsDiff >= 3) {
    return "Il y a des écarts vraiment extrêmes dans tes notes. Certains albums te semblent bien plus grands que leurs morceaux, d'autres bien plus petits."
  }

  if (hasRealContrast && maxAbsDiff >= 1.5) {
    return "Certains albums te semblent bien plus grands que leurs morceaux, d'autres bien plus petits. Ton jugement varie vraiment d'un projet à l'autre."
  }

  if (hasRealContrast) {
    return "Certains albums te plaisent plus que leurs titres, d'autres un peu moins. Les deux cas se présentent dans ta façon d'écouter."
  }

  // direction légèrement marquée mais pas sans exception
  if (avgDiff > 0.3) {
    return "Tu as une légère tendance à noter tes albums au-dessus de tes titres, même si quelques albums font exception dans l'autre sens."
  }

  if (avgDiff < -0.3) {
    return "Tu as une légère tendance à noter tes albums en dessous de tes titres, même si quelques albums font exception dans l'autre sens."
  }

  return "Tes notes d'albums et de titres restent dans un écart raisonnable. Chaque album est un cas à part dans ta façon d'évaluer."
}
