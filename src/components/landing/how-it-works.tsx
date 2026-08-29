"use client"

import { motion, useInView } from "framer-motion"
import { Target, BookOpen, TrendingUp } from "lucide-react"
import { useRef } from "react"

const steps = [
  {
    num: "01",
    color: "bg-cyan",
    icon: Target,
    title: "Take a diagnostic test",
    desc: "Get your current band score instantly across all 4 skills. Know exactly where you stand before you start.",
  },
  {
    num: "02",
    color: "bg-yellow-300",
    icon: BookOpen,
    title: "Follow your study plan",
    desc: "Lessons, practice tests & flashcards tailored to your weak spots. Your teacher assigns what you need.",
  },
  {
    num: "03",
    color: "bg-blue-300",
    icon: TrendingUp,
    title: "Track & improve",
    desc: "Watch your band climb with instant feedback, streak rewards, and a clear history of every test.",
  },
]

function AnimatedPath() {
  const ref = useRef<SVGPathElement>(null)
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px",
  })

  return (
    <svg
      className="absolute top-24 left-0 w-full h-16 hidden md:block pointer-events-none"
      viewBox="0 0 1200 80"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <motion.path
        ref={ref}
        d="M 100 40 Q 300 40 400 40 Q 500 40 600 40 Q 700 40 800 40 Q 900 40 1100 40"
        stroke="var(--teal)"
        strokeWidth="3"
        strokeDasharray="8 8"
        fill="none"
        initial={{
          pathLength: 0,
          opacity: 0,
        }}
        animate={
          isInView
            ? {
                pathLength: 1,
                opacity: 1,
              }
            : {}
        }
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          delay: 0.3,
        }}
      />

      {[
        { cx: 100, delay: 0.2 },
        { cx: 600, delay: 0.8 },
        { cx: 1100, delay: 1.4 },
      ].map((point) => (
        <motion.circle
          key={point.cx}
          cx={point.cx}
          cy="40"
          r="6"
          fill="var(--teal)"
          initial={{ scale: 0 }}
          animate={
            isInView
              ? {
                  scale: 1,
                }
              : {}
          }
          transition={{
            delay: point.delay,
            type: "spring",
          }}
        />
      ))}
    </svg>
  )
}

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-20 md:py-28 bg-white relative"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.5,
          }}
          className="mb-16"
        >
          <span className="inline-block text-sm font-black tracking-widest text-teal uppercase mb-3">
            How it works
          </span>

          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-ink leading-none">
            How IELTS Beta works
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          <AnimatedPath />

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{
                  opacity: 0,
                  y: 40,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.2,
                  type: "spring",
                  stiffness: 100,
                }}
              >
                <motion.div
                  whileHover={{
                    y: -10,
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 20,
                    },
                  }}
                  className="rounded-2xl border-3 border-ink bg-white p-8 h-full shadow-hard hover:shadow-brutalist transition-shadow"
                >
                  {/* Number + icon */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${step.color} border-3 border-ink shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`}
                    >
                      <span className="text-lg font-black text-ink">
                        {step.num}
                      </span>
                    </div>

                    <motion.div
                      animate={{
                        rotate: [-2, 2, -2],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 3,
                        delay: i * 0.5,
                      }}
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10 border-2 border-teal/20"
                    >
                      <step.icon className="h-6 w-6 text-teal" />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-black text-ink mb-3 tracking-tight">
                    {step.title}
                  </h3>

                  <p className="text-slate leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
