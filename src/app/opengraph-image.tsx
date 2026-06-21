import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Discheck — Suivez vos discographies musicales'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0F0F0F',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px 96px',
          gap: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#0F0F0F' }} />
          </div>
          <span style={{ fontSize: 40, fontWeight: 700, color: '#ffffff', letterSpacing: '-1px' }}>
            Discheck
          </span>
        </div>

        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: '#22c55e',
            letterSpacing: '-2px',
            lineHeight: 1.1,
            maxWidth: 800,
          }}
        >
          Découvrez ce que votre musique dit de vous.
        </div>

        <div style={{ fontSize: 24, color: '#71717a', marginTop: 8 }}>
          Suivez vos écoutes · Notez vos albums · Explorez votre profil musical
        </div>
      </div>
    ),
    { ...size }
  )
}
