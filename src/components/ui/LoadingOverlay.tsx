import DischecLoader from './DischecLoader'

export default function LoadingOverlay() {
  return (
    <div className="loading-overlay fixed inset-0 z-[70] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <DischecLoader size={64} />
    </div>
  )
}
