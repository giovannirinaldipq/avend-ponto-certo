"use client";

import { useEffect, useState } from "react";

type Indicacao = {
  id: string;
  nomeEstabelecimento: string;
  cidade: string;
  indicadorId: string;
  indicador: { nome: string };
};

type Pagamento = {
  id: string;
  tipo: string;
  valor: number;
  mesReferencia: string | null;
  pago: boolean;
  dataPagamento: string | null;
  comprovanteUrl: string | null;
  indicacao: { nomeEstabelecimento: string; cidade: string };
  indicador: { nome: string };
};

export default function AdminFinanceiroPage() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [indicacoesAtivas, setIndicacoesAtivas] = useState<Indicacao[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    indicacaoId: "",
    indicadorId: "",
    tipo: "BONUS_INCLUSAO",
    valor: "",
    mesReferencia: "",
    comprovanteUrl: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    fetch("/api/financeiro").then((r) => r.json()).then((d) => setPagamentos(d.pagamentos || []));
    fetch("/api/indicacoes?status=INSTALADO")
      .then((r) => r.json())
      .then((d) => setIndicacoesAtivas(d.indicacoes || []));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const selected = indicacoesAtivas.find((i) => i.id === form.indicacaoId);
    await fetch("/api/financeiro/pagamento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        indicacaoId: form.indicacaoId,
        indicadorId: selected?.indicadorId || "",
        tipo: form.tipo,
        valor: parseFloat(form.valor),
        mesReferencia: form.mesReferencia || null,
        comprovanteUrl: form.comprovanteUrl || null,
      }),
    });
    setSaving(false);
    setShowForm(false);
    setForm({ indicacaoId: "", indicadorId: "", tipo: "BONUS_INCLUSAO", valor: "", mesReferencia: "", comprovanteUrl: "" });
    loadData();
  }

  const totalPago = pagamentos.filter((p) => p.pago).reduce((s, p) => s + p.valor, 0);
  const totalPendente = pagamentos.filter((p) => !p.pago).reduce((s, p) => s + p.valor, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-navy">Financeiro</h1>
          <p className="text-sm text-muted mt-0.5">Gestão de pagamentos aos captadores</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={showForm ? "btn-secondary" : "btn-primary"}
        >
          {showForm ? "Cancelar" : "Registrar Pagamento"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-metric p-5 animate-fade-in">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Total Pago</p>
          <p className="text-2xl font-bold gradient-brand-text mt-1">
            R$ {totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="card-metric p-5 animate-fade-in">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Pendente</p>
          <p className="text-2xl font-bold text-secondary mt-1">
            R$ {totalPendente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="card-metric p-5 animate-fade-in">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Pagamentos</p>
          <p className="text-2xl font-bold text-navy mt-1">{pagamentos.length}</p>
          <p className="text-xs text-muted mt-1">{pagamentos.filter((p) => p.pago).length} confirmados</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 space-y-4 animate-fade-in">
          <h3 className="font-semibold text-navy">Novo Pagamento</h3>

          <div>
            <label className="text-sm text-muted mb-1">Ponto (instalado)</label>
            <select
              required
              value={form.indicacaoId}
              onChange={(e) => setForm((f) => ({ ...f, indicacaoId: e.target.value }))}
              className="input-field"
            >
              <option value="">Selecione o ponto</option>
              {indicacoesAtivas.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nomeEstabelecimento} — {i.cidade} (Captador: {i.indicador?.nome})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted mb-1">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
                className="input-field"
              >
                <option value="BONUS_INCLUSAO">Bônus de Inclusão</option>
                <option value="RECORRENCIA">Recorrência Mensal</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.valor}
                onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>

          {form.tipo === "RECORRENCIA" && (
            <div>
              <label className="text-sm text-muted mb-1">Mês referência</label>
              <input
                type="month"
                value={form.mesReferencia}
                onChange={(e) => setForm((f) => ({ ...f, mesReferencia: e.target.value }))}
                className="input-field"
              />
            </div>
          )}

          <div>
            <label className="text-sm text-muted mb-1">URL do comprovante (opcional)</label>
            <input
              type="text"
              placeholder="Link do comprovante de pagamento"
              value={form.comprovanteUrl}
              onChange={(e) => setForm((f) => ({ ...f, comprovanteUrl: e.target.value }))}
              className="input-field"
            />
          </div>

          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? "Registrando..." : "Registrar pagamento"}
          </button>
        </form>
      )}

      <div className="card overflow-hidden animate-fade-in">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-navy">Histórico de Pagamentos</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-zinc-50/80 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Ponto</th>
              <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Captador</th>
              <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Tipo</th>
              <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Valor</th>
              <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Data</th>
            </tr>
          </thead>
          <tbody>
            {pagamentos.map((p) => (
              <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-zinc-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-navy">{p.indicacao.nomeEstabelecimento}</td>
                <td className="px-4 py-3 text-muted">{p.indicador?.nome}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${p.tipo === "BONUS_INCLUSAO" ? "badge-indicado" : "badge-analise"}`}>
                    {p.tipo === "BONUS_INCLUSAO" ? "Bônus" : "Recorrência"}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold text-navy">
                  R$ {p.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${p.pago ? "badge-ativo" : "badge-aguardando"}`}>
                    {p.pago ? "Pago" : "Pendente"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">
                  {p.dataPagamento ? new Date(p.dataPagamento).toLocaleDateString("pt-BR") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pagamentos.length === 0 && (
          <p className="text-sm text-muted py-8 text-center">Nenhum pagamento registrado.</p>
        )}
      </div>
    </div>
  );
}
