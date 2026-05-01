import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteShell";
import { JerseyCanvas, ShortsCanvas, SocksCanvas } from "@/components/jersey/JerseyCanvas";
import { DEFAULT_DESIGN, PRESETS, type JerseyDesign, type CollarType, type SleeveType, type PatternType } from "@/lib/jersey-types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Download, Save, Upload, Palette, Shirt, RotateCcw, Eye, ZoomIn, ZoomOut, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/editor")({
  head: () => ({
    meta: [
      { title: "Editor — HYPE_CRAFT" },
      { name: "description", content: "Personalize sua camisa, shorts e meião em tempo real. Exporte em PNG ou salve no seu vault." },
    ],
  }),
  component: EditorPage,
});

const FONTS = ["Teko", "Manrope", "Impact", "Arial Black", "Georgia"];

function EditorPage() {
  const [design, setDesign] = useState<JerseyDesign>(DEFAULT_DESIGN);
  const [view, setView] = useState<"front" | "back">("front");
  const [zoom, setZoom] = useState(1);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("Untitled Drop");
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const update = <K extends keyof JerseyDesign>(k: K, v: JerseyDesign[K]) =>
    setDesign((d) => ({ ...d, [k]: v }));

  const applyPreset = (p: Partial<JerseyDesign>) => setDesign((d) => ({ ...d, ...p }));

  const handleLogo = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => update("logoDataUrl", reader.result as string);
    reader.readAsDataURL(file);
  };

  const exportPNG = async () => {
    const svg = svgWrapRef.current?.querySelector("svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1500;
      canvas.height = 1800;
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
    if (error) {
      toast.error(`Erro ao salvar: ${error.message}`);
    } else {
      toast.success("Design salvo no seu vault.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-px bg-zinc-900">
        {/* Left controls */}
        <aside className="bg-asphalt p-5 lg:p-6 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
          <div className="mb-6">
            <p className="text-[10px] tracking-[0.3em] text-uv uppercase font-bold mb-2">[ Editor ]</p>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-concrete border-zinc-800 text-2xl font-bold uppercase tracking-tight h-auto py-2"
              style={{ fontFamily: "var(--font-display)" }}
            />
          </div>

          {/* Presets */}
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
                      background: `linear-gradient(135deg, ${p.design.primary} 50%, ${p.design.secondary} 50%)`,
                    }}
                  />
                  <div className="text-[10px] text-zinc-400 group-hover:text-uv uppercase tracking-widest text-center truncate">
                    {p.name}
                  </div>
                </button>
              ))}
            </div>
          </Section>

          <Tabs defaultValue="shirt" className="mt-6">
            <TabsList className="grid grid-cols-3 bg-concrete">
              <TabsTrigger value="shirt">Camisa</TabsTrigger>
              <TabsTrigger value="shorts">Shorts</TabsTrigger>
              <TabsTrigger value="socks">Meião</TabsTrigger>
            </TabsList>

            <TabsContent value="shirt" className="space-y-5 pt-5">
              <ColorRow label="Cor principal" value={design.primary} onChange={(v) => update("primary", v)} />
              <ColorRow label="Cor secundária" value={design.secondary} onChange={(v) => update("secondary", v)} />
              <ColorRow label="Detalhes" value={design.accent} onChange={(v) => update("accent", v)} />

              <Field label="Padrão">
                <Select value={design.pattern} onValueChange={(v) => update("pattern", v as PatternType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Liso</SelectItem>
                    <SelectItem value="stripes">Listras</SelectItem>
                    <SelectItem value="halves">Metades</SelectItem>
                    <SelectItem value="diagonal">Diagonal</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Gola">
                <Select value={design.collar} onValueChange={(v) => update("collar", v as CollarType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v">V-Neck</SelectItem>
                    <SelectItem value="crew">Crew</SelectItem>
                    <SelectItem value="polo">Polo</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Mangas">
                <Select value={design.sleeve} onValueChange={(v) => update("sleeve", v as SleeveType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Curtas</SelectItem>
                    <SelectItem value="long">Longas</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Nome (costas)">
                <Input value={design.playerName} onChange={(e) => update("playerName", e.target.value.toUpperCase().slice(0, 14))} />
              </Field>

              <Field label="Número">
                <Input value={design.playerNumber} onChange={(e) => update("playerNumber", e.target.value.replace(/\D/g, "").slice(0, 2))} />
              </Field>

              <Field label="Fonte do número">
                <Select value={design.fontFamily} onValueChange={(v) => update("fontFamily", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FONTS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Patrocinador (peito)">
                <Input value={design.sponsor} onChange={(e) => update("sponsor", e.target.value.toUpperCase().slice(0, 16))} />
              </Field>

              <Field label="Logo (upload)">
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
              </Field>
            </TabsContent>

            <TabsContent value="shorts" className="space-y-5 pt-5">
              <ColorRow label="Cor" value={design.shortsColor} onChange={(v) => update("shortsColor", v)} />
              <ColorRow label="Faixas" value={design.shortsStripe} onChange={(v) => update("shortsStripe", v)} />
              <Field label="Número">
                <Input value={design.shortsNumber} onChange={(e) => update("shortsNumber", e.target.value.replace(/\D/g, "").slice(0, 2))} />
              </Field>
            </TabsContent>

            <TabsContent value="socks" className="space-y-5 pt-5">
              <ColorRow label="Cor" value={design.socksColor} onChange={(v) => update("socksColor", v)} />
              <ColorRow label="Detalhes" value={design.socksDetail} onChange={(v) => update("socksDetail", v)} />
            </TabsContent>
          </Tabs>

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

          {/* viewport chrome */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-3 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
            <span className="size-1.5 bg-uv rounded-full animate-pulse" /> Live preview
          </div>
          <div className="absolute top-4 right-4 z-10 flex gap-1 bg-asphalt/80 border border-zinc-800 backdrop-blur-md p-1">
            <button
              onClick={() => setView("front")}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold transition-colors ${view === "front" ? "bg-uv text-asphalt" : "text-zinc-400 hover:text-zinc-100"}`}
            >
              <Eye className="size-3 inline mr-1" /> Frente
            </button>
            <button
              onClick={() => setView("back")}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold transition-colors ${view === "back" ? "bg-uv text-asphalt" : "text-zinc-400 hover:text-zinc-100"}`}
            >
              <Eye className="size-3 inline mr-1" /> Costas
            </button>
          </div>

          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-asphalt/80 border border-zinc-800 backdrop-blur-md p-2">
            <ZoomOut className="size-3.5 text-zinc-500" />
            <Slider
              value={[zoom]}
              min={0.5}
              max={2}
              step={0.1}
              onValueChange={(v) => setZoom(v[0])}
              className="w-32"
            />
            <ZoomIn className="size-3.5 text-zinc-500" />
            <span className="text-[10px] text-zinc-500 tabular-nums w-8">{Math.round(zoom * 100)}%</span>
          </div>

          <div className="h-[60vh] lg:h-[calc(100vh-4rem)] flex items-center justify-center p-6">
            <div ref={svgWrapRef} className="w-full max-w-xl flex items-center justify-center" style={{ transform: `scale(${zoom})`, transition: "transform 0.2s" }}>
              <JerseyCanvas design={design} view={view} className="w-full h-auto drop-shadow-[0_30px_50px_rgba(208,0,255,0.25)]" />
            </div>
          </div>

          <div className="border-t border-zinc-900 bg-asphalt/80 backdrop-blur grid grid-cols-2 gap-px">
            <div className="bg-asphalt p-4 flex items-center justify-center">
              <ShortsCanvas
                color={design.shortsColor}
                stripe={design.shortsStripe}
                number={design.shortsNumber}
                font={design.fontFamily}
                className="h-32 w-auto"
              />
            </div>
            <div className="bg-asphalt p-4 flex items-center justify-center">
              <SocksCanvas color={design.socksColor} detail={design.socksDetail} className="h-32 w-auto" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="mb-2">
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

// Hide the unused `useEffect` warning if any
void useEffect;
