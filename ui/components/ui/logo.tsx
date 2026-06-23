import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("h-8 w-8", className)}
      fill="none"
      aria-hidden
    >
      <rect
        x="2.5"
        y="2.5"
        width="35"
        height="35"
        rx="9"
        className="fill-surface-2 stroke-border-strong"
        strokeWidth="1.6"
      />
      <path
        d="M14 30 V11 h7.5 a5.75 5.75 0 0 1 0 11.5 H14"
        stroke="var(--accent)"
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="27.5" cy="28.5" r="1.9" fill="var(--accent-glow)" />
      <path
        d="M22.5 27 h3"
        stroke="var(--faint)"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  withText = true,
}: {
  className?: string;
  withText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className="h-7 w-7" />
      {withText && (
        <span className="font-display text-[1.15rem] font-bold tracking-tight text-foreground">
          Poneglyph
        </span>
      )}
    </span>
  );
}
