import DashboardTabs from '@/components/dashboard/DashboardTabs'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pt-6 pb-6 md:px-8 lg:px-16 lg:pt-6 lg:pb-6 flex flex-col flex-1">
      <DashboardTabs />
      {children}
    </div>
  )
}
