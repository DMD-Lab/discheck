import Image from 'next/image'

export default function VinylSpinner({ size = 80 }: { size?: number }) {
  return (
    <Image
      src="/vinyl.png"
      alt="Chargement..."
      width={size}
      height={size}
      className="animate-spin"
      style={{ animationDuration: '2s', animationTimingFunction: 'linear' }}
      priority
    />
  )
}
