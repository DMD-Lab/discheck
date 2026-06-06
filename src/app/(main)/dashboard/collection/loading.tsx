import DischecLoader from '@/components/ui/DischecLoader'

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/60 backdrop-blur-[2px] pointer-events-none">
        <DischecLoader size={80} />
      </div>
    </div>
  )
}
