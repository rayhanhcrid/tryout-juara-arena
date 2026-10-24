import {
  Atom,
  BookOpenText,
  Calculator,
  Coins,
  Cpu,
  FlaskConical,
  Globe2,
  Landmark,
  Languages,
  Leaf,
  Scale,
  Users,
  type LucideIcon,
} from "lucide-react";
import { COVER_PHOTOS, type CoverPhoto, type CoverPhotoKey } from "@/lib/cover-photos";
import { hashIndex } from "@/lib/format";
import { cn } from "@/lib/utils";

const COVER_CLASSES = [
  "cover-0",
  "cover-1",
  "cover-2",
  "cover-3",
  "cover-4",
  "cover-5",
  "cover-6",
  "cover-7",
  "cover-8",
  "cover-9",
  "cover-10",
  "cover-11",
] as const;

export function coverClass(seed: string): string {
  return COVER_CLASSES[hashIndex(seed, COVER_CLASSES.length)] ?? "cover-0";
}

/**
 * SMA subjects get a fixed hue, symbol and photograph, so "Fisika" always
 * looks like Fisika. More specific titles come before the general ones.
 */
const SUBJECTS: { match: RegExp; cover: string; icon: LucideIcon; photo: CoverPhotoKey }[] = [
  {
    match: /\btka\b.*geografi|geografi.*\btka\b/i,
    cover: "cover-10",
    icon: Globe2,
    photo: "tka-geografi",
  },
  { match: /geografi/i, cover: "cover-10", icon: Globe2, photo: "geografi" },
  { match: /matematika dasar/i, cover: "cover-0", icon: Calculator, photo: "matematika-dasar" },
  { match: /matemat/i, cover: "cover-0", icon: Calculator, photo: "matematika" },
  { match: /fisika/i, cover: "cover-1", icon: Atom, photo: "fisika" },
  { match: /kimia/i, cover: "cover-5", icon: FlaskConical, photo: "kimia" },
  { match: /biologi/i, cover: "cover-6", icon: Leaf, photo: "biologi" },
  { match: /bahasa indonesia/i, cover: "cover-11", icon: BookOpenText, photo: "bahasa-indonesia" },
  {
    match: /bahasa inggris|english/i,
    cover: "cover-2",
    icon: Languages,
    photo: "bahasa-inggris",
  },
  { match: /sejarah/i, cover: "cover-9", icon: Landmark, photo: "sejarah" },
  { match: /ekonomi/i, cover: "cover-8", icon: Coins, photo: "ekonomi" },
  { match: /sosiologi/i, cover: "cover-3", icon: Users, photo: "sosiologi" },
  { match: /pancasila|ppkn|kewarganegaraan/i, cover: "cover-4", icon: Scale, photo: "pancasila" },
  { match: /informatika|komputer|tik\b/i, cover: "cover-7", icon: Cpu, photo: "informatika" },
];

export function subjectOf(title: string) {
  return SUBJECTS.find((s) => s.match.test(title)) ?? null;
}

/** The subject's photograph, or null for a subject without one. */
export function coverPhotoOf(title: string): CoverPhoto | null {
  const subject = subjectOf(title);
  return subject ? COVER_PHOTOS[subject.photo] : null;
}

export function catalogCoverClass(id: string, title: string): string {
  return subjectOf(title)?.cover ?? coverClass(id);
}

/** First letter of the most meaningful word: "Try Out Matematika Dasar" -> "M". */
export function monogram(title: string): string {
  const skip = new Set(["try", "out", "tryout", "ujian", "tes", "test", "latihan", "simulasi"]);
  const words = title.split(/\s+/).filter(Boolean);
  const word = words.find((w) => !skip.has(w.toLowerCase())) ?? words[0] ?? "?";
  return word[0]?.toUpperCase() ?? "?";
}

/** The subject's symbol, or the title's monogram when the subject is unknown. */
export function CoverMark({ title, className }: { title: string; className?: string }) {
  const subject = subjectOf(title);
  if (subject) {
    const Icon = subject.icon;
    return <Icon aria-hidden className={className} strokeWidth={1.5} />;
  }
  return (
    <span
      aria-hidden
      className={cn("font-display font-bold leading-none tracking-[-0.06em]", className)}
    >
      {monogram(title)}
    </span>
  );
}

/** A subject's photograph filling its parent; decorative, so it has no alt text. */
export function CoverPhotoImage({
  photo,
  className,
  eager = false,
}: {
  photo: CoverPhoto;
  className?: string;
  eager?: boolean;
}) {
  return (
    <img
      src={photo.src}
      alt=""
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      style={{ objectPosition: photo.position }}
      className={cn("pointer-events-none absolute inset-0 h-full w-full object-cover", className)}
    />
  );
}

/**
 * Catalog artwork: the subject's photograph under a dark foot so the title
 * reads, or for an unknown subject its hue with the symbol cropped large.
 * The hue also shows while the photo loads.
 */
export function CatalogCover({
  id,
  title,
  className,
  children,
  showTitle = true,
  eager = false,
}: {
  id: string;
  title: string;
  className?: string;
  children?: React.ReactNode;
  showTitle?: boolean;
  eager?: boolean;
}) {
  const subject = subjectOf(title);
  const photo = subject ? COVER_PHOTOS[subject.photo] : null;
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden text-white",
        catalogCoverClass(id, title),
        className,
      )}
    >
      {photo ? (
        <>
          <CoverPhotoImage
            photo={photo}
            eager={eager}
            className="transition-transform duration-700 ease-apple group-hover:scale-[1.04]"
          />
          {showTitle ? (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.28)_0%,rgb(0_0_0/0)_32%,rgb(0_0_0/0)_45%,rgb(0_0_0/0.72)_100%)]"
            />
          ) : null}
        </>
      ) : subject ? (
        <subject.icon
          aria-hidden
          strokeWidth={1.25}
          className="pointer-events-none absolute -right-[6%] -top-[18%] h-[120%] w-auto text-white/20"
        />
      ) : (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-[0.08em] -top-[0.2em] select-none font-display text-[11rem] font-bold leading-none tracking-[-0.06em] text-white/18"
        >
          {monogram(title)}
        </span>
      )}
      {children}
      {showTitle ? (
        <p className="absolute inset-x-5 bottom-4 line-clamp-2 font-display text-[22px] font-semibold leading-[1.15] tracking-[-0.024em] [text-shadow:0_1px_12px_rgb(0_0_0/0.35)]">
          {title}
        </p>
      ) : null}
    </div>
  );
}
