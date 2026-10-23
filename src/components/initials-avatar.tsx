import { coverClass } from "@/components/catalog-cover";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export function InitialsAvatar({
  name,
  seed,
  size = 36,
  className,
}: {
  name: string;
  seed: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white",
        coverClass(seed),
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {initials(name)}
    </span>
  );
}
