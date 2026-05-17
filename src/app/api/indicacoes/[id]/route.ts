import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { notificarStatusAlterado } from "@/lib/notificacoes";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;

  const indicacao = await prisma.indicacao.findUnique({
    where: { id },
    include: {
      indicador: { select: { nome: true, email: true, telefone: true, tier: true } },
      pagamentos: true,
    },
  });

  if (!indicacao) {
    return NextResponse.json({ error: "Indicação não encontrada" }, { status: 404 });
  }

  if (session.role === "INDICADOR" && indicacao.indicadorId !== session.id) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  return NextResponse.json({ indicacao });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  if (session.role === "INDICADOR") {
    const indicacao = await prisma.indicacao.findUnique({ where: { id } });
    if (!indicacao || indicacao.indicadorId !== session.id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    if (!body.fotos || !Array.isArray(body.fotos) || body.fotos.length === 0) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }
    const existingFotos: string[] = JSON.parse(indicacao.fotos || "[]");
    const merged = [...existingFotos, ...body.fotos];
    const updated = await prisma.indicacao.update({
      where: { id },
      data: { fotos: JSON.stringify(merged) },
    });
    return NextResponse.json({ indicacao: updated });
  }

  const { status, dataInstalacao, faturamentoMensal, fotos, franqueado } = body;

  const data: Record<string, unknown> = {};
  if (status) data.status = status;
  if (dataInstalacao) data.dataInstalacao = new Date(dataInstalacao);
  if (faturamentoMensal !== undefined) data.faturamentoMensal = faturamentoMensal;
  if (fotos) data.fotos = JSON.stringify(fotos);
  if (franqueado !== undefined) data.franqueado = franqueado;

  const indicacao = await prisma.indicacao.update({
    where: { id },
    data,
  });

  if (status) {
    await notificarStatusAlterado(indicacao.indicadorId, indicacao.nomeEstabelecimento, status, id);
  }

  return NextResponse.json({ indicacao });
}
