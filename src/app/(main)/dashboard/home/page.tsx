import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import WelcomeBanner from "@/components/dashboard/home/WelcomeBanner";

const RETURN_MESSAGES = [
  "Content de te retrouver",
  "Prêt pour une nouvelle session",
  "De retour parmi nous",
  "Bonne écoute",
  "Qu'est-ce qu'on écoute aujourd'hui",
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

  const albumsEcoutes = new Set(
    listenedData?.map((t) => t.album_deezer_id).filter(Boolean),
  ).size;

  const heures = Math.round(
    (listenedData?.reduce((sum, t) => sum + (t.duration_seconds ?? 0), 0) ??
      0) / 3600,
  );

  return (
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
  );
}
