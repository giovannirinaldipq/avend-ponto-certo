"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { MapPin, TrendingUp, Flame, Banknote, AlertTriangle, Clock, Store } from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { STATUS_OPTIONS, STATUS_BADGE, STATUS_COLORS } from "@/lib/constants";
import FeedAtividade from "@/components/FeedAtividade";
import ScoreRing from "@/components/ScoreRing";
import { KPICard, ThemeToggle } from "@/components/ui";
import { BarChart } from "@/components/charts";
import { cn } from "@/lib/design-system";

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

const stagger = {
  container: { transition: { staggerChildren: 0.05 } },
  item: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  },
};

function AlertCard({ alerts }: { alerts: { message: string; type: "warning" | "danger" }[] }) {
  if (alerts.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <h3 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
        <AlertTriangle size={16} className="text-accent" />
        Pontos de Atenção
      </h3>
      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "text-xs px-3 py-2 rounded-lg border",
              alert.type === "danger"
                ? "bg-red-50 border-red-100 text-red-700"
                : "bg-amber-50 border-amber-100 text-amber-700"
            )}
          >
            {alert.message}
          </motion.div>
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
  const porCidade = new Map<string, Indicacao[]>();
  indicacoes.forEach((i) => {
    const key = `${i.cidade}/${i.estado}`;
    if (!porCidade.has(key)) porCidade.set(key, []);
    porCidade.get(key)!.push(i);
  });

  if (indicacoes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-border p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
          <Store size={28} className="text-muted" />
        </div>
        <p className="text-sm text-muted">Nenhum ponto disponível aguardando franqueado.</p>
      </div>
    );
  }

  return (
    <motion.div className="space-y-6" initial="initial" animate="animate" variants={stagger.container}>
      <motion.div variants={stagger.item} className="bg-white rounded-2xl border border-border p-4 gradient-brand-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center">
            <Store size={20} className="text-primary-dark" />
          </div>
          <div>
            <p className="text-sm font-bold text-navy">{indicacoes.length} pontos prontos</p>
            <p className="text-xs text-muted">Aguardando alocação em {porCidade.size} cidade(s)</p>
          </div>
        </div>
      </motion.div>

      {Array.from(porCidade.entries()).map(([cidade, pontos]) => (
        <motion.div key={cidade} variants={stagger.item} className="space-y-2">
          <h3 className="text-sm font-semibold text-navy flex items-center gap-2">
            <MapPin size={14} className="text-muted" />
            {cidade}
            <span className="text-xs font-normal text-muted">({pontos.length})</span>
          </h3>
          <div className="space-y-2">
            {pontos.map((ponto) => (
              <motion.div key={ponto.id} whileHover={{ scale: 1.002 }} className="bg-white rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-navy">{ponto.nomeEstabelecimento}</p>
                    <p className="text-xs text-muted mt-0.5">{ponto.tipoLocal} · Score {ponto.score} · {ponto.indicador.nome}</p>
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
                        <button onClick={() => onAlocar(ponto.id, franqueadoEdit.value)} disabled={actionLoading || !franqueadoEdit.value} className="btn-primary text-xs px-3 py-1.5">Salvar</button>
                        <button onClick={() => setFranqueadoEdit(null)} className="text-xs text-muted hover:text-navy">✕</button>
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
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
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

  const { data, error, isLoading, mutate } = useSWR<IndicacoesResponse>(`/api/indicacoes?${params}`, fetcher);
  const { data: dataDisponiveis } = useSWR<IndicacoesResponse>(`/api/indicacoes?status=AGUARDANDO_FRANQUEADO&all=true`, fetcher);

  const indicacoes = data?.indicacoes || [];
  const disponiveis = dataDisponiveis?.indicacoes || [];
  const totalPages = data?.pages || 1;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 skeleton rounded-lg"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28 rounded-2xl"></div>)}
        </div>
        <div className="skeleton h-64 rounded-2xl"></div>
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

  const statusCounts = STATUS_OPTIONS.filter((s) => s.value).map((s) => ({
    name: s.label.replace("Aguardando", "Aguard."),
    value: indicacoes.filter((i) => i.status === s.value).length,
    color: STATUS_COLORS[s.value] || "#6b7294",
  }));

  const alerts: { message: string; type: "warning" | "danger" }[] = [];
  const paradas = indicacoes.filter((i) => {
    const days = (Date.now() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return days > 14 && !["INSTALADO", "ATIVO", "RECUSADO"].includes(i.status);
  });
  if (paradas.length > 0) alerts.push({ message: `${paradas.length} indicação(ões) parada(s) há mais de 14 dias`, type: "warning" });
  const quentesSemAcao = indicacoes.filter((i) => i.score >= 70 && i.status === "INDICADO");
  if (quentesSemAcao.length > 0) alerts.push({ message: `${quentesSemAcao.length} ponto(s) quente(s) sem análise iniciada`, type: "danger" });

  return (
    <motion.div className="space-y-6" initial="initial" animate="animate" variants={stagger.container}>
      {/* Header */}
      <motion.div variants={stagger.item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Pipeline de Indicações</h1>
          <p className="text-sm text-muted mt-0.5">Visão geral e gestão do funil</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle size="sm" />
          <span className="text-xs text-muted font-medium px-3 py-1.5 rounded-lg border border-border">{stats.total} indicações</span>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={stagger.item} className="flex gap-2">
        <button onClick={() => setAbaAtiva("pipeline")} className={cn("px-4 py-2 text-sm font-medium rounded-xl transition-all", abaAtiva === "pipeline" ? "bg-primary/10 text-primary-dark" : "text-muted hover:bg-zinc-100")}>
          Pipeline
        </button>
        <button onClick={() => setAbaAtiva("disponiveis")} className={cn("px-4 py-2.5 text-sm font-medium rounded-xl transition-all border-2", abaAtiva === "disponiveis" ? "bg-secondary/10 text-secondary border-secondary/30" : disponiveis.length > 0 ? "bg-secondary/5 text-secondary border-secondary/20" : "text-muted hover:bg-zinc-100 border-transparent")}>
          <span className="flex items-center gap-2">
            <Store size={14} /> Disponíveis
            {disponiveis.length > 0 && <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-secondary text-white">{disponiveis.length}</span>}
          </span>
        </button>
      </motion.div>

      {abaAtiva === "pipeline" && (
        <>
          {/* KPIs */}
          <motion.div variants={stagger.item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Total Indicações" value={stats.total} icon={<MapPin size={18} />} color="secondary" />
            <KPICard title="Taxa Conversão" value={stats.taxaConversao} format="percent" icon={<TrendingUp size={18} />} color="primary" />
            <KPICard title="Pontos Quentes" value={stats.quentes} icon={<Flame size={18} />} color="accent" />
            <KPICard title="Receita Gerada" value={stats.receitaEstimada} format="currency" icon={<Banknote size={18} />} color="success" />
          </motion.div>

          {/* Chart + Alerts + Feed */}
          <motion.div variants={stagger.item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="text-sm font-semibold text-navy mb-4">Por Status</h3>
              <BarChart data={statusCounts} height={140} showXAxis barRadius={6} />
            </div>
            <AlertCard alerts={alerts} />
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                <Clock size={14} className="text-secondary" /> Atividade Recente
              </h3>
              <FeedAtividade limit={6} />
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div variants={stagger.item} className="flex items-center justify-between">
            <div className="flex gap-3">
              <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="input-field w-auto">
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <input type="text" placeholder="Filtrar por cidade..." value={filtroCidade} onChange={(e) => setFiltroCidade(e.target.value)} className="input-field w-48" />
            </div>
            <div className="flex gap-1 bg-white border border-border rounded-xl p-1">
              <button onClick={() => setViewMode("tabela")} className={cn("px-3 py-1.5 text-xs font-medium rounded-lg transition-all", viewMode === "tabela" ? "gradient-brand-subtle text-navy shadow-sm" : "text-muted")}>Tabela</button>
              <button onClick={() => setViewMode("mapa")} className={cn("px-3 py-1.5 text-xs font-medium rounded-lg transition-all", viewMode === "mapa" ? "gradient-brand-subtle text-navy shadow-sm" : "text-muted")}>Mapa</button>
            </div>
          </motion.div>

          {/* Table / Map */}
          <motion.div variants={stagger.item}>
            {viewMode === "mapa" ? (
              <MapaPontos pontos={indicacoes} height="500px" linkPrefix="/gestao-pc2026/validacao" />
            ) : (
              <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Local</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Cidade</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Captador</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Score</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Data</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {indicacoes.map((ind, idx) => (
                      <motion.tr key={ind.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }} className="border-b border-border/50 last:border-0 hover:bg-primary/5 transition-colors">
                        <td className="px-4 py-3"><p className="font-medium text-navy">{ind.nomeEstabelecimento}</p><p className="text-xs text-muted">{ind.tipoLocal}</p></td>
                        <td className="px-4 py-3 text-muted">{ind.cidade}/{ind.estado}</td>
                        <td className="px-4 py-3"><p className="text-navy">{ind.indicador.nome}</p><p className="text-xs text-muted">{ind.indicador.tier}</p></td>
                        <td className="px-4 py-3"><ScoreRing score={ind.score} size={32} strokeWidth={3} showLabel={false} /></td>
                        <td className="px-4 py-3"><span className={`badge ${STATUS_BADGE[ind.status] || ""}`}>{STATUS_OPTIONS.find((s) => s.value === ind.status)?.label || ind.status}</span></td>
                        <td className="px-4 py-3 text-muted">{new Date(ind.createdAt).toLocaleDateString("pt-BR")}</td>
                        <td className="px-4 py-3"><Link href={`/gestao-pc2026/validacao/${ind.id}`} className="text-secondary text-xs font-medium hover:underline">Ver</Link></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {indicacoes.length === 0 && <p className="text-sm text-muted py-8 text-center">Nenhuma indicação encontrada.</p>}
              </div>
            )}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div variants={stagger.item} className="flex items-center justify-center gap-2 pt-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Anterior</button>
              <span className="text-xs text-muted">Página {page} de {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Próxima</button>
            </motion.div>
          )}
        </>
      )}

      {abaAtiva === "disponiveis" && (
        <DisponiveisView
          indicacoes={disponiveis}
          franqueadoEdit={franqueadoEdit}
          setFranqueadoEdit={setFranqueadoEdit}
          actionLoading={actionLoading}
          onAlocar={async (id, franqueado) => {
            setActionLoading(true);
            await fetch(`/api/indicacoes/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ franqueado }) });
            setActionLoading(false);
            setFranqueadoEdit(null);
            mutate();
          }}
        />
      )}
    </motion.div>
  );
}
