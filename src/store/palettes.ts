export interface ColorDef {
  hex: string;
  oklch: string;
  role: 'dominant' | 'supporting' | 'accent' | 'neutral';
}

export interface PaletteDef {
  name: string;
  mood: string;
  harmony: string;
  colors: ColorDef[];
  meshStops: string[]; // 4 hex colors
}

export const palettes: PaletteDef[] = [
  {
    name: "Cyber Neon",
    mood: "acid pastel",
    harmony: "split-complementary",
    colors: [
      { hex: "#ff007f", oklch: "oklch(65% 0.25 330)", role: "dominant" },
      { hex: "#00f0ff", oklch: "oklch(80% 0.15 200)", role: "supporting" },
      { hex: "#39ff14", oklch: "oklch(85% 0.20 140)", role: "supporting" },
      { hex: "#ffea00", oklch: "oklch(90% 0.18 100)", role: "accent" },
      { hex: "#ffffff", oklch: "oklch(100% 0 0)", role: "neutral" }
    ],
    meshStops: ["#ff007f", "#bc00ff", "#0088ff", "#00f0ff"]
  },
  {
    name: "Abyssal Glow",
    mood: "deep ocean",
    harmony: "analogous",
    colors: [
      { hex: "#0055ff", oklch: "oklch(55% 0.20 260)", role: "dominant" },
      { hex: "#00aaff", oklch: "oklch(70% 0.15 240)", role: "supporting" },
      { hex: "#00ffcc", oklch: "oklch(85% 0.15 180)", role: "supporting" },
      { hex: "#aaffff", oklch: "oklch(95% 0.05 210)", role: "accent" },
      { hex: "#e6f2ff", oklch: "oklch(96% 0.02 240)", role: "neutral" }
    ],
    meshStops: ["#002288", "#0055ff", "#00aaff", "#00ffcc"]
  },
  {
    name: "Terracotta Echo",
    mood: "brutalist warm",
    harmony: "monochrome-with-accent",
    colors: [
      { hex: "#e65c00", oklch: "oklch(65% 0.18 45)", role: "dominant" },
      { hex: "#ff8c42", oklch: "oklch(75% 0.14 55)", role: "supporting" },
      { hex: "#ffb380", oklch: "oklch(85% 0.08 65)", role: "supporting" },
      { hex: "#ff1a1a", oklch: "oklch(60% 0.22 30)", role: "accent" },
      { hex: "#ffe6d9", oklch: "oklch(95% 0.03 50)", role: "neutral" }
    ],
    meshStops: ["#cc4400", "#e65c00", "#ff8c42", "#ffb380"]
  },
  {
    name: "Synthwave Dusk",
    mood: "retro sunset",
    harmony: "analogous",
    colors: [
      { hex: "#9900ff", oklch: "oklch(55% 0.25 300)", role: "dominant" },
      { hex: "#ff00cc", oklch: "oklch(65% 0.25 340)", role: "supporting" },
      { hex: "#ff6600", oklch: "oklch(70% 0.18 40)", role: "supporting" },
      { hex: "#ffcc00", oklch: "oklch(85% 0.16 85)", role: "accent" },
      { hex: "#ffebf0", oklch: "oklch(95% 0.02 340)", role: "neutral" }
    ],
    meshStops: ["#6600cc", "#9900ff", "#ff00cc", "#ff6600"]
  },
  {
    name: "Zen Garden",
    mood: "ethereal",
    harmony: "monochrome-with-accent",
    colors: [
      { hex: "#00e676", oklch: "oklch(80% 0.18 150)", role: "dominant" },
      { hex: "#69f0ae", oklch: "oklch(90% 0.12 155)", role: "supporting" },
      { hex: "#b9f6ca", oklch: "oklch(95% 0.06 160)", role: "supporting" },
      { hex: "#00b0ff", oklch: "oklch(75% 0.14 230)", role: "accent" },
      { hex: "#f1f8e9", oklch: "oklch(98% 0.01 130)", role: "neutral" }
    ],
    meshStops: ["#00c853", "#00e676", "#69f0ae", "#b9f6ca"]
  },
  {
    name: "Solar Flare",
    mood: "high energy",
    harmony: "triadic",
    colors: [
      { hex: "#ffea00", oklch: "oklch(90% 0.18 100)", role: "dominant" },
      { hex: "#ff007f", oklch: "oklch(65% 0.25 330)", role: "supporting" },
      { hex: "#00f0ff", oklch: "oklch(80% 0.15 200)", role: "supporting" },
      { hex: "#ff5500", oklch: "oklch(70% 0.20 50)", role: "accent" },
      { hex: "#fffde6", oklch: "oklch(98% 0.02 100)", role: "neutral" }
    ],
    meshStops: ["#ff5500", "#ffaa00", "#ffea00", "#ffff66"]
  },
  {
    name: "Royal Velvet",
    mood: "luxurious",
    harmony: "split-complementary",
    colors: [
      { hex: "#5500ff", oklch: "oklch(50% 0.25 280)", role: "dominant" },
      { hex: "#ffaa00", oklch: "oklch(80% 0.16 75)", role: "supporting" },
      { hex: "#00ff88", oklch: "oklch(85% 0.18 160)", role: "supporting" },
      { hex: "#ff00ff", oklch: "oklch(65% 0.25 315)", role: "accent" },
      { hex: "#f0e6ff", oklch: "oklch(96% 0.02 280)", role: "neutral" }
    ],
    meshStops: ["#3300cc", "#5500ff", "#9933ff", "#cc66ff"]
  },
  {
    name: "Radioactive",
    mood: "grungy acid",
    harmony: "analogous",
    colors: [
      { hex: "#ccff00", oklch: "oklch(90% 0.20 120)", role: "dominant" },
      { hex: "#88ff00", oklch: "oklch(85% 0.22 135)", role: "supporting" },
      { hex: "#44ff00", oklch: "oklch(80% 0.24 150)", role: "supporting" },
      { hex: "#ffff00", oklch: "oklch(95% 0.18 105)", role: "accent" },
      { hex: "#f6ffe6", oklch: "oklch(98% 0.02 120)", role: "neutral" }
    ],
    meshStops: ["#88cc00", "#aadd00", "#ccff00", "#eeff66"]
  }
];
