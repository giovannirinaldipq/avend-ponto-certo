import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string; unidadeId: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { id, unidadeId } = await params;

  const unidade = await prisma.unidadeRede.findFirst({
    where: { id: unidadeId, parceriaId: id },
    include: { parceria: true },
  });

  if (!unidade) {
    return NextResponse.json({ error: "Unidade não encontrada" }, { status: 404 });
  }

  if (unidade.indicacaoId) {
    return NextResponse.json({ error: "Unidade já possui ponto vinculado" }, { status: 400 });
  }

  // Criar indicação a partir da unidade
  const indicacao = await prisma.indicacao.create({
    data: {
      indicadorId: session.id,
      nomeEstabelecimento: `${unidade.parceria.nomeEmpresa} - ${unidade.nome}`,
      endereco: unidade.endereco,
      cidade: unidade.cidade,
      estado: unidade.estado,
      tipoLocal: "EMPRESA",
      horarioFuncionamento: "Comercial",
      fluxoPessoas: "DE_150_A_500",
      nomeDecissor: unidade.parceria.nomeContato,
      telefoneDecissor: unidade.parceria.telefone,
      cargoDecissor: "Parceria de Rede",
      interesseDecissor: "SIM",
      fotos: "[]",
      temEspaco: "SIM",
      temEnergia: "SIM",
      temConcorrente: false,
      score: 85,
      status: "EM_ANALISE",
    },
  });

  // Vincular unidade ao ponto criado
  await prisma.unidadeRede.update({
    where: { id: unidadeId },
    data: { indicacaoId: indicacao.id },
  });

  return NextResponse.json({ indicacao }, { status: 201 });
}