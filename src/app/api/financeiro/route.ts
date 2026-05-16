import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const indicadorId = searchParams.get("indicadorId");

  const where: Record<string, unknown> = {};

  if (session.role === "INDICADOR") {
    where.indicadorId = session.id;
  } else if (indicadorId) {
    where.indicadorId = indicadorId;
  }

  const pagamentos = await prisma.pagamento.findMany({
    where,
    include: {
      indicacao: { select: { nomeEstabelecimento: true, cidade: true } },
      indicador: { select: { nome: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalPago = pagamentos
    .filter((p) => p.pago)
    .reduce((sum, p) => sum + p.valor, 0);

  const totalPendente = pagamentos
    .filter((p) => !p.pago)
    .reduce((sum, p) => sum + p.valor, 0);

  return NextResponse.json({ pagamentos, totalPago, totalPendente });
}
