import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { calcularScore } from "@/lib/score";
import { indicacaoSchema, formatZodError } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const cidade = searchParams.get("cidade");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const all = searchParams.get("all") === "true";

  const where: Record<string, unknown> = {};

  if (session.role === "INDICADOR") {
    where.indicadorId = session.id;
  }

  if (status) where.status = status;
  if (cidade) where.cidade = { contains: cidade };

  const total = await prisma.indicacao.count({ where });

  const indicacoes = await prisma.indicacao.findMany({
    where,
    include: { indicador: { select: { nome: true, email: true, tier: true } } },
    orderBy: { createdAt: "desc" },
    ...(all ? {} : { skip: (page - 1) * limit, take: limit }),
  });

  return NextResponse.json({
    indicacoes,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = indicacaoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: formatZodError(parsed.error) },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const fotosArray: string[] = data.fotos.length > 0 ? data.fotos : (data.fotoUrl ? [data.fotoUrl] : []);

  const score = calcularScore({
    tipoLocal: data.tipoLocal,
    fluxoPessoas: data.fluxoPessoas,
    interesseDecissor: data.interesseDecissor,
    temEspaco: data.temEspaco,
    temEnergia: data.temEnergia,
    temConcorrente: data.temConcorrente,
    fotos: fotosArray,
  });

  const indicacao = await prisma.indicacao.create({
    data: {
      indicadorId: session.id,
      nomeEstabelecimento: data.nomeEstabelecimento,
      endereco: data.endereco,
      cidade: data.cidade,
      estado: data.estado,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      tipoLocal: data.tipoLocal,
      horarioFuncionamento: data.horarioFuncionamento,
      fluxoPessoas: data.fluxoPessoas,
      nomeDecissor: data.nomeDecissor,
      telefoneDecissor: data.telefoneDecissor,
      cargoDecissor: data.cargoDecissor || null,
      interesseDecissor: data.interesseDecissor,
      fotos: JSON.stringify(fotosArray),
      temEspaco: data.temEspaco,
      temEnergia: data.temEnergia,
      temConcorrente: data.temConcorrente,
      score,
    },
  });

  return NextResponse.json({ indicacao }, { status: 201 });
}
