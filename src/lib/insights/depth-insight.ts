export type DepthItem = {
  artistDeezerId: number
  name: string
  pictureXl: string
  listened: number
  total: number
  pct: number
}

export function getDepthInsight(items: DepthItem[]): string | null {
  const n = items.length
  if (n === 0) return null

  const sorted = [...items].sort((a, b) => b.pct - a.pct)
  const pcts = sorted.map(i => i.pct)
  const avg = Math.round(pcts.reduce((a, b) => a + b, 0) / n)
  const fullyListened = pcts.filter(p => p === 100).length

  if (n === 1) {
    const [p] = pcts
    if (p === 100) return "Ton seul artiste est exploré à 100%. Écoute d'autres artistes pour voir ton profil se dessiner."
    if (p >= 50) return `Tu explores ton seul artiste à ${p}%. Pas encore assez de données pour cerner ton profil.`
    return "Tu commences à explorer ton premier artiste. Ton profil se précisera avec le temps."
  }

  const topCount = Math.max(1, Math.ceil(n * 0.25))
  const topAvg = pcts.slice(0, topCount).reduce((a, b) => a + b, 0) / topCount
  const restPcts = pcts.slice(topCount)
  const restAvg = restPcts.length > 0 ? restPcts.reduce((a, b) => a + b, 0) / restPcts.length : 0
  const hasNucleus = n >= 4 && topAvg - restAvg > 35

  if (avg >= 75) {
    if (fullyListened >= Math.ceil(n * 0.5)) return "Tu vas vraiment au bout de tes artistes. Plus de la moitié ont été explorés à 100%, c'est un profil de collectionneur engagé."
    return "Tu explores tes artistes en profondeur, de façon très régulière. Peu de découvertes superficielles dans ta bibliothèque."
  }

  if (avg >= 50) {
    if (hasNucleus) return "Tu as un noyau d'artistes que tu connais à fond, et des découvertes encore peu explorées autour. Le profil classique d'un auditeur fidèle à ses artistes de cœur."
    return "Tu explores tes artistes en profondeur, de façon assez uniforme. Peu de distinction entre favoris et secondaires dans ta façon d'écouter."
  }

  if (hasNucleus) return "Quelques artistes sont vraiment bien explorés, les autres beaucoup moins. Tu as des incontournables que tu reviens écouter, et tout le reste reste effleuré."

  if (avg >= 30) {
    if (n >= 15) return "Beaucoup d'artistes dans ta bibliothèque, avec une complétion modérée. Tu découvres activement sans forcément revenir en profondeur sur ce que tu connais déjà."
    return "Tu touches à tes artistes sans aller au bout. Ta bibliothèque s'élargit plus vite que tu ne l'explores en profondeur."
  }

  if (n >= 15) return "Une bibliothèque large et peu profonde. Tu picores partout, chaque artiste reste souvent effleuré. Une façon rapide de couvrir du terrain."
  return "Encore peu d'exploration en profondeur. Ta bibliothèque s'élargit, la profondeur viendra avec le temps."
}
