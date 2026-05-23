export interface JerseyDesign {
  /** Main body color (jersey + shorts body, class fil0) */
  bodyColor: string;
  /** Trim / outlines / cuffs color (class fil1, str0, str2, str4) */
  trimColor: string;
  /** Accent color used for name, number, sponsor and logo backdrop */
  accentColor: string;
  /** Player name printed on the back */
  playerName: string;
  /** Player number printed on the back */
  playerNumber: string;
  /** Font used for name + number + sponsor */
  fontFamily: string;
  /** Sponsor text printed on the chest */
  sponsor: string;
  /** Uploaded logo (data URL) shown on the chest */
  logoDataUrl: string | null;
}

export const DEFAULT_DESIGN: JerseyDesign = {
  bodyColor: "#D000FF",
  trimColor: "#0a0a0a",
  accentColor: "#ffffff",
  playerName: "VITRINE",
  playerNumber: "10",
  fontFamily: "Teko",
  sponsor: "HYPE_CRAFT",
  logoDataUrl: null,
};

export const PRESETS: Array<{ name: string; design: Partial<JerseyDesign> }> = [
  { name: "Ultraviolet", design: { bodyColor: "#D000FF", trimColor: "#0a0a0a", accentColor: "#ffffff" } },
  { name: "Volt Strike", design: { bodyColor: "#CCFF00", trimColor: "#050505", accentColor: "#050505" } },
  { name: "Blood Moon", design: { bodyColor: "#FF0033", trimColor: "#1a0505", accentColor: "#FFD700" } },
  { name: "Cyber Ice", design: { bodyColor: "#00E5FF", trimColor: "#03111c", accentColor: "#ffffff" } },
  { name: "Royal Gold", design: { bodyColor: "#0a0a3d", trimColor: "#FFD700", accentColor: "#FFD700" } },
  { name: "Forest Ops", design: { bodyColor: "#0a1a0a", trimColor: "#39FF14", accentColor: "#39FF14" } },
  { name: "Pitch Black", design: { bodyColor: "#0a0a0a", trimColor: "#ffffff", accentColor: "#ffffff" } },
  { name: "Solar Flare", design: { bodyColor: "#FF6B00", trimColor: "#0a0a0a", accentColor: "#ffffff" } },
  { name: "Tidal Wave", design: { bodyColor: "#003D7A", trimColor: "#00E5FF", accentColor: "#ffffff" } },
];
