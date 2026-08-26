"use client"

import { motion } from "framer-motion"
import { Target, BookOpen, TrendingUp } from "lucide-react"

const steps = [
  {
    num: "01",
    color: "bg-[#78FFF9]",
    icon: Target,
    title: "Take a diagnostic test",
    desc: "Get your current band score instantly across all 4 skills. Know exactly where you stand before you start.",
  },
  {
    num: "02",
    color: "bg-[#FEF08A]",
    icon: BookOpen,
    title: "Follow your study plan",
    desc: "Lessons, practice tests & flashcards tailored to your weak spots. Your teacher assigns what you need.",
  },
  {
    num: "03",
    color: "bg-[#BFDBFE]",
    icon: TrendingUp,
    title: "Track & improve",
    desc: "Watch your band climb with instant feedback, streak rewards, and a clear history of every test.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-[var(--white)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <span className="inline-block text-sm font-bold tracking-widest text-[var(--teal)] uppercase mb-3">
            How it works
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#0F1720]">
            How IELTS Beta works
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <motion.div
                whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
                className="rounded-[var(--radius-lg)] border-2 border-[var(--mist)] bg-[var(--white)] p-8 h-full hover:border-[var(--teal)]/30 transition-colors"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-[var(--radius-md)] ${step.color} mb-5`}>
                  <span className="text-lg font-black text-[#0F1720]">{step.num}</span>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--teal)]/10 mb-5">
                  <step.icon className="h-6 w-6 text-[var(--teal)]" />
                </div>
                <h3 className="text-xl font-bold text-[#0F1720] mb-3">{step.title}</h3>
                <p className="text-[#334155] leading-relaxed">{step.desc}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}