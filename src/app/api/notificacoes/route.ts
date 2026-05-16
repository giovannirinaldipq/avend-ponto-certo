import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const notificacoes = await prisma.notificacao.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const naoLidas = await prisma.notificacao.count({
    where: { userId: session.id, lida: false },
  });

  return NextResponse.json({ notificacoes, naoLidas });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();

  if (body.marcarTodasLidas) {
    await prisma.notificacao.updateMany({
      where: { userId: session.id, lida: false },
      data: { lida: true },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.id) {
    await prisma.notificacao.update({
      where: { id: body.id },
      data: { lida: true },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}
