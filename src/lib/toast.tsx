import { toast as sonnerToast } from "sonner";
import { motion } from "framer-motion";
import { 
  Check as CheckIcon, 
  AlertCircle as ErrorIcon, 
  Info as InfoIcon, 
  AlertTriangle as WarningIcon, 
  Waves as WaveIcon, 
  Zap, 
  Trophy, 
  Gift 
} from "lucide-react";

export const notify = {
  success: (message: string) =>
    sonnerToast(message, { icon: <CheckIcon size={20} /> }),
  error: (message: string) =>
    sonnerToast(message, { icon: <ErrorIcon size={20} /> }),
  info: (message: string) =>
    sonnerToast(message, { icon: <InfoIcon size={20} /> }),
  warning: (message: string) =>
    sonnerToast(message, { icon: <WarningIcon size={20} /> }),
  goodbye: (message: string) =>
    sonnerToast(message, { icon: <WaveIcon size={20} /> }),
  
  confirm: (message: string, onConfirm: () => void, confirmLabel = "Confirm") =>
    sonnerToast(message, {
      icon: <WarningIcon size={20} />,
      duration: 8000,
      action: {
        label: confirmLabel,
        onClick: onConfirm,
      },
      cancel: { label: "Cancel", onClick: () => {} },
    }),

  /** XP earned toast — bouncy green popup */
  xp: (amount: number, reason?: string) =>
    sonnerToast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.8 }}
        className="flex items-center gap-3 bg-green-50 border-2 border-green-400 text-green-700 px-4 py-3 rounded-xl shadow-hard"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5 }}
        >
          <Zap className="h-5 w-5 fill-green-500 text-green-500" />
        </motion.div>
        <div>
          <p className="font-black text-sm">+{amount.toLocaleString()} XP</p>
          {reason && <p className="text-xs font-bold text-green-600">{reason}</p>}
        </div>
      </motion.div>
    ), { duration: 3000 }),

  /** Gems earned toast */
  gems: (amount: number) =>
    sonnerToast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.8 }}
        className="flex items-center gap-3 bg-cyan-50 border-2 border-cyan-400 text-cyan-700 px-4 py-3 rounded-xl shadow-hard"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 0.6 }}
        >
          <Gift className="h-5 w-5 text-cyan-500" />
        </motion.div>
        <p className="font-black text-sm">+{amount} Gems earned!</p>
      </motion.div>
    ), { duration: 3000 }),

  /** Level up celebration toast */
  levelUp: (level: number, title: string) =>
    sonnerToast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        className="flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400 text-amber-800 px-5 py-4 rounded-xl shadow-brutalist"
      >
        <motion.div
          animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 0.6 }}
        >
          <Trophy className="h-6 w-6 text-amber-500" />
        </motion.div>
        <div>
          <p className="font-black text-base">Level Up! 🎉</p>
          <p className="text-xs font-bold text-amber-700">You reached Level {level} — {title}</p>
        </div>
      </motion.div>
    ), { duration: 5000 }),
};
