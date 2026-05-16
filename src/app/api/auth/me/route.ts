import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      tier: true,
      cpfCnpj: true,
      telefone: true,
      chavePix: true,
      tipoChavePix: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const { nome, telefone, chavePix, tipoChavePix, senhaAtual, novaSenha } = body;

  const data: Record<string, unknown> = {};
  if (nome) data.nome = nome;
  if (telefone) data.telefone = telefone;
  if (chavePix !== undefined) data.chavePix = chavePix || null;
  if (tipoChavePix !== undefined) data.tipoChavePix = tipoChavePix || null;

  if (novaSenha) {
    if (!senhaAtual) {
      return NextResponse.json({ error: "Senha atual é obrigatória" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }
    const valid = await verifyPassword(senhaAtual, user.senha);
    if (!valid) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });
    }
    data.senha = await hashPassword(novaSenha);
  }

  const updated = await prisma.user.update({
    where: { id: session.id },
    data,
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      tier: true,
      cpfCnpj: true,
      telefone: true,
      chavePix: true,
      tipoChavePix: true,
    },
  });

  return NextResponse.json({ user: updated });
}
