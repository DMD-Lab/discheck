export type DecadeStats = {
  decade: number
  label: string
  count: number
  percentage: number
}

export function decadeLabel(decade: number): string {
  if (decade >= 2000) return `${decade}s`
  return `${String(decade).slice(2)}s`
}

function pick<T>(items: T[], seed: string): T {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return items[hash % items.length]
}

export function getDecadeInsight(decades: DecadeStats[]): string {
  const sorted = [...decades].filter(d => d.count > 0).sort((a, b) => b.count - a.count)
  if (sorted.length === 0) return ''

  const seed = sorted[0].label + sorted[0].percentage
  const top = sorted[0]
  const second = sorted[1]
  const third = sorted[2]
  const ratio12 = second ? top.percentage / second.percentage : Infinity

  const oldPct = sorted.filter(d => d.decade <= 1980).reduce((s, d) => s + d.percentage, 0)
  const newPct = sorted.filter(d => d.decade >= 2010).reduce((s, d) => s + d.percentage, 0)
  const hasOld = oldPct > 0
  const hasNew = newPct > 0

  // 1. mono
  if (sorted.length === 1) {
    return pick([
      `Les ${top.label}, c'est ton territoire. T'as pas cherché ailleurs, et ça se voit.`,
      `T'as clairement une époque de prédilection — tout ce que t'écoutes vient des ${top.label}.`,
      `Une seule décennie suffit quand elle te colle à la peau comme les ${top.label}.`,
    ], seed)
  }

  // 2. pure modern (all >= 2010)
  if (sorted.every(d => d.decade >= 2010)) {
    return pick([
      `Rien d'ancien dans ta liste — tu vis pleinement dans le présent musical.`,
      `T'écoutes que de la musique récente, et c'est assumé.`,
      `2010 et après uniquement — t'es tourné vers ce qui se fait maintenant.`,
    ], seed)
  }

  // 3. pure old school (all <= 1980)
  if (sorted.every(d => d.decade <= 1980)) {
    return pick([
      `Tout ce que t'écoutes vient d'avant les années 90 — t'as un vrai truc avec la musique d'époque.`,
      `Classique dans l'âme : ta musique est entièrement pré-90s et elle n'a pas pris une ride.`,
      `Les belles années, uniquement — t'as pas besoin du présent pour te faire plaisir.`,
    ], seed)
  }

  // 4. pure millennial (all in 1990–2009)
  if (sorted.every(d => d.decade >= 1990 && d.decade <= 2000)) {
    return pick([
      `Les 90s et les 2000s, ton terrain de jeu — une époque charnière que tu tiens à garder proche.`,
      `T'es dans la zone millennial : les 90s et les 2000s ont tout ce qu'il te faut.`,
      `Ni trop vieux ni trop récent — les 90s-2000s, c'est exactement là où tu te situes.`,
    ], seed)
  }

  // 5. old + modern split, with proportion sub-cases
  if (hasOld && hasNew) {
    // vrai grand écart
    if (oldPct >= 25 && newPct >= 25) {
      return pick([
        `Une partie de toi reste dans les classiques, l'autre vit pleinement le présent — un grand écart qui dit quelque chose.`,
        `Des décennies aux antipodes qui cohabitent dans ta liste : t'as clairement pas de limite dans le temps.`,
        `T'as autant d'attaches pour les vieux classiques que pour la musique d'aujourd'hui.`,
      ], seed)
    }
    // moderne dominant, touche vintage
    if (newPct > 60 && oldPct < 25) {
      const oldTop = sorted.filter(d => d.decade <= 1980)[0]
      return pick([
        `T'écoutes surtout du récent, mais les ${oldTop?.label ?? 'classiques'} s'invitent quand même dans ta liste.`,
        `Ancré dans le présent, avec une parenthèse pour les classiques — un profil clairement tourné vers aujourd'hui.`,
        `La musique récente domine largement, les vieux classiques ne font que passer.`,
      ], seed + 'b')
    }
    // classique dominant, ouverture moderne
    if (oldPct > 60 && newPct < 25) {
      const newTop = sorted.filter(d => d.decade >= 2010)[0]
      return pick([
        `Ancré dans les classiques, avec quelques incursions dans les ${newTop?.label ?? 'années récentes'}.`,
        `T'es fidèle à la vieille garde — le présent musical ne te représente que peu.`,
        `Les classiques dominent, le moderne n'est là que pour varier un peu.`,
      ], seed + 'c')
    }
    // old+new sans dominance claire — continue vers les cas généraux
  }

  // 6. 2020s top
  if (top.decade === 2020) {
    return pick([
      `Les 2020s en tête — t'es clairement dans l'air du temps.`,
      `T'écoutes ce qui sort maintenant, et ça se reflète dans tes stats.`,
      `Ultra-récent en priorité — t'as une oreille sur ce qui se fait aujourd'hui.`,
    ], seed)
  }

  // 7. 2010s top
  if (top.decade === 2010) {
    return pick([
      `Les 2010s comme référence principale — une décennie riche qui te parle encore.`,
      `T'as grandi musicalement avec les 2010s, et ça reste ta boussole.`,
      `Les 2010s en tête — ni trop récent ni trop ancien, juste là où tu te sens bien.`,
    ], seed)
  }

  // 8. 2000s top
  if (top.decade === 2000) {
    return pick([
      `Les 2000s en tête — une décennie souvent sous-estimée mais que tu valorises vraiment.`,
      `Les années 2000, c'est ton repère principal — cette époque te parle plus que les autres.`,
      `T'as une vraie affection pour les 2000s, ça ressort clairement.`,
    ], seed)
  }

  // 9. 90s top
  if (top.decade === 1990) {
    return pick([
      `Les 90s au cœur de tout — une décennie qui a visiblement marqué et qui reste indétrônable.`,
      `Les 90s en tête : on ne se refait pas, et t'as pas l'air d'en avoir envie.`,
      `T'es profondément 90s — c'est une époque qui reste au-dessus de tout le reste pour toi.`,
    ], seed)
  }

  // 10. crushing dominant
  if (top.percentage > 70) {
    return pick([
      `Les ${top.label} dominent totalement — le reste ne fait que de la figuration.`,
      `C'est clair : les ${top.label}, c'est là où tu vis musicalement.`,
      `T'as beau avoir d'autres décennies, les ${top.label} reviennent toujours.`,
    ], seed)
  }

  // 11. wide spectrum (5+ décennies, écart top-last < 20)
  if (sorted.length >= 5 && top.percentage - sorted[sorted.length - 1].percentage < 20) {
    return pick([
      `Cinq décennies ou plus, toutes bien représentées — t'as aucune limite temporelle dans ta façon d'écouter.`,
      `T'es le genre de personne à écouter aussi bien un classique des 70s qu'une sortie de la semaine.`,
      `Ton écoute couvre un demi-siècle de musique sans accroc — c'est rare et ça dénote une vraie curiosité.`,
    ], seed)
  }

  // 12. balanced duo
  if (second && top.percentage + second.percentage > 65 && ratio12 < 2) {
    return pick([
      `Les ${top.label} et les ${second.label} se partagent ton attention — t'as un pied dans chaque camp.`,
      `Deux époques, un équilibre : les ${top.label} et les ${second.label} se disputent ta playlist.`,
      `T'oscilles entre les ${top.label} et les ${second.label} — deux repères qui pèsent autant l'un que l'autre.`,
    ], seed)
  }

  // 13. tight trio
  if (third && top.percentage + second!.percentage + third.percentage > 70 && top.percentage - third.percentage < 15) {
    return pick([
      `Les ${top.label}, ${second!.label} et ${third.label} se tiennent de près — une tranche d'histoire qui te colle à la peau.`,
      `Trois décennies presque à égalité : les ${top.label}, ${second!.label} et ${third.label} forment ton socle.`,
      `T'as trois décennies phares bien installées — les ${top.label}, ${second!.label} et ${third.label} tiennent la corde.`,
    ], seed)
  }

  // 14. clear leader
  if (top.percentage >= 50 && ratio12 > 2.2) {
    return pick([
      `Les ${top.label} sortent nettement du lot — le reste complète sans vraiment rivaliser.`,
      `T'as une base solide dans les ${top.label}, les autres décennies ne sont là que pour varier un peu.`,
      `Les ${top.label} en tête sans discussion — les autres s'en approchent pas.`,
    ], seed)
  }

  // 15. balanced spread
  if (sorted.length >= 3 && top.percentage - sorted[sorted.length - 1].percentage < 20) {
    return pick([
      `Plusieurs époques à des niveaux proches — t'as pas de décennie de référence, tu picores un peu partout.`,
      `T'écoutes de tout sur plusieurs décennies sans vraiment en privilégier une.`,
      `Aucune époque ne domine vraiment — t'as une façon de traverser le temps musical sans te fixer.`,
    ], seed)
  }

  // 16. default
  return pick([
    `Ton écoute traverse plusieurs décennies sans vraiment s'arrêter sur une en particulier.`,
    `T'as des affinités réparties sur différentes époques — difficile de te ranger dans une case.`,
    `Plusieurs décennies représentées, un profil qu'on résume pas facilement.`,
  ], seed)
}
