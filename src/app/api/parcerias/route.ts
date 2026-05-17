import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const parcerias = await prisma.parceria.findMany({
    include: { unidades: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ parcerias });
}

export async function POST(request: NextRequest) {
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
      status: "NOVO",
    },
  });

  return NextResponse.json({ parceria }, { status: 201 });
}