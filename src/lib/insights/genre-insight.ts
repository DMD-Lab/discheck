export type GenreStats = {
  genreId: number
  name: string
  count: number
  percentage: number
  color: string
}

function pick<T>(items: T[], seed: string): T {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return items[hash % items.length]
}

export function getGenreInsight(genres: GenreStats[]): string {
  if (genres.length === 0) return ""

  const [g1, g2, g3] = genres
  const n = genres.length
  const seed = `${g1.name}-${Math.round(g1.percentage / 5) * 5}-${n}`

  const top2 = g2 ? g1.percentage + g2.percentage : g1.percentage
  const top3 = g3 ? top2 + g3.percentage : top2
  const othersPercentage = Math.max(0, 100 - top3)
  const spread13 = g3 ? g1.percentage - g3.percentage : 100
  const ratio12 = g2 ? g1.percentage / g2.percentage : Infinity

  // mono
  if (n === 1) {
    return pick([
      `Que du ${g1.name}, tu sais ce que tu veux.`,
      `Un seul genre dans tes écoutes : le ${g1.name}. Profil assumé.`,
      `Le ${g1.name} et rien d'autre. C'est rare d'être aussi focalisé.`,
    ], seed)
  }

  // long tail
  if (othersPercentage > g1.percentage && n > 6) {
    return pick([
      `Tu écoutes tellement de choses différentes qu'aucun genre ne sort vraiment du lot. Difficile de te mettre dans une case.`,
      `${n} genres au compteur, et les petits cumulés battent les grands. Ton profil part vraiment dans tous les sens.`,
      `Un peu de tout, beaucoup de tout. Les styles s'accumulent sans hiérarchie claire.`,
      `Aucun genre ne prend vraiment la tête, la diversité c'est clairement ton truc.`,
    ], seed)
  }

  // crushing dominant
  if (g1.percentage > 65 && ratio12 > 2.5) {
    return pick([
      `Le ${g1.name}, c'est vraiment ton truc. Les autres styles existent mais on n'est clairement pas au même niveau.`,
      `${g1.name} en tête et loin devant, ton profil est très clair là-dessus.`,
      `Tu écoutes principalement du ${g1.name}, et de loin. Les autres genres sont là mais en toile de fond.`,
      `Le ${g1.name} prend toute la place. Les autres genres font de la figuration.`,
    ], seed)
  }

  // isolated leader
  if (g1.percentage > 50 && ratio12 > 2 && (!g2 || g2.percentage < 20)) {
    return pick([
      `Le ${g1.name} revient dans presque toutes tes sessions. Les autres styles sont là, mais loin derrière.`,
      `Difficile de passer à côté : le ${g1.name} c'est ta référence principale, les autres n'arrivent pas à rivaliser.`,
      `${g1.name} clairement en tête, les autres genres existent mais sans vraiment peser.`,
      `Ton genre principal c'est le ${g1.name}, et l'écart avec les autres est assez marqué.`,
    ], seed)
  }

  // leader + follower
  if (g1.percentage > 40 && g2 && g2.percentage > 18 && ratio12 < 2.8) {
    return pick([
      `Le ${g1.name} domine, mais le ${g2.name} est souvent là aussi. Les deux vont souvent de pair, c'est pas un hasard.`,
      `${g1.name} en premier, ${g2.name} juste derrière. Un combo qui se tient.`,
      `Ton genre principal c'est le ${g1.name}, avec le ${g2.name} qui revient régulièrement. L'écart est réel mais le deuxième tient son rang.`,
      `Le ${g1.name} devant, le ${g2.name} qui suit. Deux styles différents mais qui coexistent bien dans tes écoutes.`,
    ], seed)
  }

  // balanced duo
  if (g2 && g2.percentage > 25 && ratio12 < 1.6 && top2 > 58) {
    return pick([
      `${g1.name} et ${g2.name} se partagent la tête, tu as vraiment un pied dans les deux. Difficile de dire lequel domine.`,
      `Deux genres au même niveau : ${g1.name} et ${g2.name}. Selon les humeurs probablement.`,
      `Tu as autant d'affinité pour le ${g1.name} que pour le ${g2.name}. Les deux ressortent vraiment à des niveaux similaires.`,
      `${g1.name} et ${g2.name} au coude-à-coude. Ces deux-là reviennent autant l'un que l'autre dans tes écoutes.`,
    ], seed)
  }

  // tight trio
  if (g2 && g3 && g3.percentage > 18 && spread13 < 16) {
    return pick([
      `${g1.name}, ${g2.name}, ${g3.name} : les trois sont vraiment au même niveau. Pas de préférence marquée entre eux.`,
      `Difficile de dire lequel des trois domine entre ${g1.name}, ${g2.name} et ${g3.name}. C'est très serré.`,
      `Trois genres presque à égalité dans tes écoutes. Tu passes d'un style à l'autre sans vraiment de hiérarchie.`,
      `${g1.name}, ${g2.name} et ${g3.name} à des niveaux quasi identiques. Ton écoute ne choisit pas vraiment.`,
    ], seed)
  }

  // stable trio
  if (g2 && g3 && g3.percentage > 13 && spread13 < 22) {
    return pick([
      `${g1.name} devant, mais ${g2.name} et ${g3.name} ne sont pas loin. Trois styles qui reviennent régulièrement.`,
      `Ton écoute tourne surtout autour de ${g1.name}, ${g2.name} et ${g3.name}. Des styles différents mais qui coexistent bien.`,
      `Trois genres qui ressortent clairement. Un peu d'écart entre eux, mais les trois sont bien présents.`,
      `${g1.name} en tête, ${g2.name} et ${g3.name} juste derrière. Un profil à trois couleurs assez cohérent.`,
    ], seed)
  }

  // anchor + exploration
  if (n > 6 && g1.percentage > 30 && othersPercentage > 28) {
    return pick([
      `Le ${g1.name} c'est ton port d'attache, mais tu écoutes beaucoup d'autres choses aussi. ${n} genres dans ton historique.`,
      `Tu reviens souvent au ${g1.name}, mais sans te limiter à ça. Beaucoup de styles différents dans tes écoutes.`,
      `${g1.name} en tête, et une vraie curiosité derrière. ${n} genres au total, tu n'es pas du genre à rester dans une seule case.`,
      `Un genre principal bien identifié, le ${g1.name}, mais l'envie d'explorer est clairement là aussi.`,
    ], seed)
  }

  // ultra-eclectic
  if (n >= 8 && g1.percentage < 22) {
    return pick([
      `Tu écoutes vraiment de tout. ${n} genres et aucun qui domine vraiment. Difficile de te coller une étiquette.`,
      `Pas de genre favori marqué, juste beaucoup de curiosité. ${n} styles différents dans tes écoutes.`,
      `${n} genres au compteur et aucun qui prend clairement la tête. L'éclectisme c'est ton mode par défaut.`,
      `Ton profil c'est la diversité. ${n} styles présents, aucun qui efface les autres.`,
    ], seed)
  }

  // scattered
  if (g1.percentage < 30) {
    return pick([
      `Plusieurs genres à des niveaux proches. Le ${g1.name} prend légèrement la tête mais sans vraiment s'imposer.`,
      `Pas de genre qui domine clairement, tes écoutes sont bien réparties entre plusieurs styles.`,
      `Aucun genre ne se dégage vraiment, les ${n} styles présents sont assez équilibrés entre eux.`,
      `Le ${g1.name} est légèrement devant, mais l'écart avec les autres n'est pas si grand.`,
    ], seed)
  }

  // default
  return pick([
    `Le ${g1.name} revient souvent, mais ton écoute reste variée. Tu ne te limites pas à un seul style.`,
    `Une tendance vers le ${g1.name}, mais les autres genres ont bien leur place aussi.`,
    `${g1.name} en tête, et une belle diversité derrière. ${n} genres différents dans tes écoutes.`,
    `Le ${g1.name} donne le ton, mais ton profil reste ouvert. Pas d'enfermement.`,
  ], seed)
}
