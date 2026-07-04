'use client'

import { useState } from 'react'
import { ArrowRight, Users } from 'lucide-react'
import InfoTooltip from '@/components/ui/InfoTooltip'
import Image from 'next/image'
import { textStyles } from '@/components/ui/text-styles'
import MarqueeText from '@/components/ui/marquee-text'
import Panel from '@/components/ui/panel'
import type { DepthItem } from '@/lib/insights/depth-insight'
import { getDepthInsight } from '@/lib/insights/depth-insight'

const COL_ARTIST = 'w-36 md:w-48 flex-shrink-0'
const COL_COMPLETION = 'w-14 flex-shrink-0'
const COL_SORTIES = 'w-24 flex-shrink-0 ml-3'

function TableHeader() {
  return (
    <div className="flex items-center gap-3 pb-2 border-b border-border">
      <div className={COL_ARTIST}>
        <span className={`${textStyles.overline} text-text-disabled sm:hidden`}>Artistes</span>
        <span className={`${textStyles.overline} text-text-disabled hidden sm:inline`}>Artistes les plus écoutés</span>
      </div>
      <div className="flex-1" />
      <div className={`${COL_COMPLETION} text-right`}>
        <span className={`${textStyles.overline} text-text-disabled`}>Complétion</span>
      </div>
      <div className={`${COL_SORTIES} text-center`}>
        <span className={`${textStyles.overline} text-text-disabled`}>Sorties</span>
      </div>
    </div>
  )
}

function ArtistRow({ item }: { item: DepthItem }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="flex-1 sm:flex-none sm:w-36 md:w-48 sm:flex-shrink-0 flex items-center gap-2 min-w-0">
        <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
          <Image src={item.pictureXl} alt={item.name} fill sizes="32px" className="object-cover" />
        </div>
        <MarqueeText className={`${textStyles.body} text-text-primary`}>{item.name}</MarqueeText>
      </div>
      <div className="flex-1 hidden sm:block">
        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${item.pct}%`, backgroundColor: 'var(--primary)' }}
          />
        </div>
      </div>
      <div className={`${COL_COMPLETION} text-right`}>
        <span className={`${textStyles.caption} text-text-secondary`}>{item.pct}%</span>
      </div>
      <div className={`${COL_SORTIES} text-center`}>
        <span className={`${textStyles.caption} text-text-secondary`}>{item.listened}/{item.total}</span>
      </div>
    </div>
  )
}

function ArtistPanelRow({ item }: { item: DepthItem }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="flex-1 sm:flex-none sm:w-36 md:w-48 sm:flex-shrink-0 flex items-center gap-2 min-w-0">
        <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
          <Image src={item.pictureXl} alt={item.name} fill sizes="36px" className="object-cover" />
        </div>
        <MarqueeText className={`${textStyles.body} text-text-primary`} fromColor="from-bg-secondary">{item.name}</MarqueeText>
      </div>
      <div className="flex-1 hidden sm:block">
        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${item.pct}%`, backgroundColor: 'var(--primary)' }}
          />
        </div>
      </div>
      <div className={`${COL_COMPLETION} text-right`}>
        <span className={`${textStyles.caption} text-text-secondary`}>{item.pct}%</span>
      </div>
      <div className={`${COL_SORTIES} text-center`}>
        <span className={`${textStyles.caption} text-text-secondary`}>{item.listened}/{item.total}</span>
      </div>
    </div>
  )
}

export default function DepthSection({ items }: { items: DepthItem[] }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const insight = getDepthInsight(items)
  const preview = items.slice(0, 5)
  const total = items.length
  const avgPct = total > 0 ? Math.round(items.reduce((a, b) => a + b.pct, 0) / total) : 0
  const completedCount = items.filter(i => i.pct === 100).length

  if (items.length === 0) {
    return (
      <section className="border border-bg-secondary rounded-lg p-5">
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <h2 className={`${textStyles.cardTitle} text-text-green`}>Profondeur d&apos;écoute</h2>
            <InfoTooltip text="Le pourcentage de discographie exploré pour chaque artiste. Plus le chiffre est proche de 100%, plus tu as couvert l'intégralité de ses sorties." />
          </div>
        </div>
        <div className="min-h-[160px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <Users size={45} className="text-text-disabled w-7 h-7 md:w-[45px] md:h-[45px]" />
            <p className={`${textStyles.caption} text-text-secondary max-w-[240px]`}>
              Écoute des albums d&apos;artistes pour voir ta progression ici
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="border border-bg-secondary rounded-lg p-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h2 className={`${textStyles.cardTitle} text-text-green`}>Profondeur d&apos;écoute</h2>
            <InfoTooltip text="Le pourcentage de discographie exploré pour chaque artiste. Plus le chiffre est proche de 100%, plus tu as couvert l'intégralité de ses sorties." />
          </div>
          {items.length > 5 && (
            <button
              onClick={() => setIsPanelOpen(true)}
              className={`${textStyles.caption} text-text-primary hover:text-primary transition-colors flex items-center gap-1`}
            >
              Voir plus
              <ArrowRight size={12} />
            </button>
          )}
        </div>

        {insight && (
          <p className={`${textStyles.caption} text-text-secondary mt-1 mb-4`}>{insight}</p>
        )}

        <div className="flex flex-col gap-6 xl:grid xl:grid-cols-3 xl:gap-6">
          <div className="flex flex-col justify-between bg-bg-secondary rounded-lg p-6">
            <div className="flex flex-col items-center gap-2 py-3 sm:py-4">
              <div className="border-2 border-primary rounded-full p-3">
                <Users size={36} className="text-primary" />
              </div>
              <span className={`${textStyles.statLg} text-text-primary tabular-nums leading-none mt-1`}>{total}</span>
              <span className={`${textStyles.caption} text-text-secondary text-center`}>Artistes écoutés</span>
            </div>
            <div className="border-t border-border pt-4 flex flex-col gap-2.5">
              <p className={`${textStyles.caption} text-text-secondary leading-snug`}>
                Tu explores en moyenne <span className="text-primary font-bold">{avgPct}%</span> des sorties de chaque artiste
              </p>
              <p className={`${textStyles.caption} text-text-secondary leading-snug`}>
                Tu as entièrement exploré <span className="text-primary font-bold">{completedCount}</span> artiste{completedCount > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="col-span-2 min-w-0">
            <TableHeader />
            <div className="flex flex-col divide-y divide-border">
              {preview.map(item => (
                <ArtistRow key={item.artistDeezerId} item={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <Panel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-border flex-shrink-0 pr-12">
            <h2 className={`${textStyles.sectionTitle} text-text-green`}>Profondeur d&apos;écoute</h2>
            <p className={`${textStyles.caption} text-text-secondary mt-1`}>
              {total} artiste{total > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pt-4">
            <TableHeader />
            <div className="flex flex-col divide-y divide-border">
              {items.map(item => (
                <ArtistPanelRow key={item.artistDeezerId} item={item} />
              ))}
            </div>
          </div>
        </div>
      </Panel>
    </>
  )
}
