import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteShell";
import { ArrowRight, Sparkles, Layers, Download, Cpu, Palette, Share2, Star } from "lucide-react";
import heroJersey from "@/assets/hero-jersey.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HYPE_CRAFT — Crie uniformes esportivos premium em tempo real" },
      {
        name: "description",
        content:
          "Editor interativo de uniformes esportivos com preview ao vivo. Personalize camisa, shorts e meião, exporte em PNG e salve seus designs.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Ticker />
        <Features />
        <Showcase />
        <Testimonials />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 right-[-10%] -translate-y-1/2 w-[800px] h-[800px] bg-uv/15 blur-[160px] rounded-full pointer-events-none" />

      <div className="relative max-w-[1440px] mx-auto px-6 pt-12 pb-24 lg:pt-20 lg:pb-32 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <div className="lg:col-span-7 z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="size-2 bg-uv animate-pulse shadow-[0_0_10px_var(--uv)]" />
            <p className="text-[11px] font-bold tracking-[0.3em] text-uv uppercase">
              Protocol 0.4.1 — Live Render Engine
            </p>
          </div>

          <h1 className="text-display text-[clamp(3.5rem,11vw,9rem)] text-zinc-50 mb-8">
            Garment
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-50 via-zinc-100 to-zinc-600">
              Architecture
            </span>
          </h1>

          <p className="max-w-[52ch] text-base lg:text-lg text-zinc-400 leading-relaxed mb-10 text-pretty">
            Esculpa o silhueta. Defina a tensão da malha. Dite a cultura. Personalize uniformes esportivos em tempo real
            com a precisão de uma startup de design premium.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <Link
              to="/editor"
              className="group relative inline-flex items-center justify-center gap-3 bg-uv text-asphalt px-8 py-4 text-lg font-bold uppercase tracking-widest overflow-hidden hover:bg-white transition-colors duration-300 uv-glow"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="relative z-10">Criar Uniforme</span>
              <ArrowRight className="size-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/galeria"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300 hover:text-uv border border-zinc-800 hover:border-uv/40 transition-colors"
            >
              Ver Galeria
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 max-w-md border-t border-zinc-900 pt-8">
            <Stat value="12k+" label="Designs" />
            <Stat value="4.9★" label="Rating" />
            <Stat value="60s" label="To craft" />
          </div>
        </div>

        <div className="lg:col-span-5 relative animate-float">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-uv/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="relative bg-concrete border border-zinc-800/80 p-2 shadow-[0_30px_80px_-20px_rgba(208,0,255,0.25)]">
            <div className="absolute top-3 left-3 z-20 text-[10px] tracking-widest font-bold text-zinc-500 bg-asphalt/80 px-2 py-1 backdrop-blur-sm border border-zinc-800">
              RENDER_VP_01
            </div>
            <div className="absolute bottom-3 right-3 z-20 text-[10px] tracking-widest font-bold text-uv bg-asphalt/80 px-2 py-1 backdrop-blur-sm border border-uv/30 flex items-center gap-1.5">
              <span className="size-1.5 bg-uv rounded-full animate-pulse" /> LIVE
            </div>
            <img
              src={heroJersey}
              alt="Render 3D de uniforme esportivo personalizado em preto e ultravioleta"
              width={1024}
              height={1280}
              className="w-full aspect-[4/5] object-cover"
            />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-0 w-full h-px bg-uv/20" />
              <div className="absolute top-3/4 left-0 w-full h-px bg-uv/20" />
              <div className="absolute top-0 left-1/3 w-px h-full bg-uv/20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-display text-3xl text-zinc-100">{value}</div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-1">{label}</div>
    </div>
  );
}

function Ticker() {
  const items = ["GARMENT ARCHITECTURE", "REAL-TIME RENDER", "EXPORT 8K PNG", "SAVE TO VAULT", "SHARE INSTANTLY"];
  const list = [...items, ...items, ...items];
  return (
    <div className="border-y border-zinc-900 bg-asphalt overflow-hidden">
      <div className="flex ticker whitespace-nowrap py-5">
        {list.map((it, i) => (
          <span key={i} className="text-display text-2xl text-zinc-700 mx-8 flex items-center gap-8">
            {it}
            <span className="size-1.5 bg-uv rounded-full" />
          </span>
        ))}
      </div>
    </div>
  );
}

function Features() {
  const features = [
    { icon: Palette, title: "Personalização Total", desc: "Cores, padrões, gola, mangas, número, nome e logo. Cada detalhe sob seu comando." },
    { icon: Cpu, title: "Render em Tempo Real", desc: "Visualize cada alteração instantaneamente — preview frontal, traseiro e zoom." },
    { icon: Download, title: "Exporte em PNG", desc: "Baixe seu design em alta resolução para mockups, redes sociais ou produção." },
    { icon: Layers, title: "Templates Prontos", desc: "Comece de paletas curadas — Ultraviolet, Volt, Cyber Ice e mais." },
    { icon: Share2, title: "Compartilhe", desc: "Salve no seu vault e compartilhe com seu squad antes da decisão final." },
    { icon: Sparkles, title: "Premium Feel", desc: "Interface clínica, tipografia editorial, animações fluidas. Como deve ser." },
  ];
  return (
    <section className="max-w-[1440px] mx-auto px-6 py-24">
      <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <p className="text-[11px] tracking-[0.3em] text-uv uppercase font-bold mb-3">[ System Specs ]</p>
          <h2 className="text-display text-5xl md:text-7xl text-zinc-50">
            Engenharia<br />
            <span className="text-zinc-500">de uniformes</span>
          </h2>
        </div>
        <p className="max-w-md text-sm text-zinc-400">
          Tudo o que você precisa para criar um uniforme com aparência de campanha global, em minutos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-900">
        {features.map((f) => (
          <div
            key={f.title}
            className="group bg-asphalt p-8 hover:bg-concrete transition-colors cursor-default relative overflow-hidden"
          >
            <div className="h-px w-12 bg-uv mb-6 group-hover:w-full transition-all duration-500" />
            <f.icon className="size-7 text-uv mb-5" />
            <h3 className="text-2xl text-zinc-100 uppercase tracking-tight mb-3" style={{ fontFamily: "var(--font-display)" }}>
              {f.title}
            </h3>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-[40ch]">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Showcase() {
  // gradient cards as visual showcase examples
  const themes = [
    { name: "Ultraviolet", bg: "linear-gradient(135deg, #0a0a0a 50%, #D000FF 50%)" },
    { name: "Volt Strike", bg: "linear-gradient(135deg, #050505 50%, #CCFF00 50%)" },
    { name: "Cyber Ice", bg: "linear-gradient(135deg, #03111c 50%, #00E5FF 50%)" },
    { name: "Blood Moon", bg: "linear-gradient(135deg, #1a0505 50%, #FF0033 50%)" },
    { name: "Royal Gold", bg: "linear-gradient(135deg, #0a0a3d 50%, #FFD700 50%)" },
    { name: "Forest Ops", bg: "linear-gradient(135deg, #0a1a0a 50%, #39FF14 50%)" },
  ];
  return (
    <section className="border-t border-zinc-900 bg-concrete/30 py-24">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-[11px] tracking-[0.3em] text-uv uppercase font-bold mb-3">[ Drops ]</p>
            <h2 className="text-display text-4xl md:text-6xl text-zinc-50">Galeria de drops</h2>
          </div>
          <Link to="/galeria" className="hidden md:inline-flex text-xs uppercase tracking-widest text-zinc-400 hover:text-uv items-center gap-2">
            Ver tudo <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {themes.map((t) => (
            <Link
              key={t.name}
              to="/editor"
              className="group relative aspect-[3/4] border border-zinc-800 hover:border-uv/40 transition-all overflow-hidden"
            >
              <div className="absolute inset-0" style={{ background: t.bg }} />
              <div className="absolute inset-0 bg-gradient-to-t from-asphalt/90 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Drop</div>
                <div className="text-zinc-50 font-bold uppercase tracking-tight" style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", lineHeight: 1 }}>
                  {t.name}
                </div>
              </div>
              <div className="absolute top-3 right-3 size-2 bg-uv opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_var(--uv)]" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { quote: "Mudou completamente como apresentamos uniformes pros sponsors. Render limpo, exportação rápida.", author: "Lucas Vieira", role: "Diretor Criativo @ FuriaWear" },
    { quote: "A interface parece um software de lab. Os jogadores ficam viciados em testar paletas.", author: "Marina Reis", role: "Brand Lead @ NorthSquad" },
    { quote: "De zero ao mockup final em 4 minutos. Inacreditável.", author: "Igor Almeida", role: "Founder @ Drop Atelier" },
  ];
  return (
    <section className="max-w-[1440px] mx-auto px-6 py-24">
      <div className="mb-12">
        <p className="text-[11px] tracking-[0.3em] text-uv uppercase font-bold mb-3">[ Field Reports ]</p>
        <h2 className="text-display text-4xl md:text-6xl text-zinc-50">Quem já forjou aqui</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-900">
        {items.map((t, i) => (
          <div key={i} className="bg-asphalt p-8">
            <div className="flex gap-1 mb-5">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className="size-3.5 fill-uv text-uv" />
              ))}
            </div>
            <p className="text-zinc-200 text-base leading-relaxed mb-8 text-pretty">"{t.quote}"</p>
            <div className="border-t border-zinc-900 pt-4">
              <div className="text-sm text-zinc-100 font-semibold">{t.author}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{t.role}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative border-t border-zinc-900 overflow-hidden">
      <div className="absolute inset-0 bg-uv/10 blur-[120px]" />
      <div className="relative max-w-[1440px] mx-auto px-6 py-24 text-center">
        <h2 className="text-display text-5xl md:text-8xl text-zinc-50 mb-6">
          Pronto pra<br />
          <span className="text-uv uv-text-glow">forjar</span>?
        </h2>
        <p className="text-zinc-400 max-w-md mx-auto mb-10">
          Abra o editor e crie um uniforme com cara de campanha global em poucos minutos.
        </p>
        <Link
          to="/editor"
          className="inline-flex items-center gap-3 bg-uv text-asphalt px-10 py-5 text-xl font-bold uppercase tracking-widest hover:bg-white transition-colors uv-glow"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Criar Uniforme <ArrowRight className="size-5" />
        </Link>
      </div>
    </section>
  );
}
