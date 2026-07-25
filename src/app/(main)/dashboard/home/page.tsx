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
    { data: listenedData },
    { count: albumsNotes },
    { count: tracksNotees },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("pseudo, created_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("listened_tracks")
      .select("track_deezer_id, album_deezer_id")
      .eq("user_id", user.id)
      .limit(10000),
    supabase
      .from("album_ratings")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("track_ratings")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  // top albums
  const { data: topAlbumRatings } = await supabase
    .from("album_ratings")
    .select("album_deezer_id, rating, rated_at")
    .eq("user_id", user.id)
    .order("rating", { ascending: false });

  let topAlbums: TopAlbum[] = [];

  if (topAlbumRatings && topAlbumRatings.length > 0) {
    const albumIds = topAlbumRatings.map((r) => r.album_deezer_id);

    const [{ data: albumsData }, { data: cachedTracksData }] =
      await Promise.all([
        supabase
          .from("cached_albums")
          .select("album_deezer_id, title, artist_name, cover_xl, album_data")
          .in("album_deezer_id", albumIds)
          .limit(10000),
        supabase
          .from("cached_tracks")
          .select("track_deezer_id, album_deezer_id")
          .in("album_deezer_id", albumIds)
          .limit(10000),
      ]);

    const trackIds = (cachedTracksData ?? []).map((t) => t.track_deezer_id);
    const { data: trackRatingsData } =
      trackIds.length > 0
        ? await supabase
            .from("track_ratings")
            .select("track_deezer_id, rating")
            .eq("user_id", user.id)
            .in("track_deezer_id", trackIds)
        : { data: [] };

    topAlbums = topAlbumRatings.map((r, i) => {
      const album = (albumsData ?? []).find(
        (a) => a.album_deezer_id === r.album_deezer_id,
      );
      const raw = album?.album_data as { title?: string; cover_xl?: string } | null;
      const tracks = (cachedTracksData ?? []).filter(
        (t) => t.album_deezer_id === r.album_deezer_id,
      );
      const ratings = (trackRatingsData ?? []).filter((tr) =>
        tracks.some((t) => t.track_deezer_id === tr.track_deezer_id),
      );
      const trackAvg =
        ratings.length > 0 && ratings.length === tracks.length
          ? Math.round(
              (ratings.reduce((s, tr) => s + tr.rating, 0) / ratings.length) *
                10,
            ) / 10
          : null;
      return {
        rank: i + 1,
        albumDeezerId: r.album_deezer_id,
        title: album?.title ?? raw?.title ?? "Album inconnu",
        artistName: album?.artist_name ?? "",
        coverXl: album?.cover_xl ?? raw?.cover_xl ?? "",
        albumRating: r.rating,
        trackAvg,
        hasAnyTrackRating: ratings.length > 0,
        ratedAt: r.rated_at,
      };
    });

    topAlbums = topAlbums
      .sort((a, b) => {
        if (b.albumRating !== a.albumRating) return b.albumRating - a.albumRating;
        const aHasAvg = a.trackAvg !== null;
        const bHasAvg = b.trackAvg !== null;
        if (aHasAvg !== bHasAvg) return bHasAvg ? 1 : -1;
        if (aHasAvg && bHasAvg && b.trackAvg! !== a.trackAvg!) return b.trackAvg! - a.trackAvg!;
        if (a.hasAnyTrackRating !== b.hasAnyTrackRating) return b.hasAnyTrackRating ? 1 : -1;
        return new Date(b.ratedAt).getTime() - new Date(a.ratedAt).getTime();
      })
      .slice(0, 5)
      .map((a, i) => ({ ...a, rank: i + 1 }));
  }

  // top artistes
  let topArtists: TopArtist[] = [];
  const { data: allTrackRatings } = await supabase
    .from("track_ratings")
    .select("track_deezer_id, rating")
    .eq("user_id", user.id)
    .limit(10000);

  if (allTrackRatings && allTrackRatings.length > 0) {
    const trackIds = allTrackRatings.map((r) => r.track_deezer_id);
    const { data: tracksForArtist } = await supabase
      .from("cached_tracks")
      .select("track_deezer_id, album_deezer_id")
      .in("track_deezer_id", trackIds)
      .limit(10000);

    if (tracksForArtist && tracksForArtist.length > 0) {
      const albumIdsForArtist = [...new Set(tracksForArtist.map((t) => t.album_deezer_id))];
      const { data: albumsForArtist } = await supabase
        .from("cached_albums")
        .select("album_deezer_id, artist_deezer_id, artist_name")
        .in("album_deezer_id", albumIdsForArtist);

      if (albumsForArtist && albumsForArtist.length > 0) {
        const artistIdsForTop = [...new Set(albumsForArtist.map((a) => a.artist_deezer_id).filter(Boolean))];
        const { data: artistsForTop } = await supabase
          .from("cached_artists")
          .select("artist_deezer_id, artist_data")
          .in("artist_deezer_id", artistIdsForTop);

        const artistMap = new Map<number, { totalRating: number; count: number; name: string; pictureXl: string }>();

        for (const tr of allTrackRatings) {
          const track = tracksForArtist.find((t) => t.track_deezer_id === tr.track_deezer_id);
          if (!track) continue;
          const album = albumsForArtist.find((a) => a.album_deezer_id === track.album_deezer_id);
          if (!album?.artist_deezer_id) continue;
          const artistId = album.artist_deezer_id;

          if (!artistMap.has(artistId)) {
            const artist = (artistsForTop ?? []).find((a) => a.artist_deezer_id === artistId);
            const raw = artist?.artist_data as { name?: string; picture_xl?: string } | null;
            artistMap.set(artistId, {
              name: album.artist_name ?? raw?.name ?? "",
              pictureXl: raw?.picture_xl ?? "",
              totalRating: 0,
              count: 0,
            });
          }
          const entry = artistMap.get(artistId)!;
          entry.totalRating += tr.rating;
          entry.count += 1;
        }

        topArtists = [...artistMap.entries()]
          .map(([artistId, data]) => ({
            rank: 0,
            artistDeezerId: artistId,
            name: data.name,
            pictureXl: data.pictureXl,
            avgRating: Math.round((data.totalRating / data.count) * 10) / 10,
            tracksRated: data.count,
          }))
          .filter((a) => a.tracksRated >= 5)
          .sort((a, b) => {
            if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
            return b.tracksRated - a.tracksRated;
          })
          .slice(0, 5)
          .map((a, i) => ({ ...a, rank: i + 1 }));
      }
    }
  }

  // tracks 5/5
  let topTracks: TopTrack[] = [];
  const { data: topTrackRatings } = await supabase
    .from("track_ratings")
    .select("track_deezer_id, rated_at")
    .eq("user_id", user.id)
    .eq("rating", 5)
    .order("rated_at", { ascending: false })
    .limit(5);

  if (topTrackRatings && topTrackRatings.length > 0) {
    const trackIds = topTrackRatings.map((r) => r.track_deezer_id);
    const { data: tracksForFav } = await supabase
      .from("cached_tracks")
      .select("track_deezer_id, album_deezer_id, track_data")
      .in("track_deezer_id", trackIds);

    const albumIdsForFav = [...new Set((tracksForFav ?? []).map((t) => t.album_deezer_id))];
    const { data: albumsForFav } = await supabase
      .from("cached_albums")
      .select("album_deezer_id, artist_name, cover_xl")
      .in("album_deezer_id", albumIdsForFav);

    topTracks = topTrackRatings.map((r) => {
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

  const albumsEcoutes = new Set(
    listenedData?.map((t) => t.album_deezer_id).filter(Boolean),
  ).size;

  const listenedTrackIds = (listenedData ?? []).map((t) => t.track_deezer_id);
  const { data: durationTracksData } =
    listenedTrackIds.length > 0
      ? await supabase
          .from("cached_tracks")
          .select("track_deezer_id, track_data")
          .in("track_deezer_id", listenedTrackIds)
          .limit(10000)
      : { data: [] };

  const trackDurationMap = new Map<number, number>();
  for (const t of durationTracksData ?? []) {
    const data = t.track_data as { duration?: number } | null;
    if (data?.duration) trackDurationMap.set(t.track_deezer_id, data.duration);
  }

  const heures = Math.round(
    (listenedData?.reduce(
      (sum, t) => sum + (trackDurationMap.get(t.track_deezer_id) ?? 0),
      0,
    ) ?? 0) / 3600,
  );

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
