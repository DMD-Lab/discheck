import type { PickerMode } from '@/components/dashboard/recap/RecapPicker'

export const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

export function periodSuffix(mode: PickerMode): string {
  return mode === 'year' ? "de l'année" : 'du mois'
}

export function periodThis(mode: PickerMode): string {
  return mode === 'year' ? 'cette année' : 'ce mois-ci'
}

const ELIDED_MONTHS = new Set([3, 7, 9])

export function monthWithPreposition(month: number): string {
  const name = MONTH_NAMES[month - 1].toLowerCase()
  return ELIDED_MONTHS.has(month - 1) ? `d'${name}` : `de ${name}`
}

export function periodAt(mode: PickerMode, year: number, month: number): string {
  return mode === 'year' ? `en ${year}` : `en ${MONTH_NAMES[month - 1].toLowerCase()} ${year}`
}
