import type {
  DeezerSearchResponse,
  DeezerDiscographyResponse,
  DeezerTracksResponse,
  DeezerGenresResponse,
} from './types'

const BASE_URL = 'https://api.deezer.com'

export async function searchArtists(query: string): Promise<DeezerSearchResponse> {
  const res = await fetch(
    `${BASE_URL}/search/artist?q=${encodeURIComponent(query)}&limit=10`
  )
  if (!res.ok) throw new Error('Deezer search failed')
  return res.json()
}

export async function getArtistDiscography(artistId: number): Promise<DeezerDiscographyResponse> {
  const res = await fetch(
    `${BASE_URL}/artist/${artistId}/albums?limit=100`
  )
  if (!res.ok) throw new Error('Deezer discography fetch failed')
  return res.json()
}

export async function getAlbumTracks(albumId: number): Promise<DeezerTracksResponse> {
  const res = await fetch(
    `${BASE_URL}/album/${albumId}/tracks`
  )
  if (!res.ok) throw new Error('Deezer tracks fetch failed')
  return res.json()
}

export async function getArtist(artistId: number) {
  const res = await fetch(`${BASE_URL}/artist/${artistId}`)
  if (!res.ok) throw new Error('Deezer artist fetch failed')
  return res.json()
}

export async function getGenres(): Promise<DeezerGenresResponse> {
  const res = await fetch(`${BASE_URL}/genre`)
  if (!res.ok) throw new Error('Deezer genres fetch failed')
  return res.json()
}

export async function getTrackPreview(trackId: number): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/track/${trackId}`)
  if (!res.ok) return null
  const data = await res.json()
  return data.preview || null
}
