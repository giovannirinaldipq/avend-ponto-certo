import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createToken, setTokenCookie } from "@/lib/auth";
import { loginSchema, formatZodError } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { email, senha } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(senha, user.senha))) {
      return NextResponse.json(
        { error: "E-mail ou senha inválidos" },
        { status: 401 }
      );
    }

    const token = await createToken({ id: user.id, email: user.email, role: user.role });

    return NextResponse.json(
      { user: { id: user.id, nome: user.nome, email: user.email, role: user.role, tier: user.tier } },
      { headers: setTokenCookie(token) }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
