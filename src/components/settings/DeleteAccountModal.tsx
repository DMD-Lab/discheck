'use client'

import { useState } from 'react'
import { useTransitionRouter } from 'next-view-transitions'
import { createClient } from '@/lib/supabase/client'
import AppButton from '@/components/ui/AppButton'
import Modal from '@/components/ui/Modal'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { textStyles } from '@/components/ui/text-styles'

interface DeleteAccountModalProps {
  pseudo: string
  onClose: () => void
}

export default function DeleteAccountModal({ pseudo, onClose }: DeleteAccountModalProps) {
  const router = useTransitionRouter()
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const canDelete = confirmText === pseudo

  async function handleDelete() {
    if (!canDelete) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/account/delete', { method: 'POST' })
    if (!res.ok) {
      setError('Une erreur est survenue. Réessayez plus tard.')
      setLoading(false)
      return
    }
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <Modal title="Supprimer mon compte" variant="danger" onClose={onClose}>
      {loading && <LoadingOverlay />}
      <div className="p-4 flex flex-col gap-3">
        <p className={`${textStyles.body} text-text-secondary leading-relaxed`}>
          Cette action est définitive : votre discographie suivie, vos écoutes et vos notes seront supprimées.
        </p>
        <p className={`${textStyles.caption} text-text-disabled`}>
          Pour confirmer, tapez votre pseudo <span className="text-text-primary font-medium">{pseudo}</span> ci-dessous.
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className={`bg-bg-primary border border-border rounded-lg px-3 py-2.5 ${textStyles.body} text-text-primary outline-none focus:[border-color:var(--color-error)] transition-colors`}
        />
        {error && <p className={`${textStyles.caption} text-error`}>{error}</p>}
        <AppButton
          variant="primary"
          size="sm"
          fullWidth
          disabled={!canDelete}
          onClick={handleDelete}
          className="hover:opacity-90"
          style={{ backgroundColor: 'var(--color-error)' }}
        >
          Supprimer définitivement mon compte
        </AppButton>
      </div>
    </Modal>
  )
}
