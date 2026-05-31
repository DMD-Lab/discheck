export type ConcentrationStats = {
  top3Pct: number
  totalTracks: number
  totalArtists: number
  top3Artists: { name: string; pct: number }[]
}

function pick(arr: string[], seed: number): string {
  let h = seed
  h = ((h >> 16) ^ h) * 0x45d9f3b
  h = ((h >> 16) ^ h) * 0x45d9f3b
  h = (h >> 16) ^ h
  return arr[Math.abs(h) % arr.length]
}

export function getConcentrationInsight(stats: ConcentrationStats): string {
  const { top3Pct, totalTracks, totalArtists, top3Artists } = stats

  if (totalTracks === 0 || totalArtists === 0) return ''

  if (totalTracks < 20) {
    return "Encore trop peu d'écoutes pour établir un profil de concentration."
  }

  if (totalArtists === 1) {
    return pick([
      "Tu as consacré toute ton écoute à un seul artiste. C'est du dévouement.",
      "Un artiste, toute ton attention. Tu sais exactement ce que tu veux.",
    ], totalTracks)
  }

  if (totalArtists === 2) {
    return pick([
      "Deux artistes se partagent intégralement ton écoute pour l'instant.",
      "Ton univers musical tourne autour de deux noms, un duo très serré.",
    ], totalTracks)
  }

  if (totalArtists === 3) {
    return pick([
      "Ton écoute tourne autour de 3 artistes, un trio bien ancré.",
      "3 artistes, tout ton espace musical. Tu es resté fidèle à un cercle restreint.",
    ], totalTracks)
  }

  const top1Pct = top3Artists[0]?.pct ?? 0
  const seed = top3Pct * 31 + totalTracks % 17

  if (top3Pct >= 85 && top1Pct >= 50) {
    return pick([
      `${top3Artists[0]?.name} à lui seul représente ${top1Pct}% de tes écoutes. Tu dois vraiment l'apprécier.`,
      `Un artiste domine tout le reste. ${top3Artists[0]?.name} occupe ${top1Pct}% de ta bibliothèque à lui seul.`,
    ], seed)
  }

  if (top3Pct >= 85) {
    return pick([
      `Tes 3 artistes les plus écoutés représentent ${top3Pct}% de tes écoutes. Tu es très fidèle à un cercle restreint.`,
      `${top3Pct}% de tes écoutes viennent de seulement 3 artistes. Tu dois vraiment les apprécier.`,
      `Tes 3 favoris monopolisent presque tout, ${top3Pct}% du total. Peu d'artistes, beaucoup de fidélité.`,
    ], seed)
  }

  if (top3Pct >= 70) {
    return pick([
      `Tes 3 artistes les plus écoutés concentrent ${top3Pct}% de tes écoutes. Tu préfères clairement creuser en profondeur.`,
      `${top3Pct}% de ce que tu écoutes vient de 3 artistes. Tu es du genre à revenir encore et encore aux mêmes.`,
      `Tes 3 favoris représentent ${top3Pct}% de ta bibliothèque. Une fidélité qui ne laisse pas de doute.`,
    ], seed)
  }

  if (top3Pct >= 55) {
    return pick([
      `Tes 3 artistes préférés cumulent ${top3Pct}% de tes écoutes, avec encore de la place pour explorer.`,
      `${top3Pct}% de tes écoutes reviennent à 3 artistes. Tu as des favoris bien installés, mais tu laisses de la place à d'autres.`,
      `Un noyau dur de 3 artistes qui représente ${top3Pct}% du total, entouré d'explorations ponctuelles.`,
    ], seed)
  }

  if (top3Pct >= 40) {
    return pick([
      "Un bel équilibre entre artistes récurrents et nouvelles découvertes.",
      "Tu alternes entre fidélité et exploration, un profil d'écoute bien équilibré.",
      "Pas d'artiste qui écrase les autres, ton écoute est bien répartie.",
    ], seed)
  }

  if (top3Pct >= 25) {
    return pick([
      "Tes écoutes sont très homogènes, aucun artiste ne domine vraiment.",
      "Une grande diversité dans tes écoutes, sans artiste qui prend clairement la tête.",
      "Tes écoutes sont bien réparties sur un grand nombre d'artistes.",
    ], seed)
  }

  return pick([
    "Tes écoutes sont extrêmement homogènes, chaque artiste n'a qu'une infime part de ta bibliothèque.",
    "Aucun artiste ne ressort vraiment. Tu es un explorateur musical dans l'âme.",
    "Une curiosité sans limites, tu ne te fixes sur aucun artiste en particulier.",
  ], seed)
}
