import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar acesso
    const indicacao = await prisma.indicacao.findUnique({ where: { id } });
    if (!indicacao) {
      return NextResponse.json({ error: "Indicação não encontrada" }, { status: 404 });
    }

    if (session.role === "INDICADOR" && indicacao.indicadorId !== session.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const comunicacoes = await prisma.comunicacao.findMany({
      where: { indicacaoId: id },
      include: { autor: { select: { nome: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ comunicacoes });
  } catch (error) {
    console.error("Comunicacoes GET error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar acesso
    const indicacao = await prisma.indicacao.findUnique({ where: { id } });
    if (!indicacao) {
      return NextResponse.json({ error: "Indicação não encontrada" }, { status: 404 });
    }

    if (session.role === "INDICADOR" && indicacao.indicadorId !== session.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
    }

    const { tipo, mensagem } = body;

    if (!tipo || !mensagem) {
      return NextResponse.json({ error: "Tipo e mensagem são obrigatórios" }, { status: 400 });
    }

    const tiposValidos = ["NOTA", "LIGACAO", "VISITA", "EMAIL", "WHATSAPP"];
    if (!tiposValidos.includes(tipo)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    const comunicacao = await prisma.comunicacao.create({
      data: {
        indicacaoId: id,
        autorId: session.id,
        tipo,
        mensagem,
      },
      include: { autor: { select: { nome: true, role: true } } },
    });

    return NextResponse.json({ comunicacao }, { status: 201 });
  } catch (error) {
    console.error("Comunicacoes POST error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
