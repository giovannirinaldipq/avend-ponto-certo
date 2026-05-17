"use client";

import { useState } from "react";
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
  createdAt: string;
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

export default function ParceriasPage() {
  const { data, isLoading, mutate } = useSWR<{ parcerias: Parceria[] }>("/api/parcerias", fetcher);
  const [tab, setTab] = useState<"GERAL" | "REDE">("GERAL");
  const [selected, setSelected] = useState<Parceria | null>(null);
  const [unidadeForm, setUnidadeForm] = useState({ nome: "", endereco: "", cidade: "", estado: "" });
  const [notaForm, setNotaForm] = useState({ tipo: "NOTA", mensagem: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const parcerias = data?.parcerias?.filter((p) => p.tipo === tab) || [];

  async function updateStatus(id: string, status: string) {
    setActionLoading(true);
    await fetch(`/api/parcerias/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setActionLoading(false);
    mutate();
    if (selected?.id === id) setSelected({ ...selected!, status });
  }

  async function addUnidade(parceriaId: string) {
    if (!unidadeForm.nome || !unidadeForm.endereco || !unidadeForm.cidade || !unidadeForm.estado) return;
    setActionLoading(true);
    await fetch(`/api/parcerias/${parceriaId}/unidades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(unidadeForm),
    });
    setUnidadeForm({ nome: "", endereco: "", cidade: "", estado: "" });
    setActionLoading(false);
    mutate();
  }

  async function criarPonto(parceriaId: string, unidadeId: string) {
    setActionLoading(true);
    await fetch(`/api/parcerias/${parceriaId}/unidades/${unidadeId}/criar-ponto`, { method: "POST" });
    setActionLoading(false);
    mutate();
  }

  async function addNota(parceriaId: string) {
    if (!notaForm.mensagem.trim()) return;
    setActionLoading(true);
    await fetch(`/api/parcerias/${parceriaId}/historico`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notaForm),
    });
    setNotaForm({ tipo: "NOTA", mensagem: "" });
    setActionLoading(false);
    mutate();
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-zinc-200 rounded-lg"></div>
        <div className="h-12 w-64 bg-zinc-100 rounded-lg"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="card p-5 h-20"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-navy">Parcerias</h1>
        <p className="text-sm text-muted mt-0.5">Gestão de parcerias comerciais e redes escaláveis</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => { setTab("GERAL"); setSelected(null); }}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === "GERAL" ? "bg-primary/10 text-primary-dark" : "text-muted hover:bg-zinc-100"}`}
        >
          Parceiros Gerais
        </button>
        <button
          onClick={() => { setTab("REDE"); setSelected(null); }}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === "REDE" ? "bg-primary/10 text-primary-dark" : "text-muted hover:bg-zinc-100"}`}
        >
          Redes Escaláveis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lista */}
        <div className="lg:col-span-2 space-y-3">
          {parcerias.length === 0 && (
            <p className="text-sm text-muted py-8 text-center">Nenhuma parceria {tab === "GERAL" ? "geral" : "de rede"} cadastrada.</p>
          )}
          {parcerias.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelected(p)}
              className={`card p-4 cursor-pointer transition-all hover:shadow-md ${selected?.id === p.id ? "ring-2 ring-primary/30" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-navy">{p.nomeEmpresa}</p>
                  <p className="text-xs text-muted">{p.nomeContato} · {p.email}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${PARCERIA_STATUS_BADGE[p.status]}`}>
                    {PARCERIA_STATUS_LABELS[p.status]}
                  </span>
                  {p.tipo === "REDE" && p.numUnidades && (
                    <p className="text-[10px] text-muted mt-1">{p.numUnidades} unidades est.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detalhe */}
        <div className="space-y-4">
          {selected ? (
            <>
              <div className="card p-5 space-y-3">
                <h3 className="font-semibold text-navy">{selected.nomeEmpresa}</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between"><dt className="text-muted">Contato</dt><dd className="text-navy">{selected.nomeContato}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Email</dt><dd className="text-navy">{selected.email}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Telefone</dt><dd className="text-navy">{selected.telefone}</dd></div>
                  {selected.numUnidades && <div className="flex justify-between"><dt className="text-muted">Unidades</dt><dd className="text-navy">{selected.numUnidades}</dd></div>}
                  {selected.descricao && <div><dt className="text-muted text-xs">Descrição</dt><dd className="text-navy text-xs mt-1">{selected.descricao}</dd></div>}
                </dl>

                {/* Status Actions */}
                <div className="pt-3 border-t border-border space-y-2">
                  <p className="text-xs font-medium text-muted uppercase tracking-wider">Avançar Status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_FLOW.map((s) => (
                      <button
                        key={s}
                        disabled={actionLoading || selected.status === s}
                        onClick={() => updateStatus(selected.id, s)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                          selected.status === s
                            ? "bg-primary/20 text-primary-dark"
                            : "bg-zinc-100 text-muted hover:bg-zinc-200"
                        }`}
                      >
                        {PARCERIA_STATUS_LABELS[s]}
                      </button>
                    ))}
                    <button
                      disabled={actionLoading || selected.status === "RECUSADO"}
                      onClick={() => updateStatus(selected.id, "RECUSADO")}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              </div>

              {/* Unidades (só para redes ativas) */}
              {selected.tipo === "REDE" && selected.status === "ATIVO" && (
                <div className="card p-5 space-y-4">
                  <h3 className="font-semibold text-navy text-sm">Unidades Liberadas</h3>

                  {selected.unidades.length > 0 && (
                    <div className="space-y-2">
                      {selected.unidades.map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-navy">{u.nome}</p>
                            <p className="text-xs text-muted">{u.cidade}/{u.estado}</p>
                          </div>
                          {u.indicacaoId ? (
                            <span className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">No pipeline</span>
                          ) : (
                            <button
                              onClick={() => criarPonto(selected.id, u.id)}
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

                  {/* Form nova unidade */}
                  <div className="pt-3 border-t border-border space-y-2">
                    <p className="text-xs font-medium text-muted uppercase tracking-wider">Adicionar Unidade</p>
                    <input
                      type="text"
                      placeholder="Nome da unidade"
                      value={unidadeForm.nome}
                      onChange={(e) => setUnidadeForm({ ...unidadeForm, nome: e.target.value })}
                      className="input-field text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Endereço"
                      value={unidadeForm.endereco}
                      onChange={(e) => setUnidadeForm({ ...unidadeForm, endereco: e.target.value })}
                      className="input-field text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Cidade"
                        value={unidadeForm.cidade}
                        onChange={(e) => setUnidadeForm({ ...unidadeForm, cidade: e.target.value })}
                        className="input-field text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Estado"
                        value={unidadeForm.estado}
                        onChange={(e) => setUnidadeForm({ ...unidadeForm, estado: e.target.value })}
                        className="input-field text-sm"
                      />
                    </div>
                    <button
                      onClick={() => addUnidade(selected.id)}
                      disabled={actionLoading}
                      className="btn-primary w-full text-sm"
                    >
                      Adicionar unidade
                    </button>
                  </div>
                </div>
              )}

              {/* Histórico / Notas */}
              <div className="card p-5 space-y-4">
                <h3 className="font-semibold text-navy text-sm">Histórico</h3>

                {/* Form nova nota */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={notaForm.tipo}
                      onChange={(e) => setNotaForm({ ...notaForm, tipo: e.target.value })}
                      className="input-field text-xs w-auto"
                    >
                      <option value="NOTA">Nota</option>
                      <option value="LIGACAO">Ligação</option>
                      <option value="REUNIAO">Reunião</option>
                      <option value="EMAIL">Email</option>
                      <option value="WHATSAPP">WhatsApp</option>
                    </select>
                  </div>
                  <textarea
                    value={notaForm.mensagem}
                    onChange={(e) => setNotaForm({ ...notaForm, mensagem: e.target.value })}
                    placeholder="Registrar atualização sobre esta parceria..."
                    className="input-field text-sm min-h-[60px]"
                  />
                  <button
                    onClick={() => addNota(selected.id)}
                    disabled={actionLoading || !notaForm.mensagem.trim()}
                    className="btn-primary w-full text-sm disabled:opacity-40"
                  >
                    Adicionar registro
                  </button>
                </div>

                {/* Timeline */}
                {selected.historico && selected.historico.length > 0 && (
                  <div className="pt-3 border-t border-border space-y-3">
                    {selected.historico.map((h) => {
                      const tipoIcons: Record<string, string> = {
                        NOTA: "📝", LIGACAO: "📞", REUNIAO: "🤝", EMAIL: "📧", WHATSAPP: "💬", STATUS: "🔄"
                      };
                      return (
                        <div key={h.id} className="flex gap-3">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-xs">
                            {tipoIcons[h.tipo] || "📝"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-navy">{h.mensagem}</p>
                            <p className="text-[10px] text-muted mt-0.5">
                              {new Date(h.createdAt).toLocaleDateString("pt-BR")} às {new Date(h.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {(!selected.historico || selected.historico.length === 0) && (
                  <p className="text-xs text-muted text-center py-2">Nenhum registro ainda.</p>
                )}
              </div>
            </>
          ) : (
            <div className="card p-5 text-center">
              <p className="text-sm text-muted">Selecione uma parceria para ver detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}