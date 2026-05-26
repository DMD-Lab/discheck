import Image from "next/image";
import { Star } from "lucide-react";
import { textStyles } from "@/components/ui/text-styles";
import MarqueeText from "@/components/ui/marquee-text";
import type { TopArtist } from "./TopArtistesSection";

export default function ArtistSmallCard({ artist }: { artist: TopArtist }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 flex-1">
      <span className="text-xs font-bold text-text-primary bg-bg-tertiary rounded w-6 h-6 flex items-center justify-center flex-shrink-0">
        {artist.rank}
      </span>
      <div className="relative w-9 h-9 flex-shrink-0">
        {artist.pictureXl ? (
          <Image
            src={artist.pictureXl}
            alt={artist.name}
            fill
            sizes="36px"
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-bg-tertiary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <MarqueeText
          className={`${textStyles.caption} font-medium text-text-primary`}
          fromColor="from-bg-secondary"
        >
          {artist.name}
        </MarqueeText>
        <p className={`${textStyles.caption} text-text-disabled`}>
          {artist.tracksRated} tracks notés
        </p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Star size={11} className="text-text-green fill-text-green" />
        <span className={`${textStyles.caption} font-semibold text-text-primary`}>
          {artist.avgRating.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
