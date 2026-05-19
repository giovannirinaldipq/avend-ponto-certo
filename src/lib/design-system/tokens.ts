// Design System Tokens - Avend Ponto Certo Enterprise
// Centralized design tokens for consistent styling across the application

export const colors = {
  // Brand Colors
  primary: {
    DEFAULT: "#00e5c8",
    dark: "#00c4ab",
    light: "#33ebd3",
    50: "rgba(0, 229, 200, 0.05)",
    100: "rgba(0, 229, 200, 0.1)",
    200: "rgba(0, 229, 200, 0.2)",
  },
  secondary: {
    DEFAULT: "#4040bf",
    dark: "#3333a6",
    light: "#5c5ccc",
    50: "rgba(64, 64, 191, 0.05)",
    100: "rgba(64, 64, 191, 0.1)",
    200: "rgba(64, 64, 191, 0.2)",
  },
  accent: {
    DEFAULT: "#8b2fc9",
    dark: "#7526ab",
    light: "#a24fd6",
    50: "rgba(139, 47, 201, 0.05)",
    100: "rgba(139, 47, 201, 0.1)",
    200: "rgba(139, 47, 201, 0.2)",
  },
  navy: {
    DEFAULT: "#1a1145",
    light: "#2d1f6e",
    dark: "#0f0a2e",
  },

  // Semantic Colors
  success: {
    DEFAULT: "#10b981",
    light: "#34d399",
    bg: "rgba(16, 185, 129, 0.1)",
  },
  warning: {
    DEFAULT: "#f59e0b",
    light: "#fbbf24",
    bg: "rgba(245, 158, 11, 0.1)",
  },
  danger: {
    DEFAULT: "#ef4444",
    light: "#f87171",
    bg: "rgba(239, 68, 68, 0.1)",
  },

  // Neutral Colors
  surface: "#ffffff",
  background: "#f8f9fc",
  muted: "#545b7a",
  border: "#e8eaf0",

  // Chart Colors
  chart: {
    primary: "#00e5c8",
    secondary: "#4040bf",
    accent: "#8b2fc9",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    gray: "#94a3b8",
  },
} as const;

export const spacing = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
} as const;

export const borderRadius = {
  none: "0",
  sm: "0.375rem",
  DEFAULT: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 2px rgba(26, 17, 69, 0.04)",
  DEFAULT: "0 1px 3px rgba(26, 17, 69, 0.04), 0 4px 12px rgba(26, 17, 69, 0.03)",
  md: "0 4px 6px rgba(26, 17, 69, 0.05), 0 10px 20px rgba(26, 17, 69, 0.04)",
  lg: "0 8px 16px rgba(26, 17, 69, 0.06), 0 20px 40px rgba(26, 17, 69, 0.05)",
  xl: "0 12px 24px rgba(26, 17, 69, 0.08), 0 32px 64px rgba(26, 17, 69, 0.06)",
  glow: {
    primary: "0 0 20px rgba(0, 229, 200, 0.4), 0 0 40px rgba(0, 229, 200, 0.2)",
    secondary: "0 0 20px rgba(64, 64, 191, 0.4), 0 0 40px rgba(64, 64, 191, 0.2)",
    accent: "0 0 20px rgba(139, 47, 201, 0.4), 0 0 40px rgba(139, 47, 201, 0.2)",
  },
} as const;

export const typography = {
  fontFamily: {
    sans: 'var(--font-geist), system-ui, -apple-system, sans-serif',
    mono: 'var(--font-geist-mono), ui-monospace, monospace',
  },
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }],
    sm: ["0.875rem", { lineHeight: "1.25rem" }],
    base: ["1rem", { lineHeight: "1.5rem" }],
    lg: ["1.125rem", { lineHeight: "1.75rem" }],
    xl: ["1.25rem", { lineHeight: "1.75rem" }],
    "2xl": ["1.5rem", { lineHeight: "2rem" }],
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    black: "900",
  },
} as const;

export const animation = {
  duration: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
    slower: "700ms",
  },
  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
} as const;

// Gradients
export const gradients = {
  brand: "linear-gradient(135deg, #00e5c8 0%, #4040bf 60%, #8b2fc9 100%)",
  brandSubtle: "linear-gradient(135deg, rgba(0, 229, 200, 0.08) 0%, rgba(64, 64, 191, 0.06) 60%, rgba(139, 47, 201, 0.04) 100%)",
  brandText: "linear-gradient(135deg, #00e5c8 0%, #4040bf 50%, #8b2fc9 100%)",
  dark: "linear-gradient(160deg, #1a1145 0%, #2d1f6e 50%, #1a1145 100%)",
  darkRich: "linear-gradient(135deg, #0f0a2e 0%, #1a1145 30%, #2d1f6e 70%, #1a1145 100%)",
  mesh: `
    radial-gradient(at 20% 30%, rgba(0, 229, 200, 0.15) 0%, transparent 50%),
    radial-gradient(at 80% 20%, rgba(64, 64, 191, 0.12) 0%, transparent 50%),
    radial-gradient(at 60% 80%, rgba(139, 47, 201, 0.1) 0%, transparent 50%),
    linear-gradient(180deg, #f8f9fc 0%, #ffffff 100%)
  `,
} as const;

// Z-Index Scale
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;

// Breakpoints
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// Status Colors (for badges and indicators)
export const statusColors = {
  INDICADO: { bg: colors.secondary[100], text: colors.secondary.DEFAULT },
  EM_ANALISE: { bg: colors.accent[100], text: colors.accent.DEFAULT },
  AGUARDANDO_VISITA: { bg: "rgba(26, 17, 69, 0.08)", text: colors.navy.DEFAULT },
  EM_NEGOCIACAO: { bg: colors.primary[100], text: colors.primary.dark },
  AGUARDANDO_FRANQUEADO: { bg: colors.secondary[100], text: colors.secondary.DEFAULT },
  INSTALADO: { bg: colors.primary[200], text: "#008577" },
  ATIVO: { bg: gradients.brandSubtle, text: colors.navy.DEFAULT },
  RECUSADO: { bg: colors.danger.bg, text: colors.danger.DEFAULT },
} as const;

// Tier Colors
export const tierColors = {
  BRONZE: "#cd7f32",
  PRATA: "#c0c0c0",
  OURO: "#ffd700",
  PLATINA: "#e5e4e2",
  DIAMANTE: "#b9f2ff",
} as const;
