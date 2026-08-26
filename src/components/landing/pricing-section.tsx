"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import Link from "next/link"
import { TiltCard } from "@/components/ui/tilt-card"

const plans = [
  {
    name: "Core",
    price: { monthly: 0, yearly: 0 },
    period: "forever",
    description: "For students getting started",
    features: [
      "User account & dashboard",
      "Goal tracking",
      "All 4 skill modules",
      "Dark / light mode",
      "Basic flashcards",
    ],
    cta: "Get started",
    ctaStyle: "outline" as const,
    popular: false,
  },
  {
    name: "Engage",
    price: { monthly: 999, yearly: 799 },
    period: "/mo",
    description: "For serious test takers",
    features: [
      "Everything in Core",
      "Vocabulary flashcards",
      "Daily streaks & rewards",
      "Progress analytics",
      "AI tutor access",
      "Cambridge resource library",
    ],
    cta: "Start free trial",
    ctaStyle: "filled" as const,
    popular: true,
  },
  {
    name: "Advanced",
    price: { monthly: 1999, yearly: 1599 },
    period: "/mo",
    description: "For band 7+ aspirants",
    features: [
      "Everything in Engage",
      "Full mock tests + reports",
      "Priority teacher feedback",
      "Speaking fluency analysis",
      "Essay grading with rubric",
      "1-on-1 live sessions",
    ],
    cta: "Start free trial",
    ctaStyle: "outline" as const,
    popular: false,
  },
]

export function PricingSection() {
  const [yearly, setYearly] = useState(false)

  const formatPrice = (price: number) => {
    if (price === 0) return "Free"
    return `৳${price}`
  }

  return (
    <section id="pricing" className="py-20 md:py-28 bg-[var(--white)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-sm font-bold tracking-widest text-[var(--teal)] uppercase mb-3">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#0F1720]">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-[#334155] max-w-2xl mx-auto">
            Start free. Upgrade when you're ready. No hidden fees, no surprises.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border-2 border-[var(--mist)] bg-[var(--paper)] p-1">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                !yearly
                  ? "bg-[var(--navy)] text-white"
                  : "text-[#334155] hover:text-[#0F1720]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                yearly
                  ? "bg-[var(--navy)] text-white"
                  : "text-[#334155] hover:text-[#0F1720]"
              }`}
            >
              Yearly
              <span className="ml-1.5 text-xs font-bold text-[var(--success)]">Save 20%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <TiltCard tiltAmount={plan.popular ? 5 : 3} glowColor={plan.popular ? "rgba(14, 165, 153, 0.15)" : "rgba(14, 165, 153, 0.08)"}>
                <div className={`relative rounded-[var(--radius-lg)] border-2 p-8 h-full flex flex-col ${
                  plan.popular
                    ? "border-[var(--teal)] bg-[var(--teal)]/5"
                    : "border-[var(--mist)] bg-[var(--white)]"
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-[var(--teal)] text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="text-sm font-bold tracking-widest text-[#334155] uppercase mb-2">
                      {plan.name}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-[#0F1720]">
                        {formatPrice(yearly ? plan.price.yearly : plan.price.monthly)}
                      </span>
                      <span className="text-sm font-medium text-[#334155]">
                        {plan.price.monthly === 0 ? plan.period : plan.period}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[#334155]">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-[#334155]">
                        <Check className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/signup"
                    className={`block text-center w-full py-3 rounded-full font-bold text-base transition-all hover:scale-[1.02] ${
                      plan.ctaStyle === "filled"
                        ? "bg-[var(--navy)] hover:bg-[var(--navy-deep)] text-white shadow-[var(--shadow-float)]"
                        : "border-2 border-[var(--mist)] hover:border-[var(--navy)]/30 text-[#0F1720] hover:bg-[var(--paper)]"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}