import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteShell";
import { JerseyCanvas } from "@/components/jersey/JerseyCanvas";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { type JerseyDesign } from "@/lib/jersey-types";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface DesignRow {
  id: string;
  name: string;
  data: JerseyDesign;
  created_at: string;
}

export const Route = createFileRoute("/designs")({
  head: () => ({
    meta: [
      { title: "Meus Designs — HYPE_CRAFT" },
      { name: "description", content: "Seu vault de uniformes personalizados salvos." },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login" });
    }
  },
  component: DesignsPage,
});

function DesignsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<DesignRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("designs")
      .select("id,name,data,created_at")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows((data ?? []) as unknown as DesignRow[]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("designs").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Design removido.");
    setRows((r) => r.filter((x) => x.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-[1440px] mx-auto px-6 py-12 w-full">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="text-[11px] tracking-[0.3em] text-uv uppercase font-bold mb-3">[ Vault ]</p>
            <h1 className="text-display text-5xl md:text-7xl text-zinc-50">Meus Designs</h1>
            <p className="text-zinc-500 mt-2">{rows.length} drop{rows.length === 1 ? "" : "s"} salvo{rows.length === 1 ? "" : "s"}</p>
          </div>
          <Link
            to="/editor"
            className="inline-flex items-center gap-2 bg-uv text-asphalt px-6 py-3 font-bold uppercase tracking-widest hover:bg-white transition-colors"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <Plus className="size-4" /> Novo Design
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-6 animate-spin text-uv" />
          </div>
        ) : rows.length === 0 ? (
          <div className="border border-dashed border-zinc-800 py-24 text-center">
            <p className="text-zinc-400 mb-6">Seu vault tá vazio. Crie seu primeiro drop.</p>
            <Link to="/editor" className="text-uv hover:text-white text-xs uppercase tracking-widest font-bold inline-flex items-center gap-2">
              Abrir editor →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rows.map((d) => (
              <div key={d.id} className="group bg-concrete border border-zinc-900 hover:border-uv/40 transition-colors overflow-hidden">
                <div className="aspect-[4/5] bg-asphalt grid-bg flex items-center justify-center p-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-uv/10 blur-[80px]" />
                  <JerseyCanvas design={(d.data ?? {}) as Partial<JerseyDesign>} view="front" className="relative w-full h-full flex items-center justify-center" />
                </div>
                <div className="p-4 border-t border-zinc-900">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-zinc-100 font-bold uppercase tracking-tight truncate" style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem" }}>
                        {d.name}
                      </h3>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-600 mt-1">
                        {formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => remove(d.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="size-4 text-zinc-500 hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
