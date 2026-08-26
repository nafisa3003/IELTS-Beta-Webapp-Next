"use client"

import { useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  tiltAmount?: number
  glowColor?: string
}

export function TiltCard({ children, className = "", tiltAmount = 10, glowColor = "rgba(14, 165, 153, 0.15)" }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)

  const rotateX = useSpring(useTransform(y, [0, 1], [tiltAmount, -tiltAmount]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [0, 1], [-tiltAmount, tiltAmount]), { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const xPos = (e.clientX - rect.left) / rect.width
    const yPos = (e.clientY - rect.top) / rect.height
    x.set(xPos)
    y.set(yPos)
  }

  const handleMouseLeave = () => {
    x.set(0.5)
    y.set(0.5)
    setIsHovered(false)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className={`relative ${className}`}
    >
      <motion.div
        animate={{ boxShadow: isHovered ? `0 25px 50px -12px ${glowColor}` : "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
        transition={{ duration: 0.3 }}
        className="h-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}