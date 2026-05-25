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
      <div className="flex flex-col xl:flex-row xl:items-center gap-6 xl:gap-0 mb-10 justify-between">
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
      <div className="mb-10">
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
    </>
  )
}
