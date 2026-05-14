import { type NextRequest } from 'next/server'
import { searchArtists } from '@/lib/deezer/api'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q?.trim()) return Response.json({ data: [], total: 0 })

  try {
    const data = await searchArtists(q)
    return Response.json(data)
  } catch {
    return Response.json({ error: 'Search failed' }, { status: 500 })
  }
}
