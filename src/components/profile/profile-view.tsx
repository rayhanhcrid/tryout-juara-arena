import { Link } from "@tanstack/react-router";
import { ChevronRight, CircleUserRound, CloudOff, LogOut, Save } from "lucide-react";
import { WeekStrip } from "@/components/daily/week-strip";
import { InitialsAvatar } from "@/components/initials-avatar";
import { ScoreChart } from "@/components/profile/score-chart";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Guest } from "@/lib/exam-session";
import { formatDate, formatDateTime, formatDay, percent } from "@/lib/format";
import type { Profile } from "@/lib/participant-api";

/**
 * The participant's own dashboard, in the light working world: who they are,
 * the streak, a few totals, the score day by day, and every recent attempt
 * with its review one tap away.
 */
export function ProfileView({
  guest,
  profile,
  failed,
  onSignOut,
  signingOut,
}: {
  /** undefined while this browser is being read. */
  guest: Guest | null | undefined;
  /** undefined while loading; null when the browser's key no longer checks out. */
  profile: Profile | null | undefined;
  failed: boolean;
  onSignOut: () => void;
  signingOut: boolean;
}) {
  if (guest === null) return <NoProfile />;
  if (failed) return <LoadFailed />;
  if (guest === undefined || profile === undefined) return <ProfileSkeleton />;
  if (profile === null) return <Expired />;

  const account = !!profile.guest.username;
  const { totals } = profile;

  return (
    <div>
      <header className="flex flex-wrap items-center gap-x-5 gap-y-4">
        <InitialsAvatar name={profile.guest.nama} seed={profile.guest.nama} size={64} />
        <div className="min-w-0 flex-1">
          <h1 className="type-title-1 truncate">{profile.guest.nama}</h1>
          <p className="type-callout mt-1 text-muted-foreground">
            {account
              ? `@${profile.guest.username} · bergabung ${formatDate(profile.guest.joined)}`
              : "Tamu di browser ini, belum punya akun"}
          </p>
        </div>
        {account ? (
          <Button variant="secondary" size="sm" onClick={onSignOut} disabled={signingOut}>
            <LogOut /> Keluar
          </Button>
        ) : null}
      </header>

      {!account ? (
        <section
          aria-labelledby="simpan-akun"
          className="surface mt-8 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fill">
            <Save className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h2 id="simpan-akun" className="type-headline">
              Simpan progresmu ke akun.
            </h2>
            <p className="type-callout mt-1 max-w-[52ch] text-muted-foreground">
              Saat ini progresmu hanya tersimpan di browser ini. Buat nama pengguna dan kata sandi
              supaya hari beruntun dan riwayat skormu bisa dibuka dari perangkat lain.
            </p>
          </div>
          <Link
            to="/masuk"
            search={{ mode: "daftar" }}
            className={buttonVariants({ className: "shrink-0 self-start sm:self-center" })}
          >
            Buat akun
          </Link>
        </section>
      ) : null}

      <div className="mt-8 grid gap-5 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-stretch">
        <section className="surface p-6" aria-label="Hari beruntun">
          <p className="flex items-baseline gap-2">
            <span className="tabular font-display text-[56px] font-bold leading-none tracking-[-0.045em]">
              {profile.streak.current}
            </span>
            <span className="text-[17px] font-semibold tracking-[-0.016em]">hari beruntun</span>
          </p>
          <p className="type-callout mt-2 text-muted-foreground">
            {profile.streak.best > 0
              ? `Rekormu ${profile.streak.best} hari.`
              : "Kirim paket harian di harinya untuk memulai."}
          </p>
          <WeekStrip days={profile.week} today={profile.today} className="mt-6" />
        </section>

        <section
          aria-label="Ringkasan"
          className="surface grid grid-cols-1 divide-y divide-hairline sm:grid-cols-3 sm:divide-x sm:divide-y-0"
        >
          <Stat
            label="Paket dikerjakan"
            value={String(totals.packages)}
            note={`dari ${totals.attempts} kali kirim`}
          />
          <Stat
            label="Rata-rata skor"
            value={totals.average !== null ? `${totals.average}%` : "–"}
            note="percobaan pertama tiap paket"
          />
          <Stat
            label="Skor terbaik"
            value={totals.best !== null ? `${totals.best}%` : "–"}
            note="percobaan pertama tiap paket"
          />
        </section>
      </div>

      <section aria-labelledby="skor-harian" className="mt-14">
        <h2 id="skor-harian" className="type-title-2">
          Skor harian
        </h2>
        <div className="mt-5">
          {profile.days.some((d) => d.attemptId) ? (
            <ScoreChart days={profile.days} />
          ) : (
            <Empty>
              Belum ada paket harian yang kamu kerjakan. Skor tiap hari akan tergambar di sini.
              <Link
                to="/hari-ini"
                className="mt-3 inline-flex items-center text-[15px] text-link hover:underline"
              >
                Kerjakan paket hari ini <ChevronRight className="h-4 w-4" />
              </Link>
            </Empty>
          )}
        </div>
      </section>

      <section aria-labelledby="riwayat" className="mt-14">
        <h2 id="riwayat" className="type-title-2">
          Riwayat
        </h2>
        <div className="mt-5">
          {profile.recent.length === 0 ? (
            <Empty>Belum ada paket yang kamu kirim.</Empty>
          ) : (
            <ul className="overflow-hidden rounded-[22px] bg-card shadow-[var(--shadow-card)]">
              {profile.recent.map((r) => (
                <li key={r.attemptId} className="border-t border-hairline first:border-t-0">
                  <Link
                    to="/pembahasan/$attemptId"
                    params={{ attemptId: r.attemptId }}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-fill/60"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[17px] font-semibold tracking-[-0.016em]">
                        {r.title}
                      </span>
                      <span className="tabular block text-[13px] text-muted-foreground">
                        {r.dailyDate ? `Paket ${formatDay(r.dailyDate, "short")} · ` : ""}
                        dikirim {formatDateTime(r.submittedAt)}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="tabular block text-[17px] font-semibold">
                        {r.score}/{r.total}
                      </span>
                      <span className="tabular block text-[13px] text-muted-foreground">
                        {percent(r.score, r.total)}% benar
                      </span>
                    </span>
                    <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-tertiary" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        {profile.recent.length > 0 ? (
          <p className="mt-3 px-1 text-[13px] text-muted-foreground">
            Ketuk satu kiriman untuk membuka pembahasannya.
          </p>
        ) : null}
      </section>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="flex flex-col justify-between gap-3 p-6">
      <p className="text-[13px] font-semibold text-muted-foreground">{label}</p>
      <div>
        <p className="font-display text-[40px] font-bold leading-none tracking-[-0.04em]">
          {value}
        </p>
        <p className="mt-2 text-[13px] leading-[1.4] text-muted-foreground">{note}</p>
      </div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="type-callout flex flex-col items-center rounded-[22px] bg-card px-6 py-10 text-center text-muted-foreground shadow-[var(--shadow-card)]">
      {children}
    </div>
  );
}

function Centered({
  icon: Icon,
  title,
  body,
  children,
}: {
  icon: typeof CloudOff;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="surface flex flex-col items-center px-6 py-16 text-center sm:py-20">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-fill text-muted-foreground">
        <Icon className="h-7 w-7" />
      </span>
      <h1 className="type-title-3 mt-5">{title}</h1>
      <p className="type-callout mt-2 max-w-sm text-muted-foreground">{body}</p>
      {children}
    </div>
  );
}

function NoProfile() {
  return (
    <Centered
      icon={CircleUserRound}
      title="Belum ada profil di browser ini."
      body="Masuk ke akunmu, atau kerjakan paket hari ini dulu: profilmu terbentuk setelah kiriman pertama."
    >
      <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <Link to="/masuk" className={buttonVariants({ size: "lg" })}>
          Masuk
        </Link>
        <Link
          to="/masuk"
          search={{ mode: "daftar" }}
          className="inline-flex items-center text-[15px] text-link hover:underline"
        >
          Buat akun <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </Centered>
  );
}

function Expired() {
  return (
    <Centered
      icon={CircleUserRound}
      title="Sesi di browser ini sudah berakhir."
      body="Masuk lagi dengan nama pengguna dan kata sandimu untuk membuka profilmu."
    >
      <Link to="/masuk" className={buttonVariants({ size: "lg", className: "mt-7" })}>
        Masuk lagi
      </Link>
    </Centered>
  );
}

function LoadFailed() {
  return (
    <Centered
      icon={CloudOff}
      title="Profil tidak bisa dimuat."
      body="Server sedang tidak bisa membaca database. Coba muat ulang halaman sebentar lagi."
    />
  );
}

function ProfileSkeleton() {
  return (
    <div aria-busy="true">
      <div className="flex items-center gap-5">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-36 rounded-md" />
        </div>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <Skeleton className="h-56 rounded-[28px]" />
        <Skeleton className="h-56 rounded-[28px]" />
      </div>
      <Skeleton className="mt-14 h-80 rounded-[28px]" />
    </div>
  );
}
