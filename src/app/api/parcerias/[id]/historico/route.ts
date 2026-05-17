import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;

  const historico = await prisma.historicoParceria.findMany({
    where: { parceriaId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ historico });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { tipo, mensagem } = body;

  if (!tipo || !mensagem) {
    return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 });
  }

  const validTipos = ["NOTA", "LIGACAO", "REUNIAO", "EMAIL", "WHATSAPP", "STATUS"];
  if (!validTipos.includes(tipo)) {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  }

  const registro = await prisma.historicoParceria.create({
    data: {
      parceriaId: id,
      autorId: session.id,
      tipo,
      mensagem,
    },
  });

  return NextResponse.json({ registro }, { status: 201 });
}