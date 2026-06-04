import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteShell";
import { JerseyCanvas } from "@/components/jersey/JerseyCanvas";
import { SponsorDragLayer } from "@/components/jersey/SponsorDragLayer";
import {
  DEFAULT_DESIGN,
  PRESETS,
  NUMBER_PLACEMENTS,
  SPONSOR_POSITIONS,
  type BodyPattern,
  type JerseyDesign,
  type NumberPlacement,
  type SponsorItem,
  type SponsorPosition,
} from "@/lib/jersey-types";
import { STAMPS, fetchDbStamps, type Stamp } from "@/lib/stamps";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Download, Save, Upload, Palette, RotateCcw, Eye, ZoomIn, ZoomOut, Trash2, Shirt, Plus, Layers } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/editor")({
  head: () => ({
    meta: [
      { title: "Editor — HYPE_CRAFT" },
      { name: "description", content: "Personalize seu uniforme em tempo real. Exporte em PNG ou salve no seu vault." },
    ],
  }),
  component: EditorPage,
});

const FONTS = ["Teko", "Manrope", "Impact", "Arial Black", "Georgia"];

const PATTERNS: Array<{ value: BodyPattern; label: string }> = [
  { value: "solid", label: "Liso" },
  { value: "stripes-v", label: "Listras vert." },
  { value: "stripes-h", label: "Listras horiz." },
  { value: "sash", label: "Faixa diagonal" },
  { value: "halves", label: "Metades" },
  { value: "checks", label: "Xadrez" },
];

/** CSS background that previews a body pattern using the two design colors. */
function patternBg(value: BodyPattern, c1: string, c2: string): string {
  switch (value) {
    case "stripes-v":
      return `repeating-linear-gradient(90deg, ${c2} 0 8px, ${c1} 8px 16px)`;
    case "stripes-h":
      return `repeating-linear-gradient(0deg, ${c2} 0 8px, ${c1} 8px 16px)`;
    case "sash":
      return `repeating-linear-gradient(45deg, ${c2} 0 8px, ${c1} 8px 22px)`;
    case "checks":
      return `conic-gradient(${c2} 0 25%, ${c1} 0 50%, ${c2} 0 75%, ${c1} 0) 0 0 / 16px 16px`;
    case "halves":
      return `linear-gradient(90deg, ${c2} 0 50%, ${c1} 50% 100%)`;
    default:
      return c1;
  }
}


function EditorPage() {
  const [design, setDesign] = useState<JerseyDesign>(DEFAULT_DESIGN);
  const [view, setView] = useState<"front" | "back" | "full">("front");
  const [zoom, setZoom] = useState(1);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("Untitled Drop");
  const [dbStamps, setDbStamps] = useState<Stamp[]>([]);
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchDbStamps().then(setDbStamps);
  }, []);

  const allStamps: Stamp[] = [...STAMPS, ...dbStamps];

  const update = <K extends keyof JerseyDesign>(k: K, v: JerseyDesign[K]) =>
    setDesign((d) => ({ ...d, [k]: v }));

  const applyPreset = (p: Partial<JerseyDesign>) => setDesign((d) => ({ ...d, ...p }));

  /** Pick a procedural pattern — clears any selected SVG stamp. */
  const selectPattern = (value: BodyPattern) =>
    setDesign((d) => ({ ...d, bodyPattern: value, stampId: null, stampSvg: null }));

  /** Pick an SVG stamp — clears the procedural pattern. */
  const selectStamp = (s: Stamp) =>
    setDesign((d) => ({ ...d, stampId: s.id, stampSvg: s.svg, bodyPattern: "solid" }));


  const handleLogo = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => update("logoDataUrl", reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCrest = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => update("crestDataUrl", reader.result as string);
    reader.readAsDataURL(file);
  };

  const addSponsor = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const item: SponsorItem = {
        id: crypto.randomUUID(),
        imageDataUrl: reader.result as string,
        position: "belly",
      };
      setDesign((d) => ({ ...d, sponsors: [...(d.sponsors ?? []), item] }));
    };
    reader.readAsDataURL(file);
  };

  const updateSponsor = (id: string, position: SponsorPosition) =>
    setDesign((d) => ({
      ...d,
      sponsors: (d.sponsors ?? []).map((s) => (s.id === id ? { ...s, position } : s)),
    }));

  const removeSponsor = (id: string) =>
    setDesign((d) => ({ ...d, sponsors: (d.sponsors ?? []).filter((s) => s.id !== id) }));



  const exportPNG = async () => {
    const svg = svgWrapRef.current?.querySelector("svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const ratio = img.height / img.width || 1.2;
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = Math.round(1600 * ratio);
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => {
        if (!b) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.download = `${name.replace(/\s+/g, "-").toLowerCase()}-${view}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
      }, "image/png");
      URL.revokeObjectURL(url);
      toast.success("PNG exportado!");
    };
    img.src = url;
  };

  const saveDesign = async () => {
    if (!user) {
      toast.error("Faça login pra salvar designs no seu vault.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("designs").insert({
      user_id: user.id,
      name,
      data: design as unknown as never,
    });
    setSaving(false);
    if (error) toast.error(`Erro ao salvar: ${error.message}`);
    else toast.success("Design salvo no seu vault.");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-px bg-zinc-900">
        {/* Left controls */}
        <aside className="bg-asphalt p-5 lg:p-6 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
          <div className="mb-6">
            <p className="text-[10px] tracking-[0.3em] text-uv uppercase font-bold mb-2">[ Editor / KIT_01 ]</p>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-concrete border-zinc-800 text-2xl font-bold uppercase tracking-tight h-auto py-2"
              style={{ fontFamily: "var(--font-display)" }}
            />
          </div>

          <Section title="Presets" icon={Palette}>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p.design)}
                  className="group border border-zinc-800 hover:border-uv/50 p-2 transition-colors"
                  type="button"
                >
                  <div
                    className="aspect-square mb-2"
                    style={{
                      background: `linear-gradient(135deg, ${p.design.bodyColor ?? "#000"} 50%, ${p.design.collarTrim ?? "#fff"} 50%)`,
                    }}
                  />
                  <div className="text-[10px] text-zinc-400 group-hover:text-uv uppercase tracking-widest text-center truncate">
                    {p.name}
                  </div>
                </button>
              ))}
            </div>
          </Section>

          <div className="space-y-6 mt-6">
            <Section title="Corpo" icon={Shirt}>
              <div className="space-y-4">
                <ColorRow label="Cor do corpo" value={design.bodyColor} onChange={(v) => update("bodyColor", v)} />
                <Field label="Padrão">
                  <Select value={design.bodyPattern} onValueChange={(v) => update("bodyPattern", v as BodyPattern)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PATTERNS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                {design.bodyPattern !== "solid" && (
                  <ColorRow label="Cor do padrão" value={design.bodyPatternColor} onChange={(v) => update("bodyPatternColor", v)} />
                )}
              </div>
            </Section>

            <Section title="Mangas" icon={Palette}>
              <ColorRow label="Cor das mangas" value={design.sleeveColor} onChange={(v) => update("sleeveColor", v)} />
            </Section>

            <Section title="Gola" icon={Palette}>
              <div className="space-y-4">
                <ColorRow label="Base" value={design.collarColor} onChange={(v) => update("collarColor", v)} />
                <ColorRow label="Detalhe" value={design.collarTrim} onChange={(v) => update("collarTrim", v)} />
              </div>
            </Section>

            <Section title="Short" icon={Palette}>
              <div className="space-y-4">
                <ColorRow label="Cor do short" value={design.shortsColor} onChange={(v) => update("shortsColor", v)} />
                <ColorRow label="Detalhe" value={design.shortsTrim} onChange={(v) => update("shortsTrim", v)} />
              </div>
            </Section>

            <Section title="Acabamento" icon={Palette}>
              <div className="space-y-4">
                <ColorRow label="Costuras / contorno" value={design.outlineColor} onChange={(v) => update("outlineColor", v)} />
                <ColorRow label="Nome & número" value={design.accentColor} onChange={(v) => update("accentColor", v)} />
              </div>
            </Section>

            <Section title="Tipografia" icon={Palette}>
              <div className="space-y-4">
                <Field label="Nome (costas)">
                  <Input value={design.playerName} onChange={(e) => update("playerName", e.target.value.toUpperCase().slice(0, 14))} />
                </Field>
                <Field label="Número">
                  <Input value={design.playerNumber} onChange={(e) => update("playerNumber", e.target.value.replace(/\D/g, "").slice(0, 2))} />
                </Field>
                <Field label="Onde imprimir o número">
                  <Select value={design.numberPlacement} onValueChange={(v) => update("numberPlacement", v as NumberPlacement)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {NUMBER_PLACEMENTS.map((n) => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Fonte">
                  <Select value={design.fontFamily} onValueChange={(v) => update("fontFamily", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FONTS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </Section>

            <Section title="Patrocínios" icon={Palette}>
              <div className="space-y-4">
                <Field label="Barriga (peito)">
                  <Input value={design.sponsor} onChange={(e) => update("sponsor", e.target.value.toUpperCase().slice(0, 16))} placeholder="Ex: HYPE_CRAFT" />
                </Field>
                <Field label="Manga">
                  <Input value={design.sponsorSleeve} onChange={(e) => update("sponsorSleeve", e.target.value.toUpperCase().slice(0, 12))} placeholder="Ex: VOLT" />
                </Field>
                <Field label="Costas (parte de baixo)">
                  <Input value={design.sponsorBack} onChange={(e) => update("sponsorBack", e.target.value.toUpperCase().slice(0, 16))} placeholder="Ex: STREET_CO" />
                </Field>
              </div>
            </Section>

            <Section title="Logo (peito esquerdo)" icon={Upload}>
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 border border-dashed border-zinc-800 hover:border-uv/50 px-3 py-2 text-xs uppercase tracking-widest text-zinc-400 hover:text-uv transition-colors">
                  <Upload className="size-3.5" /> Enviar PNG/SVG
                  <input
                    type="file"
                    accept="image/png,image/svg+xml,image/jpeg"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleLogo(e.target.files[0])}
                  />
                </label>
                {design.logoDataUrl && (
                  <Button size="icon" variant="ghost" onClick={() => update("logoDataUrl", null)}>
                    <Trash2 className="size-4 text-zinc-400" />
                  </Button>
                )}
              </div>
            </Section>

            <Section title="Escudo (aplicado automaticamente)" icon={Upload}>
              <p className="text-[10px] text-zinc-500 mb-3 leading-relaxed">
                Ao enviar o escudo ele entra sozinho no peito direito e no short.
              </p>
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 border border-dashed border-zinc-800 hover:border-uv/50 px-3 py-2 text-xs uppercase tracking-widest text-zinc-400 hover:text-uv transition-colors">
                  <Upload className="size-3.5" /> Enviar escudo
                  <input
                    type="file"
                    accept="image/png,image/svg+xml,image/jpeg"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleCrest(e.target.files[0])}
                  />
                </label>
                {design.crestDataUrl && (
                  <Button size="icon" variant="ghost" onClick={() => update("crestDataUrl", null)}>
                    <Trash2 className="size-4 text-zinc-400" />
                  </Button>
                )}
              </div>
            </Section>

            <Section title="Estampas" icon={Layers}>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => update("stampId", null)}
                  className={`border p-2 text-[10px] uppercase tracking-widest aspect-square flex items-center justify-center text-center transition-colors ${design.stampId == null ? "border-uv text-uv" : "border-zinc-800 text-zinc-400 hover:border-uv/50"}`}
                >
                  Nenhuma
                </button>
                {STAMPS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => update("stampId", s.id)}
                    className={`border p-1 aspect-square overflow-hidden transition-colors ${design.stampId === s.id ? "border-uv" : "border-zinc-800 hover:border-uv/50"}`}
                    title={s.name}
                  >
                    <div
                      className="w-full h-full text-uv"
                      dangerouslySetInnerHTML={{ __html: s.svg }}
                    />
                  </button>
                ))}
              </div>
              {STAMPS.length === 0 && (
                <p className="text-[10px] text-zinc-600 mt-2">Nenhuma estampa cadastrada ainda.</p>
              )}
            </Section>

            <Section title="Patrocínios (imagens)" icon={Plus}>
              <p className="text-[10px] text-zinc-500 mb-3 leading-relaxed">
                Envie quantos patrocínios quiser e escolha o lugar de cada um.
              </p>
              <div className="space-y-3">
                {(design.sponsors ?? []).map((s) => (
                  <div key={s.id} className="flex items-center gap-2 border border-zinc-800 p-2">
                    <div className="size-10 shrink-0 bg-concrete border border-zinc-800 overflow-hidden flex items-center justify-center">
                      <img src={s.imageDataUrl} alt="patrocínio" className="max-w-full max-h-full object-contain" />
                    </div>
                    <Select value={s.position} onValueChange={(v) => updateSponsor(s.id, v as SponsorPosition)}>
                      <SelectTrigger className="flex-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SPONSOR_POSITIONS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" onClick={() => removeSponsor(s.id)}>
                      <Trash2 className="size-4 text-zinc-400" />
                    </Button>
                  </div>
                ))}
                <label className="cursor-pointer flex items-center justify-center gap-2 border border-dashed border-zinc-800 hover:border-uv/50 px-3 py-2 text-xs uppercase tracking-widest text-zinc-400 hover:text-uv transition-colors">
                  <Plus className="size-3.5" /> Adicionar patrocínio
                  <input
                    type="file"
                    accept="image/png,image/svg+xml,image/jpeg"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) addSponsor(e.target.files[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </Section>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-2">
            <Button onClick={saveDesign} disabled={saving} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-100">
              <Save className="size-4 mr-2" /> {saving ? "Salvando..." : "Salvar"}
            </Button>
            <Button onClick={exportPNG} className="bg-uv hover:bg-white text-asphalt font-bold uppercase tracking-widest">
              <Download className="size-4 mr-2" /> PNG
            </Button>
          </div>
          <Button
            variant="ghost"
            onClick={() => setDesign(DEFAULT_DESIGN)}
            className="w-full mt-2 text-zinc-500 hover:text-uv text-xs uppercase tracking-widest"
          >
            <RotateCcw className="size-3.5 mr-2" /> Resetar tudo
          </Button>
        </aside>

        {/* Right preview */}
        <section className="bg-concrete relative grid-bg overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-uv/15 blur-[140px] rounded-full pointer-events-none" />

          <div className="absolute top-4 left-4 z-10 flex items-center gap-3 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
            <span className="size-1.5 bg-uv rounded-full animate-pulse" /> Live preview — KIT_01
          </div>
          <div className="absolute top-4 right-4 z-10 flex gap-1 bg-asphalt/80 border border-zinc-800 backdrop-blur-md p-1">
            {(["front", "back", "full"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold transition-colors ${view === v ? "bg-uv text-asphalt" : "text-zinc-400 hover:text-zinc-100"}`}
              >
                <Eye className="size-3 inline mr-1" />
                {v === "front" ? "Frente" : v === "back" ? "Costas" : "Kit"}
              </button>
            ))}
          </div>

          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-asphalt/80 border border-zinc-800 backdrop-blur-md p-2">
            <ZoomOut className="size-3.5 text-zinc-500" />
            <Slider value={[zoom]} min={0.5} max={2} step={0.1} onValueChange={(v) => setZoom(v[0])} className="w-32" />
            <ZoomIn className="size-3.5 text-zinc-500" />
            <span className="text-[10px] text-zinc-500 tabular-nums w-8">{Math.round(zoom * 100)}%</span>
          </div>

          <div className="h-[70vh] lg:h-[calc(100vh-4rem)] flex items-center justify-center p-6">
            <div
              ref={svgWrapRef}
              className="w-full h-full flex items-center justify-center"
              style={{ transform: `scale(${zoom})`, transition: "transform 0.2s" }}
            >
              <JerseyCanvas
                design={design}
                view={view}
                className="w-full h-full max-h-full flex items-center justify-center drop-shadow-[0_30px_50px_rgba(208,0,255,0.25)]"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="size-3.5 text-uv" />
        <h3 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold">{label}</Label>
      {children}
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 h-8 text-xs uppercase tabular-nums"
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-8 cursor-pointer bg-transparent border border-zinc-800"
        />
      </div>
    </div>
  );
}
