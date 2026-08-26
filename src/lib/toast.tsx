import { toast as sonnerToast } from "sonner";
import { CheckIcon, ErrorIcon, InfoIcon, WarningIcon, WaveIcon } from "@/components/icons/stat-icons";

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
  /** A toast with an inline "Confirm" action — used for logout / destructive
   * confirmations instead of a jarring native browser confirm() dialog. */
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
};
