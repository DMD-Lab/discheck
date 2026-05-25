import Image from "next/image";
import { textStyles } from "@/components/ui/text-styles";
import type { TopAlbum } from "./TopAlbumsSection";
import { RatingBadge } from "./AlbumFeaturedCard";
import MarqueeText from '@/components/ui/marquee-text'

export default function AlbumSmallCard({
  album,
  priority = false,
}: {
  album: TopAlbum;
  priority?: boolean;
}) {
  const date = new Date(album.ratedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="h-full flex flex-col min-w-0 border border-bg-secondary rounded-lg p-3 gap-2">
      <div className="relative w-full h-36 flex-shrink-0">
        <Image
          src={album.coverXl}
          alt={album.title}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 85vw"
          className="object-cover rounded-lg"
          priority={priority}
        />
        <span className="absolute top-2 left-2 text-xs font-bold text-text-primary bg-bg-primary/70 backdrop-blur-sm rounded w-6 h-6 flex items-center justify-center">
          {album.rank}
        </span>
      </div>
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div className="min-w-0">
          <MarqueeText className={`${textStyles.caption} font-medium text-text-primary`}>
            {album.title}
          </MarqueeText>
          <MarqueeText className={`${textStyles.caption} text-text-secondary`}>
            {album.artistName}
          </MarqueeText>
          <p className={`${textStyles.caption} text-text-disabled mt-0.5`}>{date}</p>
        </div>
        <div className="flex items-center border-t border-border pt-2 mt-2">
          <span className="flex-1 flex justify-center">
            <RatingBadge label="Note attrib." value={album.albumRating} />
          </span>
          <div className="w-px h-10 bg-border flex-shrink-0" />
          <span className="flex-1 flex justify-center">
            <RatingBadge label="Moy. tracks" value={album.trackAvg} />
          </span>
        </div>
      </div>
    </div>
  )
}
