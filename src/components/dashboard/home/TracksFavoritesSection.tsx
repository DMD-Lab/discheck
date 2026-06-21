'use client'

import { useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import { textStyles } from "@/components/ui/text-styles";
import TrackCard from "./TrackCard";
import Panel from "@/components/ui/panel";
import TracksRanking from "./tracks-ranking";

export type TopTrack = {
  trackDeezerId: number;
  title: string;
  artistName: string;
  coverXl: string;
  ratedAt: string;
};

export default function TracksFavoritesSection({ tracks }: { tracks: TopTrack[] }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  if (tracks.length === 0) {
    return (
      <section className="2xl:pl-6">
        <div className="flex items-center pb-3 mb-3 border-b border-border">
          <h2 className={`${textStyles.cardTitle} text-text-green`}>Tracks Favorites</h2>
        </div>
        <div className="min-h-[244px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center p-6">
            <Star size={28} className="text-text-disabled" />
            <p className={`${textStyles.caption} text-text-secondary max-w-[200px]`}>
              Note tes tracks 5/5 pour les retrouver ici
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="2xl:pl-6">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
          <h2 className={`${textStyles.cardTitle} text-text-green`}>
            Tracks Favorites
          </h2>
          <button
            onClick={() => setIsPanelOpen(true)}
            className={`${textStyles.caption} text-text-primary hover:text-primary transition-colors flex items-center gap-1`}
          >
            Voir plus
            <ArrowRight size={12} />
          </button>
        </div>

        <div className="flex flex-col divide-y divide-border">
          {tracks.map((track) => (
            <TrackCard key={track.trackDeezerId} track={track} />
          ))}
        </div>
      </section>

      <Panel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)}>
        <TracksRanking />
      </Panel>
    </>
  );
}
