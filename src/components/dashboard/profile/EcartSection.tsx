'use client'

import { useState } from 'react'
import { ArrowRight, Scale } from 'lucide-react'
import Image from 'next/image'
import { textStyles } from '@/components/ui/text-styles'
import MarqueeText from '@/components/ui/marquee-text'
import type { EcartItem } from '@/lib/insights/ecart-insight'
import { getEcartInsight } from '@/lib/insights/ecart-insight'
import Panel from '@/components/ui/panel'
import { RatingBadge } from '@/components/dashboard/home/AlbumFeaturedCard'

function EcartCard({ item }: { item: EcartItem }) {
  return (
    <div className="flex flex-col border border-bg-secondary rounded-lg overflow-hidden">
      <div className="relative w-full h-32">
        <Image
          src={item.coverXl}
          alt={item.title}
          fill
          sizes="(min-width: 1280px) 20vw, 30vw"
          className="object-cover"
        />
      </div>
      <div className="p-3 flex flex-col gap-2">
        <div className="min-w-0">
          <MarqueeText className={`${textStyles.body} font-medium text-text-primary`}>{item.title}</MarqueeText>
          <MarqueeText className={`${textStyles.caption} text-text-secondary`}>{item.artistName}</MarqueeText>
        </div>
        <div className="flex items-center border-t border-border pt-2">
          <div className="flex-1 flex justify-center">
            <RatingBadge label="Note album" value={item.albumRating} />
          </div>
          <div className="w-px h-8 bg-border flex-shrink-0" />
          <div className="flex-1 flex justify-center">
            <RatingBadge label="Moy. tracks" value={item.trackAvg} />
          </div>
        </div>
      </div>
    </div>
  )
}

function EcartRow({ item }: { item: EcartItem }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden">
        <Image src={item.coverXl} alt={item.title} fill sizes="40px" className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <MarqueeText className={`${textStyles.body} text-text-primary`}>{item.title}</MarqueeText>
        <MarqueeText className={`${textStyles.caption} text-text-secondary`}>{item.artistName}</MarqueeText>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <RatingBadge label="Note album" value={item.albumRating} />
        <div className="w-px h-8 bg-border flex-shrink-0" />
        <RatingBadge label="Moy. tracks" value={item.trackAvg} />
      </div>
    </div>
  )
}

export default function EcartSection({ items }: { items: EcartItem[] }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const insight = getEcartInsight(items)
  const preview = items.slice(0, 3)

  if (items.length === 0) {
    return (
      <section className="border border-bg-secondary rounded-lg p-5 h-full">
        <div className="mb-3">
          <h2 className={`${textStyles.cardTitle} text-text-green`}>Écarts de notes</h2>
        </div>
        <div className="min-h-[160px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <Scale size={45} className="text-text-disabled w-7 h-7 md:w-[45px] md:h-[45px]" />
            <p className={`${textStyles.caption} text-text-secondary max-w-[240px]`}>
              Note tous les titres d&apos;un album pour voir l&apos;écart avec ta note globale
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="border border-bg-secondary rounded-lg p-5 h-full">
        <div className="flex items-center justify-between mb-1">
          <h2 className={`${textStyles.cardTitle} text-text-green`}>Écarts de notes</h2>
          {items.length > 3 && (
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

        <div className="flex flex-col divide-y divide-border sm:hidden">
          {preview.map(item => (
            <EcartRow key={item.albumDeezerId} item={item} />
          ))}
        </div>
        <div className="hidden sm:grid grid-cols-3 gap-3">
          {preview.map(item => (
            <EcartCard key={item.albumDeezerId} item={item} />
          ))}
        </div>
      </section>

      <Panel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-border flex-shrink-0 pr-12">
            <h2 className={`${textStyles.sectionTitle} text-text-green`}>Écarts de notes</h2>
            <p className={`${textStyles.caption} text-text-secondary mt-1`}>
              Albums dont tous les titres ont été notés
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pt-4">
            <div className="flex flex-col divide-y divide-border">
              {items.map(item => (
                <EcartRow key={item.albumDeezerId} item={item} />
              ))}
            </div>
          </div>
        </div>
      </Panel>
    </>
  )
}
