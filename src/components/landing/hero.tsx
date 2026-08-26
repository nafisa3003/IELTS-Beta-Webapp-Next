"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Play, TrendingUp, Target, BookOpen } from "lucide-react"
import Link from "next/link"
import { useRef } from "react"

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 150])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[#78FFF9] pt-32 pb-16 md:pt-40 md:pb-24">
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #0F1720 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      <motion.div style={{ opacity }} className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center rounded-full border-2 border-[#0F1720]/10 bg-[#0F1720]/5 px-4 py-1.5 text-sm font-bold text-[#0F1720] mb-6"
            >
              <span className="flex h-2 w-2 rounded-full bg-[var(--teal)] mr-2 animate-pulse" />
              Trusted by 12,000+ learners in Bangladesh
            </motion.div>

            <h1 className="text-5xl font-black tracking-tighter text-[#0F1720] sm:text-6xl md:text-7xl leading-[1.05]">
              Ready to level up{" "}
              <span className="text-[var(--navy)]">your IELTS score?</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-[#334155] max-w-xl leading-relaxed">
              Self-grading practice tests, teacher-reviewed writing & speaking,
              vocabulary flashcards, and AI feedback — all in one place.
              Hit your target band faster.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-[var(--navy)] hover:bg-[var(--navy-deep)] text-white font-bold text-base px-8 py-4 rounded-full transition-all hover:scale-[1.02] border-2 border-[var(--navy)] shadow-[var(--shadow-float)]"
              >
                Start free today <ArrowRight className="h-4 w-4" />
              </Link>
              <button className="inline-flex items-center gap-2 bg-transparent hover:bg-[#0F1720]/5 text-[#0F1720] font-bold text-base px-8 py-4 rounded-full transition-all border-2 border-[#0F1720]/20 hover:border-[#0F1720]/40">
                <Play className="h-4 w-4 fill-current" /> View demo
              </button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-10 flex items-center gap-6 md:gap-10"
            >
              <div>
                <div className="text-3xl font-black text-[#0F1720]">12K+</div>
                <div className="text-sm font-medium text-[#334155]">Active learners</div>
              </div>
              <div className="h-10 w-0.5 bg-[#0F1720]/10" />
              <div>
                <div className="text-3xl font-black text-[#0F1720]">4.9/5</div>
                <div className="text-sm font-medium text-[#334155]">Satisfaction</div>
              </div>
              <div className="h-10 w-0.5 bg-[#0F1720]/10" />
              <div>
                <div className="text-3xl font-black text-[#0F1720]">+1.4</div>
                <div className="text-sm font-medium text-[#334155]">Avg. band gain</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Product placeholder with 3D tilt */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative"
            style={{ perspective: 1000 }}
          >
            <motion.div
              whileHover={{ rotateY: 5, rotateX: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative rounded-[var(--radius-lg)] border-2 border-[var(--mist)] bg-white p-3 shadow-[var(--shadow-float)]"
            >
              <div className="rounded-[var(--radius-md)] w-full aspect-[4/3] bg-gradient-to-br from-[var(--navy)] via-[var(--teal)] to-[#78FFF9] opacity-90" />
            </motion.div>

            {/* Floating streak card */}
            <motion.div
              style={{ y: y2 }}
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 md:-left-8 rounded-[var(--radius-md)] border-2 border-[var(--teal)]/20 bg-white p-4 shadow-[var(--shadow-float)] z-10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--xp)]/10 text-[var(--xp)]">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-[var(--navy)]">21 day streak!</div>
                  <div className="text-xs font-medium text-[var(--slate)]">Keep it going</div>
                </div>
              </div>
            </motion.div>

            {/* Floating score card */}
            <motion.div
              style={{ y: y1 }}
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
              className="absolute -top-4 -right-4 md:-right-6 rounded-[var(--radius-md)] border-2 border-[var(--success)]/20 bg-white p-4 shadow-[var(--shadow-float)] z-10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-[var(--navy)]">Band 7.5</div>
                  <div className="text-xs font-medium text-[var(--slate)]">New personal best</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}