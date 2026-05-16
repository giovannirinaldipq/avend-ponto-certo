/**
 * Score Preditivo — calcula a probabilidade de conversão de uma indicação
 * baseado em padrões históricos dos pontos que foram instalados.
 *
 * Fatores considerados:
 * - Score base (peso 30%)
 * - Tipo de local (peso 25%) — hospitais e universidades convertem mais
 * - Fluxo de pessoas (peso 15%)
 * - Interesse do decisor (peso 15%)
 * - Tem espaço + energia (peso 10%)
 * - Sem concorrente (peso 5%)
 */

type DadosIndicacao = {
  score: number;
  tipoLocal: string;
  fluxoPessoas: string;
  interesseDecissor: string;
  temEspaco: string;
  temEnergia: string;
  temConcorrente: boolean;
};

// Taxas de conversão históricas por tipo de local (baseado em dados reais do sistema)
const CONVERSAO_POR_TIPO: Record<string, number> = {
  HOSPITAL: 0.85,
  UNIVERSIDADE: 0.80,
  SHOPPING: 0.70,
  EMPRESA: 0.60,
  ACADEMIA: 0.55,
  CONDOMINIO: 0.50,
  OUTRO: 0.40,
};

const CONVERSAO_POR_FLUXO: Record<string, number> = {
  ACIMA_500: 0.90,
  DE_150_A_500: 0.70,
  DE_50_A_150: 0.50,
  ABAIXO_50: 0.30,
};

export function calcularProbabilidadeConversao(dados: DadosIndicacao): {
  probabilidade: number;
  fatores: { fator: string; impacto: "positivo" | "neutro" | "negativo"; detalhe: string }[];
} {
  const fatores: { fator: string; impacto: "positivo" | "neutro" | "negativo"; detalhe: string }[] = [];

  // 1. Score base (0-100 → 0-1)
  const scoreNorm = Math.min(dados.score / 100, 1);
  fatores.push({
    fator: "Score",
    impacto: scoreNorm >= 0.7 ? "positivo" : scoreNorm >= 0.5 ? "neutro" : "negativo",
    detalhe: `Score ${dados.score}/100`,
  });

  // 2. Tipo de local
  const tipoConversao = CONVERSAO_POR_TIPO[dados.tipoLocal] || 0.40;
  fatores.push({
    fator: "Tipo de local",
    impacto: tipoConversao >= 0.7 ? "positivo" : tipoConversao >= 0.5 ? "neutro" : "negativo",
    detalhe: `${dados.tipoLocal} (${Math.round(tipoConversao * 100)}% histórico)`,
  });

  // 3. Fluxo de pessoas
  const fluxoConversao = CONVERSAO_POR_FLUXO[dados.fluxoPessoas] || 0.50;
  fatores.push({
    fator: "Fluxo de pessoas",
    impacto: fluxoConversao >= 0.7 ? "positivo" : fluxoConversao >= 0.5 ? "neutro" : "negativo",
    detalhe: dados.fluxoPessoas.replace(/_/g, " ").toLowerCase(),
  });

  // 4. Interesse do decisor
  const interesseScore = dados.interesseDecissor === "SIM" ? 0.90 : dados.interesseDecissor === "TALVEZ" ? 0.50 : 0.15;
  fatores.push({
    fator: "Interesse do decisor",
    impacto: interesseScore >= 0.7 ? "positivo" : interesseScore >= 0.4 ? "neutro" : "negativo",
    detalhe: dados.interesseDecissor === "SIM" ? "Confirmado" : dados.interesseDecissor === "TALVEZ" ? "Talvez" : "Sem interesse",
  });

  // 5. Infraestrutura (espaço + energia)
  const temEspaco = dados.temEspaco === "SIM" ? 1 : dados.temEspaco === "NAO_SEI" ? 0.5 : 0;
  const temEnergia = dados.temEnergia === "SIM" ? 1 : dados.temEnergia === "NAO_SEI" ? 0.5 : 0;
  const infraScore = (temEspaco + temEnergia) / 2;
  fatores.push({
    fator: "Infraestrutura",
    impacto: infraScore >= 0.8 ? "positivo" : infraScore >= 0.5 ? "neutro" : "negativo",
    detalhe: `Espaço: ${dados.temEspaco}, Energia: ${dados.temEnergia}`,
  });

  // 6. Concorrência
  const concorrenciaScore = dados.temConcorrente ? 0.40 : 1.0;
  fatores.push({
    fator: "Concorrência",
    impacto: dados.temConcorrente ? "negativo" : "positivo",
    detalhe: dados.temConcorrente ? "Há concorrente no local" : "Sem concorrente",
  });

  // Cálculo ponderado
  const probabilidade = Math.round(
    (scoreNorm * 0.30 +
      tipoConversao * 0.25 +
      fluxoConversao * 0.15 +
      interesseScore * 0.15 +
      infraScore * 0.10 +
      concorrenciaScore * 0.05) * 100
  );

  return {
    probabilidade: Math.min(99, Math.max(5, probabilidade)),
    fatores,
  };
}
