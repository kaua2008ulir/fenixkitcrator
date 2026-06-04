import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useIsAdmin } from "@/lib/use-admin";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className={`text-xs font-bold tracking-[0.2em] uppercase transition-colors ${
        path === to ? "text-uv" : "text-zinc-400 hover:text-zinc-100"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-asphalt/70 border-b border-zinc-900/80">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="size-2 bg-uv shadow-[0_0_10px_var(--uv)]" />
          <span className="text-zinc-100 text-sm font-bold tracking-[0.25em] uppercase">
            HYPE_CRAFT
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLink("/", "Home")}
          {navLink("/editor", "Editor")}
          {navLink("/galeria", "Galeria")}
          {user && navLink("/designs", "Meus Designs")}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/designs"
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-widest text-zinc-300 hover:text-uv border border-zinc-900 hover:border-uv/40 transition-colors"
              >
                <UserIcon className="size-3.5" />
                <span className="max-w-[100px] truncate">{user.email?.split("@")[0]}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut} className="text-zinc-400 hover:text-uv">
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-xs font-bold uppercase tracking-[0.2em] border border-uv/40 text-uv px-4 py-2 hover:bg-uv hover:text-asphalt transition-colors"
            >
              Access Vault
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-900 mt-24">
      <div className="max-w-[1440px] mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="size-2 bg-uv shadow-[0_0_10px_var(--uv)]" />
            <span className="text-zinc-100 text-sm font-bold tracking-[0.25em] uppercase">HYPE_CRAFT</span>
          </div>
          <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
            Garment architecture para a próxima geração de squads.
          </p>
        </div>
        <div>
          <h4 className="text-[10px] tracking-[0.25em] uppercase text-zinc-500 mb-4">Produto</h4>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li><Link to="/editor" className="hover:text-uv">Editor</Link></li>
            <li><Link to="/galeria" className="hover:text-uv">Galeria</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] tracking-[0.25em] uppercase text-zinc-500 mb-4">Conta</h4>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li><Link to="/login" className="hover:text-uv">Login</Link></li>
            <li><Link to="/designs" className="hover:text-uv">Meus Designs</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] tracking-[0.25em] uppercase text-zinc-500 mb-4">Status</h4>
          <p className="text-xs text-zinc-500">Render Engine v2.0.4</p>
          <p className="text-xs text-uv mt-2 flex items-center gap-2">
            <span className="size-1.5 bg-uv rounded-full animate-pulse" /> All systems online
          </p>
        </div>
      </div>
      <div className="border-t border-zinc-900 px-6 py-4 text-center text-[10px] text-zinc-600 tracking-widest uppercase">
        © {new Date().getFullYear()} HYPE_CRAFT — Garment Architecture
      </div>
    </footer>
  );
}
