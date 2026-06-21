-- Profiles utilisateurs (complète auth.users de Supabase)
CREATE TABLE profiles (
  id         uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  pseudo     text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Cache artistes Deezer (JSONB — données brutes Deezer)
CREATE TABLE cached_artists (
  artist_deezer_id bigint PRIMARY KEY,
  artist_data      jsonb NOT NULL,
  cached_at        timestamptz NOT NULL DEFAULT now()
);

-- Cache albums / singles / EPs (JSONB — données brutes Deezer)
CREATE TABLE cached_albums (
  album_deezer_id       bigint PRIMARY KEY,
  artist_deezer_id      bigint NOT NULL,
  album_data            jsonb NOT NULL,
  cached_at             timestamptz NOT NULL DEFAULT now(),
  original_release_year smallint,
  record_type           text,
  genre_id              integer,
  track_count           smallint,
  title                 text,
  artist_name           text,
  cover_xl              text
);

-- Cache titres (JSONB — données brutes Deezer)
CREATE TABLE cached_tracks (
  track_deezer_id bigint PRIMARY KEY,
  album_deezer_id bigint NOT NULL,
  track_data      jsonb NOT NULL
);

-- Artistes suivis par un utilisateur
CREATE TABLE user_artist_follows (
  user_id           uuid REFERENCES profiles ON DELETE CASCADE,
  artist_deezer_id  bigint NOT NULL,
  followed_at       timestamptz DEFAULT now(),
  has_new_release   boolean DEFAULT false,
  PRIMARY KEY (user_id, artist_deezer_id)
);

-- Titres écoutés
CREATE TABLE listened_tracks (
  user_id           uuid REFERENCES profiles ON DELETE CASCADE,
  track_deezer_id   bigint NOT NULL,
  listened_at       timestamptz DEFAULT now(),
  listened_at_user  timestamptz,
  album_deezer_id   bigint,
  artist_deezer_id  bigint,
  duration_seconds  integer,
  PRIMARY KEY (user_id, track_deezer_id)
);

-- Notations (1 à 5)
CREATE TABLE track_ratings (
  user_id         uuid REFERENCES profiles ON DELETE CASCADE,
  track_deezer_id bigint NOT NULL,
  rating          smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  rated_at        timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, track_deezer_id)
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_artist_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE listened_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_ratings ENABLE ROW LEVEL SECURITY;

-- Policies profiles
CREATE POLICY "Users can select own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"   ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"   ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies cache (lecture/écriture authentifiés)
CREATE POLICY "Artists readable"  ON cached_artists FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Artists writable"  ON cached_artists FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Artists updatable" ON cached_artists FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Albums readable"   ON cached_albums FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Albums writable"   ON cached_albums FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Albums updatable"  ON cached_albums FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Albums deletable"  ON cached_albums FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Tracks readable"   ON cached_tracks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Tracks writable"   ON cached_tracks FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policies données utilisateur
CREATE POLICY "Users can manage own follows"   ON user_artist_follows FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own listens"   ON listened_tracks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own ratings"   ON track_ratings FOR ALL USING (auth.uid() = user_id);

-- Fonction : artistes écoutés par un utilisateur
CREATE OR REPLACE FUNCTION get_listened_artists(p_user_id uuid)
RETURNS TABLE (artist_deezer_id bigint, artist_data jsonb)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT
    car.artist_deezer_id,
    car.artist_data
  FROM listened_tracks lt
  JOIN cached_tracks  ct  ON ct.track_deezer_id   = lt.track_deezer_id
  JOIN cached_albums  ca  ON ca.album_deezer_id   = ct.album_deezer_id
  JOIN cached_artists car ON car.artist_deezer_id = ca.artist_deezer_id
  WHERE lt.user_id = p_user_id
$$;

-- Artistes favoris (max 5 par utilisateur, accès rapide sidebar)
CREATE TABLE favorite_artists (
  user_id          uuid REFERENCES profiles ON DELETE CASCADE,
  artist_deezer_id bigint NOT NULL REFERENCES cached_artists(artist_deezer_id),
  created_at       timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, artist_deezer_id)
);

ALTER TABLE favorite_artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own favorites" ON favorite_artists FOR ALL USING (auth.uid() = user_id);

-- Trigger : crée automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, pseudo)
  VALUES (new.id, new.raw_user_meta_data->>'pseudo');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

  -- Notations d'albums (indépendant des notes de titres)
CREATE TABLE album_ratings (
  user_id          uuid REFERENCES profiles ON DELETE CASCADE,
  album_deezer_id  bigint NOT NULL,
  rating           smallint CHECK (rating BETWEEN 1 AND 5),
  rated_at         timestamptz DEFAULT now(),
  listened_at_user timestamptz,
  PRIMARY KEY (user_id, album_deezer_id)
);

ALTER TABLE album_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own album ratings"
  ON album_ratings FOR ALL USING (auth.uid() = user_id);

-- Cache genres Deezer (refresh toutes les 7 jours)
CREATE TABLE cached_genres (
  deezer_id  integer PRIMARY KEY,
  name       text NOT NULL,
  cached_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE cached_genres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Genres readable"  ON cached_genres FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Genres writable"  ON cached_genres FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Genres updatable" ON cached_genres FOR UPDATE USING (auth.role() = 'authenticated');