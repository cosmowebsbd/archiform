import AppSidebar from '@/components/app/sidebar'
import TrialBanner from '@/components/app/trial-banner'
import AuthGuard from '@/components/app/auth-guard'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
     <AuthGuard>
      <div className="min-h-screen bg-[#f4f5f9]">
        <AppSidebar />
        <main className="app-main pb-16">{children}</main>
        <TrialBanner />
      </div>
    </AuthGuard>
  )
}
