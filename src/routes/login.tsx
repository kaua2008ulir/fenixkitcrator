import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { ArrowRight, Mail, Lock, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — HYPE_CRAFT" },
      { name: "description", content: "Acesse seu vault de uniformes personalizados." },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      throw redirect({ to: "/designs" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/designs` },
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Conta criada — você já está logado.");
      navigate({ to: "/designs" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Bem-vindo de volta.");
      navigate({ to: "/designs" });
    }
  };

  const google = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/designs`,
    });
    if (result.error) {
      setLoading(false);
      toast.error("Erro no login com Google.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/designs" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 grid lg:grid-cols-2">
        {/* Left visual */}
        <div className="hidden lg:flex relative grid-bg bg-concrete items-center justify-center overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] bg-uv/20 blur-[140px] rounded-full" />
          <div className="relative text-center max-w-md px-8">
            <p className="text-[11px] tracking-[0.3em] text-uv uppercase font-bold mb-4">[ Access Vault ]</p>
            <h1 className="text-display text-7xl text-zinc-50 mb-6">Entre<br /><span className="text-zinc-500">no squad</span></h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Salve seus designs, retome rascunhos e compartilhe com seu time. Gratuito enquanto durar a beta.
            </p>
          </div>
        </div>

        {/* Right form */}
        <div className="flex items-center justify-center px-6 py-16">
          <form onSubmit={submit} className="w-full max-w-sm space-y-5">
            <div>
              <p className="text-[10px] tracking-[0.3em] text-uv uppercase font-bold mb-2">[ Auth Console ]</p>
              <h2 className="text-display text-4xl text-zinc-50">{mode === "signin" ? "Login" : "Criar conta"}</h2>
            </div>

            <Button
              type="button"
              onClick={google}
              disabled={loading}
              variant="outline"
              className="w-full bg-asphalt border-zinc-800 hover:border-uv/40 hover:bg-concrete text-zinc-100 h-11 uppercase text-xs tracking-widest font-bold"
            >
              <GoogleIcon /> Continuar com Google
            </Button>

            <div className="relative flex items-center gap-3 text-[10px] uppercase tracking-widest text-zinc-600">
              <div className="flex-1 h-px bg-zinc-900" /> ou <div className="flex-1 h-px bg-zinc-900" />
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold mb-2 block">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-600" />
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 bg-concrete border-zinc-800 h-11" placeholder="seuemail@dominio.com" />
                </div>
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold mb-2 block">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-600" />
                  <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 bg-concrete border-zinc-800 h-11" placeholder="••••••••" />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 bg-uv hover:bg-white text-asphalt font-bold uppercase tracking-widest text-base" style={{ fontFamily: "var(--font-display)" }}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : (
                <>
                  {mode === "signin" ? "Entrar" : "Criar conta"} <ArrowRight className="size-4 ml-2" />
                </>
              )}
            </Button>

            <button
              type="button"
              onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
              className="w-full text-xs text-zinc-500 hover:text-uv uppercase tracking-widest"
            >
              {mode === "signin" ? "Sem conta? Criar" : "Já tem conta? Entrar"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 mr-2" aria-hidden>
      <path fill="#fff" d="M21.35 11.1H12v2.9h5.35c-.23 1.4-1.7 4.1-5.35 4.1-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.84 3.62 14.7 2.7 12 2.7 6.94 2.7 2.85 6.79 2.85 11.85S6.94 21 12 21c6.92 0 9.15-4.85 9.15-7.32 0-.49-.05-.86-.13-1.58Z" />
    </svg>
  );
}
