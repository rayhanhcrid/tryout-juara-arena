import { Link } from "@tanstack/react-router";
import { ChevronLeft, LockKeyhole } from "lucide-react";
import { useState } from "react";
import {
  FieldGroup,
  FloatingField,
  FormError,
  SubmitArrow,
  useShake,
} from "@/components/form-fields";

export type GateResult = { token: string | null; reason: "code" | "server" | null };

/** Passcode screen. `onSubmitCode` resolves to a token, or says why there is none. */
export function AdminGate({
  onSubmitCode,
  onUnlock,
}: {
  onSubmitCode: (code: string) => Promise<GateResult>;
  onUnlock: (token: string) => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { shake, trigger } = useShake();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { token, reason } = await onSubmitCode(code.trim());
      if (!token) {
        setError(
          reason === "server"
            ? "Server ini belum tersambung ke database admin, jadi kata sandi tidak bisa diperiksa. Panel admin berjalan di aplikasi Lovable (Lovable Cloud), bukan di server lokal."
            : "Kata sandi salah. Periksa lagi, lalu coba sekali lagi.",
        );
        if (reason !== "server") setCode("");
        trigger();
        return;
      }
      onUnlock(token);
    } catch {
      setError("Tidak bisa memeriksa kata sandi sekarang. Periksa koneksi, lalu coba lagi.");
      trigger();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-card">
      <header className="mx-auto flex h-[52px] w-full max-w-[1080px] items-center px-3 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[15px] text-link hover:underline"
        >
          <ChevronLeft className="h-4 w-4" /> Beranda
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-5 pb-24 pt-10 sm:items-center sm:pt-0">
        <div className="w-full max-w-[380px] text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-fill">
            <LockKeyhole className="h-7 w-7 text-foreground" />
          </span>
          <h1 className="type-title-2 mt-6">Panel admin</h1>
          <p className="type-callout mt-2 text-muted-foreground">
            Masukkan kata sandi admin untuk mengelola katalog dan soal.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 text-left" noValidate>
            <FieldGroup shake={shake}>
              <FloatingField
                label="Kata sandi"
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoComplete="current-password"
                autoFocus
                trailing={
                  <SubmitArrow
                    enabled={code.trim().length > 0}
                    loading={loading}
                    label="Buka panel"
                  />
                }
              />
            </FieldGroup>
            <FormError message={error} />
          </form>
          <p className="mt-6 type-footnote text-muted-foreground">
            Sesi admin berlaku 12 jam di perangkat ini.
          </p>
        </div>
      </main>
    </div>
  );
}
