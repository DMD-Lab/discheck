'use client'

import { useState } from "react";
import { ArrowRight, Mic2 } from "lucide-react";
import { textStyles } from "@/components/ui/text-styles";
import InfoTooltip from "@/components/ui/InfoTooltip";
import ArtistFeaturedCard from "./ArtistFeaturedCard";
import ArtistSmallCard from "./ArtistSmallCard";
import Panel from "@/components/ui/panel";
import ArtistsRanking from "./artists-ranking";

export type TopArtist = {
  rank: number;
  artistDeezerId: number;
  name: string;
  pictureXl: string;
  avgRating: number;
  tracksRated: number;
};

export default function TopArtistesSection({ artists }: { artists: TopArtist[] }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  if (artists.length === 0) {
    return (
      <section className="2xl:pr-6 2xl:border-r 2xl:border-border">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-border">
          <h2 className={`${textStyles.cardTitle} text-text-green`}>Top Artistes</h2>
          <InfoTooltip text="Tes artistes classés par note moyenne sur leurs titres. Il faut au moins 5 titres notés pour apparaître." />
        </div>
        <div className="md:min-h-[243px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center p-6">
            <Mic2 size={28} className="text-text-disabled" />
            <p className={`${textStyles.caption} text-text-secondary max-w-[200px]`}>
              Note au moins 5 tracks d&apos;un artiste pour le voir ici
            </p>
          </div>
        </div>
      </section>
    )
  }

  const [featured, ...rest] = artists;

  return (
    <>
      <section className="2xl:pr-6 2xl:border-r 2xl:border-border">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className={`${textStyles.cardTitle} text-text-green`}>Top Artistes</h2>
            <InfoTooltip text="Tes artistes classés par note moyenne sur leurs titres. Il faut au moins 5 titres notés pour apparaître." />
          </div>
          <button
            onClick={() => setIsPanelOpen(true)}
            className={`${textStyles.caption} text-text-primary hover:text-primary transition-colors flex items-center gap-1`}
          >
            Voir plus
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Mobile — liste simple */}
        <div className="flex md:hidden flex-col divide-y divide-border">
          {artists.map((artist) => (
            <ArtistSmallCard key={artist.rank} artist={artist} />
          ))}
        </div>

        {/* md+ — featured + liste */}
        <div className="hidden md:flex gap-4 items-stretch">
          <div className="flex-shrink-0 w-[200px] lg:w-[220px]">
            <ArtistFeaturedCard artist={featured} />
          </div>
          <div className="flex-1 flex flex-col divide-y divide-border min-w-0">
            {rest.map((artist) => (
              <ArtistSmallCard key={artist.rank} artist={artist} />
            ))}
          </div>
        </div>
      </section>

      <Panel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)}>
        <ArtistsRanking />
      </Panel>
    </>
  );
}
