"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function ClosingCTA() {
  return (
    <section className="py-20 md:py-28 bg-[var(--white)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--navy)] px-6 py-16 md:px-16 md:py-20 text-center"
        >
          {/* Subtle dot pattern overlay */}
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />

          {/* Cyan glow blob */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#78FFF9]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[var(--teal)]/10 blur-3xl pointer-events-none" />

          <div className="relative">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
              Your next practice test is one click away.
            </h2>
            <p className="mt-4 text-lg text-white/70 max-w-xl mx-auto">
              Join 12,000+ test takers. Free forever. No credit card required.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-[var(--teal)] hover:bg-[var(--teal-deep)] text-white font-bold text-base px-8 py-4 rounded-full transition-all hover:scale-[1.02] shadow-lg"
              >
                Create your free account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-base px-8 py-4 rounded-full transition-all border-2 border-white/20"
              >
                I already have an account
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}