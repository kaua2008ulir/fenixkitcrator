import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useIsAdmin } from "@/lib/use-admin";
import { fetchDbStamps, type Stamp } from "@/lib/stamps";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Plus, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/estampas")({
  head: () => ({
    meta: [{ title: "Admin — Estampas — HYPE_CRAFT" }],
  }),
  component: AdminEstampasPage,
});

function AdminEstampasPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [name, setName] = useState("");
  const [svg, setSvg] = useState("");
  const [saving, setSaving] = useState(false);

  const reload = () => fetchDbStamps().then(setStamps);
  useEffect(() => {
    if (isAdmin) reload();
  }, [isAdmin]);

  const handleFile = (file: File) => {
    if (!/svg/.test(file.type) && !file.name.endsWith(".svg")) {
      toast.error("Envie um arquivo .svg");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSvg(reader.result as string);
      if (!name) setName(file.name.replace(/\.svg$/i, "").replace(/[-_]+/g, " "));
    };
    reader.readAsText(file);
  };

  const addStamp = async () => {
    if (!name.trim() || !svg.trim()) {
      toast.error("Dê um nome e envie o SVG.");
      return;
    }
    if (!/<svg[\s>]/i.test(svg)) {
      toast.error("O conteúdo não parece um SVG válido.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("stamps").insert({
      name: name.trim(),
      svg,
      created_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) {
      toast.error(`Erro ao salvar: ${error.message}`);
      return;
    }
    toast.success("Estampa adicionada! Já aparece pra todos no editor.");
    setName("");
    setSvg("");
    reload();
  };

  const removeStamp = async (id: string) => {
    const { error } = await supabase.from("stamps").delete().eq("id", id);
    if (error) toast.error(`Erro ao remover: ${error.message}`);
    else {
      toast.success("Estampa removida.");
      reload();
    }
  };

  const gate = authLoading || roleLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-[900px] w-full mx-auto px-6 py-12">
        <p className="text-[10px] tracking-[0.3em] text-uv uppercase font-bold mb-2">[ Admin / Estampas ]</p>
        <h1 className="text-display text-4xl md:text-6xl text-zinc-50 mb-8">Biblioteca de estampas</h1>

        {gate ? (
          <p className="text-zinc-500 text-sm">Verificando acesso...</p>
        ) : !user ? (
          <Denied
            message="Você precisa entrar com uma conta de administrador."
            cta={<Link to="/login" className="text-uv hover:underline">Fazer login</Link>}
          />
        ) : !isAdmin ? (
          <Denied message="Esta área é restrita a administradores." />
        ) : (
          <div className="space-y-12">
            {/* Add new */}
            <section className="border border-zinc-800 p-6 bg-asphalt">
              <h2 className="text-sm uppercase tracking-[0.25em] text-zinc-300 font-bold mb-5">Adicionar estampa</h2>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold">Nome</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Chevron, Camuflado..." />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold">Arquivo SVG</Label>
                  <label className="cursor-pointer flex items-center justify-center gap-2 border border-dashed border-zinc-800 hover:border-uv/50 px-3 py-4 text-xs uppercase tracking-widest text-zinc-400 hover:text-uv transition-colors">
                    <Upload className="size-4" /> {svg ? "Trocar SVG" : "Enviar arquivo .svg"}
                    <input
                      type="file"
                      accept="image/svg+xml,.svg"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFile(e.target.files[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                {svg && (
                  <div className="flex items-center gap-4">
                    <div className="size-20 border border-zinc-800 bg-concrete p-2 text-uv [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: svg }} />
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Preview</span>
                  </div>
                )}
                <Button onClick={addStamp} disabled={saving} className="bg-uv hover:bg-white text-asphalt font-bold uppercase tracking-widest">
                  <Plus className="size-4 mr-2" /> {saving ? "Salvando..." : "Adicionar"}
                </Button>
              </div>
            </section>

            {/* List */}
            <section>
              <h2 className="text-sm uppercase tracking-[0.25em] text-zinc-300 font-bold mb-5">
                Estampas cadastradas ({stamps.length})
              </h2>
              {stamps.length === 0 ? (
                <p className="text-zinc-600 text-sm">Nenhuma estampa cadastrada ainda.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {stamps.map((s) => (
                    <div key={s.id} className="border border-zinc-800 bg-asphalt p-3">
                      <div className="aspect-square border border-zinc-900 mb-2 text-uv overflow-hidden [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: s.svg }} />
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-400 truncate">{s.name}</span>
                        <button onClick={() => removeStamp(s.id)} className="text-zinc-500 hover:text-red-400 shrink-0">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Denied({ message, cta }: { message: string; cta?: React.ReactNode }) {
  return (
    <div className="border border-zinc-800 bg-asphalt p-8 flex items-start gap-4">
      <ShieldAlert className="size-6 text-uv shrink-0" />
      <div>
        <p className="text-zinc-300">{message}</p>
        {cta && <div className="mt-3 text-sm">{cta}</div>}
      </div>
    </div>
  );
}
