import DischecLoader from '@/components/ui/DischecLoader'

function CollectionGenreSkeleton() {
  return (
    <div className="border border-bg-secondary rounded-lg p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="h-4 w-36 bg-bg-tertiary rounded animate-pulse" />
        <div className="h-4 w-14 bg-bg-tertiary rounded animate-pulse" />
      </div>
      <div className="md:hidden flex flex-col gap-3">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 flex-shrink-0 rounded bg-bg-tertiary animate-pulse" />
            <div className="flex-1 h-4 bg-bg-tertiary rounded animate-pulse" />
            <div className="flex flex-col items-end gap-1">
              <div className="h-4 w-12 bg-bg-tertiary rounded animate-pulse" />
              <div className="h-3 w-16 bg-bg-tertiary rounded animate-pulse" />
            </div>
            <div className="w-12 h-4 bg-bg-tertiary rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="hidden md:grid gap-3 md:[grid-template-columns:1.5fr_1fr_0.7fr] lg:[grid-template-columns:1.5fr_1fr_1fr_0.7fr] xl:[grid-template-columns:1.5fr_1fr_1fr_0.85fr_0.7fr]">
        <div className="h-[260px] rounded-[18px] bg-bg-tertiary animate-pulse" />
        <div className="h-[260px] rounded-[18px] bg-bg-tertiary animate-pulse" />
        <div className="h-[260px] rounded-[18px] bg-bg-tertiary animate-pulse md:hidden lg:block" />
        <div className="h-[260px] rounded-[18px] bg-bg-tertiary animate-pulse md:hidden xl:block" />
        <div className="h-[260px] rounded-[18px] bg-bg-tertiary animate-pulse" />
      </div>
    </div>
  )
}

function CollectionDecadeSkeleton() {
  return (
    <div className="border border-bg-secondary rounded-lg p-5 flex flex-col gap-4 h-full">
      <div className="h-4 w-44 bg-bg-tertiary rounded animate-pulse" />
      <div className="relative flex-1 flex flex-col">
        <div className="absolute top-0 bottom-0 w-px left-4 bg-bg-tertiary" />
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex-1 flex">
            <div className="flex-shrink-0 w-8 flex justify-center items-center relative z-10">
              <div className="w-2.5 h-2.5 rounded-full bg-bg-tertiary" />
            </div>
            <div className={`flex-1 flex items-center gap-3 pl-3 py-2.5 2xl:py-0 ${i < 6 ? 'border-b border-bg-secondary' : ''}`}>
              <div className="h-3.5 w-10 bg-bg-tertiary rounded animate-pulse" />
              <div className="flex-1 flex justify-end gap-3">
                <div className="h-3.5 w-20 bg-bg-tertiary rounded animate-pulse" />
                <div className="w-12 h-3.5 bg-bg-tertiary rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CollectionArtistExplorationSkeleton() {
  return (
    <div className="border border-bg-secondary rounded-lg p-5 flex flex-col gap-4">
      <div className="h-4 w-48 bg-bg-tertiary rounded animate-pulse" />
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        <div className="flex flex-col gap-3 lg:flex-1">
          <div className="h-3.5 w-40 bg-bg-tertiary rounded animate-pulse" />
          <div className="flex flex-col">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-16 h-16 rounded-md bg-bg-tertiary animate-pulse flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                  <div className="h-3 w-28 bg-bg-tertiary rounded animate-pulse" />
                  <div className="h-3 w-16 bg-bg-tertiary rounded animate-pulse" />
                </div>
                <div className="h-5 w-16 bg-bg-tertiary rounded flex-shrink-0 animate-pulse" />
              </div>
            ))}
          </div>
          <div className="h-3 w-14 bg-bg-tertiary rounded animate-pulse" />
        </div>

        <div className="h-px w-full bg-bg-secondary lg:h-auto lg:w-px lg:self-stretch flex-shrink-0" />

        <div className="flex flex-col gap-3 lg:flex-1">
          <div className="h-3.5 w-16 bg-bg-tertiary rounded animate-pulse" />
          <div className="flex flex-col">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className={`flex items-center gap-3 py-2 ${i < 4 ? 'border-b border-bg-secondary' : ''}`}>
                <div className="w-10 h-10 rounded-md bg-bg-tertiary animate-pulse flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                  <div className="flex justify-between gap-2">
                    <div className="h-3 w-24 bg-bg-tertiary rounded animate-pulse" />
                    <div className="h-3 w-20 bg-bg-tertiary rounded animate-pulse flex-shrink-0" />
                  </div>
                  <div className="h-1.5 w-full bg-bg-tertiary rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-3 w-14 bg-bg-tertiary rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

function CollectionRecentActivitySkeleton() {
  return (
    <div className="border border-bg-secondary rounded-lg p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 bg-bg-tertiary rounded animate-pulse" />
        <div className="h-7 w-32 bg-bg-tertiary rounded-full animate-pulse" />
      </div>
      <div className="flex flex-col">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className={`flex items-center gap-3 py-2.5 ${i < 4 ? 'border-b border-bg-secondary' : ''}`}>
            <div className="w-10 h-10 rounded-md bg-bg-tertiary animate-pulse flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
              <div className="h-3 w-28 bg-bg-tertiary rounded animate-pulse" />
              <div className="h-3 w-20 bg-bg-tertiary rounded animate-pulse" />
            </div>
            <div className="h-3 w-12 bg-bg-tertiary rounded animate-pulse flex-shrink-0" />
          </div>
        ))}
      </div>
      <div className="h-3 w-14 bg-bg-tertiary rounded animate-pulse" />
    </div>
  )
}

function PeriodSelectorSkeleton() {
  return (
    <div className="flex items-center gap-0.5 bg-bg-tertiary rounded-full p-0.5">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="h-6 w-16 bg-bg-secondary rounded-full animate-pulse" />
      ))}
    </div>
  )
}

function CollectionGlobalSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-5 w-40 bg-bg-tertiary rounded animate-pulse" />
      <div className="grid grid-cols-2 gap-px bg-border lg:flex lg:bg-transparent lg:gap-0 lg:divide-x lg:divide-border">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="lg:flex-1 flex flex-col items-center gap-1.5 px-4 py-4 sm:px-6 bg-bg-primary lg:bg-transparent">
            <div className="w-6 h-6 lg:w-9 lg:h-9 rounded-full bg-bg-tertiary animate-pulse" />
            <div className="h-6 w-10 bg-bg-tertiary rounded animate-pulse" />
            <div className="h-3 w-20 bg-bg-tertiary rounded animate-pulse" />
            <div className="h-4 w-10 bg-bg-tertiary rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CollectionLoading() {
  return (
    <div className="relative flex flex-col gap-6">
      <div className="flex justify-end">
        <PeriodSelectorSkeleton />
      </div>
      <CollectionGlobalSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2 xl:col-span-2 2xl:col-span-1">
          <CollectionGenreSkeleton />
        </div>
        <div className="lg:col-span-2 xl:col-span-2 2xl:col-span-1">
          <CollectionDecadeSkeleton />
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <CollectionArtistExplorationSkeleton />
        </div>
        <div>
          <CollectionRecentActivitySkeleton />
        </div>
      </div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/60 backdrop-blur-[2px] pointer-events-none">
        <DischecLoader size={80} />
      </div>
    </div>
  )
}
