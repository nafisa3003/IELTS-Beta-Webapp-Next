"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { Check } from "lucide-react"
import { useRef } from "react"
import { TiltCard } from "@/components/ui/tilt-card"

const features = [
  {
    tag: "Auto-graded",
    title: "Practice tests that grade themselves",
    desc: "Listening and Reading scored the moment you submit. Writing and Speaking sent to your teacher for rubric-based feedback. Know exactly where you stand.",
    bg: "bg-[var(--navy)]",
    text: "text-white",
    tagBg: "bg-[var(--teal)]/20",
    tagText: "text-[#78FFF9]",
    tagBorder: "border-[var(--teal)]/30",
    checkColor: "text-[#78FFF9]",
    gradient: "from-[var(--teal)] via-[#78FFF9] to-[var(--navy)]",
  },
  {
    tag: "All 4 skills",
    title: "Skill modules built for real progress",
    desc: "Targeted exercises for Listening, Reading, Writing, and Speaking. Each module adapts to your level with Cambridge-style passages and real accents.",
    bg: "bg-[var(--white)]",
    text: "text-[#0F1720]",
    tagBg: "bg-[var(--teal)]/10",
    tagText: "text-[var(--teal-deep)]",
    tagBorder: "border-[var(--teal)]/20",
    checkColor: "text-[var(--success)]",
    gradient: "from-[var(--navy)] via-[var(--teal)] to-[#78FFF9]",
  },
  {
    tag: "Vocabulary",
    title: "Master 180+ academic words with flashcards",
    desc: "3D interactive cards with difficulty levels, custom word creation, and spaced repetition. Build the vocabulary band 7+ answers demand.",
    bg: "bg-[#F0FDFC]",
    text: "text-[#0F1720]",
    tagBg: "bg-[var(--teal)]/10",
    tagText: "text-[var(--teal-deep)]",
    tagBorder: "border-[var(--teal)]/20",
    checkColor: "text-[var(--success)]",
    gradient: "from-[#78FFF9] via-white to-[var(--violet)]",
  },
  {
    tag: "AI Powered",
    title: "24/7 AI tutor for instant feedback",
    desc: "Essay grading, speaking fluency analysis, grammar checks, and live web search for the latest IELTS info. Get answers in seconds, not days.",
    bg: "bg-[var(--navy)]",
    text: "text-white",
    tagBg: "bg-[var(--teal)]/20",
    tagText: "text-[#78FFF9]",
    tagBorder: "border-[var(--teal)]/30",
    checkColor: "text-[#78FFF9]",
    gradient: "from-[var(--violet)] via-[var(--teal)] to-[#78FFF9]",
  },
  {
    tag: "Official",
    title: "Cambridge resources, curated",
    desc: "Official practice tests, band descriptors, academic word lists, and model answers — all organized and downloadable in one place.",
    bg: "bg-[var(--white)]",
    text: "text-[#0F1720]",
    tagBg: "bg-[var(--teal)]/10",
    tagText: "text-[var(--teal-deep)]",
    tagBorder: "border-[var(--teal)]/20",
    checkColor: "text-[var(--success)]",
    gradient: "from-[var(--navy)] to-[var(--teal)]",
  },
  {
    tag: "Gamified",
    title: "Progress you can actually see",
    desc: "XP for every test, streaks that remember you showed up, and a band history that shows the climb — not just today's score.",
    bg: "bg-[#F0FDFC]",
    text: "text-[#0F1720]",
    tagBg: "bg-[var(--teal)]/10",
    tagText: "text-[var(--teal-deep)]",
    tagBorder: "border-[var(--teal)]/20",
    checkColor: "text-[var(--success)]",
    gradient: "from-[var(--teal)] via-[#78FFF9] to-white",
  },
]

const checkItems = ["Instant scoring", "Teacher feedback", "Progress tracking"]

export function FeatureShowcase() {
  const containerRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])

  return (
    <section ref={containerRef} id="features" className="relative overflow-hidden">
      <div className="space-y-0">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className={`py-20 md:py-28 ${feature.bg}`}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${i % 2 === 1 ? "" : ""}`}>
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <div className={`inline-flex items-center gap-2 rounded-full border-2 ${feature.tagBorder} ${feature.tagBg} px-3 py-1 text-xs font-bold ${feature.tagText} uppercase tracking-wider mb-4`}>
                    {feature.tag}
                  </div>
                  <h3 className={`text-3xl md:text-4xl lg:text-5xl font-black tracking-tight ${feature.text} mb-4`}>
                    {feature.title}
                  </h3>
                  <p className={`text-lg leading-relaxed mb-6 ${feature.bg === "bg-[var(--navy)]" ? "text-white/80" : "text-[#334155]"}`}>
                    {feature.desc}
                  </p>
                  <ul className="space-y-2">
                    {checkItems.map((item) => (
                      <li key={item} className={`flex items-center gap-2 text-sm font-semibold ${feature.text}`}>
                        <Check className={`h-4 w-4 ${feature.checkColor}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <TiltCard tiltAmount={8} glowColor={feature.bg === "bg-[var(--navy)]" ? "rgba(120, 255, 249, 0.15)" : "rgba(14, 165, 153, 0.12)"}>
                    <div className="rounded-[var(--radius-lg)] border-2 border-[var(--mist)] bg-[var(--paper)] p-3 shadow-[var(--shadow-card)]">
                      <div className={`rounded-[var(--radius-md)] w-full aspect-[4/3] bg-gradient-to-br ${feature.gradient} opacity-90`} />
                    </div>
                  </TiltCard>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}