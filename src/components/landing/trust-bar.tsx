"use client"

import { motion } from "framer-motion"

const stats = [
  { value: "12,000+", label: "Learners building their streak" },
  { value: "4.9/5", label: "Average student rating" },
  { value: "50,000+", label: "Practice tests taken" },
  { value: "98%", label: "Students hit their target band" },
]

export function TrustBar() {
  return (
    <section className="border-y-2 border-[var(--mist)] bg-[var(--white)] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, i) => (
            <div key={stat.label} className={`text-center ${i < stats.length - 1 ? "md:border-r-2 md:border-[var(--mist)]" : ""}`}>
              <div className="text-3xl md:text-4xl font-black text-[#0F1720]">{stat.value}</div>
              <div className="mt-1 text-sm font-medium text-[#334155]">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}