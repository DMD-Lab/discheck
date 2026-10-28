import DischecLoader from '@/components/ui/DischecLoader'

export default function RecapLoading() {
  return (
    <div className="relative flex flex-col gap-6">
      <div className="flex justify-end">
        <div className="h-8 w-40 bg-bg-tertiary rounded-full animate-pulse" />
      </div>
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-10 px-4">
        <div className="h-10 w-48 bg-bg-tertiary rounded animate-pulse" />
        <div className="w-full max-w-2xl flex flex-col gap-10">
          <div className="flex items-center gap-4 self-start">
            <div className="w-14 h-14 rounded-full bg-bg-tertiary animate-pulse" />
            <div className="h-12 w-32 bg-bg-tertiary rounded animate-pulse" />
          </div>
          <div className="flex flex-row-reverse items-center gap-4 self-end">
            <div className="w-10 h-10 rounded-full bg-bg-tertiary animate-pulse" />
            <div className="h-10 w-24 bg-bg-tertiary rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-4 self-start">
            <div className="w-10 h-10 rounded-full bg-bg-tertiary animate-pulse" />
            <div className="h-10 w-24 bg-bg-tertiary rounded animate-pulse" />
          </div>
          <div className="flex flex-row-reverse items-center gap-4 self-end">
            <div className="w-14 h-14 rounded-full bg-bg-tertiary animate-pulse" />
            <div className="h-12 w-32 bg-bg-tertiary rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/60 backdrop-blur-[2px] pointer-events-none">
        <DischecLoader size={80} />
      </div>
    </div>
  )
}
