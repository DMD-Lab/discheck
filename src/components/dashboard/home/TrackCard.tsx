import Image from "next/image";
import { Star } from "lucide-react";
import { textStyles } from "@/components/ui/text-styles";
import MarqueeText from "@/components/ui/marquee-text";
import type { TopTrack } from "./TracksFavoritesSection";

export default function TrackCard({ track }: { track: TopTrack }) {
  const date = new Date(track.ratedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex items-center gap-3 px-4 py-1.5">
      <div className="relative w-9 h-9 flex-shrink-0">
        {track.coverXl ? (
          <Image
            src={track.coverXl}
            alt={track.title}
            fill
            sizes="36px"
            className="rounded object-cover"
          />
        ) : (
          <div className="w-full h-full rounded bg-bg-tertiary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <MarqueeText
          className={`${textStyles.caption} font-medium text-text-primary`}
          fromColor="from-bg-secondary"
        >
          {track.title}
        </MarqueeText>
        <p className={`${textStyles.caption} text-text-secondary truncate`}>
          {track.artistName}
        </p>
      </div>
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
        <div className="flex items-center gap-1">
          <Star size={11} className="text-text-green fill-text-green" />
          <span className={`${textStyles.caption} font-semibold text-text-primary`}>
            5
          </span>
        </div>
        <span className="text-[10px] text-text-disabled">{date}</span>
      </div>
    </div>
  );
}
