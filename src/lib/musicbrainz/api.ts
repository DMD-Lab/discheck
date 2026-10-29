const BASE_URL = 'https://musicbrainz.org/ws/2'
const TIMEOUT_MS = 4000

const HEADERS = {
  'User-Agent': 'Discheck/1.0 ( karim.damad.p@hotmail.com )',
  'Accept': 'application/json',
}

export interface MBReleaseGroup {
  id: string
  title: string
  'first-release-date': string
  'primary-type': string
  'secondary-types': string[]
}

async function mbFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { headers: HEADERS, signal: AbortSignal.timeout(TIMEOUT_MS) })
  if (!res.ok) throw new Error(`MusicBrainz error ${res.status}: ${path}`)
  return res.json()
}

export async function searchArtistMbid(artistName: string): Promise<string | null> {
  const query = encodeURIComponent(`artist:"${artistName}"`)
  const data = await mbFetch<{ artists: { id: string; score: number }[] }>(
    `/artist/?query=${query}&limit=1&fmt=json`
  )
  const top = data.artists?.[0]
  if (!top || top.score < 90) return null
  return top.id
}

export async function getArtistReleaseGroups(mbid: string): Promise<MBReleaseGroup[]> {
  const results: MBReleaseGroup[] = []
  let offset = 0
  const limit = 100

  while (true) {
    const data = await mbFetch<{ 'release-groups': MBReleaseGroup[]; count: number }>(
      `/release-group?artist=${mbid}&limit=${limit}&offset=${offset}&fmt=json`
    )
    const groups = data['release-groups'] ?? []
    results.push(...groups)
    if (results.length >= data.count || groups.length < limit) break
    offset += limit
  }

  return results
}

export function matchRelease(
  albumTitle: string,
  recordType: string,
  releaseGroups: MBReleaseGroup[]
): { year: number; date: string | null } | null {
  // keep non-latin chars
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')

  const normalizedTitle = normalize(albumTitle)
  if (!normalizedTitle) return null

  // title alone is ambiguous
  const candidates = releaseGroups.filter(
    rg => normalize(rg.title) === normalizedTitle
      && rg['primary-type']?.toLowerCase() === recordType.toLowerCase()
  )
  if (candidates.length === 0) return null

  // prefer canonical release
  const match = candidates.find(rg => (rg['secondary-types']?.length ?? 0) === 0) ?? candidates[0]

  const raw = match['first-release-date']
  if (!raw) return null
  const year = parseInt(raw.slice(0, 4), 10)
  if (isNaN(year)) return null
  // day-level precision only
  const date = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null
  return { year, date }
}
