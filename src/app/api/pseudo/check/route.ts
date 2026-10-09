import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getPseudoError } from '@/lib/validation/pseudo'

export async function POST(req: NextRequest) {
  const { pseudo } = await req.json()

  if (typeof pseudo !== 'string' || getPseudoError(pseudo) !== null) {
    return NextResponse.json({ available: false })
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('pseudo', pseudo)
    .maybeSingle()

  if (error) return NextResponse.json({ available: false })

  return NextResponse.json({ available: data === null })
}
