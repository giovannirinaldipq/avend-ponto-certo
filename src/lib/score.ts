type ScoreInput = {
  tipoLocal: string;
  fluxoPessoas: string;
  interesseDecissor: string;
  temEspaco: string;
  temEnergia: string;
  temConcorrente: boolean;
  fotos: string[];
};

export function calcularScore(input: ScoreInput): number {
  let score = 0;

  // Tipo de local (0-25)
  const tipoScores: Record<string, number> = {
    EMPRESA: 25,
    HOSPITAL: 25,
    UNIVERSIDADE: 25,
    ACADEMIA: 20,
    INDUSTRIA: 20,
    CONDOMINIO: 15,
    COWORKING: 15,
    SHOPPING: 20,
    OUTRO: 10,
  };
  score += tipoScores[input.tipoLocal] || 10;

  // Fluxo de pessoas (0-25)
  const fluxoScores: Record<string, number> = {
    ACIMA_500: 25,
    DE_150_A_500: 20,
    DE_50_A_150: 12,
    ATE_50: 5,
  };
  score += fluxoScores[input.fluxoPessoas] || 5;

  // Interesse do decisor (0-20)
  const interesseScores: Record<string, number> = {
    SIM: 20,
    TALVEZ: 10,
    NAO: 0,
  };
  score += interesseScores[input.interesseDecissor] || 0;

  // Infraestrutura (0-15)
  const espaco = input.temEspaco === "SIM" ? 1 : input.temEspaco === "NAO_SEI" ? 0.5 : 0;
  const energia = input.temEnergia === "SIM" ? 1 : input.temEnergia === "NAO_SEI" ? 0.5 : 0;
  const infraScore = (espaco + energia) / 2;
  score += Math.round(infraScore * 15);

  // Sem concorrente (0-10)
  score += input.temConcorrente ? 0 : 10;

  // Foto (0-5)
  score += input.fotos.length > 0 ? 5 : 0;

  return Math.min(score, 100);
}

export function classificarScore(score: number): "QUENTE" | "MORNO" | "FRIO" {
  if (score >= 70) return "QUENTE";
  if (score >= 50) return "MORNO";
  return "FRIO";
}
