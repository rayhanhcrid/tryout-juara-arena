import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { normalizeUsername, syntheticEmail } from "@/lib/username";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Masuk / Daftar — TryOutKu" },
      { name: "description", content: "Masuk atau daftar untuk mengikuti try out di TryOutKu." },
      { property: "og:title", content: "Masuk / Daftar — TryOutKu" },
      { property: "og:description", content: "Masuk atau daftar untuk mengikuti try out di TryOutKu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();

  // Signed-in users don't need this page.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground">
            T
          </span>
          <span className="font-display text-xl font-bold tracking-tight">TryOutKu</span>
        </Link>

        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Masuk</TabsTrigger>
            <TabsTrigger value="register">Daftar</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm onDone={() => navigate({ to: "/dashboard" })} />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm onDone={() => navigate({ to: "/dashboard" })} />
          </TabsContent>
        </Tabs>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Masuk pakai username &amp; password yang kamu daftarkan.
        </p>
      </div>
    </div>
  );
}

function LoginForm({ onDone }: { onDone: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const normalized = normalizeUsername(username);
    const { error } = await supabase.auth.signInWithPassword({
      email: syntheticEmail(normalized),
      password,
    });
    setLoading(false);
    if (error) {
      toast.error("Username atau password salah.");
      return;
    }
    toast.success("Berhasil masuk!");
    onDone();
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Selamat datang kembali</CardTitle>
        <CardDescription>Masuk untuk mengikuti try out.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-username">Username</Label>
            <Input
              id="login-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="misal: budi01"
              required
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RegisterForm({ onDone }: { onDone: () => void }) {
  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizeUsername(username);
    if (normalized.length < 3) {
      toast.error("Username minimal 3 karakter.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password minimal 6 karakter.");
      return;
    }
    setLoading(true);

    // Username must be unique: reserve it by checking profiles first.
    const { data: taken } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", normalized)
      .maybeSingle();
    if (taken) {
      setLoading(false);
      toast.error("Username sudah dipakai, coba yang lain.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: syntheticEmail(normalized),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { username: normalized, nama: nama.trim() },
      },
    });
    setLoading(false);
    if (error) {
      toast.error("Pendaftaran gagal. Coba username lain.");
      return;
    }
    toast.success("Akun berhasil dibuat!");
    onDone();
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Buat akun baru</CardTitle>
        <CardDescription>Gratis, cukup nama, username, dan password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reg-nama">Nama lengkap</Label>
            <Input
              id="reg-nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="misal: Budi Santoso"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-username">Username</Label>
            <Input
              id="reg-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="misal: budi01"
              required
              autoComplete="username"
            />
            <p className="text-xs text-muted-foreground">
              Username dipakai untuk masuk nanti (huruf kecil semua).
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <Input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Membuat akun..." : "Daftar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
