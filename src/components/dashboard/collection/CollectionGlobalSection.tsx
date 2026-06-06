import { Headphones, Disc3, Timer, Mic2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { textStyles } from '@/components/ui/text-styles'

export type StatDelta = {
  value: string
  pctChange: number | null
}

export type CollectionGlobalStats = {
  tracksListened: StatDelta
  albumsCompleted: StatDelta
  listeningTimeHours: StatDelta
  artistsExplored: StatDelta
}

function DeltaBadge({ pctChange }: { pctChange: number | null }) {
  if (pctChange === null) return <span className={`${textStyles.body} text-text-disabled`}>—</span>
  const positive = pctChange >= 0
  return (
    <span className={`text-xs font-semibold lg:text-sm px-1.5 py-0.5 rounded-full ${
      positive ? 'bg-text-green/15 text-text-green' : 'bg-red-500/15 text-red-400'
    }`}>
      {positive ? '+' : ''}{pctChange}%
    </span>
  )
}

function StatWidget({
  icon: Icon,
  value,
  label,
  pctChange,
}: {
  icon: LucideIcon
  value: string
  label: string
  pctChange: number | null
}) {
  return (
    <div className="lg:flex-1 flex flex-col items-center gap-3 px-4 py-4 sm:px-6 bg-bg-primary lg:bg-transparent">
      <Icon size={36} className="text-text-green w-6 h-6 lg:w-9 lg:h-9" />
      <span className={`${textStyles.statLg} text-text-primary tabular-nums leading-none`}>{value}</span>
      <span className={`${textStyles.caption} text-text-secondary text-center`}>{label}</span>
      <DeltaBadge pctChange={pctChange} />
    </div>
  )
}

export default function CollectionGlobalSection({ stats }: { stats: CollectionGlobalStats }) {
  const { tracksListened, albumsCompleted, listeningTimeHours, artistsExplored } = stats

  return (
    <div className="flex flex-col gap-4">
      <h2 className={`${textStyles.cardTitle} text-text-green`}>Collection globale</h2>
      <div className="grid grid-cols-2 gap-px bg-border lg:flex lg:bg-transparent lg:gap-0 lg:divide-x lg:divide-border">
        <StatWidget
          icon={Headphones}
          value={tracksListened.value}
          label="Tracks écoutées"
          pctChange={tracksListened.pctChange}
        />
        <StatWidget
          icon={Disc3}
          value={albumsCompleted.value}
          label="Albums / EP terminés"
          pctChange={albumsCompleted.pctChange}
        />
        <StatWidget
          icon={Mic2}
          value={artistsExplored.value}
          label="Artistes explorés"
          pctChange={artistsExplored.pctChange}
        />
        <StatWidget
          icon={Timer}
          value={listeningTimeHours.value}
          label="Temps d'écoute"
          pctChange={listeningTimeHours.pctChange}
        />
      </div>
    </div>
  )
}
