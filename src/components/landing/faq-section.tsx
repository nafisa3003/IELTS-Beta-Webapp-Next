"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"

const faqs = [
  {
    q: "How accurate are the auto-graded Listening & Reading tests?",
    a: "Our auto-grader uses official IELTS scoring rubrics and has been calibrated against thousands of real test results. Listening and Reading scores are calculated instantly with 95%+ accuracy. Writing and Speaking are reviewed by your teacher for the most reliable feedback.",
  },
  {
    q: "Can my teacher assign custom lessons through IELTS Beta?",
    a: "Yes! Teachers can create courses, upload videos, PDFs, and YouTube links, and organize content exactly how they want. Students see everything in their personalized dashboard.",
  },
  {
    q: "What's the difference between Core and Engage plans?",
    a: "Core is free forever and includes basic practice tests, goal tracking, and all 4 skill modules. Engage adds vocabulary flashcards, daily streaks, progress analytics, and AI tutor access for ৳999/month.",
  },
  {
    q: "Is there a mobile app available?",
    a: "IELTS Beta is fully responsive and works great on mobile browsers. A native app is on our 2026 roadmap. For now, you can study anywhere with your phone or tablet.",
  },
  {
    q: "How does the teacher feedback system work?",
    a: "When you submit a Writing Task or Speaking recording, it goes directly to your enrolled teacher. They grade it against the official IELTS rubric and return detailed feedback within 24-48 hours.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Absolutely. There are no contracts or cancellation fees. You can downgrade to Core (free) or cancel completely at any time from your profile settings.",
  },
]

function FAQItem({ item, isOpen, onClick }: { item: typeof faqs[0]; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b-2 border-[var(--mist)]">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between py-6 text-left"
      >
        <span className="text-base md:text-lg font-bold text-[#0F1720] pr-4">{item.q}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--mist)] text-[var(--navy)]"
        >
          {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-[#334155] leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-20 md:py-28 bg-[#F0FDFC]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-sm font-bold tracking-widest text-[var(--teal)] uppercase mb-3">
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#0F1720]">
            Questions? Answered.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-[var(--radius-lg)] border-2 border-[var(--mist)] bg-[var(--white)] px-6 md:px-8"
        >
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              item={faq}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}