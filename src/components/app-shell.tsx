import { Link } from "@tanstack/react-router";
import {
  CalendarCheck2,
  CircleUserRound,
  LayoutGrid,
  LogIn,
  Newspaper,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLink } from "@/components/brand";
import { InitialsAvatar } from "@/components/initials-avatar";
import { buttonVariants } from "@/components/ui/button";
import { readGuest, type Guest } from "@/lib/exam-session";
import { cn } from "@/lib/utils";

/**
 * This browser's participant, read after mount (it lives in localStorage):
 * undefined until then, null when there is none.
 */
export function useGuest(): Guest | null | undefined {
  const [guest, setGuest] = useState<Guest | null | undefined>(undefined);
  useEffect(() => setGuest(readGuest()), []);
  return guest;
}

/** The name last used on this browser, read after mount (it lives in localStorage). */
export function useGuestName(): string | null {
  return useGuest()?.nama ?? null;
}

type Destination = {
  to: "/hari-ini" | "/katalog" | "/berita" | "/profil";
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

/** Phones also get the profile as a tab; wide screens reach it from the avatar. */
const PROFILE_TAB: Destination = {
  to: "/profil",
  label: "Profil",
  icon: CircleUserRound,
  match: ["/profil", "/masuk"],
};

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
  const guest = useGuest();
  const onProfile = isActive(pathname, PROFILE_TAB);

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
          {guest !== undefined ? (
            <div className="-mr-1.5 ml-auto flex items-center gap-1.5">
              {/* Anyone not signed in to an account can sign in from every page. */}
              {!guest?.username && !pathname.startsWith("/masuk") ? (
                <Link
                  to="/masuk"
                  className={buttonVariants({ variant: "tinted", size: "sm", className: "mr-1" })}
                >
                  <LogIn /> Masuk
                </Link>
              ) : null}
              {guest ? (
                <Link
                  to="/profil"
                  aria-current={onProfile ? "page" : undefined}
                  className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1 transition-colors duration-200 hover:bg-fill aria-[current=page]:bg-fill sm:pl-3"
                >
                  <span className="hidden max-w-48 truncate text-[13px] font-medium sm:inline">
                    {guest.nama}
                  </span>
                  <span className="sr-only sm:hidden">Profil {guest.nama}</span>
                  <InitialsAvatar name={guest.nama} seed={guest.nama} size={30} />
                </Link>
              ) : null}
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
        <div className="mx-auto grid h-14 max-w-md grid-cols-4">
          {[...DESTINATIONS, PROFILE_TAB].map((d) => {
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
