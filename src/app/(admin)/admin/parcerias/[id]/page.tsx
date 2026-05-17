"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { PARCERIA_STATUS_LABELS, PARCERIA_STATUS_BADGE } from "@/lib/constants";

type UnidadeRede = {
  id: string;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  indicacaoId: string | null;
};

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
  unidades: UnidadeRede[];
  historico: HistoricoItem[];
};

const STATUS_FLOW = ["NOVO", "CONTATO", "NEGOCIACAO", "CONTRATO", "ATIVO"];
const TIPO_ICONS: Record<string, string> = { NOTA: "📝", LIGACAO: "📞", REUNIAO: "🤝", EMAIL: "📧", WHATSAPP: "💬", STATUS: "🔄" };
const NOTA_TIPOS = [
  { value: "NOTA", label: "Nota" },
  { value: "LIGACAO", label: "Ligação" },
  { value: "REUNIAO", label: "Reunião" },
  { value: "EMAIL", label: "E-mail" },
  { value: "WHATSAPP", label: "WhatsApp" },
];

export default function ParceriaDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const { data, isLoading, mutate } = useSWR<{ parceria: Parceria }>(`/api/parcerias/${params.id}`, fetcher);
  const [notaForm, setNotaForm] = useState({ tipo: "NOTA", mensagem: "" });
  const [unidadeForm, setUnidadeForm] = useState({ nome: "", endereco: "", cidade: "", estado: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const parceria = data?.parceria;

  async function updateStatus(status: string) {
    setActionLoading(true);
    await fetch(`/api/parcerias/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setActionLoading(false);
    mutate();
  }

  async function addNota() {
    if (!notaForm.mensagem.trim()) return;
    setActionLoading(true);
    await fetch(`/api/parcerias/${params.id}/historico`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notaForm),
    });
    setNotaForm({ tipo: "NOTA", mensagem: "" });
    setActionLoading(false);
    mutate();
  }

  async function addUnidade() {
    if (!unidadeForm.nome || !unidadeForm.endereco || !unidadeForm.cidade || !unidadeForm.estado) return;
    setActionLoading(true);
    await fetch(`/api/parcerias/${params.id}/unidades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(unidadeForm),
    });
    setUnidadeForm({ nome: "", endereco: "", cidade: "", estado: "" });
    setActionLoading(false);
    mutate();
  }

  async function criarPonto(unidadeId: string) {
    setActionLoading(true);
    await fetch(`/api/parcerias/${params.id}/unidades/${unidadeId}/criar-ponto`, { method: "POST" });
    setActionLoading(false);
    mutate();
  }

  if (isLoading || !parceria) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse space-y-4">
        <div className="h-8 w-64 bg-zinc-200 rounded-lg"></div>
        <div className="h-48 bg-zinc-100 rounded-2xl"></div>
        <div className="h-48 bg-zinc-100 rounded-2xl"></div>
      </div>
    );
  }

  const currentIdx = STATUS_FLOW.indexOf(parceria.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <button onClick={() => router.push("/admin/parcerias")} className="text-sm text-muted hover:text-navy transition-colors">&larr; Voltar para parcerias</button>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-navy">{parceria.nomeEmpresa}</h1>
            <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 text-muted font-medium">
              {parceria.tipo === "REDE" ? "Pontos em Escala" : "Parceria Geral"}
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
          <a
            href={`https://wa.me/55${parceria.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${parceria.nomeContato}, sou da AVEND e gostaria de conversar sobre a parceria com ${parceria.nomeEmpresa}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs flex items-center gap-2 w-full justify-center mt-3"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp do Contato
          </a>
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

      {/* Atualizar Status */}
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-navy">Atualizar Status</h3>
        <div className="flex flex-wrap gap-2">
          {STATUS_FLOW.map((s) => (
            <button
              key={s}
              disabled={actionLoading || parceria.status === s}
              onClick={() => updateStatus(s)}
              className={`px-4 py-2 text-xs font-medium rounded-lg border transition-all ${
                parceria.status === s
                  ? "border-primary bg-primary/10 text-primary-dark"
                  : "border-border text-muted hover:border-secondary/30 hover:bg-zinc-50"
              }`}
            >
              {PARCERIA_STATUS_LABELS[s]}
            </button>
          ))}
          <button
            disabled={actionLoading || parceria.status === "RECUSADO"}
            onClick={() => updateStatus("RECUSADO")}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-all"
          >
            Recusar
          </button>
        </div>
      </div>

      {/* Unidades (só para redes) */}
      {parceria.tipo === "REDE" && parceria.status === "ATIVO" && (
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-navy">Unidades Liberadas</h3>

          {parceria.unidades.length > 0 && (
            <div className="space-y-2">
              {parceria.unidades.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-navy">{u.nome}</p>
                    <p className="text-xs text-muted">{u.endereco} — {u.cidade}/{u.estado}</p>
                  </div>
                  {u.indicacaoId ? (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">No pipeline</span>
                  ) : (
                    <button
                      onClick={() => criarPonto(u.id)}
                      disabled={actionLoading}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium bg-primary/10 text-primary-dark hover:bg-primary/20"
                    >
                      Criar ponto
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-border space-y-2">
            <p className="text-xs font-medium text-muted uppercase tracking-wider">Adicionar Unidade</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input type="text" placeholder="Nome da unidade" value={unidadeForm.nome} onChange={(e) => setUnidadeForm({ ...unidadeForm, nome: e.target.value })} className="input-field text-sm" />
              <input type="text" placeholder="Endereço" value={unidadeForm.endereco} onChange={(e) => setUnidadeForm({ ...unidadeForm, endereco: e.target.value })} className="input-field text-sm" />
              <input type="text" placeholder="Cidade" value={unidadeForm.cidade} onChange={(e) => setUnidadeForm({ ...unidadeForm, cidade: e.target.value })} className="input-field text-sm" />
              <input type="text" placeholder="Estado (UF)" value={unidadeForm.estado} onChange={(e) => setUnidadeForm({ ...unidadeForm, estado: e.target.value })} className="input-field text-sm" />
            </div>
            <button onClick={addUnidade} disabled={actionLoading} className="btn-primary text-sm">
              Adicionar unidade
            </button>
          </div>
        </div>
      )}

      {/* Histórico */}
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-navy">Histórico e Comunicação</h3>

        <form onSubmit={(e) => { e.preventDefault(); addNota(); }} className="space-y-3 pb-4 border-b border-border">
          <div className="flex gap-2">
            <select value={notaForm.tipo} onChange={(e) => setNotaForm({ ...notaForm, tipo: e.target.value })} className="input-field w-auto text-sm">
              {NOTA_TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <span className="text-xs text-muted self-center">Registrar interação</span>
          </div>
          <textarea
            value={notaForm.mensagem}
            onChange={(e) => setNotaForm({ ...notaForm, mensagem: e.target.value })}
            placeholder="Descreva a comunicação, feedback ou observação..."
            rows={3}
            className="input-field text-sm resize-none"
          />
          <button type="submit" disabled={actionLoading || !notaForm.mensagem.trim()} className="btn-primary text-sm disabled:opacity-50">
            {actionLoading ? "Enviando..." : "Registrar"}
          </button>
        </form>

        {/* Timeline */}
        {parceria.historico.length > 0 ? (
          <div className="space-y-0 pt-2">
            {parceria.historico.map((h, idx) => (
              <div key={h.id} className="flex gap-3 relative" style={{ animationDelay: `${idx * 30}ms` }}>
                {idx < parceria.historico.length - 1 && (
                  <div className="absolute left-4 top-10 bottom-0 w-px bg-border"></div>
                )}
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 bg-white border border-border shadow-sm z-10">
                  {TIPO_ICONS[h.tipo] || "📝"}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-navy">{NOTA_TIPOS.find((t) => t.value === h.tipo)?.label || h.tipo}</span>
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
            <p className="text-sm text-muted">Nenhum registro ainda.</p>
            <p className="text-xs text-muted mt-1">Registre ligações, reuniões e notas sobre esta parceria.</p>
          </div>
        )}
      </div>
    </div>
  );
}