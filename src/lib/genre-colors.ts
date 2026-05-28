export const GENRE_COLORS: Record<number, string> = {
  2:   '#D97706', // Musique africaine  — amber
  12:  '#0F766E', // Musique arabe      — teal
  16:  '#DC2626', // Musique asiatique  — red
  52:  '#2563EB', // Chanson française  — blue
  75:  '#16A34A', // Musique brésilienne— green
  81:  '#EA580C', // Musique indienne   — orange
  84:  '#78350F', // Country            — brown
  85:  '#475569', // Alternative        — slate
  95:  '#BE185D', // Jeunesse           — pink
  98:  '#4338CA', // Classique          — indigo
  106: '#0891B2', // Electro            — cyan
  113: '#7C3AED', // Dance              — violet
  116: '#6D28D9', // Rap/Hip Hop        — purple
  129: '#B45309', // Jazz               — gold
  132: '#DB2777', // Pop                — hot pink
  144: '#15803D', // Reggae             — dark green
  152: '#B91C1C', // Rock               — dark red
  153: '#1D4ED8', // Blues              — dark blue
  165: '#C2410C', // R&B                — burnt orange
  169: '#D97706', // Soul & Funk        — amber (distinct via name)
  173: '#4C1D95', // Films/Jeux vidéo   — deep purple
  197: '#E11D48', // Latino             — rose
  457: '#6B7280', // Livres audio       — gray
  464: '#1E293B', // Metal              — near black
  466: '#92400E', // Folk               — dark amber
}

export const GENRE_FALLBACK_COLOR = '#374151'

export function getGenreColor(genreId: number): string {
  return GENRE_COLORS[genreId] ?? GENRE_FALLBACK_COLOR
}
