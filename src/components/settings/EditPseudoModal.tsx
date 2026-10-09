'use client'

import { useState } from 'react'
import { User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AppButton from '@/components/ui/AppButton'
import Modal from '@/components/ui/Modal'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { textStyles } from '@/components/ui/text-styles'
import { PSEUDO_MAX_LENGTH, getPseudoError, getPseudoDisplayError } from '@/lib/validation/pseudo'

interface EditPseudoModalProps {
  userId: string
  currentPseudo: string
  onSaved: (pseudo: string) => void
  onClose: () => void
}

export default function EditPseudoModal({ userId, currentPseudo, onSaved, onClose }: EditPseudoModalProps) {
  const [pseudo, setPseudo] = useState(currentPseudo)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [attempted, setAttempted] = useState(false)
  const [committed, setCommitted] = useState(currentPseudo)

  const unchanged = pseudo === currentPseudo
  const canSave = !unchanged && !getPseudoError(pseudo)
  const pseudoError = getPseudoDisplayError(attempted, committed, pseudo)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) { setCommitted(pseudo); setAttempted(true); return }
    setSaving(true)
    setError('')

    const supabase = createClient()
    const { error: updateError } = await supabase.from('profiles').update({ pseudo }).eq('id', userId)
    setSaving(false)

    if (updateError) {
      setError(updateError.code === '23505' ? 'Ce pseudo est déjà pris.' : 'Une erreur est survenue.')
      return
    }

    onSaved(pseudo)
    onClose()
  }

  return (
    <Modal title="Modifier le pseudo" onClose={onClose}>
      {saving && <LoadingOverlay />}
      <form onSubmit={handleSave} noValidate className="p-4 flex flex-col gap-2">
        <div className={`flex items-center gap-2.5 bg-bg-primary border rounded-lg px-3 py-2.5 transition-colors ${
          pseudoError ? 'border-error' : 'border-border focus-within:[border-color:var(--primary)]'
        }`}>
          <span className="text-text-disabled flex-shrink-0"><User size={15} /></span>
          <input
            type="text"
            value={pseudo}
            onChange={e => setPseudo(e.target.value)}
            autoFocus
            autoComplete="off"
            maxLength={PSEUDO_MAX_LENGTH}
            className={`flex-1 bg-transparent ${textStyles.body} text-text-primary outline-none`}
          />
        </div>
        {pseudoError && <p className={`${textStyles.caption} text-error mt-1`}>{pseudoError}</p>}

        {error && <p className={`${textStyles.caption} text-error`}>{error}</p>}

        <AppButton
          type="submit"
          variant="primary"
          size="sm"
          fullWidth
          disabled={unchanged}
          className="mt-2"
        >
          Enregistrer
        </AppButton>
      </form>
    </Modal>
  )
}
