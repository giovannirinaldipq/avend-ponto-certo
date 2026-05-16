import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "OPERADOR")) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const indicadores = await prisma.user.findMany({
    where: { role: "INDICADOR" },
    select: {
      id: true,
      nome: true,
      email: true,
      cpfCnpj: true,
      telefone: true,
      tier: true,
      chavePix: true,
      tipoChavePix: true,
      createdAt: true,
      _count: { select: { indicacoes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ indicadores });
}
