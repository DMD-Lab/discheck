import Image from 'next/image'

interface LogoImageProps {
  height?: number
  className?: string
}

export default function LogoImage({ height = 48, className = '' }: LogoImageProps) {
  return (
    <>
      <Image
        src="/logo-white.png"
        alt="Discheck"
        width={1678}
        height={524}
        style={{ height: `${height}px`, width: 'auto' }}
        loading="eager"
        className={`logo-dark ${className}`}
      />
      <Image
        src="/logo-black.png"
        alt=""
        aria-hidden
        width={1678}
        height={524}
        style={{ height: `${height}px`, width: 'auto' }}
        loading="eager"
        className={`logo-light ${className}`}
      />
    </>
  )
}
