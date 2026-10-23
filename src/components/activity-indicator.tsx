import { cn } from "@/lib/utils";

/** The iOS spinner: eight fading ticks stepping round. */
export function ActivityIndicator({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <span
      role="progressbar"
      aria-label="Memuat"
      className={cn("activity-indicator relative inline-block text-muted-foreground", className)}
      style={{ width: size, height: size }}
    >
      {Array.from({ length: 8 }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute left-1/2 top-0 h-[28%] w-[9%] -translate-x-1/2 rounded-full bg-current"
          style={{
            transform: `rotate(${i * 45}deg)`,
            transformOrigin: `50% ${size / 2}px`,
            opacity: 0.2 + (i / 8) * 0.8,
          }}
        />
      ))}
    </span>
  );
}
