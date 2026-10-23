import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Device frames for the landing stage. They are drawn at fixed design sizes
 * (so the app screens inside keep real proportions) and the stage scales the
 * whole composition to the available width with `useFitScale`.
 */

export function Laptop({
  width,
  children,
  animated = false,
  className,
}: {
  width: number;
  children: React.ReactNode;
  animated?: boolean;
  className?: string;
}) {
  const bezel = Math.round(width * 0.017);
  return (
    <div className={cn("laptop relative", className)} style={{ width }}>
      <div className={cn("laptop-lid relative", animated && "stage-lid")}>
        <div
          className="laptop-lid-front relative rounded-t-[22px] bg-bezel shadow-[inset_0_0_0_1px_var(--color-bezel-edge)]"
          style={{ padding: `${bezel}px ${bezel}px ${Math.round(bezel * 1.5)}px` }}
        >
          <div
            className={cn(
              "relative aspect-[16/10] overflow-hidden rounded-[8px] bg-background",
              animated && "stage-screen",
            )}
          >
            {children}
          </div>
        </div>
        <div aria-hidden className="laptop-lid-back aluminium rounded-t-[22px]" />
      </div>
      {/* Base: a thin aluminium deck, wider than the lid, with the opening notch. */}
      <div aria-hidden className="relative -mx-[7%] h-4 rounded-b-[18px] rounded-t-[3px] aluminium">
        <span className="absolute left-1/2 top-0 h-[45%] w-[14%] -translate-x-1/2 rounded-b-[8px] bg-black/25" />
      </div>
    </div>
  );
}

export function Tablet({
  width,
  children,
  className,
  style,
}: {
  width: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const bezel = Math.round(width * 0.045);
  return (
    <div
      className={cn(
        "relative rounded-[32px] bg-bezel shadow-[inset_0_0_0_1px_var(--color-bezel-edge),0_40px_80px_-30px_rgb(0_0_0/0.6)]",
        className,
      )}
      style={{ width, padding: bezel, ...style }}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-[18px] bg-background">
        {children}
      </div>
    </div>
  );
}

export function Phone({
  width,
  children,
  className,
  style,
}: {
  width: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const bezel = Math.max(7, Math.round(width * 0.036));
  return (
    <div
      className={cn(
        "relative aspect-[300/620] rounded-[18%/8.7%] bg-bezel shadow-[inset_0_0_0_1px_var(--color-bezel-edge),0_40px_80px_-30px_rgb(0_0_0/0.6)]",
        className,
      )}
      style={{ width, padding: bezel, ...style }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[15.5%/7.4%] bg-background">
        <div
          aria-hidden
          className="absolute left-1/2 top-[1.7%] z-20 h-[4.3%] w-[31%] -translate-x-1/2 rounded-full bg-black"
        />
        {children}
      </div>
    </div>
  );
}

/**
 * Scales a fixed-size composition to its container's width (never above 1).
 * Returns the container ref, the scale, and the design height to reserve.
 */
export function useFitScale(designWidth: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / designWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [designWidth]);
  return { ref, scale };
}
