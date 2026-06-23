import { NextRequest, NextResponse } from 'next/server'
import { getTrackPreview } from '@/lib/deezer/api'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const preview = await getTrackPreview(Number(id))
  if (!preview) return NextResponse.json({ error: 'No preview' }, { status: 404 })
  return NextResponse.json({ preview })
}
