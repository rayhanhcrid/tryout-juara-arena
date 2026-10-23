import { Link } from "@tanstack/react-router";
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

/**
 * Frosted top bar. Everything hangs off the catalog (each catalog has its own
 * leaderboard), so the only destination in the bar is "Katalog". `tone` picks
 * the world: light for working pages, dark for the score moment.
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
  const onCatalog = pathname.startsWith("/katalog");

  return (
    <div className={cn("min-h-screen bg-background", tone === "dark" && "page-dark dark")}>
      <header className="material-bar sticky top-0 z-40 border-b border-hairline">
        <div className="mx-auto flex h-[52px] max-w-6xl items-center gap-4 px-5 sm:gap-6 sm:px-8">
          <BrandLink to="/" iconSize={24} />
          <nav aria-label="Navigasi utama">
            <Link
              to="/katalog"
              aria-current={onCatalog ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200",
                onCatalog
                  ? "bg-fill text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Katalog
            </Link>
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

      <main className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-8 md:pt-12">{children}</main>
    </div>
  );
}
