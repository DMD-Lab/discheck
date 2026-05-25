'use client'

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { textStyles } from "@/components/ui/text-styles";
import AlbumFeaturedCard from "./AlbumFeaturedCard";
import AlbumSmallCard from "./AlbumSmallCard";
import Panel from "@/components/ui/panel";
import AlbumsRanking from "./albums-ranking";

export type TopAlbum = {
  rank: number;
  albumDeezerId: number;
  title: string;
  artistName: string;
  coverXl: string;
  albumRating: number;
  trackAvg: number | null;
  hasAnyTrackRating: boolean;
  ratedAt: string;
};

export default function TopAlbumsSection({ albums }: { albums: TopAlbum[] }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  if (albums.length === 0) return null;
  const [featured, ...rest] = albums;

  return (
    <>
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <h2 className={`${textStyles.cardTitle} text-text-green`}>
          Vos albums préférés
        </h2>
        <button
          onClick={() => setIsPanelOpen(true)}
          className={`${textStyles.caption} text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1`}
        >
          Voir plus
          <ArrowRight size={12} />
        </button>
      </div>

      {/* Mobile — carrousel snap */}
      <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-3 -mr-4 pr-4 pb-2 [scrollbar-width:none]">
        {albums.map((album) => (
          <div key={album.rank} className="snap-start flex-shrink-0 w-[85%]">
            <AlbumSmallCard album={album} priority={album.rank <= 2} />
          </div>
        ))}
      </div>

      {/* Tablet md (768–1023px) */}
      <div className="hidden md:flex lg:hidden flex-col gap-4">
        <AlbumFeaturedCard album={featured} />
        <div className="grid grid-cols-2 gap-4">
          {rest.map((album) => (
            <AlbumSmallCard key={album.rank} album={album} priority={album.rank === 2} />
          ))}
        </div>
      </div>

      {/* Laptop + xl (1024–1535px) */}
      <div className="hidden lg:flex 2xl:hidden flex-col gap-4">
        <AlbumFeaturedCard album={featured} />
        <div className="grid grid-cols-4 gap-4">
          {rest.map((album) => (
            <AlbumSmallCard key={album.rank} album={album} priority={album.rank === 2} />
          ))}
        </div>
      </div>

      {/* Desktop 2xl (1536px+) */}
      <div className="hidden 2xl:flex gap-4 items-stretch">
        <div className="flex-shrink-0 2xl:w-[560px]">
          <AlbumFeaturedCard album={featured} />
        </div>
        <div className="flex-1 grid grid-cols-4 gap-4 min-w-0">
          {rest.map((album) => (
            <AlbumSmallCard key={album.rank} album={album} priority={album.rank === 2} />
          ))}
        </div>
      </div>
    </section>

    <Panel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)}>
      <AlbumsRanking />
    </Panel>
    </>
  );
}
