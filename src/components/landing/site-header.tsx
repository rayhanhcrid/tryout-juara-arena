import { Link } from "@tanstack/react-router";
import { BrandLink } from "@/components/brand";
import { buttonVariants } from "@/components/ui/button";

/** Frosted, 52px, Apple-style global nav for the dark landing page. */
export function SiteHeader() {
  return (
    <header className="material-bar fixed inset-x-0 top-0 z-40 border-b border-hairline">
      <nav className="mx-auto flex h-[52px] max-w-[1080px] items-center justify-between gap-6 px-5 sm:px-8">
        <BrandLink iconSize={24} />
        <div className="hidden items-center gap-8 text-[13px] text-foreground/80 md:flex">
          <Link to="/hari-ini" className="transition-colors hover:text-foreground">
            Hari ini
          </Link>
          <Link to="/katalog" className="transition-colors hover:text-foreground">
            Latihan
          </Link>
          <Link to="/berita" className="transition-colors hover:text-foreground">
            Berita
          </Link>
          <a href="#riset" className="transition-colors hover:text-foreground">
            Riset
          </a>
          <a href="#cara-kerja" className="transition-colors hover:text-foreground">
            Cara kerja
          </a>
        </div>
        <Link to="/hari-ini" className={buttonVariants({ size: "sm" })}>
          Mulai
        </Link>
      </nav>
    </header>
  );
}
