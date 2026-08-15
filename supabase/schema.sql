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
ALTER TABLE cached_artists ENABLE ROW LEVEL SECURITY;
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
  SELECT
    car.artist_deezer_id,
    car.artist_data
  FROM listened_tracks lt
  JOIN cached_tracks  ct  ON ct.track_deezer_id  = lt.track_deezer_id
  JOIN cached_albums  ca  ON ca.album_deezer_id  = ct.album_deezer_id
  JOIN cached_artists car ON car.artist_deezer_id = ca.artist_deezer_id
  WHERE lt.user_id = p_user_id
  GROUP BY car.artist_deezer_id, car.artist_data
  ORDER BY MAX(lt.listened_at) DESC
$$;

-- Fonction : progression discographie par artiste pour un utilisateur
CREATE OR REPLACE FUNCTION get_artist_progress(p_user_id uuid)
RETURNS TABLE(artist_deezer_id bigint, total_albums integer, listened_albums integer)
LANGUAGE sql STABLE AS $$
  WITH
  listened_album_ids AS (
    SELECT DISTINCT album_deezer_id
    FROM listened_tracks
    WHERE user_id = p_user_id
      AND album_deezer_id IS NOT NULL
  ),
  listened_artist_ids AS (
    SELECT DISTINCT ca.artist_deezer_id
    FROM listened_tracks lt
    JOIN cached_tracks ct ON ct.track_deezer_id = lt.track_deezer_id
    JOIN cached_albums ca ON ca.album_deezer_id = ct.album_deezer_id
    WHERE lt.user_id = p_user_id
  )
  SELECT
    ca.artist_deezer_id,
    COUNT(DISTINCT ca.album_deezer_id)::integer AS total_albums,
    COUNT(DISTINCT la.album_deezer_id)::integer  AS listened_albums
  FROM cached_albums ca
  JOIN listened_artist_ids lai ON lai.artist_deezer_id = ca.artist_deezer_id
  LEFT JOIN listened_album_ids la ON la.album_deezer_id = ca.album_deezer_id
  GROUP BY ca.artist_deezer_id
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

-- Index : jointures Top Albums / Top Artistes
CREATE INDEX IF NOT EXISTS idx_cached_albums_artist ON cached_albums(artist_deezer_id);
CREATE INDEX IF NOT EXISTS idx_cached_tracks_album ON cached_tracks(album_deezer_id);

-- Fonction : stats bannière (durée via cached_tracks, duration_seconds jamais alimentée)
CREATE OR REPLACE FUNCTION get_home_stats(p_user_id uuid)
RETURNS TABLE(albums_listened integer, hours_listened numeric)
LANGUAGE sql STABLE AS $$
  SELECT
    COUNT(DISTINCT lt.album_deezer_id)::integer AS albums_listened,
    ROUND(COALESCE(SUM((ct.track_data->>'duration')::numeric), 0) / 3600.0, 1) AS hours_listened
  FROM listened_tracks lt
  LEFT JOIN cached_tracks ct ON ct.track_deezer_id = lt.track_deezer_id
  WHERE lt.user_id = p_user_id
$$;

-- Fonction : classement albums préférés (dashboard p_limit=5, panel "voir plus" p_limit=NULL)
CREATE OR REPLACE FUNCTION get_top_albums(p_user_id uuid, p_limit integer DEFAULT NULL)
RETURNS TABLE(
  album_deezer_id bigint,
  album_rating smallint,
  rated_at timestamptz,
  track_avg numeric,
  has_any_track_rating boolean
)
LANGUAGE sql STABLE AS $$
  WITH album_tracks AS (
    SELECT ct.album_deezer_id, ct.track_deezer_id
    FROM cached_tracks ct
    JOIN album_ratings ar ON ar.album_deezer_id = ct.album_deezer_id AND ar.user_id = p_user_id AND ar.rating IS NOT NULL
  ),
  track_stats AS (
    SELECT
      at.album_deezer_id,
      COUNT(*) AS total_tracks,
      COUNT(tr.rating) AS rated_tracks,
      AVG(tr.rating) AS avg_rating
    FROM album_tracks at
    LEFT JOIN track_ratings tr ON tr.track_deezer_id = at.track_deezer_id AND tr.user_id = p_user_id
    GROUP BY at.album_deezer_id
  )
  SELECT
    ar.album_deezer_id,
    ar.rating AS album_rating,
    ar.rated_at,
    CASE WHEN ts.total_tracks = ts.rated_tracks THEN ROUND(ts.avg_rating, 1) ELSE NULL END AS track_avg,
    COALESCE(ts.rated_tracks, 0) > 0 AS has_any_track_rating
  FROM album_ratings ar
  LEFT JOIN track_stats ts ON ts.album_deezer_id = ar.album_deezer_id
  WHERE ar.user_id = p_user_id AND ar.rating IS NOT NULL
  ORDER BY
    ar.rating DESC,
    (CASE WHEN ts.total_tracks = ts.rated_tracks THEN ROUND(ts.avg_rating, 1) ELSE NULL END) DESC NULLS LAST,
    COALESCE(ts.rated_tracks, 0) > 0 DESC,
    ar.rated_at DESC
  LIMIT p_limit
$$;

-- Fonction : classement artistes les mieux notés (minimum 5 titres notés)
CREATE OR REPLACE FUNCTION get_top_artists(p_user_id uuid, p_limit integer DEFAULT NULL)
RETURNS TABLE(artist_deezer_id bigint, tracks_rated integer, avg_rating numeric)
LANGUAGE sql STABLE AS $$
  SELECT
    ca.artist_deezer_id,
    COUNT(*)::integer AS tracks_rated,
    ROUND(AVG(tr.rating), 1) AS avg_rating
  FROM track_ratings tr
  JOIN cached_tracks ct ON ct.track_deezer_id = tr.track_deezer_id
  JOIN cached_albums ca ON ca.album_deezer_id = ct.album_deezer_id
  WHERE tr.user_id = p_user_id
  GROUP BY ca.artist_deezer_id
  HAVING COUNT(*) >= 5
  ORDER BY avg_rating DESC, tracks_rated DESC
  LIMIT p_limit
$$;

-- Fonction : titres favoris (notés 5/5)
CREATE OR REPLACE FUNCTION get_favorite_tracks(p_user_id uuid, p_limit integer DEFAULT NULL)
RETURNS TABLE(track_deezer_id bigint, rated_at timestamptz)
LANGUAGE sql STABLE AS $$
  SELECT tr.track_deezer_id, tr.rated_at
  FROM track_ratings tr
  WHERE tr.user_id = p_user_id AND tr.rating = 5
  ORDER BY tr.rated_at DESC
  LIMIT p_limit
$$;

-- Fonction : répartition par genre dominant (titres écoutés)
CREATE OR REPLACE FUNCTION get_genre_stats(p_user_id uuid)
RETURNS TABLE(genre_id integer, name text, count integer, percentage integer)
LANGUAGE sql STABLE AS $$
  WITH genre_counts AS (
    SELECT ca.genre_id, COUNT(*)::integer AS count
    FROM listened_tracks lt
    JOIN cached_albums ca ON ca.album_deezer_id = lt.album_deezer_id
    WHERE lt.user_id = p_user_id
      AND ca.genre_id IS NOT NULL
      AND ca.genre_id NOT IN (0, -1)
    GROUP BY ca.genre_id
  ),
  total AS (
    SELECT COALESCE(SUM(count), 0) AS total_count FROM genre_counts
  )
  SELECT
    gc.genre_id,
    cg.name,
    gc.count,
    ROUND(gc.count::numeric / NULLIF(t.total_count, 0) * 100)::integer AS percentage
  FROM genre_counts gc
  JOIN cached_genres cg ON cg.deezer_id = gc.genre_id
  CROSS JOIN total t
  ORDER BY gc.count DESC
$$;

-- Fonction : répartition par décennie (titres écoutés)
CREATE OR REPLACE FUNCTION get_decade_stats(p_user_id uuid)
RETURNS TABLE(decade integer, count integer, percentage integer)
LANGUAGE sql STABLE AS $$
  WITH decade_counts AS (
    SELECT ((ca.original_release_year / 10) * 10)::integer AS decade, COUNT(*)::integer AS count
    FROM listened_tracks lt
    JOIN cached_albums ca ON ca.album_deezer_id = lt.album_deezer_id
    WHERE lt.user_id = p_user_id
      AND ca.original_release_year IS NOT NULL
    GROUP BY 1
  ),
  bounds AS (
    SELECT MIN(decade) AS min_decade, COALESCE(SUM(count), 0) AS total FROM decade_counts
  )
  SELECT
    d.decade,
    COALESCE(dc.count, 0) AS count,
    CASE WHEN COALESCE(dc.count, 0) > 0 THEN ROUND(dc.count::numeric / b.total * 100)::integer ELSE 0 END AS percentage
  FROM bounds b
  CROSS JOIN LATERAL generate_series(b.min_decade, 2020, 10) AS d(decade)
  LEFT JOIN decade_counts dc ON dc.decade = d.decade
  ORDER BY d.decade
$$;

-- Fonction : albums/EPs entièrement vs partiellement écoutés
CREATE OR REPLACE FUNCTION get_listener_stats(p_user_id uuid)
RETURNS TABLE(album_full integer, album_partial integer, album_full_pct integer, album_partial_pct integer)
LANGUAGE sql STABLE AS $$
  WITH listened_counts AS (
    SELECT lt.album_deezer_id, COUNT(*)::integer AS listened_count
    FROM listened_tracks lt
    JOIN cached_albums ca ON ca.album_deezer_id = lt.album_deezer_id
    WHERE lt.user_id = p_user_id
      AND ca.record_type IN ('album', 'ep')
    GROUP BY lt.album_deezer_id
  ),
  total_counts AS (
    SELECT ct.album_deezer_id, COUNT(*)::integer AS total_count
    FROM cached_tracks ct
    WHERE ct.album_deezer_id IN (SELECT album_deezer_id FROM listened_counts)
    GROUP BY ct.album_deezer_id
  ),
  classified AS (
    SELECT CASE WHEN lc.listened_count >= tc.total_count THEN 1 ELSE 0 END AS is_full
    FROM listened_counts lc
    JOIN total_counts tc ON tc.album_deezer_id = lc.album_deezer_id
  ),
  agg AS (
    SELECT COALESCE(SUM(is_full), 0)::integer AS album_full, COALESCE(SUM(1 - is_full), 0)::integer AS album_partial
    FROM classified
  )
  SELECT
    agg.album_full,
    agg.album_partial,
    CASE WHEN (agg.album_full + agg.album_partial) > 0 THEN ROUND(agg.album_full::numeric / (agg.album_full + agg.album_partial) * 100)::integer ELSE 0 END,
    CASE WHEN (agg.album_full + agg.album_partial) > 0 THEN ROUND(agg.album_partial::numeric / (agg.album_full + agg.album_partial) * 100)::integer ELSE 0 END
  FROM agg
$$;

-- Fonction : concentration d'écoute (top 3 artistes)
CREATE OR REPLACE FUNCTION get_concentration_stats(p_user_id uuid)
RETURNS TABLE(name text, pct integer, total_tracks integer, total_artists integer, top3_pct integer)
LANGUAGE sql STABLE AS $$
  WITH artist_counts AS (
    SELECT ca.artist_deezer_id, MAX(COALESCE(ca.artist_name, '')) AS name, COUNT(*)::integer AS count
    FROM listened_tracks lt
    JOIN cached_albums ca ON ca.album_deezer_id = lt.album_deezer_id
    WHERE lt.user_id = p_user_id AND ca.artist_deezer_id IS NOT NULL
    GROUP BY ca.artist_deezer_id
  ),
  totals AS (
    SELECT COALESCE(SUM(count), 0)::integer AS total_tracks, COUNT(*)::integer AS total_artists
    FROM artist_counts
  ),
  top3 AS (
    SELECT ac.name, ac.count FROM artist_counts ac ORDER BY ac.count DESC LIMIT 3
  )
  SELECT
    top3.name,
    CASE WHEN t.total_tracks > 0 THEN ROUND(top3.count::numeric / t.total_tracks * 100)::integer ELSE 0 END AS pct,
    t.total_tracks,
    t.total_artists,
    CASE WHEN t.total_tracks > 0
      THEN ROUND((SELECT COALESCE(SUM(count), 0) FROM top3)::numeric / t.total_tracks * 100)::integer
      ELSE 0 END AS top3_pct
  FROM top3
  CROSS JOIN totals t
  ORDER BY top3.count DESC
$$;

-- Fonction : distribution des notes (albums et titres)
CREATE OR REPLACE FUNCTION get_critique_stats(p_user_id uuid)
RETURNS TABLE(mode text, cnt_1 integer, cnt_2 integer, cnt_3 integer, cnt_4 integer, cnt_5 integer, average numeric, total integer)
LANGUAGE sql STABLE AS $$
  WITH album_agg AS (
    SELECT
      COUNT(*) FILTER (WHERE rating = 1)::integer AS cnt_1,
      COUNT(*) FILTER (WHERE rating = 2)::integer AS cnt_2,
      COUNT(*) FILTER (WHERE rating = 3)::integer AS cnt_3,
      COUNT(*) FILTER (WHERE rating = 4)::integer AS cnt_4,
      COUNT(*) FILTER (WHERE rating = 5)::integer AS cnt_5,
      COUNT(*)::integer AS total,
      COALESCE(SUM(rating), 0) AS rating_sum
    FROM album_ratings
    WHERE user_id = p_user_id AND rating BETWEEN 1 AND 5
  ),
  track_agg AS (
    SELECT
      COUNT(*) FILTER (WHERE rating = 1)::integer AS cnt_1,
      COUNT(*) FILTER (WHERE rating = 2)::integer AS cnt_2,
      COUNT(*) FILTER (WHERE rating = 3)::integer AS cnt_3,
      COUNT(*) FILTER (WHERE rating = 4)::integer AS cnt_4,
      COUNT(*) FILTER (WHERE rating = 5)::integer AS cnt_5,
      COUNT(*)::integer AS total,
      COALESCE(SUM(rating), 0) AS rating_sum
    FROM track_ratings
    WHERE user_id = p_user_id AND rating BETWEEN 1 AND 5
  )
  SELECT 'albums', cnt_1, cnt_2, cnt_3, cnt_4, cnt_5,
    CASE WHEN total > 0 THEN ROUND(rating_sum::numeric / total, 2) ELSE 0 END, total
  FROM album_agg
  UNION ALL
  SELECT 'tracks', cnt_1, cnt_2, cnt_3, cnt_4, cnt_5,
    CASE WHEN total > 0 THEN ROUND(rating_sum::numeric / total, 2) ELSE 0 END, total
  FROM track_agg
$$;

-- Fonction : écart note album vs moyenne des titres (albums entièrement notés)
CREATE OR REPLACE FUNCTION get_ecart_stats(p_user_id uuid)
RETURNS TABLE(
  album_deezer_id bigint,
  title text,
  artist_name text,
  cover_xl text,
  album_rating smallint,
  track_avg numeric,
  diff numeric
)
LANGUAGE sql STABLE AS $$
  WITH album_tracks AS (
    SELECT ct.album_deezer_id, ct.track_deezer_id
    FROM cached_tracks ct
    JOIN album_ratings ar ON ar.album_deezer_id = ct.album_deezer_id AND ar.user_id = p_user_id AND ar.rating IS NOT NULL
  ),
  track_stats AS (
    SELECT
      at.album_deezer_id,
      COUNT(*) AS total_tracks,
      COUNT(tr.rating) AS rated_tracks,
      AVG(tr.rating) AS avg_rating
    FROM album_tracks at
    LEFT JOIN track_ratings tr ON tr.track_deezer_id = at.track_deezer_id AND tr.user_id = p_user_id
    GROUP BY at.album_deezer_id
  )
  SELECT
    ar.album_deezer_id,
    ca.title,
    COALESCE(ca.artist_name, ''),
    ca.cover_xl,
    ar.rating,
    ROUND(ts.avg_rating, 2) AS track_avg,
    ROUND(ar.rating - ts.avg_rating, 2) AS diff
  FROM album_ratings ar
  JOIN track_stats ts ON ts.album_deezer_id = ar.album_deezer_id
  JOIN cached_albums ca ON ca.album_deezer_id = ar.album_deezer_id
  WHERE ar.user_id = p_user_id
    AND ar.rating IS NOT NULL
    AND ts.total_tracks = ts.rated_tracks
    AND ca.title IS NOT NULL
    AND ca.cover_xl IS NOT NULL
  ORDER BY ABS(ar.rating - ts.avg_rating) DESC
$$;

-- Fonction : profondeur d'exploration par artiste (progression discographie)
CREATE OR REPLACE FUNCTION get_depth_stats(p_user_id uuid)
RETURNS TABLE(artist_deezer_id bigint, name text, picture_xl text, listened integer, total integer, pct integer)
LANGUAGE sql STABLE AS $$
  WITH listened_artist_albums AS (
    SELECT DISTINCT lt.album_deezer_id, ca.artist_deezer_id
    FROM listened_tracks lt
    JOIN cached_albums ca ON ca.album_deezer_id = lt.album_deezer_id
    WHERE lt.user_id = p_user_id
  ),
  listened_artists AS (
    SELECT DISTINCT artist_deezer_id FROM listened_artist_albums
  ),
  artist_totals AS (
    SELECT ca.artist_deezer_id, COUNT(*)::integer AS total
    FROM cached_albums ca
    JOIN listened_artists la ON la.artist_deezer_id = ca.artist_deezer_id
    GROUP BY ca.artist_deezer_id
  ),
  artist_listened AS (
    SELECT artist_deezer_id, COUNT(DISTINCT album_deezer_id)::integer AS listened
    FROM listened_artist_albums
    GROUP BY artist_deezer_id
  ),
  artist_names AS (
    SELECT ca.artist_deezer_id, MAX(ca.artist_name) AS artist_name
    FROM cached_albums ca
    JOIN listened_artists la ON la.artist_deezer_id = ca.artist_deezer_id
    WHERE ca.artist_name IS NOT NULL
    GROUP BY ca.artist_deezer_id
  )
  SELECT
    at.artist_deezer_id,
    COALESCE(an.artist_name, ''),
    COALESCE(car.artist_data->>'picture_xl', ''),
    al.listened,
    at.total,
    ROUND(al.listened::numeric / at.total * 100)::integer AS pct
  FROM artist_totals at
  JOIN artist_listened al ON al.artist_deezer_id = at.artist_deezer_id
  LEFT JOIN artist_names an ON an.artist_deezer_id = at.artist_deezer_id
  LEFT JOIN cached_artists car ON car.artist_deezer_id = at.artist_deezer_id
  ORDER BY pct DESC, al.listened DESC
$$;

-- Fonction : stats globales Collection (période courante vs précédente)
CREATE OR REPLACE FUNCTION get_collection_global_stats(
  p_user_id uuid,
  p_start timestamptz,
  p_end timestamptz,
  p_prev_start timestamptz,
  p_prev_end timestamptz
)
RETURNS TABLE(
  tracks_current integer,
  tracks_prev integer,
  albums_completed_current integer,
  albums_completed_prev integer,
  seconds_current numeric,
  seconds_prev numeric,
  artists_current integer,
  artists_prev integer
)
LANGUAGE sql STABLE AS $$
  WITH listened AS (
    SELECT
      lt.track_deezer_id,
      lt.album_deezer_id,
      COALESCE(lt.listened_at_user, lt.listened_at) AS eff_date
    FROM listened_tracks lt
    WHERE lt.user_id = p_user_id
  ),
  album_totals AS (
    SELECT album_deezer_id, COUNT(*) AS total_listened, MAX(eff_date) AS max_date
    FROM listened
    GROUP BY album_deezer_id
  ),
  album_track_counts AS (
    SELECT ct.album_deezer_id, COUNT(*)::integer AS track_count
    FROM cached_tracks ct
    WHERE ct.album_deezer_id IN (SELECT album_deezer_id FROM album_totals)
    GROUP BY ct.album_deezer_id
  ),
  completed_albums AS (
    SELECT at.album_deezer_id, at.max_date
    FROM album_totals at
    JOIN album_track_counts atc ON atc.album_deezer_id = at.album_deezer_id
    WHERE at.total_listened >= atc.track_count
  )
  SELECT
    (SELECT COUNT(*)::integer FROM listened
      WHERE p_start IS NULL OR (eff_date >= p_start AND eff_date < p_end)) AS tracks_current,
    CASE WHEN p_prev_start IS NULL THEN NULL::integer ELSE
      (SELECT COUNT(*)::integer FROM listened WHERE eff_date >= p_prev_start AND eff_date < p_prev_end)
    END AS tracks_prev,
    (SELECT COUNT(*)::integer FROM completed_albums
      WHERE p_start IS NULL OR (max_date >= p_start AND max_date < p_end)) AS albums_completed_current,
    CASE WHEN p_prev_start IS NULL THEN NULL::integer ELSE
      (SELECT COUNT(*)::integer FROM completed_albums WHERE max_date >= p_prev_start AND max_date < p_prev_end)
    END AS albums_completed_prev,
    (SELECT COALESCE(SUM((ct.track_data->>'duration')::numeric), 0)
       FROM listened l JOIN cached_tracks ct ON ct.track_deezer_id = l.track_deezer_id
       WHERE p_start IS NULL OR (l.eff_date >= p_start AND l.eff_date < p_end)) AS seconds_current,
    CASE WHEN p_prev_start IS NULL THEN NULL::numeric ELSE
      (SELECT COALESCE(SUM((ct.track_data->>'duration')::numeric), 0)
         FROM listened l JOIN cached_tracks ct ON ct.track_deezer_id = l.track_deezer_id
         WHERE l.eff_date >= p_prev_start AND l.eff_date < p_prev_end)
    END AS seconds_prev,
    (SELECT COUNT(DISTINCT ca.artist_deezer_id)::integer
       FROM listened l JOIN cached_albums ca ON ca.album_deezer_id = l.album_deezer_id
       WHERE ca.artist_deezer_id IS NOT NULL
         AND (p_start IS NULL OR (l.eff_date >= p_start AND l.eff_date < p_end))) AS artists_current,
    CASE WHEN p_prev_start IS NULL THEN NULL::integer ELSE
      (SELECT COUNT(DISTINCT ca.artist_deezer_id)::integer
         FROM listened l JOIN cached_albums ca ON ca.album_deezer_id = l.album_deezer_id
         WHERE ca.artist_deezer_id IS NOT NULL
           AND l.eff_date >= p_prev_start AND l.eff_date < p_prev_end)
    END AS artists_prev
$$;

-- Fonction : répartition par genre Collection (période courante vs précédente)
CREATE OR REPLACE FUNCTION get_collection_genre_stats(
  p_user_id uuid, p_start timestamptz, p_end timestamptz, p_prev_start timestamptz, p_prev_end timestamptz
)
RETURNS TABLE(genre_id integer, name text, count integer, prev_count integer, total_prev_count integer)
LANGUAGE sql STABLE AS $$
  WITH listened AS (
    SELECT lt.album_deezer_id, COALESCE(lt.listened_at_user, lt.listened_at) AS eff_date
    FROM listened_tracks lt WHERE lt.user_id = p_user_id
  ),
  current_counts AS (
    SELECT ca.genre_id, COUNT(*)::integer AS count
    FROM listened l JOIN cached_albums ca ON ca.album_deezer_id = l.album_deezer_id
    WHERE (p_start IS NULL OR (l.eff_date >= p_start AND l.eff_date < p_end))
      AND ca.genre_id IS NOT NULL AND ca.genre_id NOT IN (0, -1)
    GROUP BY ca.genre_id
  ),
  prev_counts AS (
    SELECT ca.genre_id, COUNT(*)::integer AS count
    FROM listened l JOIN cached_albums ca ON ca.album_deezer_id = l.album_deezer_id
    WHERE l.eff_date >= p_prev_start AND l.eff_date < p_prev_end
      AND ca.genre_id IS NOT NULL AND ca.genre_id NOT IN (0, -1)
    GROUP BY ca.genre_id
  ),
  total_prev AS (SELECT COALESCE(SUM(count), 0)::integer AS total FROM prev_counts)
  SELECT cc.genre_id, cg.name, cc.count, COALESCE(pc.count, 0), tp.total
  FROM current_counts cc
  JOIN cached_genres cg ON cg.deezer_id = cc.genre_id
  LEFT JOIN prev_counts pc ON pc.genre_id = cc.genre_id
  CROSS JOIN total_prev tp
  ORDER BY cc.count DESC
$$;

-- Fonction : répartition par décennie Collection (période courante vs précédente, liste fixe)
CREATE OR REPLACE FUNCTION get_collection_decade_stats(
  p_user_id uuid, p_start timestamptz, p_end timestamptz, p_prev_start timestamptz, p_prev_end timestamptz
)
RETURNS TABLE(decade integer, count integer, prev_count integer)
LANGUAGE sql STABLE AS $$
  WITH listened AS (
    SELECT lt.album_deezer_id, COALESCE(lt.listened_at_user, lt.listened_at) AS eff_date
    FROM listened_tracks lt WHERE lt.user_id = p_user_id
  ),
  decades(decade) AS (VALUES (2020),(2010),(2000),(1990),(1980),(1970),(1960)),
  current_counts AS (
    SELECT ((ca.original_release_year / 10) * 10)::integer AS decade, COUNT(*)::integer AS count
    FROM listened l JOIN cached_albums ca ON ca.album_deezer_id = l.album_deezer_id
    WHERE (p_start IS NULL OR (l.eff_date >= p_start AND l.eff_date < p_end))
      AND ca.original_release_year IS NOT NULL
    GROUP BY 1
  ),
  prev_counts AS (
    SELECT ((ca.original_release_year / 10) * 10)::integer AS decade, COUNT(*)::integer AS count
    FROM listened l JOIN cached_albums ca ON ca.album_deezer_id = l.album_deezer_id
    WHERE l.eff_date >= p_prev_start AND l.eff_date < p_prev_end
      AND ca.original_release_year IS NOT NULL
    GROUP BY 1
  )
  SELECT d.decade, COALESCE(cc.count, 0), COALESCE(pc.count, 0)
  FROM decades d
  LEFT JOIN current_counts cc ON cc.decade = d.decade
  LEFT JOIN prev_counts pc ON pc.decade = d.decade
  ORDER BY d.decade DESC
$$;

-- Fonction : 100 derniers titres écoutés dans la période
CREATE OR REPLACE FUNCTION get_collection_recent_tracks(p_user_id uuid, p_start timestamptz, p_end timestamptz)
RETURNS TABLE(track_deezer_id bigint, title text, artist_name text, cover_xl text, listened_at timestamptz)
LANGUAGE sql STABLE AS $$
  SELECT
    lt.track_deezer_id,
    COALESCE(ct.track_data->>'title', ''),
    COALESCE(ca.artist_name, ''),
    COALESCE(ca.cover_xl, ''),
    COALESCE(lt.listened_at_user, lt.listened_at) AS listened_at
  FROM listened_tracks lt
  JOIN cached_tracks ct ON ct.track_deezer_id = lt.track_deezer_id
  LEFT JOIN cached_albums ca ON ca.album_deezer_id = lt.album_deezer_id
  WHERE lt.user_id = p_user_id
    AND (p_start IS NULL OR (COALESCE(lt.listened_at_user, lt.listened_at) >= p_start AND COALESCE(lt.listened_at_user, lt.listened_at) < p_end))
  ORDER BY listened_at DESC
  LIMIT 100
$$;

-- Fonction : 100 derniers albums écoutés dans la période
CREATE OR REPLACE FUNCTION get_collection_recent_albums(p_user_id uuid, p_start timestamptz, p_end timestamptz)
RETURNS TABLE(album_deezer_id bigint, title text, artist_name text, cover_xl text, last_listened_at timestamptz)
LANGUAGE sql STABLE AS $$
  WITH recent AS (
    SELECT lt.album_deezer_id, MAX(COALESCE(lt.listened_at_user, lt.listened_at)) AS last_listened_at
    FROM listened_tracks lt
    WHERE lt.user_id = p_user_id
      AND (p_start IS NULL OR (COALESCE(lt.listened_at_user, lt.listened_at) >= p_start AND COALESCE(lt.listened_at_user, lt.listened_at) < p_end))
    GROUP BY lt.album_deezer_id
  )
  SELECT r.album_deezer_id, ca.title, COALESCE(ca.artist_name, ''), COALESCE(ca.cover_xl, ''), r.last_listened_at
  FROM recent r
  JOIN cached_albums ca ON ca.album_deezer_id = r.album_deezer_id
  WHERE ca.title IS NOT NULL
  ORDER BY r.last_listened_at DESC
  LIMIT 100
$$;