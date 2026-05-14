export default function ArtistLoading() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-18 h-18 rounded-lg bg-bg-tertiary animate-pulse flex-shrink-0" style={{ width: 72, height: 72 }} />
        <div className="space-y-2">
          <div className="h-7 w-48 bg-bg-tertiary rounded animate-pulse" />
          <div className="h-4 w-24 bg-bg-tertiary rounded animate-pulse" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-bg-tertiary rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )
}
