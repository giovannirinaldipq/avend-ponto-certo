import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const [minhasIndicacoes, todasIndicacoes] = await Promise.all([
    prisma.indicacao.findMany({
      where: { indicadorId: session.id },
      select: { id: true, status: true, score: true, createdAt: true, faturamentoMensal: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.indicacao.findMany({
      select: { score: true, indicadorId: true, createdAt: true, status: true },
    }),
  ]);

  const now = new Date();
  const trintaDias = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const seteDias = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // === STREAK ===
  const diasComIndicacao = new Set<string>();
  minhasIndicacoes.forEach((i) => {
    const d = new Date(i.createdAt);
    diasComIndicacao.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  });

  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (diasComIndicacao.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  // === METAS DINÂMICAS ===
  const indicacoesMes = minhasIndicacoes.filter((i) => new Date(i.createdAt) >= trintaDias).length;
  const indicacoesSemana = minhasIndicacoes.filter((i) => new Date(i.createdAt) >= seteDias).length;

  const metaMensal = Math.max(5, Math.ceil(indicacoesMes * 1.2));
  const metaSemanal = Math.max(2, Math.ceil(indicacoesSemana * 1.2));

  const progressoMensal = Math.min(100, Math.round((indicacoesMes / metaMensal) * 100));
  const progressoSemanal = Math.min(100, Math.round((indicacoesSemana / metaSemanal) * 100));

  // === BENCHMARKS ===
  const captadorIds = new Set(todasIndicacoes.map((i) => i.indicadorId));
  const scoresPorCaptador = new Map<string, number[]>();
  todasIndicacoes.forEach((i) => {
    if (!scoresPorCaptador.has(i.indicadorId)) scoresPorCaptador.set(i.indicadorId, []);
    scoresPorCaptador.get(i.indicadorId)!.push(i.score);
  });

  const mediasScores = Array.from(scoresPorCaptador.values()).map(
    (scores) => scores.reduce((s, v) => s + v, 0) / scores.length
  );
  mediasScores.sort((a, b) => a - b);

  const meuScoreMedio = minhasIndicacoes.length > 0
    ? minhasIndicacoes.reduce((s, i) => s + i.score, 0) / minhasIndicacoes.length
    : 0;

  const percentil = mediasScores.length > 0
    ? Math.round((mediasScores.filter((s) => s <= meuScoreMedio).length / mediasScores.length) * 100)
    : 50;

  const mediaRede = mediasScores.length > 0
    ? Math.round(mediasScores.reduce((s, v) => s + v, 0) / mediasScores.length)
    : 0;

  // Indicações por captador no mês
  const indicacoesMesPorCaptador = new Map<string, number>();
  todasIndicacoes.forEach((i) => {
    if (new Date(i.createdAt) >= trintaDias) {
      indicacoesMesPorCaptador.set(i.indicadorId, (indicacoesMesPorCaptador.get(i.indicadorId) || 0) + 1);
    }
  });
  const volumesMes = Array.from(indicacoesMesPorCaptador.values()).sort((a, b) => a - b);
  const mediaVolumeMes = volumesMes.length > 0
    ? Math.round(volumesMes.reduce((s, v) => s + v, 0) / volumesMes.length)
    : 0;

  // === PERFORMANCE MENSAL (últimos 6 meses) ===
  const performanceMensal = [];
  for (let i = 5; i >= 0; i--) {
    const mesInicio = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mesFim = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const mesLabel = mesInicio.toLocaleDateString("pt-BR", { month: "short" });

    const doMes = minhasIndicacoes.filter((ind) => {
      const d = new Date(ind.createdAt);
      return d >= mesInicio && d <= mesFim;
    });

    performanceMensal.push({
      mes: mesLabel,
      indicacoes: doMes.length,
      scoreMedio: doMes.length > 0 ? Math.round(doMes.reduce((s, i) => s + i.score, 0) / doMes.length) : 0,
      instalados: doMes.filter((i) => i.status === "INSTALADO" || i.status === "ATIVO").length,
    });
  }

  return NextResponse.json({
    streak,
    metas: {
      mensal: { meta: metaMensal, atual: indicacoesMes, progresso: progressoMensal },
      semanal: { meta: metaSemanal, atual: indicacoesSemana, progresso: progressoSemanal },
    },
    benchmarks: {
      meuScoreMedio: Math.round(meuScoreMedio),
      mediaRede,
      percentil,
      meuVolumeMes: indicacoesMes,
      mediaVolumeMes,
    },
    performanceMensal,
  });
}