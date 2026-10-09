'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AppButton from '@/components/ui/AppButton'
import Modal from '@/components/ui/Modal'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import PasswordField from '@/components/ui/PasswordField'
import { textStyles } from '@/components/ui/text-styles'
import { PASSWORD_MIN_LENGTH, getChangePasswordErrors, revealChangePasswordErrors } from '@/lib/validation/password'

interface EditPasswordModalProps {
  email: string
  onClose: () => void
}

const EMPTY_FIELDS = { oldPassword: '', newPassword: '', confirmPassword: '' }

export default function EditPasswordModal({ email, onClose }: EditPasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [attempted, setAttempted] = useState(false)
  const [committed, setCommitted] = useState(EMPTY_FIELDS)
  const [oldPasswordServerError, setOldPasswordServerError] = useState<string | null>(null)

  const fields = getChangePasswordErrors(oldPassword, newPassword, confirmPassword)
  const canSave = !fields.oldPasswordError && !fields.newPasswordError && !fields.confirmError

  const { oldPasswordError, newPasswordError, newPasswordRed, confirmError, confirmRed } = revealChangePasswordErrors(
    attempted,
    committed,
    { oldPassword, newPassword, confirmPassword },
  )
  const oldPasswordDisplayError = oldPasswordServerError ?? oldPasswordError

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) { setCommitted({ oldPassword, newPassword, confirmPassword }); setAttempted(true); return }
    setError('')
    setOldPasswordServerError(null)
    setSaving(true)
    const supabase = createClient()

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password: oldPassword })
    if (authError) {
      setSaving(false)
      setOldPasswordServerError('Mot de passe actuel incorrect.')
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)

    if (updateError) {
      setError('Une erreur est survenue.')
      return
    }

    onClose()
  }

  return (
    <Modal title="Changer le mot de passe" onClose={onClose}>
      {saving && <LoadingOverlay />}
      <form onSubmit={handleSave} noValidate className="p-4 flex flex-col gap-3">
        <div>
          <PasswordField
            placeholder="Mot de passe actuel"
            value={oldPassword}
            onChange={v => { setOldPassword(v); setOldPasswordServerError(null) }}
            autoComplete="current-password"
            error={!!oldPasswordDisplayError}
          />
          {oldPasswordDisplayError && <p className={`${textStyles.caption} text-error mt-1`}>{oldPasswordDisplayError}</p>}
        </div>
        <div>
          <PasswordField
            placeholder="Nouveau mot de passe"
            value={newPassword}
            onChange={setNewPassword}
            minLength={PASSWORD_MIN_LENGTH}
            autoComplete="new-password"
            error={newPasswordRed}
          />
          {newPasswordError && <p className={`${textStyles.caption} text-error mt-1`}>{newPasswordError}</p>}
        </div>
        <div>
          <PasswordField
            placeholder="Confirmer le nouveau mot de passe"
            value={confirmPassword}
            onChange={setConfirmPassword}
            minLength={PASSWORD_MIN_LENGTH}
            autoComplete="new-password"
            error={confirmRed}
          />
          {confirmError && <p className={`${textStyles.caption} text-error mt-1`}>{confirmError}</p>}
        </div>

        {error && <p className={`${textStyles.caption} text-error`}>{error}</p>}

        <AppButton
          type="submit"
          variant="primary"
          size="sm"
          fullWidth
          className="mt-1"
        >
          Enregistrer
        </AppButton>
      </form>
    </Modal>
  )
}
