export type RecordType = 'album' | 'single' | 'ep' | 'compilation'

export interface DeezerArtist {
  id: number
  name: string
  picture_medium: string
  picture_xl: string
  nb_album: number
}

export interface DeezerAlbum {
  id: number
  title: string
  cover_medium: string
  cover_xl: string
  release_date: string
  record_type: RecordType
  nb_tracks: number
  artist: { id: number; name: string }
}

export interface DeezerTrack {
  id: number
  title: string
  duration: number
  track_position: number
  contributors?: { id: number; name: string; role: string }[]
}

export interface CachedArtist {
  deezer_id: number
  name: string
  picture_url: string
  cached_at: string
  known_album_count: number
}

export interface CachedAlbum {
  deezer_id: number
  artist_id: number
  title: string
  cover_url: string
  release_date: string
  record_type: RecordType
  nb_tracks: number
  cached_at: string
}

export interface CachedTrack {
  deezer_id: number
  album_id: number
  title: string
  duration: number
  track_position: number
  contributors: { id: number; name: string; role: string }[]
}

export interface UserProfile {
  id: string
  pseudo: string
  created_at: string
}
