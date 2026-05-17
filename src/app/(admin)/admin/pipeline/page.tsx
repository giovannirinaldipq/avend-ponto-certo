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
  franqueado: string | null;
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

function DisponiveisView({
  indicacoes,
  franqueadoEdit,
  setFranqueadoEdit,
  actionLoading,
  onAlocar,
}: {
  indicacoes: Indicacao[];
  franqueadoEdit: { id: string; value: string } | null;
  setFranqueadoEdit: (v: { id: string; value: string } | null) => void;
  actionLoading: boolean;
  onAlocar: (id: string, franqueado: string) => void;
}) {
  // Agrupar por cidade
  const porCidade = new Map<string, Indicacao[]>();
  indicacoes.forEach((i) => {
    const key = `${i.cidade}/${i.estado}`;
    if (!porCidade.has(key)) porCidade.set(key, []);
    porCidade.get(key)!.push(i);
  });

  if (indicacoes.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-muted">Nenhum ponto disponível aguardando franqueado no momento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-4 gradient-brand-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-navy">{indicacoes.length} pontos prontos</p>
            <p className="text-xs text-muted">Negociados e aguardando alocação de franqueado em {porCidade.size} cidade(s)</p>
          </div>
        </div>
      </div>

      {Array.from(porCidade.entries()).map(([cidade, pontos]) => (
        <div key={cidade} className="space-y-2">
          <h3 className="text-sm font-semibold text-navy flex items-center gap-2">
            <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {cidade}
            <span className="text-xs font-normal text-muted">({pontos.length} ponto{pontos.length > 1 ? "s" : ""})</span>
          </h3>
          <div className="space-y-2">
            {pontos.map((ponto) => (
              <div key={ponto.id} className="card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-navy">{ponto.nomeEstabelecimento}</p>
                    <p className="text-xs text-muted mt-0.5">{ponto.tipoLocal} · Score {ponto.score} · Captado por {ponto.indicador.nome}</p>
                    {ponto.franqueado && (
                      <p className="text-xs mt-1 px-2 py-0.5 inline-block rounded-full bg-green-50 text-green-700 font-medium">
                        Franqueado: {ponto.franqueado}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {franqueadoEdit?.id === ponto.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={franqueadoEdit.value}
                          onChange={(e) => setFranqueadoEdit({ ...franqueadoEdit, value: e.target.value })}
                          placeholder="Nome do franqueado"
                          className="input-field text-xs w-40"
                          autoFocus
                        />
                        <button
                          onClick={() => onAlocar(ponto.id, franqueadoEdit.value)}
                          disabled={actionLoading || !franqueadoEdit.value}
                          className="btn-primary text-xs px-3 py-1.5"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setFranqueadoEdit(null)}
                          className="text-xs text-muted hover:text-navy"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setFranqueadoEdit({ id: ponto.id, value: ponto.franqueado || "" })}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium bg-primary/10 text-primary-dark hover:bg-primary/20 transition-all"
                      >
                        {ponto.franqueado ? "Editar" : "Alocar franqueado"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PipelinePage() {
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroCidade, setFiltroCidade] = useState("");
  const [viewMode, setViewMode] = useState<"tabela" | "mapa">("tabela");
  const [page, setPage] = useState(1);
  const [abaAtiva, setAbaAtiva] = useState<"pipeline" | "disponiveis">("pipeline");
  const [franqueadoEdit, setFranqueadoEdit] = useState<{ id: string; value: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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

      {/* Abas Pipeline / Disponíveis */}
      <div className="flex gap-2">
        <button
          onClick={() => setAbaAtiva("pipeline")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${abaAtiva === "pipeline" ? "bg-primary/10 text-primary-dark" : "text-muted hover:bg-zinc-100"}`}
        >
          Pipeline
        </button>
        <button
          onClick={() => setAbaAtiva("disponiveis")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${abaAtiva === "disponiveis" ? "bg-primary/10 text-primary-dark" : "text-muted hover:bg-zinc-100"}`}
        >
          Disponíveis para Franqueados
          {indicacoes.filter((i) => i.status === "AGUARDANDO_FRANQUEADO").length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-secondary/20 text-secondary">
              {indicacoes.filter((i) => i.status === "AGUARDANDO_FRANQUEADO").length}
            </span>
          )}
        </button>
      </div>

      {/* KPI Cards */}
      {abaAtiva === "pipeline" && (
      <>
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
      </>
      )}

      {/* Aba Disponíveis */}
      {abaAtiva === "disponiveis" && (
        <DisponiveisView
          indicacoes={indicacoes.filter((i) => i.status === "AGUARDANDO_FRANQUEADO")}
          franqueadoEdit={franqueadoEdit}
          setFranqueadoEdit={setFranqueadoEdit}
          actionLoading={actionLoading}
          onAlocar={async (id: string, franqueado: string) => {
            setActionLoading(true);
            await fetch(`/api/indicacoes/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ franqueado }),
            });
            setActionLoading(false);
            setFranqueadoEdit(null);
            mutate();
          }}
        />
      )}
    </div>
  );
}
