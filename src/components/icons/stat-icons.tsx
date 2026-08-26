import * as React from "react";

type IconProps = { size?: number; className?: string; style?: React.CSSProperties };

/** Faceted gem — used for XP, matching a Duolingo-gem visual language. */
export function GemIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 9L8 3H16L20 9L12 21L4 9Z" fill="var(--xp)" />
      <path d="M4 9H20" stroke="var(--xp-deep)" strokeWidth="1" strokeOpacity="0.5" />
      <path d="M8 3L12 9L16 3" stroke="var(--xp-deep)" strokeWidth="1" strokeOpacity="0.5" fill="none" />
      <path d="M4 9L12 21L20 9" stroke="var(--xp-deep)" strokeWidth="1" strokeOpacity="0.4" fill="none" />
    </svg>
  );
}

/** Flame — streak counter. */
export function FlameIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 2C12 6 8 7.5 8 12A4 4 0 0 0 16 12C16 10 15 9 15 9C15.5 11 14 12 14 12C14.5 9 12 8 12 2Z"
        fill="var(--danger)"
      />
      <path
        d="M12 22A6 6 0 0 1 6 16C6 12.5 8.5 11 9 8.5C9 8.5 9.5 13 12 13C13.5 13 14.5 11.5 14 10C16 11 18 13.5 18 16A6 6 0 0 1 12 22Z"
        fill="var(--xp)"
      />
    </svg>
  );
}

/** Concentric target rings — band-score goal. */
export function TargetIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="var(--teal)" strokeWidth="2" />
      <circle cx="12" cy="12" r="5.5" stroke="var(--teal)" strokeWidth="2" />
      <circle cx="12" cy="12" r="2" fill="var(--teal)" />
    </svg>
  );
}

/** Open book — courses / lessons. */
export function BookIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 5.5C10.3 4.4 7.8 4 5 4V17.5C7.8 17.5 10.3 17.9 12 19"
        stroke="var(--navy)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 5.5C13.7 4.4 16.2 4 19 4V17.5C16.2 17.5 13.7 17.9 12 19"
        stroke="var(--teal)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 5.5V19" stroke="var(--slate-soft)" strokeWidth="1.4" />
    </svg>
  );
}

/** Headphones — Listening skill. */
export function ListeningIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 14V12A8 8 0 0 1 20 12V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <rect x="3" y="13" width="4" height="7" rx="2" fill="currentColor" />
      <rect x="17" y="13" width="4" height="7" rx="2" fill="currentColor" />
    </svg>
  );
}

/** Open pages — Reading skill. */
export function ReadingIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 6C10.3 5 7.8 4.5 5 4.5V17C7.8 17 10.3 17.5 12 18.5C13.7 17.5 16.2 17 19 17V4.5C16.2 4.5 13.7 5 12 6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** Pencil — Writing skill. */
export function WritingIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 20L4.8 16.4L15.6 5.6C16.4 4.8 17.6 4.8 18.4 5.6C19.2 6.4 19.2 7.6 18.4 8.4L7.6 19.2L4 20Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M14 7L17 10" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

/** Check in a ring — success toasts. */
export function CheckIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill="var(--success)" />
      <path d="M7.5 12.5L10.3 15.3L16.5 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/** X in a ring — error toasts. */
export function ErrorIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill="var(--danger)" />
      <path d="M8.5 8.5L15.5 15.5M15.5 8.5L8.5 15.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** "i" in a ring — info toasts. */
export function InfoIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill="var(--teal)" />
      <circle cx="12" cy="7.5" r="1.3" fill="white" />
      <path d="M12 11V16.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Triangle "!" — warning / confirmation toasts. */
export function WarningIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3L22 20H2L12 3Z" fill="var(--xp)" />
      <path d="M12 9.5V14" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16.8" r="1.1" fill="white" />
    </svg>
  );
}

/** Waving hand shape — logout goodbye toast. Deliberately not an emoji:
    a simple geometric wave built from arcs, matching the rest of the set. */
export function WaveIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill="var(--violet)" />
      <path
        d="M8 15C8 15 9 10 11 9.5C11.5 9.3 12 9.6 12 10.2C12 8.8 13.6 8.5 13.9 9.8C14.4 8.6 15.8 9 15.7 10.3C15.7 12.5 15 15 12.5 16C10.5 16.8 8.5 16.2 8 15Z"
        fill="white"
      />
    </svg>
  );
}
export function SpeakingIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="4" y1="10" x2="4" y2="14" />
        <line x1="8" y1="6" x2="8" y2="18" />
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="16" y1="6" x2="16" y2="18" />
        <line x1="20" y1="10" x2="20" y2="14" />
      </g>
    </svg>
  );
}

/** Content-type icons for lesson lists — no emoji. */
export function VideoTypeIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2.5" y="5.5" width="14" height="13" rx="2.5" fill="currentColor" opacity="0.15" />
      <rect x="2.5" y="5.5" width="14" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16.5 10L21 7.5V16.5L16.5 14V10Z" fill="currentColor" />
    </svg>
  );
}

export function PdfTypeIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 3H14L19 8V19.5C19 20.3 18.3 21 17.5 21H6.5C5.7 21 5 20.3 5 19.5V4.5C5 3.7 5.7 3 6 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <path d="M14 3V7.5C14 7.8 14.2 8 14.5 8H19" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function YoutubeTypeIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="6" width="20" height="12" rx="4" fill="currentColor" opacity="0.15" />
      <rect x="2" y="6" width="20" height="12" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 9.5L15 12L10 14.5V9.5Z" fill="currentColor" />
    </svg>
  );
}

export function NotesTypeIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="3" width="16" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity="0.1" />
      <line x1="7.5" y1="8" x2="16.5" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="7.5" y1="12" x2="16.5" y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="7.5" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Calendar with a dot — used for the upcoming live-session banner. */
export function CalendarIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity="0.08" />
      <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" stroke="currentColor" strokeWidth="1.6" />
      <line x1="8" y1="3" x2="8" y2="6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="16" y1="3" x2="16" y2="6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="8.5" cy="14" r="1.4" fill="currentColor" />
    </svg>
  );
}

/** Bar-chart trend — used for avg. class band score. */
export function TrendIcon({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="13" width="3.5" height="7" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="10.25" y="8" width="3.5" height="12" rx="1" fill="currentColor" opacity="0.75" />
      <rect x="16.5" y="4" width="3.5" height="16" rx="1" fill="currentColor" />
    </svg>
  );
}

/** People — total students. */
export function PeopleIcon({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 19C3.5 15.5 6 13.5 9 13.5C12 13.5 14.5 15.5 14.5 19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" fill="none" />
      <circle cx="17" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <path d="M14.5 19C14.5 16.3 16.2 14.7 18.3 14.7C20.4 14.7 21.5 16.3 21.5 18.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

/** On-track ring — student is at or above target band. */
export function OnTrackIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" fill="var(--success)" fillOpacity="0.15" stroke="var(--success)" strokeWidth="1.6" />
      <path d="M8 12.3L10.5 14.8L16 9.3" stroke="var(--success)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/** Small flame — urgency badge for closing-soon enrollment CTAs. */
export function UrgencyIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 2C12 6 8 7.5 8 12A4 4 0 0 0 16 12C16 10 15 9 15 9C15.5 11 14 12 14 12C14.5 9 12 8 12 2Z"
        fill="var(--coral)"
      />
    </svg>
  );
}

/** Role-selector icons for the signup/login tabs — graduation cap, pointer/board, shield. */
export function StudentRoleIcon({ size = 28, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 4L22 9L12 14L2 9L12 4Z" fill="currentColor" />
      <path d="M6 11.5V16C6 17.5 8.5 19 12 19C15.5 19 18 17.5 18 16V11.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <line x1="22" y1="9" x2="22" y2="15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function TeacherRoleIcon({ size = 28, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="4" width="18" height="12" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.6" />
      <line x1="7" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7" y1="11.5" x2="12" y2="11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 16L12 20M9 20H15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function AdminRoleIcon({ size = 28, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3L19 6V11C19 15.5 16 18.8 12 20C8 18.8 5 15.5 5 11V6L12 3Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M9 11.3L11 13.3L15.5 8.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/** Compass — "start your journey" motif for the auth page's motivational panel. */
export function CompassIcon({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.5 8.5L13 13L8.5 15.5L11 11L15.5 8.5Z" fill="currentColor" />
    </svg>
  );
}