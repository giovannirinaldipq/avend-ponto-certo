import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo") || "pipeline";

  if (tipo === "pipeline") {
    const indicacoes = await prisma.indicacao.findMany({
      include: { indicador: { select: { nome: true, email: true, tier: true } } },
      orderBy: { createdAt: "desc" },
    });

    const statusLabels: Record<string, string> = {
      INDICADO: "Indicado", EM_ANALISE: "Em Análise", AGUARDANDO_FRANQUEADO: "Aguardando Franqueado",
      EM_NEGOCIACAO: "Em Negociação", INSTALADO: "Instalado", ATIVO: "Ativo", RECUSADO: "Recusado",
    };

    const header = "Estabelecimento;Endereço;Cidade;Estado;Tipo;Score;Status;Captador;Tier;Data Cadastro;Data Instalação;Faturamento Mensal\n";
    const rows = indicacoes.map((i) =>
      [
        i.nomeEstabelecimento,
        i.endereco,
        i.cidade,
        i.estado,
        i.tipoLocal,
        i.score,
        statusLabels[i.status] || i.status,
        i.indicador.nome,
        i.indicador.tier,
        new Date(i.createdAt).toLocaleDateString("pt-BR"),
        i.dataInstalacao ? new Date(i.dataInstalacao).toLocaleDateString("pt-BR") : "",
        i.faturamentoMensal || "",
      ].join(";")
    ).join("\n");

    const csv = header + rows;
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="pipeline_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  if (tipo === "financeiro") {
    const pagamentos = await prisma.pagamento.findMany({
      include: {
        indicacao: { select: { nomeEstabelecimento: true, cidade: true } },
        indicador: { select: { nome: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const header = "Ponto;Cidade;Captador;Tipo;Valor;Status;Data Pagamento\n";
    const rows = pagamentos.map((p) =>
      [
        p.indicacao.nomeEstabelecimento,
        p.indicacao.cidade,
        p.indicador.nome,
        p.tipo === "BONUS_INCLUSAO" ? "Bônus" : "Recorrência",
        p.valor.toFixed(2).replace(".", ","),
        p.pago ? "Pago" : "Pendente",
        p.dataPagamento ? new Date(p.dataPagamento).toLocaleDateString("pt-BR") : "",
      ].join(";")
    ).join("\n");

    const csv = header + rows;
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="financeiro_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  if (tipo === "indicadores") {
    const indicadores = await prisma.user.findMany({
      where: { role: "INDICADOR" },
      include: { _count: { select: { indicacoes: true } } },
      orderBy: { createdAt: "desc" },
    });

    const header = "Nome;Email;Telefone;CPF/CNPJ;Tier;PIX;Indicações;Data Cadastro\n";
    const rows = indicadores.map((i) =>
      [
        i.nome,
        i.email,
        i.telefone,
        i.cpfCnpj,
        i.tier,
        i.chavePix || "",
        i._count.indicacoes,
        new Date(i.createdAt).toLocaleDateString("pt-BR"),
      ].join(";")
    ).join("\n");

    const csv = header + rows;
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="captadores_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({ error: "Tipo de relatório inválido" }, { status: 400 });
}
