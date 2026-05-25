import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import WelcomeBanner from "@/components/dashboard/home/WelcomeBanner";
import TopAlbumsSection from "@/components/dashboard/home/TopAlbumsSection";
import type { TopAlbum } from "@/components/dashboard/home/TopAlbumsSection";

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
      .select("album_deezer_id, duration_seconds")
      .eq("user_id", user.id),
    supabase
      .from("album_ratings")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("track_ratings")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  // Top 5 albums notés
  const { data: topAlbumRatings } = await supabase
    .from("album_ratings")
    .select("album_deezer_id, rating, rated_at")
    .eq("user_id", user.id)
    .order("rating", { ascending: false })
    .limit(5);

  let topAlbums: TopAlbum[] = [];

  if (topAlbumRatings && topAlbumRatings.length > 0) {
    const albumIds = topAlbumRatings.map((r) => r.album_deezer_id);

    const [{ data: albumsData }, { data: cachedTracksData }] =
      await Promise.all([
        supabase
          .from("cached_albums")
          .select("album_deezer_id, title, artist_name, cover_xl")
          .in("album_deezer_id", albumIds),
        supabase
          .from("cached_tracks")
          .select("track_deezer_id, album_deezer_id")
          .in("album_deezer_id", albumIds),
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
      const tracks = (cachedTracksData ?? []).filter(
        (t) => t.album_deezer_id === r.album_deezer_id,
      );
      const ratings = (trackRatingsData ?? []).filter((tr) =>
        tracks.some((t) => t.track_deezer_id === tr.track_deezer_id),
      );
      const trackAvg =
        ratings.length > 0
          ? Math.round(
              (ratings.reduce((s, tr) => s + tr.rating, 0) / ratings.length) *
                10,
            ) / 10
          : null;
      return {
        rank: i + 1,
        albumDeezerId: r.album_deezer_id,
        title: album?.title ?? "Album inconnu",
        artistName: album?.artist_name ?? "",
        coverXl: album?.cover_xl ?? "",
        albumRating: r.rating,
        trackAvg,
        ratedAt: r.rated_at,
      };
    });
  }

  const albumsEcoutes = new Set(
    listenedData?.map((t) => t.album_deezer_id).filter(Boolean),
  ).size;

  const heures = Math.round(
    (listenedData?.reduce((sum, t) => sum + (t.duration_seconds ?? 0), 0) ??
      0) / 3600,
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
    </>
  );
}
