"use client"

import { motion, useInView } from "framer-motion"
import { Star, Quote } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { TiltCard } from "@/components/ui/tilt-card"

const testimonials = [
  {
    quote:
      "The instant granular feedback on Writing Task 2 saved me weeks of aimless rewriting. I went from stuck at 7.0 to an 8.5 in less than two months.",
    name: "Nawfat Haidar Chaudhury",
    score: "8.5",
    location: "Dhaka",
    image: "/avatar/Nawfat.jpeg",
    gradient: "from-navy to-teal",
  },
  {
    quote:
      "The timed practice mode and real-time Band Score breakdowns felt exactly like taking the actual test. I hit my target score on my first attempt!",
    name: "Fabiha Sanjeda Nuva",
    score: "8.0",
    location: "Sylhet",
    image: "/avatar/Nuva.jpeg",
    gradient: "from-teal to-cyan",
  },
  {
    quote:
      "Keeping up with the daily practice streak kept me accountable. The immediate AI analysis for Speaking fluency gave me the confidence I needed.",
    name: "Jannatul Ferdous Nishat",
    score: "8.0",
    location: "Chittagong",
    image: "/avatar/Jannat.jpeg",
    gradient: "from-violet to-navy",
  },
  {
    quote:
      "The reading section explanations break down why every wrong answer is wrong. It completely transformed how I handle true/false/not given questions.",
    name: "Shakila Jahan Tasnia",
    score: "7.5",
    location: "Dhaka",
    image: "/avatar/Tasnia.jpeg",
    gradient: "from-navy to-violet",
  },
  {
    quote:
      "I loved the flexible micro-tests. Being able to practice 15-minute Speaking modules between classes helped me jump a full band score effortlessly.",
    name: "Monisha Hossain",
    score: "7.5",
    location: "Sylhet",
    image: "/avatar/Monisha.jpeg",
    gradient: "from-cyan to-teal",
  },
  {
    quote:
      "The structured layout and gamified feedback made studying less stressful. The instant writing evaluations pinpointed my exact grammar errors.",
    name: "Syeda Nafisa Tasnim",
    score: "7.0",
    location: "Dhaka",
    image: "/avatar/Nafisa.jpeg",
    gradient: "from-teal to-navy",
  },
]

/**
 * Animated scramble effect for the main social-proof headline.
 */
function ScrambleText({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const ref = useRef<HTMLHeadingElement>(null)
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px",
  })

  const [display, setDisplay] = useState("")

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"

  useEffect(() => {
    if (!isInView) return

    let iteration = 0

    const interval = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((char, index) => {
            if (
              char === " " ||
              char === "." ||
              char === "'" ||
              char === "?"
            ) {
              return char
            }

            if (index < iteration) {
              return text[index]
            }

            return chars[Math.floor(Math.random() * chars.length)]
          })
          .join(""),
      )

      iteration += 1 / 2

      if (iteration >= text.length) {
        clearInterval(interval)
        setDisplay(text)
      }
    }, 25)

    return () => clearInterval(interval)
  }, [isInView, text])

  return (
    <h2 ref={ref} className={className}>
      {display || text.split("").map(() => " ").join("")}
    </h2>
  )
}

/**
 * Animated five-star rating.
 */
function StarBurst() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: true }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      className="flex items-center gap-0.5"
    >
      {[...Array(5)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ rotate: 0, scale: 0 }}
          whileInView={{ rotate: 360, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            delay: index * 0.1,
            type: "spring",
            stiffness: 200,
          }}
        >
          <Star className="h-4 w-4 fill-xp text-xp" />
        </motion.div>
      ))}
    </motion.div>
  )
}

/**
 * Individual testimonial card.
 *
 * Uses TiltCard from the newer UI version while preserving
 * the stronger brutalist styling and animations.
 */
function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: (typeof testimonials)[number]
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
      }}
      className="min-w-[300px] shrink-0 md:min-w-[350px]"
    >
      <TiltCard
        tiltAmount={5}
        glowColor="rgba(14, 165, 153, 0.08)"
      >
        <div className="group relative flex h-full flex-col rounded-2xl border-3 border-ink bg-white p-5 shadow-hard transition-all hover:-translate-y-1 hover:shadow-brutalist">
          {/* Rating */}
          <StarBurst />

          {/* Quote icon */}
          <Quote className="mt-3 mb-2 h-5 w-5 text-teal/30" />

          {/* Testimonial */}
          <p className="mb-4 flex-1 text-sm font-medium leading-relaxed text-slate">
            "{testimonial.quote}"
          </p>

          {/* Student information */}
          <div className="flex items-center gap-3 border-t-2 border-mist pt-3">
            <div
              className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br ${testimonial.gradient} ring-2 ring-mist`}
            >
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.style.display = "none"
                }}
              />
            </div>

            <div className="min-w-0">
              <div className="truncate text-sm font-black text-ink">
                {testimonial.name}
              </div>

              <div className="text-xs font-bold text-slate">
                Scored {testimonial.score} · {testimonial.location}
              </div>
            </div>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  )
}

/**
 * Infinite horizontal testimonial marquee.
 */
function InfiniteMarquee({
  children,
  direction = "left",
}: {
  children: React.ReactNode
  direction?: "left" | "right"
}) {
  return (
    <div className="relative overflow-hidden">
      {/* Edge fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-paper to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-paper to-transparent" />

      <motion.div
        className="flex w-max gap-4"
        animate={{
          x: direction === "left" ? [0, -1000] : [-1000, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 30,
          ease: "linear",
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  )
}

export function SocialProof() {
  const firstRow = testimonials.slice(0, 3)
  const secondRow = testimonials.slice(3, 6)

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden"
    >
      {/* =========================================================
          BIG STATEMENT
      ========================================================= */}
      <div className="bg-cyan py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ScrambleText
              text="Band scores you'll hit. Guaranteed."
              className="mb-6 text-5xl font-black leading-none tracking-tighter text-ink md:text-7xl lg:text-8xl"
            />

            <p className="mx-auto max-w-2xl text-lg font-medium text-slate md:text-xl">
              Thousands of learners across Bangladesh trust IELTS Beta to
              reach their target score. Here's what they have to say.
            </p>
          </motion.div>
        </div>
      </div>

      {/* =========================================================
          TESTIMONIALS
      ========================================================= */}
      <div className="bg-paper py-12 md:py-16">
        {/* Section heading */}
        <div className="mb-8 px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-2 inline-block text-sm font-black uppercase tracking-widest text-teal">
              Testimonials
            </span>

            <h3 className="text-3xl font-black tracking-tighter text-ink md:text-4xl">
              Loved by students across Bangladesh
            </h3>
          </motion.div>
        </div>

        {/* Desktop / mobile infinite testimonial rows */}
        <div className="space-y-4">
          <InfiniteMarquee direction="left">
            {firstRow.map((testimonial, index) => (
              <TestimonialCard
                key={`first-${testimonial.name}`}
                testimonial={testimonial}
                index={index}
              />
            ))}
          </InfiniteMarquee>

          <InfiniteMarquee direction="right">
            {secondRow.map((testimonial, index) => (
              <TestimonialCard
                key={`second-${testimonial.name}`}
                testimonial={testimonial}
                index={index + 3}
              />
            ))}
          </InfiniteMarquee>
        </div>
      </div>
    </section>
  )
}
