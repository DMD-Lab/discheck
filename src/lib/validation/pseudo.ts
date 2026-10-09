import { revealOwnError } from './reveal'

export const PSEUDO_MIN_LENGTH = 3
export const PSEUDO_MAX_LENGTH = 20
export const PSEUDO_CHARSET_PATTERN = /^[a-zA-Z0-9]*$/

export function getPseudoError(pseudo: string): string | null {
  if (pseudo.length === 0) return 'Le pseudo est requis.'
  const lengthOk = pseudo.length >= PSEUDO_MIN_LENGTH && pseudo.length <= PSEUDO_MAX_LENGTH
  const charsetOk = PSEUDO_CHARSET_PATTERN.test(pseudo)
  if (lengthOk && charsetOk) return null
  return `Le pseudo doit contenir entre ${PSEUDO_MIN_LENGTH} et ${PSEUDO_MAX_LENGTH} caractères, lettres et chiffres uniquement.`
}

export function getPseudoDisplayError(attempted: boolean, committedPseudo: string, livePseudo: string): string | null {
  if (!attempted) return null
  return revealOwnError(committedPseudo, livePseudo, getPseudoError)
}
