import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

type Atividade = {
  id: string;
  tipo: "INDICACAO_CRIADA" | "STATUS_ALTERADO" | "PAGAMENTO";
  titulo: string;
  subtitulo: string;
  data: string;
  cor: string;
};

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const where = session.role === "INDICADOR" ? { indicadorId: session.id } : {};

  const [indicacoesRecentes, pagamentosRecentes] = await Promise.all([
    prisma.indicacao.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 15,
      select: {
        id: true,
        nomeEstabelecimento: true,
        cidade: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        indicador: { select: { nome: true } },
      },
    }),
    prisma.pagamento.findMany({
      where: session.role === "INDICADOR" ? { indicadorId: session.id } : {},
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        tipo: true,
        valor: true,
        createdAt: true,
        indicacao: { select: { nomeEstabelecimento: true } },
        indicador: { select: { nome: true } },
      },
    }),
  ]);

  const atividades: Atividade[] = [];

  for (const ind of indicacoesRecentes) {
    const isNew = new Date(ind.updatedAt).getTime() - new Date(ind.createdAt).getTime() < 60000;
    if (isNew) {
      atividades.push({
        id: `ind-new-${ind.id}`,
        tipo: "INDICACAO_CRIADA",
        titulo: `${ind.indicador.nome} indicou ${ind.nomeEstabelecimento}`,
        subtitulo: ind.cidade,
        data: ind.createdAt.toISOString(),
        cor: "#4040bf",
      });
    } else {
      const statusLabels: Record<string, string> = {
        INDICADO: "Indicado", EM_ANALISE: "Em Análise", AGUARDANDO_FRANQUEADO: "Aguardando Franqueado",
        EM_NEGOCIACAO: "Em Negociação", INSTALADO: "Instalado", ATIVO: "Ativo", RECUSADO: "Recusado",
      };
      atividades.push({
        id: `ind-upd-${ind.id}`,
        tipo: "STATUS_ALTERADO",
        titulo: `${ind.nomeEstabelecimento} → ${statusLabels[ind.status] || ind.status}`,
        subtitulo: `por ${ind.indicador.nome}`,
        data: ind.updatedAt.toISOString(),
        cor: ind.status === "ATIVO" || ind.status === "INSTALADO" ? "#00e5c8" : ind.status === "RECUSADO" ? "#dc3545" : "#8b2fc9",
      });
    }
  }

  for (const pag of pagamentosRecentes) {
    atividades.push({
      id: `pag-${pag.id}`,
      tipo: "PAGAMENTO",
      titulo: `Pagamento R$ ${pag.valor.toFixed(2)} — ${pag.indicacao.nomeEstabelecimento}`,
      subtitulo: `para ${pag.indicador.nome}`,
      data: pag.createdAt.toISOString(),
      cor: "#00c4ab",
    });
  }

  atividades.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  return NextResponse.json({ atividades: atividades.slice(0, 20) });
}
