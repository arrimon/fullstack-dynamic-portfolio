export const THEMES = [
  {
    id: "midnight",
    name: "Midnight Neon",
    description: "Violet & magenta on deep purple-black.",
    swatches: ["#a855f7", "#e0339f", "#0a0514"],
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    description: "Cyan & blue on deep navy.",
    swatches: ["#0ea5e9", "#22d3ee", "#020b1a"],
  },
  {
    id: "emerald",
    name: "Emerald",
    description: "Green accents on deep forest.",
    swatches: ["#10b981", "#2dd4a8", "#04120d"],
  },
  {
    id: "rose",
    name: "Rose Sunset",
    description: "Rose & amber on warm dark.",
    swatches: ["#f43f5e", "#fb923c", "#16060f"],
  },
  {
    id: "light",
    name: "Clean Light",
    description: "Soft neutral light design.",
    swatches: ["#6d28d9", "#be185d", "#f8f7fc"],
  },
];

export const DEFAULT_THEME = "midnight";

export const THEME_IDS = THEMES.map((t) => t.id);

export const THEME_STORAGE_KEY = "pf_theme";

export function isThemeId(value) {
  return THEME_IDS.includes(value);
}

export function getThemeMeta(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}