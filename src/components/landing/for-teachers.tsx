"use client"

import { motion } from "framer-motion"
import { ArrowRight, Check, Users, BarChart3, FileCheck, Video, Calendar } from "lucide-react"
import Link from "next/link"

const teacherFeatures = [
  { icon: Users, text: "Course management — Upload videos, PDFs, and organize lessons" },
  { icon: BarChart3, text: "Student progress tracking — See band scores, streaks, and weak spots" },
  { icon: FileCheck, text: "Essay & speaking review — Grade with the official IELTS rubric" },
  { icon: Video, text: "Live classes — Schedule and host sessions with enrolled students" },
  { icon: Calendar, text: "Class analytics — Average band scores, completion rates, and more" },
]

export function ForTeachers() {
  return (
    <section id="for-teachers" className="py-20 md:py-28 bg-[#F5F3FF]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Visual */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-[var(--radius-lg)] border-2 border-[var(--violet)]/20 bg-gradient-to-br from-[var(--violet)]/30 via-[var(--navy)]/10 to-[var(--teal)]/10 p-3 shadow-[var(--shadow-card)] aspect-[4/3] flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/80 shadow-lg mb-4">
                  <Users className="h-10 w-10 text-[var(--violet)]" />
                </div>
                <p className="text-sm font-bold text-[var(--navy)]">Teacher Dashboard Preview</p>
              </div>
            </div>
          </motion.div>

          {/* Right: Copy */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="inline-block text-sm font-bold tracking-widest text-[var(--violet)] uppercase mb-3">
              For Teachers
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#0F1720] mb-6">
              Teach IELTS. Not paperwork.
            </h2>
            <p className="text-lg text-[#334155] leading-relaxed mb-8">
              Manage your courses, track every student's band progress, review essays and speaking recordings, and host live classes — all from one dashboard.
            </p>

            <ul className="space-y-4 mb-8">
              {teacherFeatures.map((f) => (
                <li key={f.text} className="flex items-start gap-3 text-[#0F1720] font-semibold">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--violet)]/10 mt-0.5">
                    <Check className="h-4 w-4 text-[var(--violet)]" />
                  </div>
                  <span className="text-sm md:text-base">{f.text}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/teachers"
              className="inline-flex items-center gap-2 bg-[var(--violet)] hover:bg-[var(--violet-deep)] text-white font-bold text-base px-8 py-4 rounded-full transition-all hover:scale-[1.02] shadow-lg"
            >
              Start teaching <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}