import { useMemo } from "react";
import frenteRaw from "@/assets/kit/frente.svg?raw";
import costaRaw from "@/assets/kit/costa.svg?raw";
import mangaRaw from "@/assets/kit/manga.svg?raw";
import golaRaw from "@/assets/kit/gola.svg?raw";
import shortRaw from "@/assets/kit/short.svg?raw";
import type { BodyPattern, JerseyDesign, SponsorPosition } from "@/lib/jersey-types";
import { getStamp } from "@/lib/stamps";
import {
  VIEW_BOXES,
  STROKE_W,
  FRONT_BODY,
  BACK_BODY,
  FRONT_SHORT,
  BACK_SHORT,
  SLEEVE_CX,
  BACK_SLEEVE_CX,
  SPONSOR_BOX,
  type KitView,
} from "@/lib/jersey-geometry";

interface Props {
  design: Partial<JerseyDesign>;
  view: KitView;
  className?: string;
}

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

/** Extract the main body path `d` so we can clip patterns / stamps to the shape. */
function bodyPathD(raw: string) {
  const m = raw.match(/\sd="([^"]+)"/);
  return m ? m[1] : "";
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
        defs: `<linearGradient id="kit-pat" x1="0" y1="0" x2="1" y2="0"><stop offset="0.5" stop-color="${color}"/><stop offset="0.5" stop-color="transparent"/></linearGradient>`,
        fill: "url(#kit-pat)",
      };
    default:
      return { defs: "", fill: null };
  }
}

/** Centered <image> helper. */
function imgEl(href: string, cx: number, cy: number, w: number, h: number) {
  return `<image href="${href}" x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`;
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
    numberPlacement = "back",
    fontFamily = "Teko",
    sponsor = "",
    sponsorSleeve = "",
    sponsorBack = "",
    sponsors = [],
    stampId = null,
    stampSvg = null,
    logoDataUrl = null,
    crestDataUrl = null,
  } = design;

  const svgString = useMemo(() => {
    const pat = patternDefs(bodyPattern, bodyPatternColor);
    const stampMarkup = stampSvg ?? getStamp(stampId)?.svg ?? null;

    // Which body shapes to draw: front-only, back-only, or both (full kit).
    const bodySources = view === "full" ? [frenteRaw, costaRaw] : view === "back" ? [costaRaw] : [frenteRaw];

    const bodyBase = bodySources.map((src) => paintSimple(src, bodyColor, outlineColor)).join("");
    const bodyClipPaths = bodySources.map((src) => `<path d="${bodyPathD(src)}"/>`).join("");

    const bodyPatternLayer =
      pat.fill !== null
        ? `<g clip-path="url(#body-clip)">${bodySources
            .map((src) => paintSimple(src, pat.fill as string, "none").replace(/stroke-width="\d+"/g, 'stroke-width="0"'))
            .join("")}</g>`
        : "";

    // Stamp / print overlay clipped to the body shape.
    let stampLayer = "";
    if (stampMarkup) {
      const href = `data:image/svg+xml;utf8,${encodeURIComponent(stampMarkup)}`;
      const boxes = view === "full" ? [FRONT_BODY, BACK_BODY] : view === "back" ? [BACK_BODY] : [FRONT_BODY];
      stampLayer = `<g clip-path="url(#body-clip)">${boxes
        .map((b) => `<image href="${href}" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" preserveAspectRatio="xMidYMid slice"/>`)
        .join("")}</g>`;
    }

    const sleeves = paintSimple(mangaRaw, sleeveColor, outlineColor);
    const collar = paintCollar(golaRaw, collarColor, collarTrim, outlineColor);
    const shorts = view === "full" ? paintSimple(shortRaw, shortsColor, shortsTrim) : "";

    const overlay: string[] = [];
    const fontStack = `${fontFamily}, Impact, sans-serif`;

    const showFrontNumber = numberPlacement === "back-front" || numberPlacement === "back-front-shorts";
    const showShortsNumber = numberPlacement === "back-front-shorts";

    // ── Image sponsors ─────────────────────────────────────────────
    const renderSponsors = (group: "front" | "back" | "full") =>
      sponsors
        .filter((s) => s.imageDataUrl && SPONSOR_BOX[s.position].group === group)
        .forEach((s) => {
          const b = SPONSOR_BOX[s.position];
          const scale = s.scale ?? 1;
          const dx = s.dx ?? 0;
          const dy = s.dy ?? 0;
          overlay.push(imgEl(s.imageDataUrl, b.cx + dx, b.cy + dy, b.w * scale, b.h * scale));
          // sleeve sponsor mirrors onto the back sleeve when both are visible
          if (s.position === "sleeve" && view !== "front") {
            overlay.push(imgEl(s.imageDataUrl, BACK_SLEEVE_CX + dx, b.cy + dy, b.w * scale, b.h * scale));
          }
        });


    if (view !== "back") {
      // Team logo on the left of the chest
      if (logoDataUrl) {
        overlay.push(imgEl(logoDataUrl, 3450, 4600, 1500, 1500));
      }
      // Escudo / crest auto-placed on the right of the chest
      if (crestDataUrl) {
        overlay.push(imgEl(crestDataUrl, 6550, 4600, 1500, 1500));
      }
      // Front number — centered on the chest
      if (playerNumber && showFrontNumber) {
        overlay.push(
          `<text x="${FRONT_BODY.cx}" y="6700" fill="${accentColor}" text-anchor="middle" font-family="${fontStack}" font-weight="800" font-size="1100">${escapeXml(playerNumber)}</text>`,
        );
      }
      // Main sponsor text on the belly — centered
      if (sponsor) {
        overlay.push(
          `<text x="${FRONT_BODY.cx}" y="9700" fill="${accentColor}" text-anchor="middle" font-family="${fontStack}" font-weight="800" font-size="640" style="text-transform:uppercase;letter-spacing:30px">${escapeXml(sponsor)}</text>`,
        );
      }
      // Sleeve sponsor text — centered on the front sleeve
      if (sponsorSleeve) {
        overlay.push(
          `<text x="${SLEEVE_CX}" y="5400" fill="${accentColor}" text-anchor="middle" font-family="${fontStack}" font-weight="800" font-size="320" style="text-transform:uppercase;letter-spacing:8px">${escapeXml(sponsorSleeve)}</text>`,
        );
      }
      renderSponsors("front");
    }

    if (view !== "front") {
      // Player name — centered, just under the collar
      if (playerName) {
        overlay.push(
          `<text x="${BACK_BODY.cx}" y="4900" fill="${accentColor}" text-anchor="middle" font-family="${fontStack}" font-weight="800" font-size="780" style="text-transform:uppercase;letter-spacing:50px">${escapeXml(playerName)}</text>`,
        );
      }
      // Back number — big, centered
      if (playerNumber) {
        overlay.push(
          `<text x="${BACK_BODY.cx}" y="8700" fill="${accentColor}" text-anchor="middle" font-family="${fontStack}" font-weight="800" font-size="3600" style="letter-spacing:-80px">${escapeXml(playerNumber)}</text>`,
        );
      }
      // Sponsor text on the lower back — centered
      if (sponsorBack) {
        overlay.push(
          `<text x="${BACK_BODY.cx}" y="11400" fill="${accentColor}" text-anchor="middle" font-family="${fontStack}" font-weight="800" font-size="560" style="text-transform:uppercase;letter-spacing:24px">${escapeXml(sponsorBack)}</text>`,
        );
      }
      // Sleeve sponsor text — centered on the back sleeve
      if (sponsorSleeve) {
        overlay.push(
          `<text x="${BACK_SLEEVE_CX}" y="5400" fill="${accentColor}" text-anchor="middle" font-family="${fontStack}" font-weight="800" font-size="320" style="text-transform:uppercase;letter-spacing:8px">${escapeXml(sponsorSleeve)}</text>`,
        );
      }
      renderSponsors("back");
    }

    if (view === "full") {
      // Auto crest on the front shorts (left leg)
      if (crestDataUrl) {
        overlay.push(imgEl(crestDataUrl, FRONT_SHORT.cx - 1300, 16400, 1200, 1200));
      }
      // Shorts number (left leg) when enabled
      if (playerNumber && showShortsNumber) {
        overlay.push(
          `<text x="${FRONT_SHORT.cx - 1300}" y="15200" fill="${accentColor}" text-anchor="middle" font-family="${fontStack}" font-weight="800" font-size="1100">${escapeXml(playerNumber)}</text>`,
        );
      }
      renderSponsors("full");
    }

    const viewBox = VIEW_BOXES[view];
    const [vx, vy, vw, vh] = viewBox.split(" ").map(Number);

    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block"><defs>${pat.defs}<clipPath id="view-clip"><rect x="${vx}" y="${vy}" width="${vw}" height="${vh}"/></clipPath><clipPath id="body-clip">${bodyClipPaths}</clipPath></defs><g clip-path="url(#view-clip)">${sleeves}${bodyBase}${bodyPatternLayer}${stampLayer}${shorts}${collar}${overlay.join("")}</g></svg>`;
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
    numberPlacement,
    fontFamily,
    sponsor,
    sponsorSleeve,
    sponsorBack,
    sponsors,
    stampId,
    logoDataUrl,
    crestDataUrl,
    view,
  ]);

  return <div className={className} dangerouslySetInnerHTML={{ __html: svgString }} />;
}
