function ArtistFeaturedSkeleton() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <div className="relative w-36 h-36 lg:w-40 lg:h-40 flex-shrink-0">
        <div className="w-full h-full rounded-full bg-bg-tertiary animate-pulse" />
        <div className="absolute -top-2 -left-2 w-6 h-6 rounded bg-bg-secondary animate-pulse" />
      </div>
      <div className="flex flex-col items-center gap-1.5 w-full">
        <div className="h-3.5 w-2/3 bg-bg-tertiary rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-bg-tertiary rounded animate-pulse" />
        <div className="h-3 w-1/3 bg-bg-tertiary rounded animate-pulse" />
      </div>
    </div>
  )
}

function ArtistRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-6 h-6 rounded bg-bg-tertiary animate-pulse flex-shrink-0" />
      <div className="w-9 h-9 rounded-full bg-bg-tertiary animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-3/4 bg-bg-tertiary rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-bg-tertiary rounded animate-pulse" />
      </div>
      <div className="h-4 w-10 bg-bg-tertiary rounded animate-pulse flex-shrink-0" />
    </div>
  )
}

function FeaturedSkeleton() {
  return (
    <div className="h-full flex gap-4 items-center border border-bg-secondary rounded-lg p-3">
      <div className="flex-shrink-0 w-40 h-40 lg:w-52 lg:h-52 2xl:w-auto 2xl:h-auto 2xl:self-stretch 2xl:aspect-square bg-bg-tertiary rounded-lg animate-pulse" />
      <div className="flex flex-col justify-around self-stretch flex-1 min-w-0 py-1">
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-bg-tertiary rounded animate-pulse" />
          <div className="h-3.5 w-1/2 bg-bg-tertiary rounded animate-pulse" />
          <div className="h-3 w-1/3 bg-bg-tertiary rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 flex justify-center">
            <div className="h-8 w-16 bg-bg-tertiary rounded animate-pulse" />
          </div>
          <div className="w-px h-10 bg-border flex-shrink-0" />
          <div className="flex-1 flex justify-center">
            <div className="h-8 w-16 bg-bg-tertiary rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

function SmallSkeleton() {
  return (
    <div className="h-full flex flex-col border border-bg-secondary rounded-lg p-3 gap-2">
      <div className="w-full h-36 bg-bg-tertiary rounded-lg animate-pulse flex-shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="h-3.5 w-3/4 bg-bg-tertiary rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-bg-tertiary rounded animate-pulse" />
        <div className="h-3 w-1/3 bg-bg-tertiary rounded animate-pulse" />
      </div>
      <div className="flex items-center border-t border-border pt-2 mt-1">
        <div className="flex-1 flex justify-center">
          <div className="h-7 w-14 bg-bg-tertiary rounded animate-pulse" />
        </div>
        <div className="w-px h-7 bg-border flex-shrink-0" />
        <div className="flex-1 flex justify-center">
          <div className="h-7 w-14 bg-bg-tertiary rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardHomeLoading() {
  return (
    <>
      {/* WelcomeBanner skeleton */}
      <div className="flex flex-col xl:flex-row xl:items-center gap-6 xl:gap-0 mb-6 justify-between">
        <div className="xl:w-1/2 shrink-0 space-y-2.5">
          <div className="h-9 w-72 bg-bg-tertiary rounded animate-pulse" />
          <div className="h-3.5 w-48 bg-bg-tertiary rounded animate-pulse" />
        </div>
        <div className="xl:w-1/2 grid grid-cols-2 gap-px bg-border lg:flex lg:bg-transparent lg:gap-0 lg:divide-x lg:divide-border">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="lg:flex-1 flex flex-row gap-3 items-center lg:justify-center bg-bg-primary lg:bg-transparent px-4 py-3 lg:px-0 lg:py-0">
              <div className="w-8 h-8 rounded-full bg-bg-tertiary animate-pulse flex-shrink-0" />
              <div className="space-y-1.5">
                <div className="h-6 w-14 bg-bg-tertiary rounded animate-pulse" />
                <div className="h-3 w-24 bg-bg-tertiary rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TopAlbumsSection skeleton */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-5 w-48 bg-bg-tertiary rounded animate-pulse" />
          <div className="h-3.5 w-16 bg-bg-tertiary rounded animate-pulse" />
        </div>

        {/* Mobile — carrousel */}
        <div className="flex md:hidden overflow-x-hidden gap-3">
          {[0, 1].map(i => (
            <div key={i} className="flex-shrink-0 w-[85%] flex flex-col border border-bg-secondary rounded-lg p-3 gap-2">
              <div className="w-full h-36 bg-bg-tertiary rounded-lg animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-3/4 bg-bg-tertiary rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-bg-tertiary rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Tablet md (768–1023px) */}
        <div className="hidden md:flex lg:hidden flex-col gap-4">
          <FeaturedSkeleton />
          <div className="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map(i => <SmallSkeleton key={i} />)}
          </div>
        </div>

        {/* Laptop + xl (1024–1535px) */}
        <div className="hidden lg:flex 2xl:hidden flex-col gap-4">
          <FeaturedSkeleton />
          <div className="grid grid-cols-4 gap-4">
            {[0, 1, 2, 3].map(i => <SmallSkeleton key={i} />)}
          </div>
        </div>

        {/* Desktop 2xl (1536px+) */}
        <div className="hidden 2xl:flex gap-4 items-stretch">
          <div className="flex-shrink-0 2xl:w-[560px]">
            <FeaturedSkeleton />
          </div>
          <div className="flex-1 grid grid-cols-4 gap-4 min-w-0">
            {[0, 1, 2, 3].map(i => <SmallSkeleton key={i} />)}
          </div>
        </div>
      </div>

      {/* TopArtistes + TracksFavorites skeleton */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 mb-6">
        {/* TopArtistes */}
        <div>
          <div className="flex items-center gap-3 pb-3 mb-3 border-b border-border">
            <div className="h-5 w-36 bg-bg-tertiary rounded animate-pulse" />
            <div className="h-3.5 w-16 bg-bg-tertiary rounded animate-pulse" />
          </div>
          <div className="flex md:hidden flex-col divide-y divide-border">
            {[0, 1, 2, 3, 4].map(i => <ArtistRowSkeleton key={i} />)}
          </div>
          <div className="hidden md:flex gap-4 items-stretch">
            <div className="flex-shrink-0 w-[200px] lg:w-[220px]">
              <ArtistFeaturedSkeleton />
            </div>
            <div className="flex-1 flex flex-col divide-y divide-border min-w-0">
              {[0, 1, 2, 3].map(i => <ArtistRowSkeleton key={i} />)}
            </div>
          </div>
        </div>

        {/* TracksFavorites */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-5 w-40 bg-bg-tertiary rounded animate-pulse" />
            <div className="h-3.5 w-16 bg-bg-tertiary rounded animate-pulse" />
          </div>
          <div className="flex flex-col border border-bg-secondary rounded-lg overflow-hidden divide-y divide-border">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded bg-bg-tertiary animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-3/4 bg-bg-tertiary rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-bg-tertiary rounded animate-pulse" />
                </div>
                <div className="h-4 w-10 bg-bg-tertiary rounded animate-pulse flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
