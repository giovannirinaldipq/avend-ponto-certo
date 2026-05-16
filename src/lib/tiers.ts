type TierInfo = {
  nome: string;
  label: string;
  cor: string;
  indicacoesMinimas: number;
  pontosInstalados: number;
};

export const TIERS: Record<string, TierInfo> = {
  BRONZE: {
    nome: "BRONZE",
    label: "Bronze",
    cor: "#CD7F32",
    indicacoesMinimas: 0,
    pontosInstalados: 0,
  },
  PRATA: {
    nome: "PRATA",
    label: "Prata",
    cor: "#8b95a5",
    indicacoesMinimas: 2,
    pontosInstalados: 0,
  },
  OURO: {
    nome: "OURO",
    label: "Ouro",
    cor: "#e5a800",
    indicacoesMinimas: 0,
    pontosInstalados: 1,
  },
  PLATINA: {
    nome: "PLATINA",
    label: "Platina",
    cor: "#4040bf",
    indicacoesMinimas: 15,
    pontosInstalados: 3,
  },
  DIAMANTE: {
    nome: "DIAMANTE",
    label: "Diamante",
    cor: "#00e5c8",
    indicacoesMinimas: 30,
    pontosInstalados: 8,
  },
};

export function calcularTier(totalIndicacoes: number, pontosInstalados: number): string {
  if (totalIndicacoes >= 30 && pontosInstalados >= 8) return "DIAMANTE";
  if (totalIndicacoes >= 15 && pontosInstalados >= 3) return "PLATINA";
  if (pontosInstalados >= 1) return "OURO";
  if (totalIndicacoes >= 2) return "PRATA";
  return "BRONZE";
}

export function proximoTier(tierAtual: string): TierInfo | null {
  const ordem = ["BRONZE", "PRATA", "OURO", "PLATINA", "DIAMANTE"];
  const idx = ordem.indexOf(tierAtual);
  if (idx === -1 || idx === ordem.length - 1) return null;
  return TIERS[ordem[idx + 1]];
}
