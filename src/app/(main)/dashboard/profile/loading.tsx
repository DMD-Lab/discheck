function GenresSkeleton() {
  return (
    <section>
      <div className="flex items-center justify-between pb-3 mb-3 gap-4">
        <div className="space-y-1.5">
          <div className="h-5 w-40 bg-bg-tertiary rounded animate-pulse" />
          <div className="h-3 w-64 bg-bg-tertiary rounded animate-pulse" />
        </div>
        <div className="h-3.5 w-16 bg-bg-tertiary rounded animate-pulse flex-shrink-0" />
      </div>

      {/* mobile */}
      <div className="grid grid-cols-2 gap-4 lg:hidden">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="aspect-square sm:aspect-[3/2] bg-bg-tertiary rounded-xl animate-pulse" />
        ))}
      </div>

      {/* desktop */}
      <div
        className="hidden lg:grid gap-4 h-52"
        style={{ gridTemplateColumns: '1fr 1fr 1fr 0.6fr' }}
      >
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="bg-bg-tertiary rounded-xl animate-pulse" />
        ))}
      </div>
    </section>
  )
}

function DecadesSkeleton() {
  const bars = [0.4, 1, 0.6, 0.3, 0.85, 0.5, 0.2]
  return (
    <section className="border border-bg-secondary rounded-lg p-5 flex flex-col">
      <div className="mb-3 flex-shrink-0 space-y-1.5">
        <div className="h-5 w-44 bg-bg-tertiary rounded animate-pulse" />
        <div className="h-3 w-56 bg-bg-tertiary rounded animate-pulse" />
      </div>
      <div className="flex gap-1 pt-7 h-[120px] lg:h-auto lg:flex-1 min-h-0">
        {bars.map((ratio, i) => (
          <div key={i} className="flex-1 flex flex-col items-center min-h-0">
            <div className="flex-1 relative flex items-end justify-center min-h-0 w-full">
              <div
                className="w-8 lg:w-5 xl:w-8 bg-bg-tertiary rounded-t animate-pulse"
                style={{ height: `${ratio * 100}%` }}
              />
            </div>
            <div className="flex-shrink-0 h-2.5 w-5 bg-bg-tertiary rounded animate-pulse mt-1" />
          </div>
        ))}
      </div>
    </section>
  )
}

function ListenerSkeleton() {
  return (
    <section className="border border-bg-secondary rounded-lg p-5">
      <div className="mb-3 space-y-1.5 lg:min-h-[128px] xl:min-h-0 2xl:min-h-[64px]">
        <div className="h-5 w-44 bg-bg-tertiary rounded animate-pulse" />
        <div className="h-3 w-52 bg-bg-tertiary rounded animate-pulse" />
      </div>
      <div className="flex items-center gap-3 pt-2 lg:flex-col lg:gap-4 xl:flex-row xl:gap-3">
        {/* stat gauche */}
        <div className="flex-1 flex flex-col items-center gap-1.5 lg:hidden xl:flex">
          <div className="h-6 w-12 bg-bg-tertiary rounded animate-pulse" />
          <div className="h-3 w-16 bg-bg-tertiary rounded animate-pulse" />
          <div className="h-3 w-14 bg-bg-tertiary rounded animate-pulse" />
        </div>

        {/* donut */}
        <div className="relative flex-shrink-0 w-24 h-24 xl:w-[120px] xl:h-[120px] rounded-full border-[12px] border-bg-tertiary animate-pulse" />

        {/* stat droite */}
        <div className="flex-1 flex flex-col items-center gap-1.5 lg:hidden xl:flex">
          <div className="h-6 w-12 bg-bg-tertiary rounded animate-pulse" />
          <div className="h-3 w-14 bg-bg-tertiary rounded animate-pulse" />
          <div className="h-3 w-14 bg-bg-tertiary rounded animate-pulse" />
        </div>

        {/* stats sous donut — lg only */}
        <div className="hidden lg:flex xl:hidden w-full items-center gap-3">
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <div className="h-6 w-12 bg-bg-tertiary rounded animate-pulse" />
            <div className="h-3 w-16 bg-bg-tertiary rounded animate-pulse" />
            <div className="h-3 w-14 bg-bg-tertiary rounded animate-pulse" />
          </div>
          <div className="w-px h-10 bg-border flex-shrink-0" />
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <div className="h-6 w-12 bg-bg-tertiary rounded animate-pulse" />
            <div className="h-3 w-14 bg-bg-tertiary rounded animate-pulse" />
            <div className="h-3 w-14 bg-bg-tertiary rounded animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  )
}

function ConcentrationSkeleton() {
  return (
    <section className="border border-bg-secondary rounded-lg p-5">
      <div className="mb-3 space-y-1.5 lg:min-h-[128px] xl:min-h-0 2xl:min-h-[64px]">
        <div className="h-5 w-44 bg-bg-tertiary rounded animate-pulse" />
        <div className="h-3 w-52 bg-bg-tertiary rounded animate-pulse" />
      </div>
      <div className="flex items-center gap-3 pt-2 lg:flex-col lg:gap-4 xl:flex-row xl:gap-3">
        {/* stat gauche */}
        <div className="flex-1 flex flex-col items-center gap-1.5 lg:hidden xl:flex">
          <div className="h-6 w-12 bg-bg-tertiary rounded animate-pulse" />
          <div className="h-3 w-20 bg-bg-tertiary rounded animate-pulse" />
        </div>

        {/* donut */}
        <div className="relative flex-shrink-0 w-24 h-24 xl:w-[120px] xl:h-[120px] rounded-full border-[12px] border-bg-tertiary animate-pulse" />

        {/* stat droite */}
        <div className="flex-1 flex flex-col items-center gap-1.5 lg:hidden xl:flex">
          <div className="h-6 w-16 bg-bg-tertiary rounded animate-pulse" />
          <div className="h-3 w-24 bg-bg-tertiary rounded animate-pulse" />
        </div>

        {/* stats sous donut — lg only */}
        <div className="hidden lg:flex xl:hidden w-full items-center gap-3">
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <div className="h-6 w-12 bg-bg-tertiary rounded animate-pulse" />
            <div className="h-3 w-20 bg-bg-tertiary rounded animate-pulse" />
          </div>
          <div className="w-px h-10 bg-border flex-shrink-0" />
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <div className="h-6 w-16 bg-bg-tertiary rounded animate-pulse" />
            <div className="h-3 w-24 bg-bg-tertiary rounded animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  )
}

function CritiqueSkeleton() {
  return (
    <section className="border border-bg-secondary rounded-lg p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="h-5 w-36 bg-bg-tertiary rounded animate-pulse" />
        <div className="h-6 w-28 bg-bg-tertiary rounded-full animate-pulse" />
      </div>
      <div className="h-3 w-64 bg-bg-tertiary rounded animate-pulse mt-1 mb-4" />
      <div className="flex items-center gap-4">
        <div className="w-3/5 flex flex-col gap-2">
          {[85, 65, 40, 25, 15].map((w, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 bg-bg-tertiary rounded animate-pulse flex-shrink-0" />
              <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                <div className="h-full bg-bg-secondary rounded-full" style={{ width: `${w}%` }} />
              </div>
              <div className="w-8 h-3 bg-bg-tertiary rounded animate-pulse flex-shrink-0" />
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-0.5 pl-4 border-l border-border">
          <div className="h-8 w-12 bg-bg-tertiary rounded animate-pulse" />
          <div className="h-3 w-14 bg-bg-tertiary rounded animate-pulse mt-0.5" />
          <div className="h-3 w-10 bg-bg-tertiary rounded animate-pulse mt-0.5" />
        </div>
      </div>
    </section>
  )
}

import DischecLoader from '@/components/ui/DischecLoader'

export default function ProfileLoading() {
  return (
    <div className="relative flex flex-col gap-6">
      <GenresSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DecadesSkeleton />
        <ListenerSkeleton />
        <ConcentrationSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-full xl:col-span-2">
          <CritiqueSkeleton />
        </div>
      </div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/60 backdrop-blur-[2px] pointer-events-none">
        <DischecLoader size={80} />
      </div>
    </div>
  )
}
