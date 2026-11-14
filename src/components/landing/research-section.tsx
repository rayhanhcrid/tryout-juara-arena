import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  PencilLine,
  Repeat,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * "Kenapa harus tiap hari?": learning research folded into one framework,
 * Uji → Cicil → Ulangi, which a package a day runs end to end. Each step
 * carries one number from its cited paper; nothing here is from memory.
 */

const SOURCES = [
  {
    id: "sumber-roediger",
    short: "Roediger & Karpicke, 2006",
    text: "Roediger, H. L., III, & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. Psychological Science, 17(3), 249–255.",
    doi: "10.1111/j.1467-9280.2006.01693.x",
  },
  {
    id: "sumber-dunlosky",
    short: "Dunlosky dkk., 2013",
    text: "Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students’ learning with effective learning techniques. Psychological Science in the Public Interest, 14(1), 4–58.",
    doi: "10.1177/1529100612453266",
  },
  {
    id: "sumber-lally",
    short: "Lally dkk., 2010",
    text: "Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J. (2010). How are habits formed: Modelling habit formation in the real world. European Journal of Social Psychology, 40(6), 998–1009.",
    doi: "10.1002/ejsp.674",
  },
] as const;

const STEPS = [
  {
    icon: PencilLine,
    title: "Uji",
    stat: "56%",
    finding:
      "isi bacaan yang masih diingat seminggu kemudian oleh mahasiswa yang langsung diuji. Yang membaca ulang tinggal 42%.",
    source: SOURCES[0],
    use: "paket soal bertimer, dan pembahasan baru terbuka setelah kamu menjawab.",
  },
  {
    icon: CalendarDays,
    title: "Cicil",
    stat: "2 dari 10",
    finding:
      "teknik belajar yang dinilai paling bermanfaat: latihan soal dan latihan berjarak. Membaca ulang dan menstabilo dinilai rendah.",
    source: SOURCES[1],
    use: "satu paket sehari, tersebar sepanjang minggu, bukan dikebut semalam sebelum tes.",
  },
  {
    icon: Repeat,
    title: "Ulangi",
    stat: "66 hari",
    finding:
      "median sampai kebiasaan baru terasa otomatis, dengan rentang 18–254 hari. Sekali terlewat tidak berpengaruh berarti.",
    source: SOURCES[2],
    use: "hari beruntun menemanimu melewati minggu-minggu awal. Terlewat sehari? Mulai lagi besok.",
  },
] as const;

export function ResearchSection() {
  return (
    <section
      id="riset"
      className="scroll-mt-14 bg-background py-24 sm:py-32"
      aria-labelledby="riset-heading"
    >
      <div className="mx-auto max-w-[1080px] px-5 sm:px-8">
        <h2 id="riset-heading" className="type-title-1 max-w-[16ch]">
          Kenapa harus tiap hari?
        </h2>
        <p className="type-lead mt-4 max-w-[40rem] text-muted-foreground">
          Riset psikologi belajar, diringkas jadi satu kerangka: <Strong>Uji, Cicil, Ulangi</Strong>
          . Satu paket soal sehari menjalankan ketiganya.
        </p>

        <figure className="reveal-on-scroll mt-14 overflow-hidden rounded-[28px] bg-card">
          <ol className="grid divide-y divide-hairline lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative flex flex-col p-6 sm:p-8">
                {i > 0 ? <StepArrow /> : null}
                <h3 className="flex items-center gap-3 text-[21px] font-semibold leading-tight tracking-[-0.02em]">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fill">
                    <step.icon aria-hidden className="h-[18px] w-[18px]" />
                  </span>
                  {step.title}
                </h3>
                <p className="mt-7 font-display text-[44px] font-bold leading-none tracking-[-0.04em]">
                  {step.stat}
                </p>
                <p className="type-callout mt-3 text-muted-foreground">{step.finding}</p>
                <a
                  href={`#${step.source.id}`}
                  className="mt-2 self-start text-[13px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  {step.source.short}
                </a>
                <p className="mt-auto pt-6 text-[15px] leading-[1.5] text-foreground/90">
                  <span className="font-semibold text-foreground">Di lulustes: </span>
                  {step.use}
                </p>
              </li>
            ))}
          </ol>
          <figcaption className="flex items-start gap-3 border-t border-hairline px-6 py-5 text-[15px] leading-[1.5] text-muted-foreground sm:px-8">
            <Repeat aria-hidden className="mt-0.5 h-[18px] w-[18px] shrink-0 text-link" />
            <span>
              Besok paket berikutnya terbit, dan putarannya mulai lagi dari{" "}
              <span className="text-foreground">Uji</span>.
            </span>
          </figcaption>
        </figure>

        <div className="mt-16 grid gap-10 border-t border-hairline pt-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <p className="type-body text-muted-foreground">
            Riset ini membahas kebiasaan dan daya ingat, bukan jaminan lulus, dan hasil tiap orang
            berbeda, seperti rentang 18 sampai 254 hari tadi. Tapi tes seleksi menguji apa yang
            masih kamu ingat di hari H, dan di situ sedikit setiap hari yang bertahan.
          </p>
          <div>
            <h3 className="text-[15px] font-semibold">Sumber</h3>
            <ol className="mt-3 space-y-3 text-[13px] leading-[1.5] text-muted-foreground">
              {SOURCES.map((s) => (
                <li key={s.id} id={s.id} className="scroll-mt-24">
                  {s.text}{" "}
                  <a
                    href={`https://doi.org/${s.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-link hover:underline"
                  >
                    doi:{s.doi}
                    <ArrowUpRight aria-hidden className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-foreground">{children}</strong>;
}

/** The hand-off between steps: down on phones, right on wide screens. */
function StepArrow() {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute z-10 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground",
        "-top-4 left-6 sm:left-8 lg:-left-4 lg:top-8",
      )}
    >
      <ArrowDown className="h-4 w-4 lg:hidden" />
      <ArrowRight className="hidden h-4 w-4 lg:block" />
    </span>
  );
}
