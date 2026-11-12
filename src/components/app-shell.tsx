import { Link } from "@tanstack/react-router";
import { CalendarCheck2, LayoutGrid, Newspaper, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLink } from "@/components/brand";
import { InitialsAvatar } from "@/components/initials-avatar";
import { readGuest } from "@/lib/exam-session";
import { cn } from "@/lib/utils";

/** The name last used on this browser, read after mount (it lives in localStorage). */
export function useGuestName(): string | null {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => setName(readGuest()?.nama ?? null), []);
  return name;
}

type Destination = {
  to: "/hari-ini" | "/katalog" | "/berita";
  label: string;
  icon: LucideIcon;
  /** Path prefixes that count as being here. */
  match: string[];
};

/** Hari ini is the routine; Latihan holds every package; Berita the selection news. */
const DESTINATIONS: Destination[] = [
  { to: "/hari-ini", label: "Hari ini", icon: CalendarCheck2, match: ["/hari-ini"] },
  { to: "/katalog", label: "Latihan", icon: LayoutGrid, match: ["/katalog", "/peringkat"] },
  { to: "/berita", label: "Berita", icon: Newspaper, match: ["/berita"] },
];

function isActive(pathname: string, d: Destination): boolean {
  return d.match.some((m) => pathname.startsWith(m));
}

/**
 * Frosted top bar, plus an iOS tab bar on phones. `tone` picks the world:
 * light for working pages, dark for the score moment. Neither bar prints, so
 * a saved review is just the review.
 */
export function AppShell({
  pathname,
  tone = "light",
  children,
}: {
  pathname: string;
  tone?: "light" | "dark";
  children: React.ReactNode;
}) {
  const guestName = useGuestName();

  return (
    <div className={cn("min-h-screen bg-background", tone === "dark" && "page-dark dark")}>
      <header className="material-bar sticky top-0 z-40 border-b border-hairline print:hidden">
        <div className="mx-auto flex h-[52px] max-w-6xl items-center gap-4 px-5 sm:gap-6 sm:px-8">
          <BrandLink to="/" iconSize={24} />
          <nav aria-label="Navigasi utama" className="hidden items-center gap-1 sm:flex">
            {DESTINATIONS.map((d) => {
              const active = isActive(pathname, d);
              return (
                <Link
                  key={d.to}
                  to={d.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200",
                    active
                      ? "bg-fill text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {d.label}
                </Link>
              );
            })}
          </nav>
          {guestName ? (
            <div className="ml-auto flex items-center gap-2.5">
              <span className="hidden max-w-48 truncate text-[13px] font-medium sm:inline">
                {guestName}
              </span>
              <InitialsAvatar name={guestName} seed={guestName} size={30} />
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-[calc(56px+env(safe-area-inset-bottom)+3rem)] pt-8 sm:px-8 sm:pb-20 md:pt-12 print:max-w-none print:p-0">
        {children}
      </main>

      <nav
        aria-label="Navigasi utama"
        className="material-bar fixed inset-x-0 bottom-0 z-40 border-t border-hairline pb-[env(safe-area-inset-bottom)] sm:hidden print:hidden"
      >
        <div className="mx-auto grid h-14 max-w-md grid-cols-3">
          {DESTINATIONS.map((d) => {
            const active = isActive(pathname, d);
            return (
              <Link
                key={d.to}
                to={d.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
                  // Link blue, not action blue: it clears 4.5:1 on both bars at 11px.
                  active ? "text-link" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <d.icon
                  aria-hidden
                  className="h-[22px] w-[22px]"
                  strokeWidth={active ? 2.25 : 1.75}
                />
                {d.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
