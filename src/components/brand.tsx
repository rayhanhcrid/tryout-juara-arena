import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/**
 * App icon: an answer sheet with a ticked option, a mortarboard and a pencil,
 * on a teal squircle. Its rounded corners are part of the image (transparent).
 */
export function AppIcon({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <img
      src="/brand/app-icon.webp"
      alt=""
      aria-hidden
      width={size}
      height={size}
      decoding="async"
      draggable={false}
      className={cn("inline-block shrink-0 select-none", className)}
    />
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
