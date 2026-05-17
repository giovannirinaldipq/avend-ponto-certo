import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { id } = await params;

  const unidades = await prisma.unidadeRede.findMany({
    where: { parceriaId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ unidades });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { nome, endereco, cidade, estado } = body;

  if (!nome || !endereco || !cidade || !estado) {
    return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 });
  }

  const unidade = await prisma.unidadeRede.create({
    data: {
      parceriaId: id,
      nome,
      endereco,
      cidade,
      estado,
    },
  });

  return NextResponse.json({ unidade }, { status: 201 });
}