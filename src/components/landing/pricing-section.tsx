"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useInView, useSpring, useTransform } from "framer-motion"
import { Check, Zap } from "lucide-react"
import Link from "next/link"
import { TiltCard } from "@/components/ui/tilt-card"

function AnimatedPrice({
  price,
  isVisible,
}: {
  price: number
  isVisible: boolean
}) {
  const springValue = useSpring(0, {
    duration: 1500,
    bounce: 0,
  })

  const displayValue = useTransform(springValue, (value) => {
    if (price === 0) return "Free"
    return `৳${Math.round(value).toLocaleString()}`
  })

  useEffect(() => {
    if (isVisible) {
      springValue.set(price)
    }
  }, [isVisible, springValue, price])

  return <motion.span className="tabular-nums">{displayValue}</motion.span>
}

const plans = [
  {
    name: "Core",
    price: {
      monthly: 0,
      yearly: 0,
    },
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
    price: {
      monthly: 999,
      yearly: 799,
    },
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
    price: {
      monthly: 1999,
      yearly: 1599,
    },
    period: "/mo",
    description: "For band 7+ aspirants",
    features: [
      "Everything in Engage",
      "Full mock tests + reports",
      "Priority teacher feedback",
      "AI Writing Task 1 & Task 2 grading",
      "Detailed writing feedback",
      "1-on-1 live sessions",
    ],
    cta: "Start free trial",
    ctaStyle: "outline" as const,
    popular: false,
  },
]

export function PricingSection() {
  const [yearly, setYearly] = useState(false)

  const ref = useRef(null)

  const isInView = useInView(ref, {
    once: true,
    margin: "-100px",
  })

  return (
    <section
      id="pricing"
      ref={ref}
      className="py-20 md:py-28 bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-sm font-black tracking-widest text-teal uppercase mb-3">
            Pricing
          </span>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-ink leading-none">
            Simple, transparent pricing
          </h2>

          <p className="mt-4 text-lg text-slate max-w-2xl mx-auto font-medium">
            Start free. Upgrade when you're ready. No hidden fees, no surprises.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center gap-1 rounded-full border-3 border-ink bg-paper p-1 shadow-hard">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-full text-sm font-black transition-all ${
                !yearly
                  ? "bg-navy text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  : "text-slate hover:text-ink"
              }`}
            >
              Monthly
            </button>

            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-black transition-all ${
                yearly
                  ? "bg-navy text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  : "text-slate hover:text-ink"
              }`}
            >
              Yearly
              <span className="ml-1.5 text-xs font-black text-success">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
              }}
            >
              <TiltCard
                tiltAmount={plan.popular ? 5 : 3}
                glowColor={
                  plan.popular
                    ? "rgba(14, 165, 153, 0.2)"
                    : "rgba(14, 165, 153, 0.08)"
                }
              >
                <div
                  className={`relative rounded-2xl border-3 p-8 h-full flex flex-col transition-all hover:-translate-y-1 ${
                    plan.popular
                      ? "border-teal bg-teal/5 shadow-brutalist"
                      : "border-ink bg-white shadow-hard"
                  }`}
                >
                  {/* Most Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-teal text-white text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider border-2 border-ink shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1 whitespace-nowrap">
                        <Zap className="h-3 w-3" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="mb-6">
                    <div className="text-sm font-black tracking-widest text-slate uppercase mb-2">
                      {plan.name}
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl lg:text-5xl font-black text-ink">
                        {plan.price.monthly === 0 ? (
                          "Free"
                        ) : (
                          <AnimatedPrice
                            price={
                              yearly
                                ? plan.price.yearly
                                : plan.price.monthly
                            }
                            isVisible={isInView}
                          />
                        )}
                      </span>

                      <span className="text-sm font-bold text-slate">
                        {plan.period}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate font-medium">
                      {plan.description}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-slate"
                      >
                        <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />

                        <span className="font-bold">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href="/signup"
                    className={`block text-center w-full py-3 rounded-xl font-black text-base transition-all hover:scale-[1.02] border-3 ${
                      plan.ctaStyle === "filled"
                        ? "bg-navy hover:bg-navy-deep text-white border-navy shadow-hard hover:shadow-brutalist"
                        : "border-ink bg-white text-ink shadow-hard hover:shadow-brutalist hover:bg-paper"
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
