export type CollarType = "v" | "crew" | "polo";
export type SleeveType = "short" | "long";
export type PatternType = "solid" | "stripes" | "halves" | "diagonal";

export interface JerseyDesign {
  // Shirt
  primary: string;
  secondary: string;
  accent: string;
  collar: CollarType;
  sleeve: SleeveType;
  pattern: PatternType;
  playerName: string;
  playerNumber: string;
  fontFamily: string;
  sponsor: string;
  logoDataUrl: string | null;
  // Shorts
  shortsColor: string;
  shortsStripe: string;
  shortsNumber: string;
  // Socks
  socksColor: string;
  socksDetail: string;
}

export const DEFAULT_DESIGN: JerseyDesign = {
  primary: "#0a0a0a",
  secondary: "#D000FF",
  accent: "#ffffff",
  collar: "v",
  sleeve: "short",
  pattern: "stripes",
  playerName: "VITRINE",
  playerNumber: "10",
  fontFamily: "Teko",
  sponsor: "HYPE_CRAFT",
  logoDataUrl: null,
  shortsColor: "#0a0a0a",
  shortsStripe: "#D000FF",
  shortsNumber: "10",
  socksColor: "#0a0a0a",
  socksDetail: "#D000FF",
};

export const PRESETS: Array<{ name: string; design: Partial<JerseyDesign> }> = [
  {
    name: "Ultraviolet",
    design: { primary: "#0a0a0a", secondary: "#D000FF", accent: "#ffffff", shortsColor: "#0a0a0a", shortsStripe: "#D000FF", socksColor: "#0a0a0a", socksDetail: "#D000FF" },
  },
  {
    name: "Volt Strike",
    design: { primary: "#050505", secondary: "#CCFF00", accent: "#ffffff", shortsColor: "#050505", shortsStripe: "#CCFF00", socksColor: "#050505", socksDetail: "#CCFF00" },
  },
  {
    name: "Blood Moon",
    design: { primary: "#1a0505", secondary: "#FF0033", accent: "#FFD700", shortsColor: "#1a0505", shortsStripe: "#FF0033", socksColor: "#1a0505", socksDetail: "#FF0033" },
  },
  {
    name: "Cyber Ice",
    design: { primary: "#03111c", secondary: "#00E5FF", accent: "#ffffff", shortsColor: "#03111c", shortsStripe: "#00E5FF", socksColor: "#03111c", socksDetail: "#00E5FF" },
  },
  {
    name: "Royal Gold",
    design: { primary: "#0a0a3d", secondary: "#FFD700", accent: "#ffffff", shortsColor: "#0a0a3d", shortsStripe: "#FFD700", socksColor: "#0a0a3d", socksDetail: "#FFD700" },
  },
  {
    name: "Forest Ops",
    design: { primary: "#0a1a0a", secondary: "#39FF14", accent: "#ffffff", shortsColor: "#0a1a0a", shortsStripe: "#39FF14", socksColor: "#0a1a0a", socksDetail: "#39FF14" },
  },
];
