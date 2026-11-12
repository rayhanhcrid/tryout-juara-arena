import { ZoomIn } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { isLongStem, splitQuestionText } from "@/lib/question-format";
import { cn } from "@/lib/utils";

/**
 * A short question alone reads as a headline. A question with a reading
 * passage (see splitQuestionText) shows passage, image, then the question.
 * `size` "exam" is the one question on screen; "review" is one of many in a
 * list, set a step smaller under its own heading level.
 */
export function QuestionBody({
  text,
  imageUrl,
  size = "exam",
  as: Heading = "h1",
}: {
  text: string;
  imageUrl: string | null;
  size?: "exam" | "review";
  as?: "h1" | "h2" | "h3";
}) {
  const { stimulus, stem } = splitQuestionText(text);
  const image = imageUrl ? <QuestionImage url={imageUrl} /> : null;
  const long = isLongStem(stem);
  const stemClass =
    size === "review"
      ? long
        ? "whitespace-pre-line text-[17px] font-semibold leading-[1.45] tracking-[-0.014em] sm:text-[19px]"
        : "whitespace-pre-line font-display text-[clamp(1.1875rem,1rem+0.7vw,1.5rem)] font-semibold leading-[1.3] tracking-[-0.02em]"
      : long
        ? "whitespace-pre-line text-[19px] font-semibold leading-[1.45] tracking-[-0.014em] sm:text-[21px]"
        : "whitespace-pre-line font-display text-[clamp(1.375rem,1.1rem+1.1vw,1.875rem)] font-semibold leading-[1.3] tracking-[-0.022em]";

  const heading = (
    <Heading className={cn(stemClass, stimulus && (size === "review" ? "mt-6" : "mt-8"))}>
      <StemLines stem={stem} />
    </Heading>
  );
  if (!stimulus) {
    return (
      <>
        {heading}
        {image}
      </>
    );
  }
  return (
    <>
      <p className="type-body whitespace-pre-line leading-[1.6] text-pretty">{stimulus}</p>
      {image}
      {heading}
    </>
  );
}

const NUMBERED = /^\((\d+)\)\s+(.*)$/;

/** Numbered statements, "(1) …", read as a list in body weight under the question's lines. */
function StemLines({ stem }: { stem: string }) {
  const lines = stem.split(/\r?\n/);
  if (!lines.some((l) => NUMBERED.test(l))) return <>{stem}</>;
  return (
    <>
      {lines.map((line, i) => {
        const m = NUMBERED.exec(line);
        const prevNumbered = i > 0 && NUMBERED.test(lines[i - 1] ?? "");
        // Space where the list starts and ends; list items sit closer together.
        const gap = i === 0 ? "" : !!m === prevNumbered ? (m ? "mt-1.5" : "") : "mt-3";
        if (!m) {
          return (
            <span key={i} className={cn("block", gap)}>
              {line}
            </span>
          );
        }
        return (
          <span
            key={i}
            className={cn("grid grid-cols-[2.25rem_1fr] font-normal tracking-[-0.012em]", gap)}
          >
            <span className="tabular text-muted-foreground">({m[1]})</span>
            <span>{m[2]}</span>
          </span>
        );
      })}
    </>
  );
}

function QuestionImage({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [url]);

  if (failed) {
    return (
      <p className="mt-6 rounded-2xl bg-fill px-4 py-6 text-center type-callout text-muted-foreground">
        Gambar soal gagal dimuat. Coba muat ulang halaman.
      </p>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setZoom(true)}
        className={cn(
          "group relative mt-6 block cursor-zoom-in overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-card)] print:shadow-none",
          !loaded && "min-h-56 min-w-72 animate-pulse bg-fill",
        )}
        aria-label="Perbesar gambar soal"
      >
        <img
          src={url}
          alt="Gambar soal"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className="max-h-[22rem] w-auto object-contain sm:max-h-[30rem]"
        />
        <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 print:hidden">
          <ZoomIn className="h-4 w-4" />
        </span>
      </button>
      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="max-w-4xl p-3 sm:p-3">
          <DialogTitle className="sr-only">Gambar soal</DialogTitle>
          <img
            src={url}
            alt="Gambar soal, diperbesar"
            className="max-h-[80dvh] w-full rounded-2xl object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
