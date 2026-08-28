"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react"
import { TiltCard } from "@/components/ui/tilt-card"

const testimonials = [
  {
    quote: "The instant granular feedback on Writing Task 2 saved me weeks of aimless rewriting. I went from stuck at 7.0 to an 8.5 in less than two months.",
    name: "Nawfat Haidar Chaudhury",
    score: "8.5",
    location: "Dhaka",
    initials: "NC",
    gradient: "from-[var(--navy)] to-[var(--teal)]",
    image: "/avatar/Nawfat.jpeg",
  },
  {
    quote: "The timed practice mode and real-time Band Score breakdowns felt exactly like taking the actual test. I hit my target score on my first attempt!",
    name: "Fabiha Sanjeda Nuva",
    score: "8.0",
    location: "Sylhet",
    initials: "FN",
    gradient: "from-[var(--teal)] to-[#78FFF9]",
    image: "/avatar/Nuva.jpeg",
  },
  {
    quote: "Keeping up with the daily practice streak kept me accountable. The immediate AI analysis for Speaking fluency gave me the confidence I needed.",
    name: "Jannatul Ferdous Nishat",
    score: "8.0",
    location: "Chittagong",
    initials: "JN",
    gradient: "from-[var(--violet)] to-[var(--navy)]",
    image: "/avatar/Jannat.jpeg",
  },
  {
    quote: "The reading section explanations break down why every wrong answer is wrong. It completely transformed how I handle true/false/not given questions.",
    name: "Shakila Jahan Tasnia",
    score: "7.5",
    location: "Dhaka",
    initials: "ST",
    gradient: "from-[var(--navy)] to-[var(--violet)]",
    image: "/avatar/Tasnia.jpeg",
  },
  {
    quote: "I loved the flexible micro-tests. Being able to practice 15-minute Speaking modules between classes helped me jump a full band score effortlessly.",
    name: "Monisha Hossain",
    score: "7.5",
    location: "Sylhet",
    initials: "MH",
    gradient: "from-[#78FFF9] to-[var(--teal)]",
    image: "/avatar/Monisha.jpeg",
  },
  {
    quote: "The structured layout and gamified feedback made studying less stressful. The instant writing evaluations pinpointed my exact grammar errors.",
    name: "Syeda Nafisa Tasnim",
    score: "7.0",
    location: "Dhaka",
    initials: "NT",
    gradient: "from-[var(--teal)] to-[var(--navy)]",
    image: "/avatar/Nafisa.jpeg",
  },
]

export function SocialProof() {
  const [page, setPage] = useState(0)
  const perPage = 3
  const totalPages = Math.ceil(testimonials.length / perPage)

  const visible = testimonials.slice(page * perPage, page * perPage + perPage)

  const next = () => setPage((p) => Math.min(p + 1, totalPages - 1))
  const prev = () => setPage((p) => Math.max(p - 1, 0))

  return (
    <section id="testimonials" className="relative">
      {/* Big Statement */}
      <div className="bg-[#78FFF9] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-[#0F1720] mb-6">
              Band scores you'll hit.<br />Guaranteed.
            </h2>
            <p className="text-lg md:text-xl text-[#334155] max-w-2xl mx-auto">
              Thousands of learners across Bangladesh trust IELTS Beta to reach their target score. Here's what they have to say.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Testimonials Carousel */}
      <div className="bg-[var(--paper)] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block text-sm font-bold tracking-widest text-[var(--teal)] uppercase mb-3">
                Testimonials
              </span>
              <h3 className="text-3xl md:text-4xl font-black tracking-tight text-[#0F1720]">
                Loved by students across Bangladesh
              </h3>
            </motion.div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={prev}
                disabled={page === 0}
                className="h-12 w-12 rounded-full border-2 border-[var(--mist)] bg-white flex items-center justify-center text-[var(--navy)] hover:border-[var(--navy)]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                disabled={page === totalPages - 1}
                className="h-12 w-12 rounded-full border-2 border-[var(--mist)] bg-white flex items-center justify-center text-[var(--navy)] hover:border-[var(--navy)]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {visible.map((t, i) => (
                <motion.div
                  key={t.name}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <TiltCard tiltAmount={6} glowColor="rgba(14, 165, 153, 0.08)">
                    <div className="rounded-[var(--radius-lg)] border-2 border-[var(--mist)] bg-[var(--white)] p-6 flex flex-col hover:border-[var(--teal)]/20 transition-colors h-full">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className="h-4 w-4 fill-[var(--xp)] text-[var(--xp)]" />
                        ))}
                      </div>
                      <Quote className="h-6 w-6 text-[var(--teal)]/30 mb-2" />
                      <p className="text-[#334155] leading-relaxed flex-1 mb-6">
                        "{t.quote}"
                      </p>
                      <div className="flex items-center gap-3 pt-4 border-t-2 border-[var(--mist)]">
                        {/* REAL PROFILE PHOTO */}
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-[var(--mist)] bg-gradient-to-br from-[var(--navy)] to-[var(--teal)]">
                          <img
                            src={t.image}
                            alt={t.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              // Fallback to initials if image fails to load
                              const target = e.currentTarget
                              target.style.display = "none"
                              target.parentElement!.classList.add(
                                "flex", "items-center", "justify-center",
                                "bg-gradient-to-br", ...t.gradient.split(" ")
                              )
                              target.parentElement!.innerHTML = `<span class="text-white text-sm font-bold">${t.initials}</span>`
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold pointer-events-none">
                          </div>
                        </div>
                        {/* /PROFILE PICTURE */}

                        <div>
                          <div className="text-sm font-bold text-[#0F1720]">{t.name}</div>
                          <div className="text-xs font-medium text-[#334155]">
                            Scored {t.score} · {t.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Mobile arrows */}
          <div className="flex md:hidden items-center justify-center gap-2 mt-8">
            <button
              onClick={prev}
              disabled={page === 0}
              className="h-12 w-12 rounded-full border-2 border-[var(--mist)] bg-white flex items-center justify-center text-[var(--navy)] disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              disabled={page === totalPages - 1}
              className="h-12 w-12 rounded-full border-2 border-[var(--mist)] bg-white flex items-center justify-center text-[var(--navy)] disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
