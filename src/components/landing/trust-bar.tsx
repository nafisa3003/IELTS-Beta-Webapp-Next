"use client"

import { motion, useInView, useSpring, useTransform } from "framer-motion"
import { useRef, useEffect, useState } from "react"

function AnimatedNumber({
  value,
  suffix = "",
}: {
  value: number
  suffix?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [hasAnimated, setHasAnimated] = useState(false)

  const springValue = useSpring(0, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  const displayValue = useTransform(springValue, (v) => {
    if (value < 10) {
      return v.toFixed(1)
    }

    return Math.round(v).toLocaleString()
  })

  useEffect(() => {
    if (isInView && !hasAnimated) {
      springValue.set(value)
      setHasAnimated(true)
    }
  }, [isInView, hasAnimated, springValue, value])

  return (
    <motion.span
      ref={ref}
      className="tabular-nums"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
    >
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </motion.span>
  )
}

const stats = [
  {
    value: 12000,
    suffix: "+",
    label: "Learners building their streak",
  },
  {
    value: 4.9,
    suffix: "/5",
    label: "Average student rating",
  },
  {
    value: 50000,
    suffix: "+",
    label: "Practice tests taken",
  },
  {
    value: 98,
    suffix: "%",
    label: "Students hit their target band",
  },
]

export function TrustBar() {
  return (
    <section className="relative overflow-hidden border-y-3 border-ink bg-white py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-0"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.1,
                type: "spring",
                stiffness: 200,
              }}
              className={`relative text-center ${
                i < stats.length - 1
                  ? "md:border-r-3 md:border-ink"
                  : ""
              }`}
            >
              <div className="text-3xl font-black text-ink md:text-4xl lg:text-5xl">
                <AnimatedNumber
                  value={stat.value}
                  suffix={stat.suffix}
                />
              </div>

              {/* Animated accent line */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.5 + i * 0.1,
                  duration: 0.5,
                }}
                className="mx-auto mt-2 h-0.5 w-12 rounded-full bg-teal"
              />

              <div className="mt-2 text-sm font-bold text-slate">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
