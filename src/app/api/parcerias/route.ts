import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const where: Record<string, unknown> = {};
    if (session.role === "INDICADOR") {
      where.indicadorId = session.id;
    }

    const parcerias = await prisma.parceria.findMany({
      where,
      include: { unidades: true, historico: { orderBy: { createdAt: "desc" } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ parcerias });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("GET /api/parcerias error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  const body = await request.json();
  const { tipo, nomeEmpresa, nomeContato, email, telefone, descricao, numUnidades } = body;

  if (!tipo || !nomeEmpresa || !nomeContato || !email || !telefone) {
    return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 });
  }

  if (!["GERAL", "REDE"].includes(tipo)) {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  }

  const parceria = await prisma.parceria.create({
    data: {
      tipo,
      nomeEmpresa,
      nomeContato,
      email,
      telefone,
      descricao: descricao || null,
      numUnidades: tipo === "REDE" ? (numUnidades || null) : null,
      indicadorId: session?.id || null,
      status: "NOVO",
    },
  });

  return NextResponse.json({ parceria }, { status: 201 });
}