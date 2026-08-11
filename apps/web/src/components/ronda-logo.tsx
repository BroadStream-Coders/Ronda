import { cn } from "@/lib/utils";

export function RondaMark({
  className,
  mono = false,
}: {
  className?: string;
  mono?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={cn("size-8 shrink-0", className)}
    >
      <path
        d="M21.5 6.474 A 11 11 0 1 1 8.9 8.05"
        stroke={mono ? "currentColor" : "var(--primary)"}
        strokeWidth="3.1"
        strokeLinecap="round"
      />
      <circle
        cx="21.5"
        cy="6.474"
        r="3.05"
        fill={mono ? "currentColor" : "var(--accent)"}
      />
    </svg>
  );
}

export function RondaLogo({
  className,
  markClassName,
  wordClassName,
  mono = false,
}: {
  className?: string;
  markClassName?: string;
  wordClassName?: string;
  mono?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <RondaMark className={markClassName} mono={mono} />
      <span
        className={cn(
          "font-heading text-[22px] font-semibold tracking-[-0.02em]",
          wordClassName,
        )}
      >
        Ronda
      </span>
    </span>
  );
}
