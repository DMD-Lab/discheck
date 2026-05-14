export interface DeezerSearchResponse {
  data: DeezerArtistResult[]
  total: number
  next?: string
}

export interface DeezerArtistResult {
  id: number
  name: string
  picture_medium: string
  picture_xl: string
  nb_album: number
  type: 'artist'
}

export interface DeezerDiscographyResponse {
  data: DeezerAlbumResult[]
  total: number
  next?: string
}

export interface DeezerAlbumResult {
  id: number
  title: string
  cover_medium: string
  cover_xl: string
  release_date: string
  record_type: string
  nb_tracks: number
  type: 'album'
}

export interface DeezerTracksResponse {
  data: DeezerTrackResult[]
}

export interface DeezerTrackResult {
  id: number
  title: string
  duration: number
  track_position: number
  contributors: {
    id: number
    name: string
    role: string
  }[]
  type: 'track'
}
