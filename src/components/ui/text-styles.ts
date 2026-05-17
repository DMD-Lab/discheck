/**
 * Échelle typographique Discheck — DMD Lab
 *
 * Chaque rôle encode taille + poids + interligne de base.
 * Les couleurs (text-text-primary, etc.) et modificateurs
 * supplémentaires (font-medium, leading-relaxed…) se combinent par-dessus.
 *
 * Usage : className={`${textStyles.pageTitle} text-text-primary`}
 */
export const textStyles = {
  /** 48px bold tight — hero landing, nom d'artiste prominent */
  display:      'text-3xl font-bold leading-tight md:text-5xl',
  /** 36px bold tight — titre H1 de chaque page */
  pageTitle:    'text-2xl font-bold leading-tight md:text-4xl',
  /** 24px bold — titre de section, panel header */
  sectionTitle: 'text-xl font-bold md:text-2xl',
  /** 18px semibold — empty states, titres de cards */
  cardTitle:    'text-lg font-semibold',
  /** 16px regular relaxed — descriptions, sous-titres longs */
  bodyLg:       'text-base leading-relaxed',
  /** 14px regular — contenu par défaut (95% de l'UI) */
  body:         'text-sm',
  /** 12px regular — méta, timestamps, labels discrets */
  caption:      'text-xs',
  /** 12px medium uppercase — en-têtes de colonnes, tags */
  overline:     'text-xs font-medium uppercase tracking-wide',
  /** 20px bold tight — logo "Discheck" partout */
  branding:     'text-xl font-bold tracking-tight',
} as const
