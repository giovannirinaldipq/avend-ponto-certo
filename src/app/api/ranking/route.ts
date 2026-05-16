import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const indicadores = await prisma.user.findMany({
    where: { role: "INDICADOR" },
    select: {
      id: true,
      nome: true,
      tier: true,
      indicacoes: {
        select: { status: true },
      },
    },
  });

  const ranking = indicadores
    .map((ind) => ({
      id: ind.id,
      nome: ind.nome,
      tier: ind.tier,
      totalIndicacoes: ind.indicacoes.length,
      pontosInstalados: ind.indicacoes.filter(
        (i) => i.status === "INSTALADO" || i.status === "ATIVO"
      ).length,
    }))
    .sort((a, b) => {
      if (b.pontosInstalados !== a.pontosInstalados) return b.pontosInstalados - a.pontosInstalados;
      return b.totalIndicacoes - a.totalIndicacoes;
    })
    .map((ind, idx) => ({ ...ind, posicao: idx + 1 }));

  return NextResponse.json({ ranking, userId: session.id });
}
