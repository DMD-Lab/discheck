import type { ReactNode } from 'react'
import ShareOptionCard from '@/components/album/ShareOptionCard'
import { useAutoHeight } from '@/hooks/useAutoHeight'

export type ShareMode = 'quick' | 'favorites' | 'complete'

interface ShareModeSelectorProps {
  mode: ShareMode
  onChange: (mode: ShareMode) => void
  completeDisabled: boolean
  favoritesSlot?: ReactNode
}

export default function ShareModeSelector({ mode, onChange, completeDisabled, favoritesSlot }: ShareModeSelectorProps) {
  const { containerRef, contentRef } = useAutoHeight(mode === 'favorites')

  return (
    <div className="flex flex-col divide-y divide-white/5">
      <ShareOptionCard
        title="Ma note uniquement"
        info="Affiche uniquement la pochette et la note que tu as attribuée à l'album, sans détail des titres."
        selected={mode === 'quick'}
        onSelect={() => onChange('quick')}
      />

      <ShareOptionCard
        title="Ma note + Mes titres préférés"
        info="Choisis jusqu'à 5 titres à mettre en avant, dans l'ordre où tu les sélectionnes. Ils n'ont pas besoin d'être notés."
        selected={mode === 'favorites'}
        onSelect={() => onChange('favorites')}
      >
        <div ref={containerRef} className="overflow-hidden" style={{ height: 0 }}>
          <div ref={contentRef} className="pt-3">{favoritesSlot}</div>
        </div>
      </ShareOptionCard>

      <ShareOptionCard
        title="Toutes mes notes"
        info="Affiche la liste complète des titres notés avec leur note, ainsi que la moyenne de l'album."
        disabledReason="Disponible une fois l'album entièrement écouté et noté."
        selected={mode === 'complete'}
        disabled={completeDisabled}
        onSelect={() => onChange('complete')}
      />
    </div>
  )
}
