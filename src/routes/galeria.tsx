import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteShell";
import { JerseyCanvas } from "@/components/jersey/JerseyCanvas";
import { DEFAULT_DESIGN, PRESETS } from "@/lib/jersey-types";

export const Route = createFileRoute("/galeria")({
  head: () => ({
    meta: [
      { title: "Galeria — HYPE_CRAFT" },
      { name: "description", content: "Inspire-se em paletas e templates de uniformes esportivos premium." },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-[1440px] mx-auto px-6 py-12 w-full">
        <div className="mb-12">
          <p className="text-[11px] tracking-[0.3em] text-uv uppercase font-bold mb-3">[ Drops ]</p>
          <h1 className="text-display text-5xl md:text-7xl text-zinc-50">Galeria</h1>
          <p className="text-zinc-500 mt-2 max-w-md">Paletas curadas pra abrir seu próximo drop em segundos. Clique e abra no editor.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESETS.map((p) => {
            const merged = { ...DEFAULT_DESIGN, ...p.design };
            return (
              <Link
                key={p.name}
                to="/editor"
                className="group bg-concrete border border-zinc-900 hover:border-uv/40 transition-colors overflow-hidden block"
              >
                <div className="aspect-[4/5] bg-asphalt grid-bg flex items-center justify-center p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-uv/10 blur-[80px]" />
                  <JerseyCanvas design={merged} view="front" className="relative w-full h-full flex items-center justify-center drop-shadow-[0_20px_40px_rgba(208,0,255,0.2)]" />
                </div>
                <div className="p-5 border-t border-zinc-900 flex items-center justify-between">
                  <div>
                    <h3 className="text-zinc-100 font-bold uppercase tracking-tight" style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem" }}>
                      {p.name}
                    </h3>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600 mt-1">Open in editor →</p>
                  </div>
                  <div className="flex gap-1">
                    <span className="size-4" style={{ background: merged.bodyColor }} />
                    <span className="size-4" style={{ background: merged.collarTrim }} />
                    <span className="size-4" style={{ background: merged.accentColor }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
