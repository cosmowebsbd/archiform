import AppSidebar from '@/components/app/sidebar'
import TrialBanner from '@/components/app/trial-banner'

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f5f9]">
      <AppSidebar />
      <main className="app-main pb-16">{children}</main>
      <TrialBanner />
    </div>
  )
}