import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-display text-9xl text-uv uv-text-glow">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-zinc-100 uppercase tracking-wider">Sinal perdido</h2>
        <p className="mt-2 text-sm text-zinc-500">
          A rota que você procura não existe ou foi movida para outra dimensão.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-uv text-asphalt px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-white transition-colors"
          >
            Voltar pra base
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "HYPE_CRAFT — Personalize uniformes esportivos em tempo real" },
      {
        name: "description",
        content:
          "Plataforma premium de personalização de uniformes esportivos. Crie camisas, shorts e meiões com preview em tempo real, exporte em PNG e salve seus designs.",
      },
      { name: "author", content: "HYPE_CRAFT" },
      { property: "og:title", content: "HYPE_CRAFT — Personalize uniformes esportivos em tempo real" },
      { property: "og:description", content: "Kit Creator Pro is a modern, interactive web application for designing and customizing sports uniforms in real-time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "HYPE_CRAFT — Personalize uniformes esportivos em tempo real" },
      { name: "description", content: "Kit Creator Pro is a modern, interactive web application for designing and customizing sports uniforms in real-time." },
      { name: "twitter:description", content: "Kit Creator Pro is a modern, interactive web application for designing and customizing sports uniforms in real-time." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/df29ee06-517e-4d34-b76e-230a8eca7728/id-preview-fe62de54--bb2d7180-735f-4fa0-90e9-ec9c428d8d3d.lovable.app-1777658313577.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/df29ee06-517e-4d34-b76e-230a8eca7728/id-preview-fe62de54--bb2d7180-735f-4fa0-90e9-ec9c428d8d3d.lovable.app-1777658313577.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Teko:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
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
  return (
    <AuthProvider>
      <Outlet />
      <Toaster theme="dark" position="top-right" />
    </AuthProvider>
  );
}
