"use client";

import { useState } from "react";
import Link from "next/link";

export default function ParceriaRedePage() {
  const [form, setForm] = useState({ nomeEmpresa: "", nomeContato: "", email: "", telefone: "", numUnidades: "", descricao: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/parcerias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tipo: "REDE",
        numUnidades: form.numUnidades ? parseInt(form.numUnidades) : null,
      }),
    });

    setLoading(false);
    if (res.ok) {
      setSuccess(true);
    } else {
      const data = await res.json();
      setError(data.error || "Erro ao enviar. Tente novamente.");
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full gradient-brand flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-navy">Proposta recebida!</h1>
          <p className="text-sm text-muted">Nossa equipe de expansão entrará em contato para discutir a instalação nas unidades da sua rede.</p>
          <Link href="/" className="btn-primary inline-block mt-4">Voltar ao início</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50">
      <div className="card p-8 max-w-lg w-full space-y-6">
        <div className="text-center">
          <Link href="/" className="text-lg font-bold text-navy tracking-tight">Radar <span className="text-primary font-normal text-sm">by Avend</span></Link>
          <h1 className="text-2xl font-bold text-navy mt-4">Tenho uma rede</h1>
          <p className="text-sm text-muted mt-1">Instale máquinas de vending em todas as suas unidades</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Nome da rede *</label>
            <input
              type="text"
              required
              value={form.nomeEmpresa}
              onChange={(e) => setForm({ ...form, nomeEmpresa: e.target.value })}
              className="input-field"
              placeholder="Ex: SmartFit, Unimed, Rede D'Or"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Nome do contato *</label>
            <input
              type="text"
              required
              value={form.nomeContato}
              onChange={(e) => setForm({ ...form, nomeContato: e.target.value })}
              className="input-field"
              placeholder="Seu nome completo"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="contato@rede.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Telefone *</label>
              <input
                type="tel"
                required
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                className="input-field"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Número estimado de unidades</label>
            <input
              type="number"
              min="1"
              value={form.numUnidades}
              onChange={(e) => setForm({ ...form, numUnidades: e.target.value })}
              className="input-field"
              placeholder="Ex: 50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Regiões de interesse / Descrição</label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className="input-field min-h-[80px]"
              placeholder="Em quais cidades/estados estão suas unidades? Alguma informação adicional..."
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Enviando..." : "Enviar proposta"}
          </button>
        </form>

        <p className="text-xs text-muted text-center">
          Quer colocar seus produtos nas máquinas? <Link href="/parceria" className="text-primary font-medium hover:underline">Clique aqui</Link>
        </p>
      </div>
    </div>
  );
}