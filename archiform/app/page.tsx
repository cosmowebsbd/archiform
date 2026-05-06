import MarketingNav from '@/components/marketing/nav'
import HeroSection from '@/components/marketing/hero'
import TestimonialsSection from '@/components/marketing/testimonials'
import FeaturesSection from '@/components/marketing/features'
import FAQSection from '@/components/marketing/faq'
import Footer from '@/components/marketing/footer'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <HeroSection />
      <TestimonialsSection />
      <FeaturesSection />

      {/* CTA Section */}
      <section className="py-24 bg-navy-950 relative overflow-hidden">
        <div className="absolute inset-0 section-dot-bg opacity-30" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold tracking-widest text-brand-400 uppercase mb-4">
            Ready to Start?
          </p>
          <h2 className="heading-lg text-white mb-6">
            Prefer a personalized walkthrough?
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Meet with a Product Expert to get an in-depth look at how A&amp;E firms use
            Archiform to increase revenue, efficiency, and productivity.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/auth/get-started"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium px-8 py-4 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-glow-md"
            >
              Book your free demo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#pricing"
              className="inline-flex items-center gap-2 border border-white/20 text-white hover:bg-white/10 font-medium px-8 py-4 rounded-xl transition-all"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      <FAQSection />
      <Footer />
    </div>
  )
}
