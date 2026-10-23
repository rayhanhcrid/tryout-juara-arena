import { DemoExam } from "@/components/landing/demo-exam";
import { Laptop, Phone, Tablet, useFitScale } from "@/components/landing/devices";
import { CatalogScreen, ResultScreen } from "@/components/landing/screens";

/**
 * The hero's device lineup. Wide screens: a laptop whose lid opens as you
 * scroll, running the playable exam, flanked by a tablet (the catalog) and a
 * phone (the score). Phones: the playable exam on a phone, tablet behind.
 */
export function HeroStage() {
  return (
    <div className="hero-stage relative">
      {/* A soft neutral spotlight so black bezels separate from the black page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[8%] mx-auto h-[80%] max-w-[1100px] rounded-[50%] bg-[radial-gradient(closest-side,rgb(255_255_255/0.09),transparent)]"
      />
      <div className="hidden lg:block">
        <WideStage />
      </div>
      <div className="lg:hidden">
        <NarrowStage />
      </div>
    </div>
  );
}

const WIDE_W = 1200;
const WIDE_H = 700;

function WideStage() {
  const { ref, scale } = useFitScale(WIDE_W);
  return (
    <div
      ref={ref}
      className="relative mx-auto w-full max-w-[1200px]"
      style={{ height: WIDE_H * scale }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: WIDE_W, height: WIDE_H, transform: `scale(${scale})` }}
      >
        <div className="stage-left absolute left-0 top-[120px]">
          <Tablet width={330}>
            <CatalogScreen count={8} />
          </Tablet>
        </div>
        <div className="absolute left-[170px] top-[30px] z-10">
          <Laptop width={860} animated>
            <div className="light h-full">
              <DemoExam variant="laptop" />
            </div>
          </Laptop>
        </div>
        <div className="stage-right absolute left-[1000px] top-[290px] z-20">
          <Phone width={192}>
            <ResultScreen topInset={26} />
          </Phone>
        </div>
      </div>
    </div>
  );
}

const NARROW_W = 390;
const NARROW_H = 650;

function NarrowStage() {
  const { ref, scale } = useFitScale(NARROW_W);
  return (
    <div
      ref={ref}
      className="relative mx-auto w-full max-w-[390px]"
      style={{ height: NARROW_H * scale }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: NARROW_W, height: NARROW_H, transform: `scale(${scale})` }}
      >
        <div className="stage-left absolute -left-[70px] top-[70px] -rotate-6">
          <Tablet width={250}>
            <CatalogScreen count={6} />
          </Tablet>
        </div>
        <div className="stage-rise absolute left-[48px] top-0 z-10">
          <Phone width={300}>
            <div className="light h-full">
              <DemoExam variant="phone" />
            </div>
          </Phone>
        </div>
      </div>
    </div>
  );
}
