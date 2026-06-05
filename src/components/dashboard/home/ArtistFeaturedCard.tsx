import Image from "next/image";
import { Star } from "lucide-react";
import { textStyles } from "@/components/ui/text-styles";
import MarqueeText from "@/components/ui/marquee-text";
import type { TopArtist } from "./TopArtistesSection";

export default function ArtistFeaturedCard({ artist }: { artist: TopArtist }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <div className="relative w-36 h-36 lg:w-40 lg:h-40 flex-shrink-0">
        {artist.pictureXl ? (
          <Image
            src={artist.pictureXl}
            alt={artist.name}
            fill
            sizes="112px"
            className="rounded-full object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full rounded-full bg-bg-tertiary" />
        )}
        <span className="absolute -top-2 -left-2 text-xs font-bold text-text-primary bg-bg-tertiary rounded w-6 h-6 flex items-center justify-center">
          1
        </span>
      </div>

      <div className="flex flex-col items-center gap-1 min-w-0 w-full text-center">
        <MarqueeText className={`${textStyles.caption} font-semibold text-text-primary`}>
          {artist.name}
        </MarqueeText>
        <div className="flex items-center gap-1">
          <Star size={13} className="text-text-green fill-text-green" />
          <span className={`${textStyles.statSm} text-text-primary`}>
            {artist.avgRating.toFixed(1).replace('.', ',')}
          </span>
        </div>
        <p className={`${textStyles.caption} text-text-disabled`}>
          {artist.tracksRated} tracks notés
        </p>
      </div>
    </div>
  );
}
