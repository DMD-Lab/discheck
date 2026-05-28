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
      <div className="grid grid-cols-2 gap-3 lg:hidden">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="aspect-square sm:aspect-[3/2] bg-bg-tertiary rounded-xl animate-pulse" />
        ))}
      </div>

      {/* desktop */}
      <div
        className="hidden lg:grid gap-3 h-52"
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
    <section className="border border-bg-secondary rounded-lg p-5">
      <div className="mb-3 space-y-1.5">
        <div className="h-5 w-44 bg-bg-tertiary rounded animate-pulse" />
        <div className="h-3 w-56 bg-bg-tertiary rounded animate-pulse" />
      </div>
      <div className="flex items-end gap-1 pt-3">
        {bars.map((ratio, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-8 bg-bg-tertiary rounded-t animate-pulse"
              style={{ height: `${ratio * 80}px` }}
            />
            <div className="h-2.5 w-5 bg-bg-tertiary rounded animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  )
}

export default function ProfileLoading() {
  return (
    <div className="flex flex-col gap-6">
      <GenresSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DecadesSkeleton />
      </div>
    </div>
  )
}
