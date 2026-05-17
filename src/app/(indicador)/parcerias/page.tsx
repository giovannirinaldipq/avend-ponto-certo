"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { PARCERIA_STATUS_LABELS, PARCERIA_STATUS_BADGE } from "@/lib/constants";

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
  historico: { id: string; tipo: string; mensagem: string; createdAt: string }[];
};

export default function ParceriasCaptadorPage() {
  const { data, isLoading, mutate } = useSWR<{ parcerias: Parceria[] }>("/api/parcerias", fetcher);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Parceria | null>(null);
  const [tipo, setTipo] = useState<"GERAL" | "REDE">("GERAL");
  const [form, setForm] = useState({ nomeEmpresa: "", nomeContato: "", email: "", telefone: "", descricao: "", numUnidades: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/parcerias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tipo,
        numUnidades: form.numUnidades ? parseInt(form.numUnidades) : null,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setForm({ nomeEmpresa: "", nomeContato: "", email: "", telefone: "", descricao: "", numUnidades: "" });
      setTimeout(() => { setSuccess(false); setShowForm(false); }, 2000);
      mutate();
    }
  }

  const parcerias = data?.parcerias || [];

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse max-w-4xl mx-auto">
        <div className="h-8 w-48 bg-zinc-200 rounded-lg"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="card p-5 h-20"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-navy">Parcerias</h1>
          <p className="text-sm text-muted mt-0.5">Indique empresas e redes para parceria com a AVEND</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? "Cancelar" : "Nova Parceria"}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="card p-6 space-y-4 animate-fade-in">
          {success ? (
            <div className="text-center py-4">
              <p className="text-sm font-medium text-green-700">Parceria cadastrada com sucesso! A equipe AVEND vai analisar.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTipo("GERAL")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tipo === "GERAL" ? "bg-primary/10 text-primary-dark" : "text-muted hover:bg-zinc-100"}`}
                >
                  Parceiro Geral
                </button>
                <button
                  type="button"
                  onClick={() => setTipo("REDE")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tipo === "REDE" ? "bg-primary/10 text-primary-dark" : "text-muted hover:bg-zinc-100"}`}
                >
                  Rede Escalável
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">{tipo === "REDE" ? "Nome da rede" : "Nome da empresa"} *</label>
                  <input type="text" required value={form.nomeEmpresa} onChange={(e) => setForm({ ...form, nomeEmpresa: e.target.value })} className="input-field" placeholder={tipo === "REDE" ? "Ex: SmartFit" : "Ex: Bold Snacks"} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Nome do contato *</label>
                  <input type="text" required value={form.nomeContato} onChange={(e) => setForm({ ...form, nomeContato: e.target.value })} className="input-field" placeholder="Pessoa de referência" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Email *</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="contato@empresa.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Telefone *</label>
                  <input type="tel" required value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} className="input-field" placeholder="(11) 99999-9999" />
                </div>
              </div>

              {tipo === "REDE" && (
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Número estimado de unidades</label>
                  <input type="number" min="1" value={form.numUnidades} onChange={(e) => setForm({ ...form, numUnidades: e.target.value })} className="input-field w-32" placeholder="Ex: 50" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-navy mb-1">Descrição</label>
                <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className="input-field min-h-[60px]" placeholder="Contexto sobre a parceria, como conhece a empresa..." />
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Enviando..." : "Cadastrar parceria"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Lista */}
      {parcerias.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-muted">Você ainda não indicou nenhuma parceria.</p>
          <p className="text-xs text-muted mt-1">Conhece uma marca ou rede que combina com vending? Cadastre aqui!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Lista de parcerias */}
          <div className="lg:col-span-2 space-y-3">
            {parcerias.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelected(p)}
                className={`card p-4 cursor-pointer transition-all hover:shadow-md ${selected?.id === p.id ? "ring-2 ring-primary/30" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-navy">{p.nomeEmpresa}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-muted font-medium">
                        {p.tipo === "REDE" ? "Rede" : "Geral"}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">{p.nomeContato} · {p.email}</p>
                    {p.descricao && <p className="text-xs text-muted mt-1 line-clamp-1">{p.descricao}</p>}
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${PARCERIA_STATUS_BADGE[p.status]}`}>
                      {PARCERIA_STATUS_LABELS[p.status]}
                    </span>
                    <p className="text-[10px] text-muted mt-1">{new Date(p.createdAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Painel de detalhes */}
          <div>
            {selected ? (
              <div className="card p-5 space-y-4 sticky top-4">
                <div>
                  <h3 className="font-semibold text-navy">{selected.nomeEmpresa}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-muted font-medium">
                    {selected.tipo === "REDE" ? "Rede Escalável" : "Parceiro Geral"}
                  </span>
                </div>

                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between"><dt className="text-muted">Contato</dt><dd className="text-navy">{selected.nomeContato}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Email</dt><dd className="text-navy text-xs">{selected.email}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Telefone</dt><dd className="text-navy">{selected.telefone}</dd></div>
                  {selected.numUnidades && <div className="flex justify-between"><dt className="text-muted">Unidades est.</dt><dd className="text-navy">{selected.numUnidades}</dd></div>}
                  <div className="flex justify-between"><dt className="text-muted">Cadastrada em</dt><dd className="text-navy">{new Date(selected.createdAt).toLocaleDateString("pt-BR")}</dd></div>
                </dl>

                {selected.descricao && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted font-medium mb-1">Descrição</p>
                    <p className="text-xs text-navy">{selected.descricao}</p>
                  </div>
                )}

                {/* Timeline do funil */}
                <div className="pt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted uppercase tracking-wider mb-3">Progresso</p>
                  <div className="space-y-2">
                    {["NOVO", "CONTATO", "NEGOCIACAO", "CONTRATO", "ATIVO"].map((step, idx) => {
                      const stepLabels: Record<string, string> = { NOVO: "Cadastrado", CONTATO: "Em contato", NEGOCIACAO: "Negociação", CONTRATO: "Contrato", ATIVO: "Ativo" };
                      const currentIdx = ["NOVO", "CONTATO", "NEGOCIACAO", "CONTRATO", "ATIVO"].indexOf(selected.status);
                      const isCompleted = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;
                      return (
                        <div key={step} className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCompleted ? "bg-primary/20" : "bg-zinc-100"
                          }`}>
                            {isCompleted ? (
                              <svg className="w-3.5 h-3.5 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
                            )}
                          </div>
                          <span className={`text-xs ${isCurrent ? "font-semibold text-primary-dark" : isCompleted ? "text-navy" : "text-muted"}`}>
                            {stepLabels[step]}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary-dark font-medium">Atual</span>
                          )}
                        </div>
                      );
                    })}
                    {selected.status === "RECUSADO" && (
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100">
                          <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <span className="text-xs font-semibold text-red-600">Recusado</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Histórico */}
                {selected.historico && selected.historico.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs font-medium text-muted uppercase tracking-wider mb-3">Atualizações</p>
                    <div className="space-y-3">
                      {selected.historico.map((h) => {
                        const tipoIcons: Record<string, string> = {
                          NOTA: "📝", LIGACAO: "📞", REUNIAO: "🤝", EMAIL: "📧", WHATSAPP: "💬", STATUS: "🔄"
                        };
                        return (
                          <div key={h.id} className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-[10px]">
                              {tipoIcons[h.tipo] || "📝"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-navy">{h.mensagem}</p>
                              <p className="text-[10px] text-muted mt-0.5">
                                {new Date(h.createdAt).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card p-5 text-center">
                <p className="text-sm text-muted">Clique numa parceria para ver detalhes e acompanhar o progresso</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}