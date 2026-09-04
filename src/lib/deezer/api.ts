import type {
  DeezerSearchResponse,
  DeezerAlbumResult,
  DeezerDiscographyResponse,
  DeezerTracksResponse,
  DeezerTrackResult,
  DeezerGenresResponse,
} from './types'

const BASE_URL = 'https://api.deezer.com'

export async function searchArtists(query: string): Promise<DeezerSearchResponse> {
  const res = await fetch(
    `${BASE_URL}/search/artist?q=${encodeURIComponent(query)}&limit=25`
  )
  if (!res.ok) throw new Error('Deezer search failed')
  const data: DeezerSearchResponse = await res.json()
  data.data.sort((a, b) => b.nb_fan - a.nb_fan)
  return data
}

async function fetchPaginated<T>(url: string, errorMessage: string): Promise<T[]> {
  const all: T[] = []
  let next: string | null = url

  while (next) {
    const res = await fetch(next)
    if (!res.ok) throw new Error(errorMessage)
    const page: { data: T[]; next?: string } = await res.json()
    all.push(...page.data)
    next = page.next ?? null
  }

  return all
}

export async function getArtistDiscography(artistId: number): Promise<DeezerDiscographyResponse> {
  const data = await fetchPaginated<DeezerAlbumResult>(
    `${BASE_URL}/artist/${artistId}/albums?limit=100`,
    'Deezer discography fetch failed'
  )
  return { data, total: data.length }
}

export async function getAlbumTracks(albumId: number): Promise<DeezerTracksResponse> {
  const data = await fetchPaginated<DeezerTrackResult>(
    `${BASE_URL}/album/${albumId}/tracks?limit=100`,
    'Deezer tracks fetch failed'
  )
  return { data, total: data.length }
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
