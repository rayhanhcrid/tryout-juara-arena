import { CoverPhotoImage } from "@/components/catalog-cover";
import { COVER_PHOTO_LIST } from "@/lib/cover-photos";
import { cn } from "@/lib/utils";

/**
 * A tilted wall of the subjects' photographs drifting sideways, row against
 * row, behind the landing's dark sections. Purely decorative: the scrim keeps
 * it well below the type, and reduced motion holds it still.
 */
export function PhotoWall({ rows = 4, className }: { rows?: number; className?: string }) {
  const list = COVER_PHOTO_LIST;
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      <div className="photo-wall absolute left-1/2 top-1/2 flex w-max flex-col gap-4">
        {Array.from({ length: rows }, (_, r) => {
          // Each row starts at a different photo so no column repeats.
          const row = list.map((_, i) => list[(i + r * 4) % list.length]!);
          return (
            <div
              key={r}
              className="photo-wall-row flex w-max gap-4"
              style={
                {
                  "--wall-duration": `${150 + r * 30}s`,
                  animationDirection: r % 2 ? "reverse" : "normal",
                } as React.CSSProperties
              }
            >
              {[...row, ...row].map((photo, i) => (
                <div
                  key={i}
                  className="relative h-[150px] w-[230px] shrink-0 overflow-hidden rounded-[22px] bg-white/5 sm:h-[190px] sm:w-[290px]"
                >
                  <CoverPhotoImage photo={photo} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
