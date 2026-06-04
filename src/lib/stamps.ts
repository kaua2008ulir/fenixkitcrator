/**
 * Stamp / print registry.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  Estampas vêm de DOIS lugares:
 *  1. Embutidas no código: arquivos `.svg` em `src/assets/stamps/` (abaixo).
 *  2. Cadastradas pelo administrador na página /admin/estampas — ficam salvas
 *     no banco e aparecem pra todos os clientes, de forma permanente.
 * ─────────────────────────────────────────────────────────────────────────
 */
import { supabase } from "@/integrations/supabase/client";

const modules = import.meta.glob("../assets/stamps/*.svg", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export interface Stamp {
  id: string;
  name: string;
  svg: string;
}

export const STAMPS: Stamp[] = Object.entries(modules)
  .map(([path, svg]) => {
    const id = path.split("/").pop()!.replace(/\.svg$/i, "");
    const name = id.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return { id, name, svg };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export const getStamp = (id: string | null): Stamp | null =>
  id ? STAMPS.find((s) => s.id === id) ?? null : null;

/** Fetch the admin-managed stamps stored in the database. */
export async function fetchDbStamps(): Promise<Stamp[]> {
  const { data, error } = await supabase
    .from("stamps")
    .select("id, name, svg")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Stamp[];
}
