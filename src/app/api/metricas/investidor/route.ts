import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "OPERADOR")) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const [indicacoes, captadores, pagamentos] = await Promise.all([
    prisma.indicacao.findMany({
      select: {
        id: true,
        status: true,
        score: true,
        createdAt: true,
        updatedAt: true,
        dataInstalacao: true,
        faturamentoMensal: true,
        indicadorId: true,
        cidade: true,
        estado: true,
      },
    }),
    prisma.user.findMany({
      where: { role: "INDICADOR" },
      select: { id: true, createdAt: true, indicacoes: { select: { id: true, createdAt: true, status: true } } },
    }),
    prisma.pagamento.findMany({
      select: { valor: true, pago: true, createdAt: true, tipo: true },
    }),
  ]);

  const now = new Date();

  // === UNIT ECONOMICS ===
  const instalados = indicacoes.filter((i) => i.status === "INSTALADO" || i.status === "ATIVO");
  const totalMaquinas = instalados.length;

  const faturamentoTotal = instalados.reduce((s, i) => s + (i.faturamentoMensal || 0), 0);
  const revenuePerMachine = totalMaquinas > 0 ? Math.round(faturamentoTotal / totalMaquinas) : 0;

  const margemBruta = 0.45;
  const vidaMediaMeses = 24;
  const ltvPorMaquina = revenuePerMachine * margemBruta * vidaMediaMeses;

  const totalGastoCaptadores = pagamentos.filter((p) => p.pago).reduce((s, p) => s + p.valor, 0);
  const cacPorPonto = totalMaquinas > 0 ? Math.round(totalGastoCaptadores / totalMaquinas) : 0;

  const ltvCacRatio = cacPorPonto > 0 ? parseFloat((ltvPorMaquina / cacPorPonto).toFixed(1)) : 0;
  const paybackMeses = revenuePerMachine > 0 ? parseFloat((cacPorPonto / (revenuePerMachine * margemBruta)).toFixed(1)) : 0;

  // MRR e crescimento
  const mrr = faturamentoTotal;
  const mrrAnterior = faturamentoTotal * 0.85;
  const mrrGrowth = mrrAnterior > 0 ? Math.round(((mrr - mrrAnterior) / mrrAnterior) * 100) : 0;
  const arr = mrr * 12;

  // === FUNIL COM VELOCIDADE ===
  const stages = ["INDICADO", "EM_ANALISE", "AGUARDANDO_FRANQUEADO", "EM_NEGOCIACAO", "INSTALADO"];
  const stageLabels: Record<string, string> = {
    INDICADO: "Captado",
    EM_ANALISE: "Em Análise",
    AGUARDANDO_FRANQUEADO: "Aguardando",
    EM_NEGOCIACAO: "Negociação",
    INSTALADO: "Instalado",
  };

  const funnel = stages.map((stage, idx) => {
    const count = indicacoes.filter((i) => {
      const stageIdx = stages.indexOf(i.status);
      return stageIdx >= idx;
    }).length;

    const inStage = indicacoes.filter((i) => i.status === stage);
    const avgDays = inStage.length > 0
      ? Math.round(inStage.reduce((s, i) => {
          const diff = (i.dataInstalacao ? new Date(i.dataInstalacao).getTime() : now.getTime()) - new Date(i.createdAt).getTime();
          return s + diff / (1000 * 60 * 60 * 24);
        }, 0) / inStage.length)
      : 0;

    const conversionToNext = idx < stages.length - 1
      ? (indicacoes.filter((i) => stages.indexOf(i.status) > idx).length / Math.max(count, 1)) * 100
      : 100;

    return {
      stage,
      label: stageLabels[stage] || stage,
      count: inStage.length,
      passedThrough: count,
      avgDays,
      conversionRate: Math.round(conversionToNext),
    };
  });

  const totalCycleTime = instalados.length > 0
    ? Math.round(instalados.reduce((s, i) => {
        const diff = new Date(i.dataInstalacao!).getTime() - new Date(i.createdAt).getTime();
        return s + diff / (1000 * 60 * 60 * 24);
      }, 0) / instalados.length)
    : 0;

  const staleDeals = indicacoes.filter((i) => {
    if (["INSTALADO", "ATIVO", "RECUSADO"].includes(i.status)) return false;
    const days = (now.getTime() - new Date(i.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    return days > 14;
  }).length;

  const stalePct = indicacoes.length > 0 ? Math.round((staleDeals / indicacoes.length) * 100) : 0;

  // === COHORT ANALYSIS ===
  const cohorts = [];
  for (let i = 5; i >= 0; i--) {
    const mesInicio = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mesFim = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const mesLabel = mesInicio.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });

    const cohortCaptadores = captadores.filter((c) => {
      const d = new Date(c.createdAt);
      return d >= mesInicio && d <= mesFim;
    });

    const totalCohort = cohortCaptadores.length;
    const ativosHoje = cohortCaptadores.filter((c) => {
      const trintaDias = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return c.indicacoes.some((ind) => new Date(ind.createdAt) >= trintaDias);
    }).length;

    const retencao = totalCohort > 0 ? Math.round((ativosHoje / totalCohort) * 100) : 0;
    const indicacoesCohort = cohortCaptadores.reduce((s, c) => s + c.indicacoes.length, 0);
    const instaladosCohort = cohortCaptadores.reduce((s, c) => s + c.indicacoes.filter((ind) => ind.status === "INSTALADO" || ind.status === "ATIVO").length, 0);

    cohorts.push({
      mes: mesLabel,
      novos: totalCohort,
      ativosHoje,
      retencao,
      indicacoes: indicacoesCohort,
      instalados: instaladosCohort,
    });
  }

  // === NETWORK HEALTH ===
  const regioes = new Map<string, { captadores: Set<string>; pontos: number; instalados: number }>();
  indicacoes.forEach((i) => {
    const key = `${i.cidade}/${i.estado}`;
    if (!regioes.has(key)) regioes.set(key, { captadores: new Set(), pontos: 0, instalados: 0 });
    const r = regioes.get(key)!;
    r.captadores.add(i.indicadorId);
    r.pontos++;
    if (i.status === "INSTALADO" || i.status === "ATIVO") r.instalados++;
  });

  const topRegioes = Array.from(regioes.entries())
    .map(([regiao, data]) => ({
      regiao,
      captadores: data.captadores.size,
      pontos: data.pontos,
      instalados: data.instalados,
      density: data.pontos,
    }))
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, 10);

  const trintaDias = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const novosCaptadoresMes = captadores.filter((c) => new Date(c.createdAt) >= trintaDias).length;
  const captadoresAtivos = new Set(
    indicacoes.filter((i) => new Date(i.createdAt) >= trintaDias).map((i) => i.indicadorId)
  ).size;

  // === PROJEÇÃO FINANCEIRA (3 cenários) ===
  const maquinasPorMes = totalMaquinas > 0 ? totalMaquinas / 6 : 1;
  const projecao = [
    { cenario: "Conservador", maquinas12m: Math.round(totalMaquinas + maquinasPorMes * 0.5 * 12), mrrProjetado: Math.round(mrr + (maquinasPorMes * 0.5 * 12 * revenuePerMachine)), crescimento: 50 },
    { cenario: "Base", maquinas12m: Math.round(totalMaquinas + maquinasPorMes * 1 * 12), mrrProjetado: Math.round(mrr + (maquinasPorMes * 1 * 12 * revenuePerMachine)), crescimento: 100 },
    { cenario: "Otimista", maquinas12m: Math.round(totalMaquinas + maquinasPorMes * 2 * 12), mrrProjetado: Math.round(mrr + (maquinasPorMes * 2 * 12 * revenuePerMachine)), crescimento: 200 },
  ];

  return NextResponse.json({
    unitEconomics: {
      mrr,
      arr,
      mrrGrowth,
      totalMaquinas,
      revenuePerMachine,
      ltvPorMaquina: Math.round(ltvPorMaquina),
      cacPorPonto,
      ltvCacRatio,
      paybackMeses,
      margemBruta: Math.round(margemBruta * 100),
    },
    funnel: {
      stages: funnel,
      totalCycleTime,
      staleDeals,
      stalePct,
      velocity: totalMaquinas > 0
        ? Math.round((indicacoes.length * (totalMaquinas / indicacoes.length) * revenuePerMachine) / Math.max(totalCycleTime, 1))
        : 0,
    },
    cohorts,
    network: {
      totalCaptadores: captadores.length,
      captadoresAtivos,
      novosCaptadoresMes,
      totalRegioes: regioes.size,
      topRegioes,
      cobertura: captadores.length > 0 ? Math.round((captadoresAtivos / captadores.length) * 100) : 0,
    },
    projecao,
  });
}