import { createClient } from "@/lib/supabase/server"
import { LandingNav } from "@/components/landing/landing-nav"
import { Hero } from "@/components/landing/hero"
import { TrustBar } from "@/components/landing/trust-bar"
import { HowItWorks } from "@/components/landing/how-it-works"
import { FeatureShowcase } from "@/components/landing/feature-showcase"
import { ForTeachers } from "@/components/landing/for-teachers"
import { SocialProof } from "@/components/landing/social-proof"
import { PricingSection } from "@/components/landing/pricing-section"
import { FAQSection } from "@/components/landing/faq-section"
import { ClosingCTA } from "@/components/landing/closing-cta"
import { LandingFooter } from "@/components/landing/landing-footer"
import { ScrollToTop } from "@/components/landing/scroll-to-top"
import type { NavRole } from "@/components/shell/top-nav"

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let displayName = ""
  let role: NavRole = "student"

  if (user) {
    const { data } = await supabase
      .from("users")
      .select("personid, role, persons(first_name, last_name)")
      .eq("userid", user.id)
      .single()

    const person = (data as unknown as { persons: { first_name: string; last_name: string } | null })?.persons
    displayName = person ? `${person.first_name} ${person.last_name}` : user.email ?? ""

    const userRole = (data as unknown as { role: string | null })?.role
    if (userRole === "teacher" || userRole === "admin") {
      role = userRole as NavRole
    }
  }

  return (
    <main className="min-h-screen">
      <LandingNav user={user} displayName={displayName} role={role} />
      <Hero />
      <TrustBar />
      <HowItWorks />
      <FeatureShowcase />
      <ForTeachers />
      <SocialProof />
      <PricingSection />
      <FAQSection />
      <ClosingCTA />
      <LandingFooter />
      <ScrollToTop />
    </main>
  )
}