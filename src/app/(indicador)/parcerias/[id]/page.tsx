"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { PARCERIA_STATUS_LABELS, PARCERIA_STATUS_BADGE } from "@/lib/constants";

type HistoricoItem = {
  id: string;
  tipo: string;
  mensagem: string;
  createdAt: string;
};

type Parceria = {
  id: string;
  tipo: string;
  nomeEmpresa: string;
  nomeContato: string;
  email: string;
  telefone: string;
  descricao: string | null;
  numUnidades: number | null;
  status: string;
  createdAt: string;
  historico: HistoricoItem[];
};

const STATUS_FLOW = ["NOVO", "CONTATO", "NEGOCIACAO", "CONTRATO", "ATIVO"];
const TIPO_ICONS: Record<string, string> = { NOTA: "📝", LIGACAO: "📞", REUNIAO: "🤝", EMAIL: "📧", WHATSAPP: "💬", STATUS: "🔄" };
const NOTA_LABELS: Record<string, string> = { NOTA: "Nota", LIGACAO: "Ligação", REUNIAO: "Reunião", EMAIL: "E-mail", WHATSAPP: "WhatsApp", STATUS: "Status" };

export default function ParceriaDetalheCaptadorPage() {
  const params = useParams();
  const router = useRouter();
  const { data, isLoading } = useSWR<{ parceria: Parceria }>(`/api/parcerias/${params.id}`, fetcher);

  const parceria = data?.parceria;

  if (isLoading || !parceria) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse space-y-4">
        <div className="h-8 w-64 bg-zinc-200 rounded-lg"></div>
        <div className="h-48 bg-zinc-100 rounded-2xl"></div>
      </div>
    );
  }

  const currentIdx = STATUS_FLOW.indexOf(parceria.status);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <button onClick={() => router.push("/parcerias")} className="text-sm text-muted hover:text-navy transition-colors">&larr; Voltar para parcerias</button>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-navy">{parceria.nomeEmpresa}</h1>
            <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 text-muted font-medium">
              {parceria.tipo === "REDE" ? "Rede Escalável" : "Parceiro Geral"}
            </span>
          </div>
          <p className="text-sm text-muted mt-1">Cadastrada em {new Date(parceria.createdAt).toLocaleDateString("pt-BR")}</p>
        </div>
        <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${PARCERIA_STATUS_BADGE[parceria.status]}`}>
          {PARCERIA_STATUS_LABELS[parceria.status]}
        </span>
      </div>

      {/* Grid: Dados + Progresso */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-navy text-sm">Dados da Empresa</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Contato</dt><dd className="text-navy font-medium">{parceria.nomeContato}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Email</dt><dd className="text-navy">{parceria.email}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Telefone</dt><dd className="text-navy">{parceria.telefone}</dd></div>
            {parceria.numUnidades && <div className="flex justify-between"><dt className="text-muted">Unidades estimadas</dt><dd className="text-navy font-medium">{parceria.numUnidades}</dd></div>}
          </dl>
          {parceria.descricao && (
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted font-medium mb-1">Descrição</p>
              <p className="text-sm text-navy">{parceria.descricao}</p>
            </div>
          )}
        </div>

        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-navy text-sm">Progresso no Funil</h3>
          <div className="space-y-3">
            {STATUS_FLOW.map((step, idx) => {
              const isCompleted = idx <= currentIdx && parceria.status !== "RECUSADO";
              const isCurrent = idx === currentIdx && parceria.status !== "RECUSADO";
              return (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? "bg-primary/20 border-2 border-primary/40" : "bg-zinc-100 border-2 border-zinc-200"
                  }`}>
                    {isCompleted ? (
                      <svg className="w-4 h-4 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
                    )}
                  </div>
                  <span className={`text-sm ${isCurrent ? "font-bold text-primary-dark" : isCompleted ? "font-medium text-navy" : "text-muted"}`}>
                    {PARCERIA_STATUS_LABELS[step]}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary-dark font-medium">Atual</span>
                  )}
                </div>
              );
            })}
            {parceria.status === "RECUSADO" && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100 border-2 border-red-200">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-red-600">Recusado</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Histórico */}
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-navy">Atualizações</h3>

        {parceria.historico.length > 0 ? (
          <div className="space-y-0">
            {parceria.historico.map((h, idx) => (
              <div key={h.id} className="flex gap-3 relative">
                {idx < parceria.historico.length - 1 && (
                  <div className="absolute left-4 top-10 bottom-0 w-px bg-border"></div>
                )}
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 bg-white border border-border shadow-sm z-10">
                  {TIPO_ICONS[h.tipo] || "📝"}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-navy">{NOTA_LABELS[h.tipo] || h.tipo}</span>
                    <span className="text-[10px] text-muted ml-auto">
                      {new Date(h.createdAt).toLocaleDateString("pt-BR")} às {new Date(h.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{h.mensagem}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted">Nenhuma atualização registrada ainda.</p>
            <p className="text-xs text-muted mt-1">A equipe AVEND registrará o progresso aqui conforme a negociação avança.</p>
          </div>
        )}
      </div>
    </div>
  );
}