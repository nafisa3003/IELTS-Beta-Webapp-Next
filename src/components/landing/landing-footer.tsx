"use client"

import Image from "next/image"
import Link from "next/link"

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "For teachers", href: "#for-teachers" },
    { label: "Mobile app", href: "#" },
  ],
  Resources: [
    { label: "Blog", href: "#" },
    { label: "IELTS tips", href: "#" },
    { label: "Band score calculator", href: "#" },
    { label: "Study guides", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy", href: "#" },
  ],
  Connect: [
    { label: "Facebook", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "YouTube", href: "#" },
    { label: "LinkedIn", href: "#" },
  ],
}

export function LandingFooter() {
  return (
    <footer className="bg-[#0F1720] pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.png"
                alt="IELTS Beta"
                width={90}
                height={30}
                className="h-[90px] w-auto object-contain [filter:drop-shadow(1px_0_0_#fff)_drop-shadow(-1px_0_0_#fff)_drop-shadow(0_1px_0_#fff)_drop-shadow(0_-1px_0_#fff)]"
              />
              <span className="text-xl font-extrabold tracking-tight text-white dark:text-white">
                IELTS Beta
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Built for learners, by learners. The complete IELTS preparation platform for Bangladesh and beyond.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm font-medium text-slate-400 hover:text-[#78FFF9] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © 2026 IELTS Beta. Built for learners, by learners.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}