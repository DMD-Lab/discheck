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
      </div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/60 backdrop-blur-[2px] pointer-events-none">
        <DischecLoader size={80} />
      </div>
    </div>
  )
}
