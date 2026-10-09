import { revealOwnError } from './reveal'

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmailFormat(email: string): boolean {
  return EMAIL_PATTERN.test(email)
}

export function getEmailError(email: string): string | null {
  if (email.length === 0) return "L'email est requis."
  if (isValidEmailFormat(email)) return null
  return 'Adresse email invalide.'
}

export function getEmailDisplayError(attempted: boolean, committedEmail: string, liveEmail: string): string | null {
  if (!attempted) return null
  return revealOwnError(committedEmail, liveEmail, getEmailError)
}
