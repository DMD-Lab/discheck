import DashboardTabs from '@/components/dashboard/DashboardTabs'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-6 md:px-8 lg:px-16 lg:py-12 flex flex-col flex-1">
      <DashboardTabs />
      {children}
    </div>
  )
}
