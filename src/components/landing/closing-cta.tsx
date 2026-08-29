"use client"

import { motion, useMotionValue, useSpring } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRef, useCallback } from "react"
import confetti from "canvas-confetti"

function MagneticConfettiButton({
  children,
  href,
}: {
  children: React.ReactNode
  href: string
}) {
  const ref = useRef<HTMLAnchorElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, {
    stiffness: 150,
    damping: 15,
  })

  const springY = useSpring(y, {
    stiffness: 150,
    damping: 15,
  })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()

      const distX =
        (e.clientX - rect.left - rect.width / 2) * 0.2

      const distY =
        (e.clientY - rect.top - rect.height / 2) * 0.2

      x.set(distX)
      y.set(distY)
    },
    [x, y]
  )

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  const handleHover = useCallback(() => {
    confetti({
      particleCount: 60,
      spread: 80,
      origin: {
        y: 0.7,
      },
      colors: [
        "#78FFF9",
        "#0EA599",
        "#F5A524",
        "#FF6B4A",
      ],
      disableForReducedMotion: true,
    })
  }, [])

  return (
    <motion.div style={{ x: springX, y: springY }}>
      <Link
        ref={ref}
        href={href}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleHover}
        className="btn-brutalist text-lg px-10 py-5"
      >
        {children}
      </Link>
    </motion.div>
  )
}

export function ClosingCTA() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-navy px-6 py-16 md:px-16 md:py-20 text-center border-3 border-ink shadow-brutalist"
        >
          {/* Cinematic dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* Cyan atmospheric glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-cyan/10 blur-3xl pointer-events-none" />

          {/* Teal atmospheric glow */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-teal/10 blur-3xl pointer-events-none" />

          <div className="relative">
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter text-white max-w-3xl mx-auto leading-none">
              Your next practice test is one click away.
            </h2>

            <p className="mt-4 text-lg text-white/70 max-w-xl mx-auto font-medium">
              Join 12,000+ test takers. Free forever. No credit card required.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <MagneticConfettiButton href="/signup">
                Create your free account
                <ArrowRight className="h-5 w-5" />
              </MagneticConfettiButton>

              <Link
                href="/login"
                className="btn-brutalist-outline bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50"
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
