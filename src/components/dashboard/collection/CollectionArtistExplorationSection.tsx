'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowRight, Check, Trophy, Clock } from 'lucide-react'
import { textStyles } from '@/components/ui/text-styles'
import InfoTooltip from '@/components/ui/InfoTooltip'
import Panel from '@/components/ui/panel'
import type { DepthItem } from '@/lib/insights/depth-insight'
import MarqueeText from '@/components/ui/marquee-text'

function CompletedRow({ item }: { item: DepthItem }) {
  return (
    <div className="flex-1 flex items-center gap-3 py-2 min-h-0">
      <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
        <Image src={item.pictureXl} alt={item.name} fill sizes="64px" className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <MarqueeText className={`${textStyles.body} font-medium text-text-primary`}>{item.name}</MarqueeText>
        <p className={`${textStyles.caption} text-text-secondary`}>{item.total} sortie{item.total > 1 ? 's' : ''}</p>
      </div>
      <span className={`${textStyles.caption} font-semibold text-text-green bg-bg-secondary px-2 py-0.5 rounded flex-shrink-0`}>
        Complétée
      </span>
    </div>
  )
}

function InProgressRow({ item }: { item: DepthItem }) {
  const remaining = item.total - item.listened
  return (
    <div className="flex-1 flex items-center gap-3 py-2 border-b border-border last:border-0 min-h-0">
      <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
        <Image src={item.pictureXl} alt={item.name} fill sizes="40px" className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="flex-1 min-w-0">
            <MarqueeText className={`${textStyles.body} font-medium text-text-primary`}>{item.name}</MarqueeText>
          </div>
          <span className={`${textStyles.caption} text-text-secondary flex-shrink-0`}>
            {remaining} sortie{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''}
          </span>
        </div>
        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${item.pct}%`, backgroundColor: 'var(--primary)' }}
          />
        </div>
      </div>
    </div>
  )
}

function CompletedPanelRow({ item }: { item: DepthItem }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
        <Image src={item.pictureXl} alt={item.name} fill sizes="40px" className="object-cover" />
      </div>
      <p className={`${textStyles.body} font-medium text-text-primary flex-1 min-w-0 truncate`}>{item.name}</p>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`${textStyles.caption} text-text-secondary`}>{item.total} sortie{item.total > 1 ? 's' : ''}</span>
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Check size={10} strokeWidth={3} className="text-white" />
        </span>
      </div>
    </div>
  )
}

function InProgressPanelRow({ item }: { item: DepthItem }) {
  const remaining = item.total - item.listened
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
        <Image src={item.pictureXl} alt={item.name} fill sizes="40px" className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${textStyles.body} font-medium text-text-primary truncate`}>{item.name}</p>
        <div className="mt-1.5 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${item.pct}%`, backgroundColor: 'var(--primary)' }}
          />
        </div>
      </div>
      <div className="flex flex-col items-end flex-shrink-0">
        <span className={`${textStyles.caption} text-text-secondary`}>{item.pct}%</span>
        <span className={`${textStyles.caption} text-text-disabled`}>{remaining} restante{remaining > 1 ? 's' : ''}</span>
      </div>
    </div>
  )
}

export default function CollectionArtistExplorationSection({ items }: { items: DepthItem[] }) {
  const [isCompletedPanelOpen, setIsCompletedPanelOpen] = useState(false)
  const [isInProgressPanelOpen, setIsInProgressPanelOpen] = useState(false)

  const completed = items.filter(i => i.pct === 100)
  const inProgress = items.filter(i => i.pct > 0 && i.pct < 100).sort((a, b) => b.pct - a.pct)

  const completedPreview = completed.slice(0, 3)
  const inProgressPreview = inProgress.slice(0, 5)

  if (completed.length === 0 && inProgress.length === 0) {
    return (
      <section className="border border-bg-secondary rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <h2 className={`${textStyles.cardTitle} text-text-green`}>Exploration des artistes</h2>
          <InfoTooltip text="Tes artistes divisés entre ceux que tu as entièrement explorés et ceux en cours. Le pourcentage correspond aux sorties cochées sur l'ensemble de leur discographie." />
        </div>
        <div className="h-40 flex items-center justify-center">
          <p className={`${textStyles.caption} text-text-secondary`}>Explore des artistes pour voir ta progression</p>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="border border-bg-secondary rounded-lg p-5 flex flex-col gap-4 h-full">
        <div className="flex items-center gap-2">
          <h2 className={`${textStyles.cardTitle} text-text-green`}>Exploration des artistes</h2>
          <InfoTooltip text="Tes artistes divisés entre ceux que tu as entièrement explorés et ceux en cours. Le pourcentage correspond aux sorties cochées sur l'ensemble de leur discographie." />
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6 lg:flex-1 lg:min-h-0">
          {completedPreview.length > 0 && (
            <div className="flex flex-col gap-3 min-w-0 lg:flex-1">
              <div className="flex items-center gap-2">
                <Trophy size={24} className="text-text-green flex-shrink-0" />
                <p className={`${textStyles.body} font-semibold text-text-primary`}>Discographies complétées</p>
              </div>
              <div className="flex flex-col min-h-0 lg:flex-1">
                {completedPreview.map(item => (
                  <CompletedRow key={item.artistDeezerId} item={item} />
                ))}
              </div>
              <button
                onClick={() => setIsCompletedPanelOpen(true)}
                className={`${textStyles.caption} text-text-primary hover:text-primary transition-colors flex items-center gap-1 self-start`}
              >
                Voir plus <ArrowRight size={12} />
              </button>
            </div>
          )}

          {completedPreview.length > 0 && inProgressPreview.length > 0 && (
            <div className="h-px w-full bg-border lg:h-auto lg:w-px lg:self-stretch flex-shrink-0" />
          )}

          {inProgressPreview.length > 0 && (
            <div className="flex flex-col gap-2 min-w-0 lg:flex-1">
              <div className="flex items-center gap-2">
                <Clock size={24} className="text-text-green flex-shrink-0" />
                <p className={`${textStyles.body} font-semibold text-text-primary`}>En cours</p>
              </div>
              <div className="flex flex-col min-h-0 lg:flex-1">
                {inProgressPreview.map(item => (
                  <InProgressRow key={item.artistDeezerId} item={item} />
                ))}
              </div>
              <button
                onClick={() => setIsInProgressPanelOpen(true)}
                className={`${textStyles.caption} text-text-primary hover:text-primary transition-colors flex items-center gap-1 self-start`}
              >
                Voir plus <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>
      </section>

      <Panel isOpen={isCompletedPanelOpen} onClose={() => setIsCompletedPanelOpen(false)}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-border flex-shrink-0 pr-12">
            <h2 className={`${textStyles.sectionTitle} text-text-green`}>Discographies complètes</h2>
            <p className={`${textStyles.caption} text-text-secondary mt-1`}>
              {completed.length} artiste{completed.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pt-4">
            {completed.map(item => (
              <CompletedPanelRow key={item.artistDeezerId} item={item} />
            ))}
          </div>
        </div>
      </Panel>

      <Panel isOpen={isInProgressPanelOpen} onClose={() => setIsInProgressPanelOpen(false)}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-border flex-shrink-0 pr-12">
            <h2 className={`${textStyles.sectionTitle} text-text-green`}>En cours</h2>
            <p className={`${textStyles.caption} text-text-secondary mt-1`}>
              {inProgress.length} artiste{inProgress.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pt-4">
            {inProgress.map(item => (
              <InProgressPanelRow key={item.artistDeezerId} item={item} />
            ))}
          </div>
        </div>
      </Panel>
    </>
  )
}
