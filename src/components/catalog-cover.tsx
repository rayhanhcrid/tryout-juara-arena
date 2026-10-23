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

/** SMA subjects get a fixed hue and symbol, so "Fisika" always looks like Fisika. */
const SUBJECTS: { match: RegExp; cover: string; icon: LucideIcon }[] = [
  { match: /matemat/i, cover: "cover-0", icon: Calculator },
  { match: /fisika/i, cover: "cover-1", icon: Atom },
  { match: /kimia/i, cover: "cover-5", icon: FlaskConical },
  { match: /biologi/i, cover: "cover-6", icon: Leaf },
  { match: /bahasa indonesia/i, cover: "cover-11", icon: BookOpenText },
  { match: /bahasa inggris|english/i, cover: "cover-2", icon: Languages },
  { match: /sejarah/i, cover: "cover-9", icon: Landmark },
  { match: /geografi/i, cover: "cover-10", icon: Globe2 },
  { match: /ekonomi/i, cover: "cover-8", icon: Coins },
  { match: /sosiologi/i, cover: "cover-3", icon: Users },
  { match: /pancasila|ppkn|kewarganegaraan/i, cover: "cover-4", icon: Scale },
  { match: /informatika|komputer|tik\b/i, cover: "cover-7", icon: Cpu },
];

export function subjectOf(title: string) {
  return SUBJECTS.find((s) => s.match.test(title)) ?? null;
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

/**
 * Generated catalog artwork (there are no uploaded covers): the subject's own
 * hue, its symbol cropped large off the corner, and the title set on it.
 */
export function CatalogCover({
  id,
  title,
  className,
  children,
  showTitle = true,
}: {
  id: string;
  title: string;
  className?: string;
  children?: React.ReactNode;
  showTitle?: boolean;
}) {
  const subject = subjectOf(title);
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden text-white",
        catalogCoverClass(id, title),
        className,
      )}
    >
      {subject ? (
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
        <p className="absolute inset-x-5 bottom-4 line-clamp-2 font-display text-[22px] font-semibold leading-[1.15] tracking-[-0.024em]">
          {title}
        </p>
      ) : null}
    </div>
  );
}
