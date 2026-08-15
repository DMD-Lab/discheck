import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import WelcomeBanner from "@/components/dashboard/home/WelcomeBanner";
import TopAlbumsSection from "@/components/dashboard/home/TopAlbumsSection";
import type { TopAlbum } from "@/components/dashboard/home/TopAlbumsSection";
import TopArtistesSection from "@/components/dashboard/home/TopArtistesSection";
import type { TopArtist } from "@/components/dashboard/home/TopArtistesSection";
import TracksFavoritesSection from "@/components/dashboard/home/TracksFavoritesSection";
import type { TopTrack } from "@/components/dashboard/home/TracksFavoritesSection";

const RETURN_MESSAGES = [
  "Content de te retrouver",
  "Prêt pour une nouvelle session",
  "De retour parmi nous",
  "Bonne écoute",
];

function getWelcomeMessage(createdAt: string | null): string {
  const isNewUser = createdAt
    ? Date.now() - new Date(createdAt).getTime() < 3_600_000
    : true;
  if (isNewUser) return "Bienvenue sur Discheck";
  return RETURN_MESSAGES[Math.floor(Math.random() * RETURN_MESSAGES.length)];
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile },
    { count: albumsNotes },
    { count: tracksNotees },
    { data: homeStats },
    { data: topAlbumsRaw },
    { data: topArtistsRaw },
    { data: favoriteTracksRaw },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("pseudo, created_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("album_ratings")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("track_ratings")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase.rpc("get_home_stats", { p_user_id: user.id }).single(),
    supabase.rpc("get_top_albums", { p_user_id: user.id, p_limit: 5 }),
    supabase.rpc("get_top_artists", { p_user_id: user.id, p_limit: 5 }),
    supabase.rpc("get_favorite_tracks", { p_user_id: user.id, p_limit: 5 }),
  ]);

  type TopAlbumRow = {
    album_deezer_id: number;
    album_rating: number;
    rated_at: string;
    track_avg: number | null;
    has_any_track_rating: boolean;
  };
  const topAlbumRows = (topAlbumsRaw ?? []) as TopAlbumRow[];

  // top albums
  let topAlbums: TopAlbum[] = [];

  if (topAlbumRows.length > 0) {
    const albumIds = topAlbumRows.map((r) => r.album_deezer_id);
    const { data: albumsData } = await supabase
      .from("cached_albums")
      .select("album_deezer_id, title, artist_name, cover_xl, album_data")
      .in("album_deezer_id", albumIds);

    topAlbums = topAlbumRows.map((r, i) => {
      const album = (albumsData ?? []).find(
        (a) => a.album_deezer_id === r.album_deezer_id,
      );
      const raw = album?.album_data as { title?: string; cover_xl?: string } | null;
      return {
        rank: i + 1,
        albumDeezerId: r.album_deezer_id,
        title: album?.title ?? raw?.title ?? "Album inconnu",
        artistName: album?.artist_name ?? "",
        coverXl: album?.cover_xl ?? raw?.cover_xl ?? "",
        albumRating: r.album_rating,
        trackAvg: r.track_avg,
        hasAnyTrackRating: r.has_any_track_rating,
        ratedAt: r.rated_at,
      };
    });
  }

  type TopArtistRow = {
    artist_deezer_id: number;
    tracks_rated: number;
    avg_rating: number;
  };
  const topArtistRows = (topArtistsRaw ?? []) as TopArtistRow[];

  // top artistes
  let topArtists: TopArtist[] = [];

  if (topArtistRows.length > 0) {
    const artistIds = topArtistRows.map((r) => r.artist_deezer_id);
    const { data: artistsData } = await supabase
      .from("cached_artists")
      .select("artist_deezer_id, artist_data")
      .in("artist_deezer_id", artistIds);

    topArtists = topArtistRows.map((r, i) => {
      const artist = (artistsData ?? []).find(
        (a) => a.artist_deezer_id === r.artist_deezer_id,
      );
      const raw = artist?.artist_data as { name?: string; picture_xl?: string } | null;
      return {
        rank: i + 1,
        artistDeezerId: r.artist_deezer_id,
        name: raw?.name ?? "",
        pictureXl: raw?.picture_xl ?? "",
        avgRating: r.avg_rating,
        tracksRated: r.tracks_rated,
      };
    });
  }

  type FavoriteTrackRow = { track_deezer_id: number; rated_at: string };
  const favoriteTrackRows = (favoriteTracksRaw ?? []) as FavoriteTrackRow[];

  // tracks 5/5
  let topTracks: TopTrack[] = [];

  if (favoriteTrackRows.length > 0) {
    const trackIds = favoriteTrackRows.map((r) => r.track_deezer_id);
    const { data: tracksForFav } = await supabase
      .from("cached_tracks")
      .select("track_deezer_id, album_deezer_id, track_data")
      .in("track_deezer_id", trackIds);

    const albumIdsForFav = [...new Set((tracksForFav ?? []).map((t) => t.album_deezer_id))];
    const { data: albumsForFav } = await supabase
      .from("cached_albums")
      .select("album_deezer_id, artist_name, cover_xl")
      .in("album_deezer_id", albumIdsForFav);

    topTracks = favoriteTrackRows.map((r) => {
      const track = (tracksForFav ?? []).find((t) => t.track_deezer_id === r.track_deezer_id);
      const album = (albumsForFav ?? []).find((a) => a.album_deezer_id === track?.album_deezer_id);
      const raw = track?.track_data as { title?: string } | null;
      return {
        trackDeezerId: r.track_deezer_id,
        title: raw?.title ?? "Track inconnue",
        artistName: album?.artist_name ?? "",
        coverXl: album?.cover_xl ?? "",
        ratedAt: r.rated_at,
      };
    });
  }

  type HomeStatsRow = { albums_listened: number; hours_listened: number };
  const stats = homeStats as HomeStatsRow | null;
  const albumsEcoutes = stats?.albums_listened ?? 0;
  const heures = Math.round(stats?.hours_listened ?? 0);

  return (
    <>
      <WelcomeBanner
        pseudo={profile?.pseudo ?? ""}
        message={getWelcomeMessage(profile?.created_at ?? null)}
        stats={{
          albumsEcoutes,
          albumsNotes: albumsNotes ?? 0,
          tracksNotees: tracksNotees ?? 0,
          heures,
        }}
      />
      <TopAlbumsSection albums={topAlbums} />
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 2xl:gap-0 mb-6">
        <TopArtistesSection artists={topArtists} />
        <TracksFavoritesSection tracks={topTracks} />
      </div>
    </>
  );
}
