import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const [indicacoes, indicadores, pagamentos] = await Promise.all([
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
      },
    }),
    prisma.user.findMany({
      where: { role: "INDICADOR" },
      select: { id: true, createdAt: true, indicacoes: { select: { id: true } } },
    }),
    prisma.pagamento.findMany({
      select: { valor: true, pago: true, createdAt: true },
    }),
  ]);

  // Crescimento mensal (últimos 6 meses)
  const now = new Date();
  const crescimentoMensal = [];
  for (let i = 5; i >= 0; i--) {
    const mesInicio = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mesFim = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const count = indicacoes.filter((ind) => {
      const d = new Date(ind.createdAt);
      return d >= mesInicio && d <= mesFim;
    }).length;
    crescimentoMensal.push({
      mes: mesInicio.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      indicacoes: count,
    });
  }

  // Tempo médio de conversão (indicado → instalado)
  const instalados = indicacoes.filter((i) => i.dataInstalacao);
  const tempoMedioConversao = instalados.length > 0
    ? Math.round(
        instalados.reduce((sum, i) => {
          const diff = new Date(i.dataInstalacao!).getTime() - new Date(i.createdAt).getTime();
          return sum + diff / (1000 * 60 * 60 * 24);
        }, 0) / instalados.length
      )
    : 0;

  // Indicadores ativos (com pelo menos 1 indicação nos últimos 30 dias)
  const trintaDiasAtras = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const indicadoresAtivosIds = new Set(
    indicacoes
      .filter((i) => new Date(i.createdAt) >= trintaDiasAtras)
      .map((i) => i.indicadorId)
  );
  const indicadoresAtivos = indicadoresAtivosIds.size;
  const indicadoresInativos = indicadores.length - indicadoresAtivos;

  // Receita
  const receitaTotal = pagamentos.filter((p) => p.pago).reduce((s, p) => s + p.valor, 0);
  const receitaPendente = pagamentos.filter((p) => !p.pago).reduce((s, p) => s + p.valor, 0);

  // Score médio geral
  const scoreMedio = indicacoes.length > 0
    ? Math.round(indicacoes.reduce((s, i) => s + i.score, 0) / indicacoes.length)
    : 0;

  // Taxa de conversão
  const totalInstalados = indicacoes.filter((i) => i.status === "INSTALADO" || i.status === "ATIVO").length;
  const taxaConversao = indicacoes.length > 0 ? Math.round((totalInstalados / indicacoes.length) * 100) : 0;

  // Faturamento estimado mensal
  const faturamentoMensal = indicacoes
    .filter((i) => i.faturamentoMensal)
    .reduce((s, i) => s + (i.faturamentoMensal || 0), 0);

  return NextResponse.json({
    crescimentoMensal,
    tempoMedioConversao,
    indicadoresAtivos,
    indicadoresInativos,
    totalIndicadores: indicadores.length,
    receitaTotal,
    receitaPendente,
    scoreMedio,
    taxaConversao,
    totalInstalados,
    totalIndicacoes: indicacoes.length,
    faturamentoMensal,
  });
}
