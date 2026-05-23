import { useMemo } from "react";
import modSvgRaw from "@/assets/mod1.svg?raw";
import type { JerseyDesign } from "@/lib/jersey-types";

interface Props {
  design: Partial<JerseyDesign>;
  view: "front" | "back" | "full";
  className?: string;
}

// Approximate viewBox crops inside the source artwork (viewBox 0 0 21000 29700)
// The kit (jersey + shorts) lives in the top portion only.
const VIEW_BOXES: Record<Props["view"], string> = {
  front: "1300 6800 8400 11200",
  back: "10800 6800 8400 11200",
  full: "1000 6800 18200 11200",
};

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Renders the MOD_1 jersey + shorts artwork with user color/text/logo overrides.
 * The original SVG fills are remapped via embedded <style> overrides, the
 * viewBox is cropped to front/back/full, and an overlay layer is appended
 * for sponsor, player name, number and uploaded logo.
 */
export function JerseyCanvas({ design, view, className }: Props) {
  const {
    bodyColor = "#ffffff",
    trimColor = "#0a0a0a",
    accentColor = "#ffffff",
    playerName = "",
    playerNumber = "",
    fontFamily = "Teko",
    sponsor = "",
    logoDataUrl = null,
  } = design;

  const svgString = useMemo(() => {
    // Strip xml prolog + doctype + outer <svg> wrapper, keep inner content.
    let inner = modSvgRaw
      .replace(/<\?xml[^?]*\?>/g, "")
      .replace(/<!DOCTYPE[\s\S]*?>/g, "")
      .replace(/<svg[^>]*>/, "")
      .replace(/<\/svg>\s*$/, "");

    // Remap the embedded class fills so the artwork follows our palette.
    inner = inner
      .replace(/\.fil0\s*\{fill:#FEFEFE\}/g, `.fil0{fill:${bodyColor}}`)
      .replace(/\.fil1\s*\{fill:#201E1E\}/g, `.fil1{fill:${trimColor}}`)
      .replace(/\.fil9\s*\{fill:#FEFEFE;fill-opacity:0\.850980\}/g, `.fil9{fill:${bodyColor};fill-opacity:0.85}`)
      .replace(/\.str0\s*\{stroke:#201E1E/g, `.str0{stroke:${trimColor}`)
      .replace(/\.str2\s*\{stroke:#201E1E/g, `.str2{stroke:${trimColor}`)
      .replace(/\.str4\s*\{stroke:#373435/g, `.str4{stroke:${trimColor}`);

    const viewBox = VIEW_BOXES[view];

    // Overlay coordinates are in the source artwork coordinate space.
    const FRONT_CX = 5000;
    const BACK_CX = 15000;

    const overlay: string[] = [];

    if (view !== "back") {
      if (sponsor) {
        overlay.push(
          `<text x="${FRONT_CX}" y="12200" fill="${accentColor}" text-anchor="middle" font-family="${fontFamily}, Impact, sans-serif" font-weight="800" font-size="720" style="text-transform:uppercase;letter-spacing:40px">${escapeXml(sponsor)}</text>`,
        );
      }
      if (logoDataUrl) {
        overlay.push(
          `<image href="${logoDataUrl}" x="3300" y="9400" width="1700" height="1700" preserveAspectRatio="xMidYMid meet"/>`,
        );
      }
    }

    if (view !== "front") {
      if (playerName) {
        overlay.push(
          `<text x="${BACK_CX}" y="9300" fill="${accentColor}" text-anchor="middle" font-family="${fontFamily}, Impact, sans-serif" font-weight="800" font-size="780" style="text-transform:uppercase;letter-spacing:60px">${escapeXml(playerName)}</text>`,
        );
      }
      if (playerNumber) {
        overlay.push(
          `<text x="${BACK_CX}" y="14200" fill="${accentColor}" text-anchor="middle" font-family="${fontFamily}, Impact, sans-serif" font-weight="800" font-size="3800" style="letter-spacing:-100px">${escapeXml(playerNumber)}</text>`,
        );
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block">${inner}${overlay.join("")}</svg>`;
  }, [bodyColor, trimColor, accentColor, playerName, playerNumber, fontFamily, sponsor, logoDataUrl, view]);

  return <div className={className} dangerouslySetInnerHTML={{ __html: svgString }} />;
}

interface ShortsProps {
  color: string;
  stripe: string;
  number: string;
  font: string;
  className?: string;
}

export function ShortsCanvas({ color, stripe, number, font, className }: ShortsProps) {
  return (
    <svg viewBox="0 0 500 400" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="shorts-shade" cx="50%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.4" />
        </radialGradient>
      </defs>
      <path
        d="M 100 40 L 400 40 L 420 80 L 380 380 L 280 380 L 250 200 L 220 380 L 120 380 L 80 80 Z"
        fill={color}
        stroke={stripe}
        strokeWidth="2"
      />
      <path
        d="M 100 40 L 400 40 L 420 80 L 380 380 L 280 380 L 250 200 L 220 380 L 120 380 L 80 80 Z"
        fill="url(#shorts-shade)"
      />
      <rect x="100" y="40" width="300" height="14" fill={stripe} />
      <path d="M 105 70 L 130 380" stroke={stripe} strokeWidth="6" />
      <path d="M 395 70 L 370 380" stroke={stripe} strokeWidth="6" />
      {number && (
        <text x="160" y="180" fill={stripe} fontFamily={font} fontWeight="700" fontSize="80" textAnchor="middle">
          {number}
        </text>
      )}
    </svg>
  );
}

interface SocksProps {
  color: string;
  detail: string;
  className?: string;
}

export function SocksCanvas({ color, detail, className }: SocksProps) {
  return (
    <svg viewBox="0 0 240 400" className={className} xmlns="http://www.w3.org/2000/svg">
      <g>
        <path d="M 40 20 L 140 20 L 130 280 L 170 380 L 60 380 L 80 280 Z" fill={color} stroke={detail} strokeWidth="2" />
        <rect x="40" y="20" width="100" height="20" fill={detail} />
        <rect x="40" y="80" width="100" height="6" fill={detail} />
        <rect x="40" y="100" width="100" height="6" fill={detail} />
        <path d="M 60 380 L 170 380 L 175 340 L 70 340 Z" fill={detail} />
      </g>
      <g transform="translate(100,0)">
        <path d="M 40 20 L 140 20 L 130 280 L 170 380 L 60 380 L 80 280 Z" fill={color} stroke={detail} strokeWidth="2" opacity="0.6" />
      </g>
    </svg>
  );
}
