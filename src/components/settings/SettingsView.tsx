'use client'

import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useTransitionRouter } from 'next-view-transitions'
import { createClient } from '@/lib/supabase/client'
import AppButton from '@/components/ui/AppButton'
import { textStyles } from '@/components/ui/text-styles'
import EditPseudoModal from './EditPseudoModal'
import EditPasswordModal from './EditPasswordModal'
import DeleteAccountModal from './DeleteAccountModal'

type ModalType = 'pseudo' | 'password' | 'delete' | null

interface SettingsViewProps {
  userId: string
  email: string
  initialPseudo: string
  version: string
}

export default function SettingsView({ userId, email, initialPseudo, version }: SettingsViewProps) {
  const router = useTransitionRouter()
  const [pseudo, setPseudo] = useState(initialPseudo)
  const [openModal, setOpenModal] = useState<ModalType>(null)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  function handlePseudoSaved(newPseudo: string) {
    setPseudo(newPseudo)
    router.refresh() // syncs sidebar pseudo
  }

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-6 md:px-8 lg:px-16 lg:py-12 flex-1 flex flex-col">
      <h1 className={`${textStyles.pageTitle} text-text-green mb-8`}>Paramètres</h1>

      <div className="max-w-lg flex flex-col gap-10">

        {/* WIP WHITE THEME — section Apparence (toggle thème clair/sombre)
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-4 py-3 rounded-md hover:bg-bg-secondary transition-colors">
            <div className="flex items-center gap-3">
              <Moon size={16} className="theme-dark-only text-text-secondary" />
              <Sun size={16} className="theme-light-only text-text-secondary" />
              <div>
                <p className={`${textStyles.body} font-medium text-text-primary`}>Apparence</p>
                <p className={`theme-dark-only ${textStyles.caption} text-text-secondary`}>Mode sombre</p>
                <p className={`theme-light-only ${textStyles.caption} text-text-secondary`}>Mode clair</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="toggle-track relative w-10 h-6 rounded-full transition-colors"
            >
              <span className="toggle-knob absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm" />
            </button>
          </div>
        </div>
        */}

        <section>
          <h2 className={`${textStyles.sectionTitle} text-text-primary mb-2`}>Profil</h2>
          <div className="flex flex-col divide-y divide-border">
            <InfoRow label="Pseudo" value={pseudo} onEdit={() => setOpenModal('pseudo')} />
            <InfoRow label="Email" value={email} />
            <InfoRow label="Mot de passe" value="********" masked onEdit={() => setOpenModal('password')} />
          </div>
        </section>
      </div>

      <div className="max-w-lg mt-auto flex flex-col gap-4">
        {/* mobile only, sidebar has it on desktop */}
        <div className="md:hidden">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 ${textStyles.body} text-text-secondary hover:text-error transition-colors`}
          >
            <LogOut size={15} />
            Se déconnecter
          </button>
        </div>

        <div className="pt-6 border-t border-border flex flex-col gap-3">
          <div>
            <p className={`${textStyles.caption} text-text-disabled`}>Discheck v{version}</p>
            <p className={`${textStyles.caption} text-text-disabled mt-1`}>Une app <span className="text-text-secondary">DMD Lab</span></p>
          </div>
          <AppButton variant="danger" className={`self-start p-0 ${textStyles.caption}`} onClick={() => setOpenModal('delete')}>
            Supprimer mon compte
          </AppButton>
        </div>
      </div>

      {openModal === 'pseudo' && (
        <EditPseudoModal
          userId={userId}
          currentPseudo={pseudo}
          onSaved={handlePseudoSaved}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === 'password' && (
        <EditPasswordModal email={email} onClose={() => setOpenModal(null)} />
      )}
      {openModal === 'delete' && (
        <DeleteAccountModal pseudo={pseudo} onClose={() => setOpenModal(null)} />
      )}
    </div>
  )
}

function InfoRow({ label, value, masked, onEdit }: {
  label: string
  value: string
  masked?: boolean
  onEdit?: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3.5">
      <div className="min-w-0">
        <p className={`${textStyles.caption} text-text-disabled`}>{label}</p>
        <p className={`${textStyles.body} text-text-primary truncate ${masked ? 'tracking-widest' : ''}`}>{value}</p>
      </div>
      {onEdit && (
        <AppButton variant="outline" size="xs" onClick={onEdit} className="flex-shrink-0">
          Modifier
        </AppButton>
      )}
    </div>
  )
}
