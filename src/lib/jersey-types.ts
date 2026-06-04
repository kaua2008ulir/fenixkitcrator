export type BodyPattern = "solid" | "stripes-v" | "stripes-h" | "sash" | "halves" | "checks";

/** Where the number is printed. */
export type NumberPlacement = "back" | "back-front" | "back-front-shorts";

/** Available sponsor placements on the kit. */
export type SponsorPosition = "belly" | "sleeve" | "back-top" | "back-bottom" | "shorts-back";

export interface SponsorItem {
  id: string;
  /** Uploaded sponsor image (data URL) */
  imageDataUrl: string;
  /** Where this sponsor is printed */
  position: SponsorPosition;
  /** Size multiplier relative to the slot's base box (1 = default) */
  scale?: number;
  /** Horizontal offset from the slot center, in SVG units (drag) */
  dx?: number;
  /** Vertical offset from the slot center, in SVG units (drag) */
  dy?: number;
}

export const SPONSOR_POSITIONS: Array<{ value: SponsorPosition; label: string }> = [
  { value: "belly", label: "Barriga (frente)" },
  { value: "sleeve", label: "Manga" },
  { value: "back-top", label: "Costas (em cima)" },
  { value: "back-bottom", label: "Costas (em baixo)" },
  { value: "shorts-back", label: "Short (costas)" },
];

export const NUMBER_PLACEMENTS: Array<{ value: NumberPlacement; label: string }> = [
  { value: "back", label: "Só nas costas" },
  { value: "back-front", label: "Costas + frente" },
  { value: "back-front-shorts", label: "Costas + frente + short" },
];

export interface JerseyDesign {
  /** Jersey body fill */
  bodyColor: string;
  /** Secondary color used by body patterns (stripes / sash / halves) */
  bodyPatternColor: string;
  /** Pattern applied to the jersey body */
  bodyPattern: BodyPattern;
  /** Sleeves fill */
  sleeveColor: string;
  /** Collar base color */
  collarColor: string;
  /** Collar accent / trim color */
  collarTrim: string;
  /** Shorts fill */
  shortsColor: string;
  /** Shorts trim / stripe color */
  shortsTrim: string;
  /** Outline / seam color shared across pieces */
  outlineColor: string;
  /** Color used for name, number and sponsor text */
  accentColor: string;
  /** Player name printed on the back */
  playerName: string;
  /** Player number printed on front + back */
  playerNumber: string;
  /** Where the number gets printed */
  numberPlacement: NumberPlacement;
  /** Font used for name + number + sponsor */
  fontFamily: string;
  /** Main sponsor text printed on the belly (front) */
  sponsor: string;
  /** Sponsor text printed on the sleeve */
  sponsorSleeve: string;
  /** Sponsor text printed on the lower back */
  sponsorBack: string;
  /** Image-based sponsors with their own placement */
  sponsors: SponsorItem[];
  /** Selected SVG stamp / print applied to the body (id from the stamp registry) */
  stampId: string | null;
  /** Uploaded team logo (data URL) shown on one side of the chest */
  logoDataUrl: string | null;
  /** Uploaded crest / escudo (data URL) — auto-placed on chest + shorts */
  crestDataUrl: string | null;
}

export const DEFAULT_DESIGN: JerseyDesign = {
  bodyColor: "#D000FF",
  bodyPatternColor: "#0a0a0a",
  bodyPattern: "solid",
  sleeveColor: "#0a0a0a",
  collarColor: "#0a0a0a",
  collarTrim: "#D000FF",
  shortsColor: "#0a0a0a",
  shortsTrim: "#D000FF",
  outlineColor: "#0a0a0a",
  accentColor: "#ffffff",
  playerName: "VITRINE",
  playerNumber: "10",
  numberPlacement: "back",
  fontFamily: "Teko",
  sponsor: "HYPE_CRAFT",
  sponsorSleeve: "",
  sponsorBack: "",
  sponsors: [],
  stampId: null,
  logoDataUrl: null,
  crestDataUrl: null,
};

export const PRESETS: Array<{ name: string; design: Partial<JerseyDesign> }> = [
  {
    name: "Ultraviolet",
    design: { bodyColor: "#D000FF", bodyPattern: "solid", sleeveColor: "#0a0a0a", collarColor: "#0a0a0a", collarTrim: "#D000FF", shortsColor: "#0a0a0a", shortsTrim: "#D000FF", outlineColor: "#0a0a0a", accentColor: "#ffffff" },
  },
  {
    name: "Volt Strike",
    design: { bodyColor: "#CCFF00", bodyPattern: "stripes-v", bodyPatternColor: "#050505", sleeveColor: "#050505", collarColor: "#050505", collarTrim: "#CCFF00", shortsColor: "#050505", shortsTrim: "#CCFF00", outlineColor: "#050505", accentColor: "#050505" },
  },
  {
    name: "Blood Moon",
    design: { bodyColor: "#FF0033", bodyPattern: "sash", bodyPatternColor: "#FFD700", sleeveColor: "#1a0505", collarColor: "#1a0505", collarTrim: "#FFD700", shortsColor: "#1a0505", shortsTrim: "#FF0033", outlineColor: "#1a0505", accentColor: "#FFD700" },
  },
  {
    name: "Cyber Ice",
    design: { bodyColor: "#00E5FF", bodyPattern: "halves", bodyPatternColor: "#03111c", sleeveColor: "#03111c", collarColor: "#03111c", collarTrim: "#00E5FF", shortsColor: "#03111c", shortsTrim: "#00E5FF", outlineColor: "#03111c", accentColor: "#ffffff" },
  },
  {
    name: "Royal Gold",
    design: { bodyColor: "#0a0a3d", bodyPattern: "stripes-v", bodyPatternColor: "#FFD700", sleeveColor: "#FFD700", collarColor: "#FFD700", collarTrim: "#0a0a3d", shortsColor: "#0a0a3d", shortsTrim: "#FFD700", outlineColor: "#05051f", accentColor: "#FFD700" },
  },
  {
    name: "Forest Ops",
    design: { bodyColor: "#0a1a0a", bodyPattern: "checks", bodyPatternColor: "#102910", sleeveColor: "#39FF14", collarColor: "#0a1a0a", collarTrim: "#39FF14", shortsColor: "#0a1a0a", shortsTrim: "#39FF14", outlineColor: "#050d05", accentColor: "#39FF14" },
  },
  {
    name: "Pitch Black",
    design: { bodyColor: "#0a0a0a", bodyPattern: "solid", sleeveColor: "#ffffff", collarColor: "#ffffff", collarTrim: "#0a0a0a", shortsColor: "#0a0a0a", shortsTrim: "#ffffff", outlineColor: "#ffffff", accentColor: "#ffffff" },
  },
  {
    name: "Solar Flare",
    design: { bodyColor: "#FF6B00", bodyPattern: "stripes-h", bodyPatternColor: "#0a0a0a", sleeveColor: "#0a0a0a", collarColor: "#0a0a0a", collarTrim: "#FF6B00", shortsColor: "#0a0a0a", shortsTrim: "#FF6B00", outlineColor: "#0a0a0a", accentColor: "#ffffff" },
  },
  {
    name: "Tidal Wave",
    design: { bodyColor: "#003D7A", bodyPattern: "sash", bodyPatternColor: "#00E5FF", sleeveColor: "#00E5FF", collarColor: "#003D7A", collarTrim: "#00E5FF", shortsColor: "#003D7A", shortsTrim: "#00E5FF", outlineColor: "#021f3d", accentColor: "#ffffff" },
  },
];
