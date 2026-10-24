import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { AppIcon } from "@/components/brand";
import { buttonVariants } from "@/components/ui/button";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="max-w-md text-center">
        <AppIcon size={56} className="mx-auto" />
        <p className="tabular mt-8 font-display text-[7rem] font-bold leading-none tracking-[-0.06em] text-tertiary">
          404
        </p>
        <h1 className="type-title-2 mt-4">Halaman ini tidak ada.</h1>
        <p className="type-body mt-3 text-muted-foreground">
          Mungkin alamatnya salah ketik, atau halamannya sudah dipindahkan.
        </p>
        <Link to="/" className={buttonVariants({ size: "lg", className: "mt-8" })}>
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="max-w-md text-center">
        <AppIcon size={56} className="mx-auto" />
        <h1 className="type-title-2 mt-8">Halaman ini gagal dimuat.</h1>
        <p className="type-body mt-3 text-muted-foreground">
          Ada yang salah di sisi kami. Coba muat ulang, atau kembali ke beranda.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className={buttonVariants({ size: "lg" })}
          >
            Coba lagi
          </button>
          <a href="/" className={buttonVariants({ size: "lg", variant: "secondary" })}>
            Ke beranda
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#f5f5f7" },
      { title: "TryOutKu — Try Out Ujian Online" },
      {
        name: "description",
        content:
          "Platform try out ujian online dengan katalog ujian, timer, skor otomatis, dan leaderboard.",
      },
      { name: "author", content: "TryOutKu" },
      { property: "og:title", content: "TryOutKu — Try Out Ujian Online" },
      {
        property: "og:description",
        content: "Ikuti try out, lihat skormu, dan bersaing di leaderboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { rel: "icon", href: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
