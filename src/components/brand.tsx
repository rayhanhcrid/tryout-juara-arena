import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/** App icon: a stopwatch with a check, on the iOS icon squircle. */
export function AppIcon({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "app-icon inline-flex shrink-0 items-center justify-center text-white",
        className,
      )}
      style={{ width: size, height: size, borderRadius: size * 0.2237 }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.64}
        height={size * 0.64}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9.75 2.25h4.5M12 2.25v2.5" />
        <circle cx="12" cy="13.5" r="7.75" />
        <path d="m8.7 13.7 2.25 2.25 4.4-4.6" />
      </svg>
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display text-[19px] font-semibold tracking-[-0.03em]", className)}>
      TryOutKu
    </span>
  );
}

export function BrandLink({
  to = "/",
  iconSize = 26,
  className,
}: {
  to?: "/" | "/dashboard" | "/admin";
  iconSize?: number;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn("flex items-center gap-2 rounded-lg text-foreground", className)}
      aria-label="TryOutKu"
    >
      <AppIcon size={iconSize} />
      <Wordmark />
    </Link>
  );
}
