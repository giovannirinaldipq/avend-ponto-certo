import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { notificarPagamento } from "@/lib/notificacoes";
import { pagamentoSchema, formatZodError } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (session.role === "INDICADOR") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = pagamentoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: formatZodError(parsed.error) },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const { comprovanteUrl } = body;

  const pagamento = await prisma.pagamento.create({
    data: {
      indicacaoId: data.indicacaoId,
      indicadorId: data.indicadorId,
      tipo: data.tipo,
      valor: data.valor,
      mesReferencia: data.mesReferencia || null,
      comprovanteUrl: comprovanteUrl || null,
      pago: true,
      dataPagamento: new Date(),
    },
    include: { indicacao: { select: { nomeEstabelecimento: true } } },
  });

  await notificarPagamento(data.indicadorId, pagamento.indicacao.nomeEstabelecimento, data.valor);

  return NextResponse.json({ pagamento }, { status: 201 });
}
