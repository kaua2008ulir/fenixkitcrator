/**
 * Stamp / print registry.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  COMO ADICIONAR UMA NOVA ESTAMPA (somente o dono do projeto):
 *  1. Coloque um arquivo `.svg` dentro da pasta `src/assets/stamps/`.
 *  2. O nome do arquivo vira o nome da estampa (ex.: `chevron-up.svg` → "Chevron Up").
 *  3. Pronto — ela aparece automaticamente no editor, de forma permanente.
 *
 *  Nenhum cliente consegue adicionar estampas: elas só entram editando o
 *  código (acesso que só você tem).
 * ─────────────────────────────────────────────────────────────────────────
 */
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
