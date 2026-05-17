"use client";

import { useState } from "react";
import Link from "next/link";
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
};

export default function ParceriasCaptadorPage() {
  const { data, isLoading, mutate } = useSWR<{ parcerias: Parceria[] }>("/api/parcerias", fetcher);
  const [showForm, setShowForm] = useState(false);
  const [tipo, setTipo] = useState<"GERAL" | "REDE">("GERAL");
  const [form, setForm] = useState({ nomeEmpresa: "", nomeContato: "", email: "", telefone: "", descricao: "", numUnidades: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const parcerias = data?.parcerias || [];

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

      {/* FormulÃ¡rio */}
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
                  Rede EscalÃ¡vel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">{tipo === "REDE" ? "Nome da rede" : "Nome da empresa"} *</label>
                  <input type="text" required value={form.nomeEmpresa} onChange={(e) => setForm({ ...form, nomeEmpresa: e.target.value })} className="input-field" placeholder={tipo === "REDE" ? "Ex: SmartFit" : "Ex: Bold Snacks"} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Nome do contato *</label>
                  <input type="text" required value={form.nomeContato} onChange={(e) => setForm({ ...form, nomeContato: e.target.value })} className="input-field" placeholder="Pessoa de referÃªncia" />
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
                  <label className="block text-sm font-medium text-navy mb-1">NÃºmero estimado de unidades</label>
                  <input type="number" min="1" value={form.numUnidades} onChange={(e) => setForm({ ...form, numUnidades: e.target.value })} className="input-field w-32" placeholder="Ex: 50" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-navy mb-1">DescriÃ§Ã£o</label>
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
          <p className="text-sm text-muted">VocÃª ainda nÃ£o indicou nenhuma parceria.</p>
          <p className="text-xs text-muted mt-1">Conhece uma marca ou rede que combina com vending? Cadastre aqui!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {parcerias.map((p) => (
            <Link
              key={p.id}
              href={`/parcerias/${p.id}`}
              className="card p-4 block transition-all hover:shadow-md hover:border-primary/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-navy">{p.nomeEmpresa}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-muted font-medium">
                      {p.tipo === "REDE" ? "Rede" : "Geral"}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">{p.nomeContato} Â· {p.email}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${PARCERIA_STATUS_BADGE[p.status]}`}>
                      {PARCERIA_STATUS_LABELS[p.status]}
                    </span>
                    <p className="text-[10px] text-muted mt-1">{new Date(p.createdAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
