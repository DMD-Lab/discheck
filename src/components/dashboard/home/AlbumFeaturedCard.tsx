import Image from "next/image";
import { textStyles } from "@/components/ui/text-styles";
import type { TopAlbum } from "./TopAlbumsSection";
import { Star } from "lucide-react"
import MarqueeText from "@/components/ui/marquee-text"

export default function AlbumFeaturedCard({ album }: { album: TopAlbum }) {
  const date = new Date(album.ratedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="h-full flex items-center border border-bg-secondary rounded-lg p-3">
      <div className="relative flex-shrink-0 w-40 h-40 lg:w-52 lg:h-52 2xl:w-auto 2xl:h-auto 2xl:self-stretch 2xl:aspect-square">
        <Image
          src={album.coverXl}
          alt={album.title}
          fill
          sizes="(min-width: 1280px) 560px, 320px"
          className="rounded-lg object-cover"
          priority
        />
        <span className="absolute top-2 left-2 text-xs font-bold text-text-primary bg-bg-primary/70 backdrop-blur-sm rounded w-6 h-6 flex items-center justify-center">
          1
        </span>
      </div>

      <div className="flex flex-col justify-around self-stretch flex-1 min-h-0 min-w-0 px-5">
        <div className="min-w-0">
          <MarqueeText className={`${textStyles.cardTitle} font-semibold text-text-primary`}>
            {album.title}
          </MarqueeText>
          <p className={`${textStyles.caption} text-text-secondary mt-0.5`}>
            {album.artistName}
          </p>
          <p className={`${textStyles.caption} text-text-disabled mt-0.5`}>
            {date}
          </p>
        </div>
        <div className="flex items-center justify-around">
          <RatingBadge label="Note attrib." value={album.albumRating} size="lg" />
          <div className="w-px h-10 bg-border flex-shrink-0" />
          <RatingBadge label="Moy. tracks" value={album.trackAvg} size="lg" />
        </div>
      </div>
    </div>
  );
}

export function RatingBadge({ label, value, size = 'sm' }: {
  label: string
  value: number | null
  size?: 'lg' | 'sm'
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[10px] text-text-secondary">{label}</span>
      <span className="flex items-center gap-1">
        <Star size={size === 'lg' ? 16 : 13} className="text-text-green fill-text-green" />
        <span className={`${size === 'lg' ? textStyles.statLg : textStyles.statSm} text-text-primary`}>
          {value !== null ? value.toFixed(1).replace('.', ',') : "—"}
        </span>
      </span>
    </div>
  )
}
