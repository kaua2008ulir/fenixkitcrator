import { useMemo } from "react";
import frenteRaw from "@/assets/kit/frente.svg?raw";
import costaRaw from "@/assets/kit/costa.svg?raw";
import mangaRaw from "@/assets/kit/manga.svg?raw";
import golaRaw from "@/assets/kit/gola.svg?raw";
import shortRaw from "@/assets/kit/short.svg?raw";
import type { BodyPattern, JerseyDesign } from "@/lib/jersey-types";

interface Props {
  design: Partial<JerseyDesign>;
  view: "front" | "back" | "full";
  className?: string;
}

/**
 * All five source SVGs share the same coordinate space (viewBox 0 0 21000 29700).
 * Front pieces live on the LEFT half, back pieces on the RIGHT half. We crop the
 * viewBox to isolate front / back, or show the whole kit (jersey + shorts).
 */
const VIEW_BOXES: Record<Props["view"], string> = {
  front: "200 2300 9400 10900",
  back: "10600 2300 9400 10900",
  full: "200 2300 19600 19200",
};

const STROKE_W = 28;

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Strip xml prolog / doctype / outer <svg> and the embedded <style> block. */
function innerOf(raw: string) {
  return raw
    .replace(/<\?xml[^?]*\?>/g, "")
    .replace(/<!DOCTYPE[\s\S]*?>/g, "")
    .replace(/<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(/<style[\s\S]*?<\/style>/g, "");
}

/** Re-color a simple piece (body / sleeve / short) that only uses .fil0 + .str0. */
function paintSimple(raw: string, fill: string, stroke: string) {
  return innerOf(raw).replace(
    /class="fil0 str0"/g,
    `fill="${fill}" stroke="${stroke}" stroke-width="${STROKE_W}" stroke-miterlimit="22.9256"`,
  );
}

/** Re-color the collar which uses fil0/fil1/fil2 + str0/str1. */
function paintCollar(raw: string, base: string, trim: string, outline: string) {
  return innerOf(raw)
    .replace(/class="fil1 str0"/g, `fill="${trim}" stroke="${trim}" stroke-width="${STROKE_W}"`)
    .replace(/class="fil2 str1"/g, `fill="none" stroke="${outline}" stroke-width="${STROKE_W}"`)
    .replace(/class="fil0 str1"/g, `fill="${base}" stroke="${outline}" stroke-width="${STROKE_W}"`)
    .replace(/class="fil0 str0"/g, `fill="${base}" stroke="${trim}" stroke-width="${STROKE_W}"`)
    .replace(/class="fil0"/g, `fill="${base}"`);
}

function patternDefs(pattern: BodyPattern, color: string): { defs: string; fill: string | null } {
  if (pattern === "solid") return { defs: "", fill: null };
  const common = `patternUnits="userSpaceOnUse"`;
  switch (pattern) {
    case "stripes-v":
      return {
        defs: `<pattern id="kit-pat" ${common} width="900" height="900" patternTransform="rotate(0)"><rect width="450" height="900" fill="${color}"/></pattern>`,
        fill: "url(#kit-pat)",
      };
    case "stripes-h":
      return {
        defs: `<pattern id="kit-pat" ${common} width="900" height="900"><rect width="900" height="450" fill="${color}"/></pattern>`,
        fill: "url(#kit-pat)",
      };
    case "sash":
      return {
        defs: `<pattern id="kit-pat" ${common} width="2400" height="2400" patternTransform="rotate(45)"><rect width="900" height="2400" fill="${color}"/></pattern>`,
        fill: "url(#kit-pat)",
      };
    case "checks":
      return {
        defs: `<pattern id="kit-pat" ${common} width="1200" height="1200"><rect width="600" height="600" fill="${color}"/><rect x="600" y="600" width="600" height="600" fill="${color}"/></pattern>`,
        fill: "url(#kit-pat)",
      };
    case "halves":
      return {
        // left half tinted via a wide gradient with a hard stop at 50%
        defs: `<linearGradient id="kit-pat" x1="0" y1="0" x2="1" y2="0"><stop offset="0.5" stop-color="${color}"/><stop offset="0.5" stop-color="transparent"/></linearGradient>`,
        fill: "url(#kit-pat)",
      };
    default:
      return { defs: "", fill: null };
  }
}

export function JerseyCanvas({ design, view, className }: Props) {
  const {
    bodyColor = "#ffffff",
    bodyPatternColor = "#0a0a0a",
    bodyPattern = "solid",
    sleeveColor = "#0a0a0a",
    collarColor = "#0a0a0a",
    collarTrim = "#ffffff",
    shortsColor = "#0a0a0a",
    shortsTrim = "#ffffff",
    outlineColor = "#0a0a0a",
    accentColor = "#ffffff",
    playerName = "",
    playerNumber = "",
    fontFamily = "Teko",
    sponsor = "",
    logoDataUrl = null,
  } = design;

  const svgString = useMemo(() => {
    const pat = patternDefs(bodyPattern, bodyPatternColor);

    // Which body shapes to draw: front-only, back-only, or both (full kit).
    const bodySources = view === "full" ? [frenteRaw, costaRaw] : view === "back" ? [costaRaw] : [frenteRaw];

    // Body: solid color underlay, then a pattern overlay clipped to the body shape.
    const bodyBase = bodySources.map((src) => paintSimple(src, bodyColor, outlineColor)).join("");
    const bodyPatternLayer =
      pat.fill !== null
        ? bodySources
            .map((src) => paintSimple(src, pat.fill as string, "none").replace(/stroke-width="\d+"/g, 'stroke-width="0"'))
            .join("")
        : "";

    const sleeves = paintSimple(mangaRaw, sleeveColor, outlineColor);
    const collar = paintCollar(golaRaw, collarColor, collarTrim, outlineColor);
    const shorts = view === "full" ? paintSimple(shortRaw, shortsColor, shortsTrim) : "";

    // Overlay coordinates (source artwork space).
    const FRONT_CX = 4400;
    const BACK_CX = 13900;

    const overlay: string[] = [];
    const fontStack = `${fontFamily}, Impact, sans-serif`;

    if (view !== "back") {
      if (logoDataUrl) {
        overlay.push(`<image href="${logoDataUrl}" x="2900" y="4400" width="1700" height="1700" preserveAspectRatio="xMidYMid meet"/>`);
      }
      if (sponsor) {
        overlay.push(
          `<text x="${FRONT_CX}" y="7600" fill="${accentColor}" text-anchor="middle" font-family="${fontStack}" font-weight="800" font-size="620" style="text-transform:uppercase;letter-spacing:30px">${escapeXml(sponsor)}</text>`,
        );
      }
      if (playerNumber) {
        overlay.push(
          `<text x="${FRONT_CX + 1300}" y="6400" fill="${accentColor}" text-anchor="middle" font-family="${fontStack}" font-weight="800" font-size="1100">${escapeXml(playerNumber)}</text>`,
        );
      }
    }

    if (view !== "front") {
      if (playerName) {
        overlay.push(
          `<text x="${BACK_CX}" y="4700" fill="${accentColor}" text-anchor="middle" font-family="${fontStack}" font-weight="800" font-size="780" style="text-transform:uppercase;letter-spacing:50px">${escapeXml(playerName)}</text>`,
        );
      }
      if (playerNumber) {
        overlay.push(
          `<text x="${BACK_CX}" y="9300" fill="${accentColor}" text-anchor="middle" font-family="${fontStack}" font-weight="800" font-size="3600" style="letter-spacing:-80px">${escapeXml(playerNumber)}</text>`,
        );
      }
    }

    const viewBox = VIEW_BOXES[view];

    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block"><defs>${pat.defs}</defs>${sleeves}${bodyBase}${bodyPatternLayer}${shorts}${collar}${overlay.join("")}</svg>`;
  }, [
    bodyColor,
    bodyPatternColor,
    bodyPattern,
    sleeveColor,
    collarColor,
    collarTrim,
    shortsColor,
    shortsTrim,
    outlineColor,
    accentColor,
    playerName,
    playerNumber,
    fontFamily,
    sponsor,
    logoDataUrl,
    view,
  ]);

  return <div className={className} dangerouslySetInnerHTML={{ __html: svgString }} />;
}
