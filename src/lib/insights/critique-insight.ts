export interface CritiqueModeStats {
  distribution: Record<1 | 2 | 3 | 4 | 5, number>
  average: number
  total: number
}

export interface CritiqueStats {
  albums: CritiqueModeStats
  tracks: CritiqueModeStats
}

export function emptyCritiqueModeStats(): CritiqueModeStats {
  return { distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, average: 0, total: 0 }
}

export function getCritiqueInsight(stats: CritiqueModeStats, mode: 'albums' | 'tracks'): string {
  const { distribution: d, average, total } = stats
  const a = mode === 'albums'

  if (total === 0) return ''

  if (total === 1) {
    return a
      ? "Tu as noté un seul album pour l'instant. Trop tôt pour cerner ton profil critique."
      : "Première track notée. Reviens quand tu en auras quelques autres."
  }

  if (total < 5) {
    return a
      ? "Tu commences à noter tes albums. Quelques notes de plus et ton profil se dessinera."
      : "Trop peu de tracks notées pour dégager un profil. Continue, ça se précisera."
  }

  const pct = (n: number) => n / total

  const highPct  = pct(d[4] + d[5])
  const lowPct   = pct(d[1] + d[2])
  const midPct   = pct(d[3])
  const fivePct  = pct(d[5])
  const fourPct  = pct(d[4])
  const onePct   = pct(d[1])
  const polarPct = highPct + lowPct

  if (d[5] === total) return a
    ? "Tu n'attribues que des 5/5. Tu réserves tes notes aux albums qui te transportent vraiment."
    : "Toutes tes tracks notées ont un 5/5. Tu notes uniquement tes coups de cœur absolus."

  if (d[4] === total) return a
    ? "Tous tes albums notés ont un 4/5. Tu apprécies ce que tu écoutes, avec un fond d'exigence."
    : "Toutes tes tracks ont un 4/5. Un niveau d'exigence constant, modéré mais présent."

  if (d[3] === total) return a
    ? "Tous tes albums ont un 3/5. Le 3 est ton satisfecit général, sans enthousiasme ni rejet."
    : "Toutes tes tracks ont un 3/5. Tu notes prudemment, sans te mouiller."

  if (d[2] === total) return a
    ? "Tous tes albums ont un 2/5. Tu écoutes souvent des artistes qui te déçoivent un peu."
    : "Toutes tes tracks ont un 2/5. Tu notes ce qui te déçoit, sans aller jusqu'au rejet total."

  if (d[1] === total) return a
    ? "Tu n'attribues que des 1/5. Tu notes exclusivement tes déceptions profondes."
    : "Toutes tes tracks ont un 1/5. Tu notes uniquement ce que tu ne supportes pas."

  const usedRatings = ([1, 2, 3, 4, 5] as const).filter(r => d[r] > 0)
  if (usedRatings.length === 2) {
    const [lo, hi] = usedRatings
    if (lo === 1 && hi === 5) return a
      ? "Tu n'utilises que le 1 et le 5. Tes jugements sont absolus : chef-d'œuvre ou catastrophe."
      : "Tes tracks obtiennent un 1 ou un 5, rien entre les deux. Tout ou rien."
    if (lo === 4 && hi === 5) return a
      ? "Tes albums n'ont que des 4 ou des 5. Tu écoutes vraiment ce que tu aimes."
      : "Tes tracks n'ont que des 4 ou des 5. Tu notes uniquement ce qui te touche vraiment."
    if (lo === 1 && hi === 2) return a
      ? "Tes albums n'ont que des 1 ou des 2. Tu notes exclusivement tes déceptions."
      : "Tes tracks n'ont que des 1 ou des 2. Tu notes principalement ce qui te déçoit."
    if (lo === 1 && hi === 3) return a
      ? "Tes albums oscillent entre 1 et 3. Tu es exigeant et les bonnes surprises se font attendre."
      : "Tes tracks oscillent entre 1 et 3. Tu notes sévèrement et les bonnes surprises sont rares."
    if (lo === 3 && hi === 5) return a
      ? "Tes albums sont soit honorables, soit excellents. Pas de mauvaises surprises."
      : "Tes tracks oscillent entre correct et excellent. Tu skipes probablement ce qui ne te plait pas."
  }

  if (polarPct > 0.82 && highPct > 0.35 && lowPct > 0.30) return a
    ? "Tes notes sont très tranchées. Presque pas de 3/5, tu adores ou tu détestes."
    : "Tes notes de tracks sont binaires. Les hits à 5, les mauvaises à 1, peu d'entre-deux."

  if (polarPct > 0.65 && midPct < 0.15 && highPct > 0.30 && lowPct > 0.25) return a
    ? "Tu évites le 3/5. Tes avis sont généralement tranchés, dans un sens comme dans l'autre."
    : "Tu distribues peu de 3/5. Tes tracks sont rarement « moyennes » dans ton esprit."

  if (fivePct > 0.65 && average >= 4.3) return a
    ? "Le 5/5 est ta note dominante. Tu réserves tes écoutes aux albums qui te parlent vraiment."
    : "Tu distribues les 5/5 avec générosité. Tu notes surtout quand tu es sous le charme."

  if (highPct > 0.80 && average >= 4.5) return a
    ? "Tu es très généreux. La quasi-totalité de tes albums récoltent un 4 ou 5/5."
    : "Tu es très généreux avec tes tracks. Presque tout mérite un 4 ou 5 dans ta bibliothèque."

  if (fourPct > 0.50 && average >= 3.8) return a
    ? "Le 4/5 est ta note de référence. Tu apprécies ce que tu écoutes, avec une exigence mesurée."
    : "Le 4/5 revient très souvent dans tes tracks. Tu sais reconnaître une bonne chanson."

  if (highPct > 0.60 && average >= 3.8) return a
    ? "Tu notes haut. Tu écoutes probablement des artistes que tu apprécies déjà beaucoup."
    : "Tes tracks sont globalement bien notées. Tu notes peut-être surtout ce qui te plait."

  if (average >= 3.5) return a
    ? "Tes notes penchent vers le positif, avec une vraie sélectivité pour les 5."
    : "Tes tracks sont notées légèrement au-dessus de la moyenne. Tu sais identifier tes favoris."

  if (midPct > 0.45 && average >= 2.8 && average <= 3.3) return a
    ? "Le 3/5 est ta note dominante. Un profil équilibré, sans excès dans un sens ou dans l'autre."
    : "Le 3/5 revient souvent dans tes tracks. Tu notes avec prudence, entre enthousiasme et déception."

  if (average >= 2.8 && average <= 3.5 && polarPct > 0.60) return a
    ? "Tu aimes ou tu n'aimes pas. Peu de 3/5, beaucoup d'extrêmes dans tes notes."
    : "Tes appréciations de tracks sont contrastées. Peu de milieu, beaucoup d'extrêmes."

  if (average >= 2.8 && average <= 3.5) return a
    ? "Ton profil est nuancé. Tu distingues bien ce que tu aimes de ce qui te laisse froid."
    : "Tes notes de tracks sont équilibrées. Tu sais faire la différence entre une bonne chanson et une mauvaise."

  if (onePct > 0.55) return a
    ? "Tu n'hésites pas à sanctionner d'un 1/5. Tu notes surtout ce qui te déçoit profondément."
    : "Le 1/5 est ta note la plus fréquente. Tu notes principalement ce que tu ne supportes pas."

  if (lowPct > 0.65 && average < 2.0) return a
    ? "Tu notes très sévèrement. Peu d'albums méritent plus d'un 2/5 à tes yeux."
    : "Tu es impitoyable avec tes tracks. Très peu passent la barre du 3/5."

  if (average < 2.0) return a
    ? "Tu es un critique exigeant. Tes standards sont élevés et tes notes le montrent clairement."
    : "Tu es très sévère avec tes tracks. Le 5/5 est une note rare dans ta bibliothèque."

  if (lowPct > 0.50 && average < 2.5) return a
    ? "Tu notes sévèrement. Les bonnes notes sont réservées à une poignée d'albums."
    : "Tu es exigeant avec tes tracks. Les bonnes notes ne s'obtiennent pas facilement."

  if (average < 2.5) return a
    ? "Tu es exigeant. La moyenne de tes albums peine à dépasser le 3/5."
    : "Tu distribues peu de bonnes notes. Les tracks que tu aimes vraiment ressortent clairement."

  if (average < 2.8) return a
    ? "Tu regardes tes albums d'un œil critique. Les bons sont rares, les mauvais sont sanctionnés."
    : "Tu es un peu sévère avec tes tracks. Les bonnes notes récompensent les vraies pépites."

  if (total >= 100) return a
    ? `Avec ${total} albums notés, ton profil critique est bien établi. Tu notes avec constance.`
    : `Avec ${total} tracks notées, tu as un profil de critique actif. Tes standards sont clairs.`

  return a
    ? "Ton profil de notation est équilibré. Tu évalues tes albums avec un regard nuancé."
    : "Ton profil de notation est équilibré. Tu évalues tes tracks avec un regard nuancé."
}
