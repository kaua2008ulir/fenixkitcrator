import type { JerseyDesign } from "@/lib/jersey-types";

interface Props {
  design: JerseyDesign;
  view: "front" | "back";
  className?: string;
  /** When true, render fonts inline so the SVG can be exported as PNG */
  forExport?: boolean;
}

export function JerseyCanvas({ design, view, className }: Props) {
  const { primary, secondary, accent, collar, sleeve, pattern, playerName, playerNumber, fontFamily, sponsor, logoDataUrl } = design;
  const isBack = view === "back";

  // Pattern fills
  const patternDef = (() => {
    if (pattern === "stripes") {
      return (
        <pattern id="bodyPat" width="40" height="200" patternUnits="userSpaceOnUse">
          <rect width="40" height="200" fill={primary} />
          <rect x="20" width="20" height="200" fill={secondary} opacity="0.85" />
        </pattern>
      );
    }
    if (pattern === "halves") {
      return (
        <linearGradient id="bodyPat" x1="0" x2="1" y1="0" y2="0">
          <stop offset="50%" stopColor={primary} />
          <stop offset="50%" stopColor={secondary} />
        </linearGradient>
      );
    }
    if (pattern === "diagonal") {
      return (
        <pattern id="bodyPat" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="60" height="60" fill={primary} />
          <rect width="30" height="60" fill={secondary} opacity="0.85" />
        </pattern>
      );
    }
    return (
      <linearGradient id="bodyPat" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={primary} />
        <stop offset="100%" stopColor={primary} />
      </linearGradient>
    );
  })();

  // Sleeve length
  const sleeveBottom = sleeve === "long" ? 380 : 220;

  // Collar shapes (front only)
  const renderCollar = () => {
    if (isBack) {
      // simple back neckline
      return <path d={`M 220 60 Q 250 80 280 60`} fill="none" stroke={accent} strokeWidth="6" />;
    }
    if (collar === "v") {
      return <path d="M 215 55 L 250 130 L 285 55 Z" fill={primary} stroke={accent} strokeWidth="3" />;
    }
    if (collar === "polo") {
      return (
        <>
          <path d="M 215 55 L 235 140 L 250 100 L 265 140 L 285 55 Z" fill={accent} />
          <line x1="250" y1="100" x2="250" y2="160" stroke={primary} strokeWidth="4" />
        </>
      );
    }
    // crew
    return <path d="M 210 55 Q 250 95 290 55" fill="none" stroke={accent} strokeWidth="10" />;
  };

  return (
    <svg
      viewBox="0 0 500 600"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {patternDef}
        <radialGradient id="shading" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.4" />
        </radialGradient>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Body shape */}
      <g>
        {/* Sleeves */}
        <path
          d={`M 110 130 L 60 ${sleeveBottom} L 130 ${sleeveBottom + 20} L 170 200 Z`}
          fill={secondary}
          stroke={accent}
          strokeWidth="2"
        />
        <path
          d={`M 390 130 L 440 ${sleeveBottom} L 370 ${sleeveBottom + 20} L 330 200 Z`}
          fill={secondary}
          stroke={accent}
          strokeWidth="2"
        />

        {/* Torso */}
        <path
          d="M 170 90 Q 250 130 330 90 L 380 200 L 380 540 Q 250 570 120 540 L 120 200 Z"
          fill="url(#bodyPat)"
          stroke={accent}
          strokeWidth="2"
        />

        {/* Subtle shading overlay */}
        <path
          d="M 170 90 Q 250 130 330 90 L 380 200 L 380 540 Q 250 570 120 540 L 120 200 Z"
          fill="url(#shading)"
        />

        {/* Side accent stripes */}
        <path d="M 122 200 L 132 540" stroke={accent} strokeWidth="3" opacity="0.7" />
        <path d="M 378 200 L 368 540" stroke={accent} strokeWidth="3" opacity="0.7" />

        {/* Collar */}
        {renderCollar()}

        {/* Sleeve cuffs */}
        <rect x="58" y={sleeveBottom - 6} width="74" height="12" fill={accent} opacity="0.8" />
        <rect x="368" y={sleeveBottom - 6} width="74" height="12" fill={accent} opacity="0.8" />

        {/* Hem */}
        <rect x="120" y="535" width="260" height="10" fill={accent} opacity="0.7" />
      </g>

      {/* Front: sponsor + logo. Back: name + number */}
      {!isBack ? (
        <g>
          {sponsor && (
            <text
              x="250"
              y="320"
              fill={accent}
              textAnchor="middle"
              fontFamily={fontFamily}
              fontWeight="700"
              fontSize="34"
              style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
            >
              {sponsor}
            </text>
          )}
          {logoDataUrl && (
            <image href={logoDataUrl} x="170" y="200" width="60" height="60" preserveAspectRatio="xMidYMid meet" />
          )}
        </g>
      ) : (
        <g>
          {playerName && (
            <text
              x="250"
              y="220"
              fill={accent}
              textAnchor="middle"
              fontFamily={fontFamily}
              fontWeight="700"
              fontSize="38"
              style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
            >
              {playerName}
            </text>
          )}
          {playerNumber && (
            <text
              x="250"
              y="430"
              fill={accent}
              textAnchor="middle"
              fontFamily={fontFamily}
              fontWeight="700"
              fontSize="180"
              style={{ letterSpacing: "-0.04em" }}
              filter="url(#glow)"
            >
              {playerNumber}
            </text>
          )}
        </g>
      )}
    </svg>
  );
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
