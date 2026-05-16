import { prisma } from "@/lib/db";

export async function criarNotificacao({
  userId,
  tipo,
  titulo,
  mensagem,
  link,
}: {
  userId: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  link?: string;
}) {
  return prisma.notificacao.create({
    data: { userId, tipo, titulo, mensagem, link },
  });
}

export async function notificarStatusAlterado(
  indicadorId: string,
  nomeEstabelecimento: string,
  novoStatus: string,
  indicacaoId: string
) {
  const statusLabels: Record<string, string> = {
    INDICADO: "Indicado",
    EM_ANALISE: "Em Análise",
    AGUARDANDO_FRANQUEADO: "Aguardando Franqueado",
    EM_NEGOCIACAO: "Em Negociação",
    INSTALADO: "Instalado",
    ATIVO: "Ativo",
    RECUSADO: "Recusado",
  };

  await criarNotificacao({
    userId: indicadorId,
    tipo: "STATUS_ALTERADO",
    titulo: `${nomeEstabelecimento} avançou no pipeline`,
    mensagem: `O status foi alterado para "${statusLabels[novoStatus] || novoStatus}"`,
    link: `/indicacoes/${indicacaoId}`,
  });
}

export async function notificarPagamento(
  indicadorId: string,
  nomeEstabelecimento: string,
  valor: number
) {
  await criarNotificacao({
    userId: indicadorId,
    tipo: "PAGAMENTO",
    titulo: `Pagamento registrado`,
    mensagem: `R$ ${valor.toFixed(2)} referente a ${nomeEstabelecimento}`,
    link: `/financeiro`,
  });
}
