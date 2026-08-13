import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.dzcdn.net',
      },
    ],
    minimumCacheTTL: 2678400,
    qualities: [75, 90],
  },
}

export default nextConfig
