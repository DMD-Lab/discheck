import { revealError, revealOwnError } from './reveal'

export const PASSWORD_MIN_LENGTH = 6

function getPasswordOwnError(password: string): string | null {
  if (password.length === 0) return 'Le mot de passe est requis.'
  if (password.length < PASSWORD_MIN_LENGTH) return `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`
  return null
}

// login: skip the length rule
export function getLoginPasswordError(password: string): string | null {
  return password.length === 0 ? 'Le mot de passe est requis.' : null
}

export function getLoginPasswordDisplayError(attempted: boolean, committedPassword: string, livePassword: string): string | null {
  if (!attempted) return null
  return revealOwnError(committedPassword, livePassword, getLoginPasswordError)
}

// confirm silent while password empty
function getConfirmOwnError(password: string, confirmPassword: string): { error: string | null; mismatch: boolean } {
  if (password.length === 0) return { error: null, mismatch: false }
  if (confirmPassword.length === 0) return { error: 'Veuillez confirmer votre mot de passe.', mismatch: false }
  const mismatch = confirmPassword !== password
  return { error: mismatch ? 'Les mots de passe ne correspondent pas.' : null, mismatch }
}

interface PasswordPairErrors {
  passwordError: string | null
  passwordRed: boolean
  confirmError: string | null
  confirmRed: boolean
}

export function getPasswordPairErrors(password: string, confirmPassword: string): PasswordPairErrors {
  const passwordError = getPasswordOwnError(password)
  const { error: confirmError, mismatch } = getConfirmOwnError(password, confirmPassword)
  return {
    passwordError,
    passwordRed: passwordError !== null || mismatch,
    confirmError,
    confirmRed: confirmError !== null,
  }
}

interface PasswordPair {
  password: string
  confirmPassword: string
}

// same reveal timing, for the pair
export function revealPasswordPairErrors(attempted: boolean, committed: PasswordPair, live: PasswordPair): PasswordPairErrors {
  if (!attempted) return { passwordError: null, passwordRed: false, confirmError: null, confirmRed: false }

  const passwordError = revealOwnError(committed.password, live.password, getPasswordOwnError)

  const committedConfirm = getConfirmOwnError(committed.password, committed.confirmPassword)
  const liveConfirm = getConfirmOwnError(live.password, live.confirmPassword)
  const confirmError = revealError(committed.confirmPassword, live.confirmPassword, committedConfirm.error, liveConfirm.error)
  const confirmMismatchShown = confirmError !== null && committedConfirm.mismatch

  return {
    passwordError,
    passwordRed: passwordError !== null || confirmMismatchShown,
    confirmError,
    confirmRed: confirmError !== null,
  }
}

function getOldPasswordOwnError(oldPassword: string): string | null {
  return oldPassword.length === 0 ? 'Le mot de passe actuel est requis.' : null
}

function getNewPasswordOwnError(oldPassword: string, newPassword: string): string | null {
  if (newPassword.length === 0) return 'Le nouveau mot de passe est requis.'
  if (newPassword.length < PASSWORD_MIN_LENGTH) return `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`
  if (oldPassword.length > 0 && newPassword === oldPassword) return 'Le nouveau mot de passe doit être différent de l\'actuel.'
  return null
}

function getNewConfirmOwnError(newPassword: string, confirmPassword: string): { error: string | null; mismatch: boolean } {
  if (newPassword.length === 0) return { error: null, mismatch: false }
  if (confirmPassword.length === 0) return { error: 'Veuillez confirmer le nouveau mot de passe.', mismatch: false }
  const mismatch = confirmPassword !== newPassword
  return { error: mismatch ? 'Les mots de passe ne correspondent pas.' : null, mismatch }
}

interface ChangePasswordFields {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

interface ChangePasswordErrors {
  oldPasswordError: string | null
  newPasswordError: string | null
  newPasswordRed: boolean
  confirmError: string | null
  confirmRed: boolean
}

export function getChangePasswordErrors(oldPassword: string, newPassword: string, confirmPassword: string): ChangePasswordErrors {
  const oldPasswordError = getOldPasswordOwnError(oldPassword)
  const newPasswordError = getNewPasswordOwnError(oldPassword, newPassword)
  const { error: confirmError, mismatch } = getNewConfirmOwnError(newPassword, confirmPassword)
  return {
    oldPasswordError,
    newPasswordError,
    newPasswordRed: newPasswordError !== null || mismatch,
    confirmError,
    confirmRed: confirmError !== null,
  }
}

export function revealChangePasswordErrors(
  attempted: boolean,
  committed: ChangePasswordFields,
  live: ChangePasswordFields,
): ChangePasswordErrors {
  if (!attempted) return { oldPasswordError: null, newPasswordError: null, newPasswordRed: false, confirmError: null, confirmRed: false }

  const oldPasswordError = revealOwnError(committed.oldPassword, live.oldPassword, getOldPasswordOwnError)

  const committedNewError = getNewPasswordOwnError(committed.oldPassword, committed.newPassword)
  const liveNewError = getNewPasswordOwnError(live.oldPassword, live.newPassword)
  const newPasswordError = revealError(committed.newPassword, live.newPassword, committedNewError, liveNewError)

  const committedConfirm = getNewConfirmOwnError(committed.newPassword, committed.confirmPassword)
  const liveConfirm = getNewConfirmOwnError(live.newPassword, live.confirmPassword)
  const confirmError = revealError(committed.confirmPassword, live.confirmPassword, committedConfirm.error, liveConfirm.error)
  const confirmMismatchShown = confirmError !== null && committedConfirm.mismatch

  return {
    oldPasswordError,
    newPasswordError,
    newPasswordRed: newPasswordError !== null || confirmMismatchShown,
    confirmError,
    confirmRed: confirmError !== null,
  }
}
