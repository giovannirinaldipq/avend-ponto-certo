import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createToken, setTokenCookie } from "@/lib/auth";
import { registroSchema, formatZodError } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
    }

    const parsed = registroSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { nome, email, senha, cpfCnpj, telefone } = parsed.data;
    const { chavePix, tipoChavePix } = body;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { cpfCnpj }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "E-mail ou CPF/CNPJ já cadastrado" },
        { status: 409 }
      );
    }

    const hash = await hashPassword(senha);

    const user = await prisma.user.create({
      data: {
        nome,
        email,
        senha: hash,
        cpfCnpj,
        telefone,
        chavePix: chavePix || null,
        tipoChavePix: tipoChavePix || null,
      },
    });

    const token = await createToken({ id: user.id, email: user.email, role: user.role });

    return NextResponse.json(
      { user: { id: user.id, nome: user.nome, email: user.email, role: user.role } },
      { status: 201, headers: setTokenCookie(token) }
    );
  } catch (error) {
    console.error("Registro error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
