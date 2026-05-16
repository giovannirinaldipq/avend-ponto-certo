"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { STATUS_OPTIONS, STATUS_BADGE, STATUS_COLORS } from "@/lib/constants";
import FeedAtividade from "@/components/FeedAtividade";

const MapaPontos = dynamic(() => import("@/components/MapaPontos"), { ssr: false });

type Indicacao = {
  id: string;
  nomeEstabelecimento: string;
  cidade: string;
  estado: string;
  score: number;
  status: string;
  tipoLocal: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  indicador: { nome: string; email: string; tier: string };
};

type IndicacoesResponse = {
  indicacoes: Indicacao[];
  total: number;
  page: number;
  pages: number;
};

function KPICard({ title, value, subtitle, icon, delay }: { title: string; value: string | number; subtitle?: string; icon: React.ReactNode; delay: number }) {
  return (
    <div className={`card-metric p-5 animate-fade-in`} style={{ animationDelay: `${delay}ms`, opacity: 0 }}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-navy">{value}</p>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl gradient-brand-subtle flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

function MiniBarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="card p-5 animate-fade-in" style={{ animationDelay: "200ms", opacity: 0 }}>
      <h3 className="text-sm font-semibold text-navy mb-4">Indicacoes por Status</h3>
      <div className="flex items-end gap-2 h-32">
        {data.map((item) => (
          <div key={item.label} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-navy">{item.value}</span>
            <div className="w-full relative rounded-t-md overflow-hidden bg-zinc-100" style={{ height: "100px" }}>
              <div
                className="absolute bottom-0 left-0 right-0 rounded-t-md transition-all duration-700 ease-out"
                style={{
                  height: `${(item.value / max) * 100}%`,
                  backgroundColor: item.color,
                  opacity: 0.85,
                }}
              />
            </div>
            <span className="text-[9px] text-muted text-center leading-tight">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertCard({ alerts }: { alerts: { message: string; type: "warning" | "danger" }[] }) {
  if (alerts.length === 0) return null;
  return (
    <div className="card p-5 animate-fade-in" style={{ animationDelay: "300ms", opacity: 0 }}>
      <h3 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1L15 14H1L8 1Z" stroke="#8b2fc9" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M8 6V9M8 11V11.5" stroke="#8b2fc9" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        Pontos de Atenção
      </h3>
      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <div
            key={i}
            className={`text-xs px-3 py-2 rounded-lg border ${
              alert.type === "danger"
                ? "bg-red-50 border-red-100 text-red-700"
                : "bg-amber-50 border-amber-100 text-amber-700"
            }`}
          >
            {alert.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroCidade, setFiltroCidade] = useState("");
  const [viewMode, setViewMode] = useState<"tabela" | "mapa">("tabela");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams();
  if (filtroStatus) params.set("status", filtroStatus);
  if (filtroCidade) params.set("cidade", filtroCidade);
  params.set("page", String(page));
  params.set("limit", "20");

  const { data, error, isLoading, mutate } = useSWR<IndicacoesResponse>(
    `/api/indicacoes?${params}`,
    fetcher
  );

  const indicacoes = data?.indicacoes || [];
  const totalPages = data?.pages || 1;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-zinc-200 rounded-lg"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="card-metric p-5 h-24"></div>)}
        </div>
        <div className="card p-5 h-64"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-sm text-red-600">Não foi possível carregar o pipeline.</p>
        <button onClick={() => mutate()} className="btn-primary">Tentar novamente</button>
      </div>
    );
  }

  const stats = {
    total: indicacoes.length,
    quentes: indicacoes.filter((i) => i.score >= 70).length,
    instalados: indicacoes.filter((i) => i.status === "INSTALADO" || i.status === "ATIVO").length,
    taxaConversao: indicacoes.length > 0
      ? Math.round((indicacoes.filter((i) => i.status === "INSTALADO" || i.status === "ATIVO").length / indicacoes.length) * 100)
      : 0,
    receitaEstimada: indicacoes.filter((i) => i.status === "INSTALADO" || i.status === "ATIVO").length * 500,
  };

  // Status distribution for chart
  const statusCounts = STATUS_OPTIONS.filter((s) => s.value).map((s) => ({
    label: s.label.replace("Aguardando", "Aguard."),
    value: indicacoes.filter((i) => i.status === s.value).length,
    color: STATUS_COLORS[s.value] || "#6b7294",
  }));

  // Alerts
  const alerts: { message: string; type: "warning" | "danger" }[] = [];
  const paradas = indicacoes.filter((i) => {
    const days = (Date.now() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return days > 14 && !["INSTALADO", "ATIVO", "RECUSADO"].includes(i.status);
  });
  if (paradas.length > 0) {
    alerts.push({ message: `${paradas.length} indicacao(oes) parada(s) ha mais de 14 dias sem avancar no pipeline`, type: "warning" });
  }
  const quentesSemAcao = indicacoes.filter((i) => i.score >= 70 && i.status === "INDICADO");
  if (quentesSemAcao.length > 0) {
    alerts.push({ message: `${quentesSemAcao.length} ponto(s) quente(s) (score 70+) ainda sem analise iniciada`, type: "danger" });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-navy">Pipeline de Indicacoes</h1>
          <p className="text-sm text-muted mt-0.5">Visao geral e gestao do funil</p>
        </div>
        <span className="text-xs text-muted font-medium px-3 py-1.5 rounded-lg border border-border">
          {stats.total} indicações no pipeline
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Indicacoes"
          value={stats.total}
          subtitle="no pipeline"
          delay={50}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4040bf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>}
        />
        <KPICard
          title="Taxa Conversao"
          value={`${stats.taxaConversao}%`}
          subtitle="indicado → instalado"
          delay={100}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L2 2L10 12V20L14 22V12L22 2Z"/></svg>}
        />
        <KPICard
          title="Pontos Quentes"
          value={stats.quentes}
          subtitle="score 70+"
          delay={150}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b2fc9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c-4 0-7-2.7-7-7 0-3.5 2.5-6.5 4-8 .5 2.5 2 4 3.5 5 1-1.5 2-3.5 2-5.5 2 2 3.5 4.5 3.5 8.5 0 4.3-3 7-6 7z"/></svg>}
        />
        <KPICard
          title="Receita Gerada"
          value={`R$ ${stats.receitaEstimada.toLocaleString("pt-BR")}`}
          subtitle="bonus de instalacao"
          delay={200}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00c4ab" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>}
        />
      </div>

      {/* Chart + Alerts + Feed Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <MiniBarChart data={statusCounts} />
        </div>
        <AlertCard alerts={alerts} />
        <div className="card p-5 animate-fade-in" style={{ animationDelay: "300ms", opacity: 0 }}>
          <h3 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4040bf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Atividade Recente
          </h3>
          <FeedAtividade limit={6} />
        </div>
      </div>

      {/* Filters + View Toggle */}
      <div className="flex items-center justify-between animate-fade-in" style={{ animationDelay: "350ms", opacity: 0 }}>
        <div className="flex gap-3">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="input-field w-auto"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Filtrar por cidade..."
            value={filtroCidade}
            onChange={(e) => setFiltroCidade(e.target.value)}
            className="input-field w-48"
          />
        </div>
        <div className="flex gap-1 bg-white border border-border rounded-xl p-1">
          <button
            onClick={() => setViewMode("tabela")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${viewMode === "tabela" ? "gradient-brand-subtle text-navy shadow-sm" : "text-muted"}`}
          >
            Tabela
          </button>
          <button
            onClick={() => setViewMode("mapa")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${viewMode === "mapa" ? "gradient-brand-subtle text-navy shadow-sm" : "text-muted"}`}
          >
            Mapa
          </button>
        </div>
      </div>

      {/* Map or Table */}
      {viewMode === "mapa" ? (
        <MapaPontos pontos={indicacoes} height="500px" linkPrefix="/admin/validacao" />
      ) : (
      <div className="card overflow-hidden animate-fade-in" style={{ animationDelay: "400ms", opacity: 0 }}>
        <table className="w-full text-sm">
          <thead className="bg-zinc-50/80 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Local</th>
              <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Cidade</th>
              <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Captador</th>
              <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Score</th>
              <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Data</th>
              <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody>
            {indicacoes.map((ind, idx) => (
              <tr key={ind.id} className="border-b border-border/50 last:border-0 table-row-hover transition-all duration-200" style={{ animationDelay: `${450 + idx * 30}ms` }}>
                <td className="px-4 py-3">
                  <p className="font-medium text-navy">{ind.nomeEstabelecimento}</p>
                  <p className="text-xs text-muted">{ind.tipoLocal}</p>
                </td>
                <td className="px-4 py-3 text-muted">{ind.cidade}/{ind.estado}</td>
                <td className="px-4 py-3">
                  <p className="text-navy">{ind.indicador.nome}</p>
                  <p className="text-xs text-muted">{ind.indicador.tier}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`font-bold ${ind.score >= 70 ? "text-primary-dark" : ind.score >= 50 ? "text-secondary" : "text-muted"}`}>
                    {ind.score}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${STATUS_BADGE[ind.status] || ""}`}>
                    {STATUS_OPTIONS.find((s) => s.value === ind.status)?.label || ind.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{new Date(ind.createdAt).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/validacao/${ind.id}`} className="text-secondary text-xs font-medium hover:underline">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {indicacoes.length === 0 && (
          <p className="text-sm text-muted py-8 text-center">Nenhuma indicacao encontrada.</p>
        )}
      </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-xs text-muted">Página {page} de {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
