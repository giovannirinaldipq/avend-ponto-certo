export const STATUS_LIST = [
  { key: "INDICADO", label: "Indicado", badge: "badge-indicado", color: "#4040bf" },
  { key: "EM_ANALISE", label: "Em Análise", badge: "badge-analise", color: "#8b2fc9" },
  { key: "AGUARDANDO_FRANQUEADO", label: "Aguardando", badge: "badge-aguardando", color: "#1a1145" },
  { key: "EM_NEGOCIACAO", label: "Negociação", badge: "badge-negociacao", color: "#00e5c8" },
  { key: "INSTALADO", label: "Instalado", badge: "badge-instalado", color: "#00c4ab" },
  { key: "ATIVO", label: "Ativo", badge: "badge-ativo", color: "#00e5c8" },
  { key: "RECUSADO", label: "Recusado", badge: "badge-recusado", color: "#dc3545" },
] as const;

export const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  ...STATUS_LIST.map((s) => ({ value: s.key, label: s.label })),
];

export const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  STATUS_LIST.map((s) => [s.key, s.label])
);

export const STATUS_BADGE: Record<string, string> = Object.fromEntries(
  STATUS_LIST.map((s) => [s.key, s.badge])
);

export const STATUS_COLORS: Record<string, string> = Object.fromEntries(
  STATUS_LIST.map((s) => [s.key, s.color])
);