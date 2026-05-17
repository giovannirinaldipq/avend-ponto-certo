import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PARCERIA_STATUS_LABELS } from "@/lib/constants";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  const validStatuses = ["NOVO", "CONTATO", "NEGOCIACAO", "CONTRATO", "ATIVO", "RECUSADO"];
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const anterior = await prisma.parceria.findUnique({ where: { id } });

  const parceria = await prisma.parceria.update({
    where: { id },
    data: { status },
  });

  // Registrar mudança de status no histórico
  if (anterior && anterior.status !== status) {
    await prisma.historicoParceria.create({
      data: {
        parceriaId: id,
        autorId: session.id,
        tipo: "STATUS",
        mensagem: `Status alterado de "${PARCERIA_STATUS_LABELS[anterior.status] || anterior.status}" para "${PARCERIA_STATUS_LABELS[status] || status}"`,
      },
    });
  }

  return NextResponse.json({ parceria });
}