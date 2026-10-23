import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Phone } from "@/components/landing/devices";
import { CatalogScreen, ExamScreen, NameScreen, ResultScreen } from "@/components/landing/screens";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "Pilih mata pelajaran.",
    body: "Matematika, Fisika, sampai Informatika. Setiap katalog menunjukkan jumlah soal dan durasinya sejak awal.",
    screen: <CatalogScreen columns={1} count={4} topInset={30} />,
  },
  {
    title: "Tulis namamu, lalu mulai.",
    body: "Tanpa daftar akun. Nama inilah yang nanti tampil di papan peringkat.",
    screen: <NameScreen topInset={30} />,
  },
  {
    title: "Kerjakan sebelum waktu habis.",
    body: "Lompat ke soal mana pun dan tandai yang ragu-ragu. Waktu habis? Jawabanmu terkirim otomatis.",
    screen: <ExamScreen topInset={34} />,
  },
  {
    title: "Lihat skor dan peringkatmu.",
    body: "Skor muncul begitu jawaban terkirim, dan skor terbaikmu langsung masuk papan peringkat mata pelajaran itu.",
    screen: <ResultScreen topInset={30} />,
  },
];

/**
 * Apple-style highlights gallery: cards scroll sideways with snap, a phone
 * rises out of the bottom of each card, dots and paddles track the position.
 */
export function StepsGallery() {
  const scroller = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    items.forEach((item, i) => {
      const dist = Math.abs(item.offsetLeft + item.offsetWidth / 2 - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActive(best);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [update]);

  function goTo(index: number) {
    const el = scroller.current;
    const item = el?.children[index] as HTMLElement | undefined;
    if (!el || !item) return;
    el.scrollTo({
      left: item.offsetLeft - (el.clientWidth - item.offsetWidth) / 2,
      behavior: "smooth",
    });
  }

  return (
    <section
      id="cara-kerja"
      className="scroll-mt-14 bg-background py-24 sm:py-32"
      aria-roledescription="carousel"
    >
      <div className="mx-auto max-w-[1080px] px-5 sm:px-8">
        <h2 className="type-title-1 max-w-[16ch]">Empat langkah. Itu saja.</h2>
      </div>

      <ul
        ref={scroller}
        className="no-scrollbar mt-12 flex snap-x snap-mandatory scroll-px-[max(20px,calc((100vw-1080px)/2+32px))] gap-5 overflow-x-auto scroll-smooth px-[max(20px,calc((100vw-1080px)/2+32px))] pb-2"
      >
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            aria-roledescription="slide"
            aria-label={`${i + 1} dari ${STEPS.length}`}
            className="w-[84vw] shrink-0 snap-center sm:w-[560px] lg:w-[640px]"
          >
            <div className="relative h-[600px] overflow-hidden rounded-[28px] bg-card sm:h-[640px]">
              <div className="relative z-10 p-8 sm:p-10">
                <h3 className="max-w-[18ch] font-display text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)] font-bold leading-[1.08] tracking-[-0.032em]">
                  {step.title}
                </h3>
                <p className="type-body mt-3 max-w-[30rem] text-muted-foreground">{step.body}</p>
              </div>
              <div className="absolute inset-x-0 -bottom-[205px] flex justify-center sm:-bottom-[150px]">
                <Phone width={270}>{step.screen}</Phone>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mx-auto mt-8 flex max-w-[1080px] items-center justify-between px-5 sm:px-8">
        <div
          className="flex items-center gap-2.5 rounded-full bg-card px-4 py-3"
          role="tablist"
          aria-label="Pilih langkah"
        >
          {STEPS.map((step, i) => (
            <button
              key={step.title}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`Langkah ${i + 1}: ${step.title}`}
              onClick={() => goTo(i)}
              className={cn(
                "h-2 cursor-pointer rounded-full transition-[width,background-color] duration-500 ease-apple",
                active === i ? "w-6 bg-foreground" : "w-2 bg-tertiary hover:bg-muted-foreground",
              )}
            />
          ))}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            disabled={active === 0}
            aria-label="Langkah sebelumnya"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-card text-foreground transition-[background-color,opacity] hover:bg-secondary-hover disabled:cursor-default disabled:opacity-35"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            disabled={active === STEPS.length - 1}
            aria-label="Langkah berikutnya"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-card text-foreground transition-[background-color,opacity] hover:bg-secondary-hover disabled:cursor-default disabled:opacity-35"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
