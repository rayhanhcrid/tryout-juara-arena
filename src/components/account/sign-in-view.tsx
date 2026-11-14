import { Link } from "@tanstack/react-router";
import { ChevronRight, CircleUserRound } from "lucide-react";
import { useEffect, useState } from "react";
import {
  FieldGroup,
  FloatingField,
  FormError,
  SubmitArrow,
  useShake,
} from "@/components/form-fields";
import { SegmentedControl } from "@/components/segmented-control";
import { buttonVariants } from "@/components/ui/button";
import type { Guest } from "@/lib/exam-session";
import type { Account } from "@/lib/participant-api";
import { USERNAME_RULE, cleanUsername } from "@/lib/username";

export type SignInMode = "masuk" | "daftar";

const MODES = [
  { value: "masuk", label: "Masuk" },
  { value: "daftar", label: "Buat akun" },
] as const satisfies readonly { value: SignInMode; label: string }[];

/**
 * Account sign-in and sign-up in the Apple ID manner: one grouped field stack
 * whose last field carries the round submit arrow. An account is optional;
 * it only lets the same participant come back from another browser.
 */
export function SignInView({
  mode,
  onModeChange,
  guest,
  onSignIn,
  onRegister,
  onDone,
}: {
  mode: SignInMode;
  onModeChange: (mode: SignInMode) => void;
  /** This browser's participant, if any (undefined while it is being read). */
  guest: Guest | null | undefined;
  onSignIn: (username: string, password: string) => Promise<Account>;
  onRegister: (input: { nama: string; username: string; password: string }) => Promise<Account>;
  onDone: () => void;
}) {
  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { shake, trigger } = useShake();

  // A plain guest's name is the obvious account name.
  useEffect(() => {
    if (guest && !guest.username) setNama((n) => n || guest.nama);
  }, [guest]);

  useEffect(() => setError(null), [mode]);

  const cleanNama = nama.trim().replace(/\s+/g, " ");
  const user = cleanUsername(username);
  const ready =
    mode === "masuk"
      ? user.length > 0 && password.length > 0
      : cleanNama.length > 0 && user.length > 0 && password.length > 0;

  function fail(message: string) {
    setError(message);
    trigger();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || loading) return;
    if (mode === "daftar") {
      if (cleanNama.length < 2) return fail("Tulis namamu dulu, minimal 2 huruf.");
      if (!USERNAME_RULE.test(user)) {
        return fail("Nama pengguna 3–20 karakter: huruf kecil, angka, titik, atau garis bawah.");
      }
      if (password.length < 6) return fail("Kata sandi minimal 6 karakter.");
    }
    setLoading(true);
    setError(null);
    try {
      if (mode === "masuk") await onSignIn(user, password);
      else await onRegister({ nama: cleanNama, username: user, password });
      onDone();
    } catch (err) {
      if (mode === "masuk") setPassword("");
      fail(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (guest?.username) {
    return (
      <Centered>
        <h1 className="type-title-2 mt-6">Kamu sudah masuk.</h1>
        <p className="type-callout mt-2 text-muted-foreground">
          Browser ini memakai akun {guest.nama} (@{guest.username}).
        </p>
        <Link to="/profil" className={buttonVariants({ size: "lg", className: "mt-8" })}>
          Buka profil
        </Link>
      </Centered>
    );
  }

  const plainGuest = guest && !guest.username ? guest : null;

  return (
    <Centered>
      <h1 className="type-title-2 mt-6">{mode === "masuk" ? "Masuk" : "Buat akun"}</h1>
      <p className="type-callout mt-2 text-muted-foreground">
        {mode === "masuk"
          ? "Lanjutkan hari beruntun dan riwayat skormu dari perangkat mana pun."
          : "Cukup nama pengguna dan kata sandi. Tanpa email, tanpa nomor HP."}
      </p>

      <SegmentedControl
        value={mode}
        onChange={onModeChange}
        options={MODES}
        ariaLabel="Masuk atau buat akun"
        className="mx-auto mt-7 max-w-[260px]"
      />

      <form onSubmit={handleSubmit} className="mt-6 text-left" noValidate>
        <FieldGroup shake={shake}>
          {mode === "daftar" ? (
            <FloatingField
              key="nama"
              label="Nama (tampil di papan peringkat)"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              autoComplete="name"
              maxLength={40}
            />
          ) : null}
          <FloatingField
            key="username"
            label="Nama pengguna"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            maxLength={21}
            autoFocus={mode === "masuk"}
          />
          <FloatingField
            key="password"
            label="Kata sandi"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "masuk" ? "current-password" : "new-password"}
            trailing={
              <SubmitArrow
                enabled={ready}
                loading={loading}
                label={mode === "masuk" ? "Masuk" : "Buat akun"}
              />
            }
          />
        </FieldGroup>
        <FormError message={error} />
      </form>

      <div className="mt-3 space-y-2 text-left text-[13px] leading-[1.45] text-muted-foreground">
        {mode === "daftar" ? (
          <>
            <p>
              Nama pengguna 3–20 karakter: huruf kecil, angka, titik, atau garis bawah. Kata sandi
              minimal 6 karakter. Belum ada cara memulihkan kata sandi, jadi simpan baik-baik.
            </p>
            {plainGuest ? (
              <p>
                Riwayat dan hari beruntun <span className="text-foreground">{plainGuest.nama}</span>{" "}
                di browser ini ikut tersimpan ke akun barumu.
              </p>
            ) : null}
          </>
        ) : plainGuest ? (
          <p>
            Skor yang dikirim sebagai <span className="text-foreground">{plainGuest.nama}</span> di
            browser ini ikut pindah ke akunmu.
          </p>
        ) : null}
      </div>

      <Link
        to="/hari-ini"
        className="mt-10 inline-flex items-center text-[15px] text-link hover:underline"
      >
        Kerjakan paket hari ini tanpa akun <ChevronRight className="h-4 w-4" />
      </Link>
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[380px] pt-2 text-center sm:pt-8">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-fill">
        <CircleUserRound className="h-8 w-8 text-foreground" strokeWidth={1.75} />
      </span>
      {children}
    </div>
  );
}
