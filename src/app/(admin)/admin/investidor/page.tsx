"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

type UnitEconomics = {
  mrr: number;
  arr: number;
  mrrGrowth: number;
  totalMaquinas: number;
  revenuePerMachine: number;
  ltvPorMaquina: number;
  cacPorPonto: number;
  ltvCacRatio: number;
  paybackMeses: number;
  margemBruta: number;
};

type FunnelStage = {
  stage: string;
  label: string;
  count: number;
  passedThrough: number;
  avgDays: number;
  conversionRate: number;
};

type Funnel = {
  stages: FunnelStage[];
  totalCycleTime: number;
  staleDeals: number;
  stalePct: number;
  velocity: number;
};

type Cohort = {
  mes: string;
  novos: number;
  ativosHoje: number;
  retencao: number;
  indicacoes: number;
  instalados: number;
};

type Network = {
  totalCaptadores: number;
  captadoresAtivos: number;
  novosCaptadoresMes: number;
  totalRegioes: number;
  topRegioes: { regiao: string; captadores: number; pontos: number; instalados: number }[];
  cobertura: number;
};

type Projecao = {
  cenario: string;
  maquinas12m: number;
  mrrProjetado: number;
  crescimento: number;
};

type InvestidorData = {
  unitEconomics: UnitEconomics;
  funnel: Funnel;
  cohorts: Cohort[];
  network: Network;
  projecao: Projecao[];
};

function MetricCard({ label, value, subtitle, highlight }: { label: string; value: string; subtitle?: string; highlight?: boolean }) {
  return (
    <div className="card-metric p-5">
      <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${highlight ? "gradient-brand-text" : "text-navy"}`}>{value}</p>
      {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
    </div>
  );
}

function HealthIndicator({ value, good, label }: { value: number; good: number; label: string }) {
  const isGood = value >= good;
  return (
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${isGood ? "bg-green-400" : "bg-amber-400"}`} />
      <div>
        <p className="text-sm font-bold text-navy">{value}</p>
        <p className="text-[10px] text-muted">{label}</p>
      </div>
    </div>
  );
}

export default function InvestidorPage() {
  const { data, error, isLoading, mutate } = useSWR<InvestidorData>(
    "/api/metricas/investidor",
    fetcher
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-72 bg-zinc-200 rounded-lg"></div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="card-metric p-5 h-24"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5 h-64"></div>
          <div className="card p-5 h-64"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-sm text-red-600">Não foi possível carregar as métricas.</p>
        <button onClick={() => mutate()} className="btn-primary">Tentar novamente</button>
      </div>
    );
  }

  const { unitEconomics: ue, funnel, cohorts, network, projecao } = data;
  const maxFunnel = Math.max(...funnel.stages.map((s) => s.passedThrough), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-navy">Investor Dashboard</h1>
        <p className="text-sm text-muted mt-0.5">Métricas de negócio e unit economics — visão estratégica</p>
      </div>

      {/* Unit Economics */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-navy uppercase tracking-wider">Unit Economics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard label="MRR" value={`R$ ${ue.mrr.toLocaleString("pt-BR")}`} subtitle={`${ue.mrrGrowth > 0 ? "+" : ""}${ue.mrrGrowth}% vs mês anterior`} highlight />
          <MetricCard label="ARR" value={`R$ ${ue.arr.toLocaleString("pt-BR")}`} subtitle={`${ue.totalMaquinas} máquinas ativas`} />
          <MetricCard label="LTV / Máquina" value={`R$ ${ue.ltvPorMaquina.toLocaleString("pt-BR")}`} subtitle={`Margem ${ue.margemBruta}% × 24 meses`} />
          <MetricCard label="CAC / Ponto" value={`R$ ${ue.cacPorPonto.toLocaleString("pt-BR")}`} subtitle="custo total de aquisição" />
          <MetricCard label="LTV:CAC" value={`${ue.ltvCacRatio}x`} subtitle={`Payback: ${ue.paybackMeses} meses`} highlight={ue.ltvCacRatio >= 3} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Revenue / Machine" value={`R$ ${ue.revenuePerMachine.toLocaleString("pt-BR")}/mês`} />
          <MetricCard label="Máquinas Ativas" value={String(ue.totalMaquinas)} />
          <MetricCard label="Payback Period" value={`${ue.paybackMeses} meses`} subtitle={ue.paybackMeses <= 18 ? "Saudável" : "Atenção"} />
          <MetricCard label="Margem Bruta" value={`${ue.margemBruta}%`} />
        </div>
      </section>

      {/* Funnel Velocity */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-navy uppercase tracking-wider">Funil de Conversão</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-navy">Pipeline Velocity</h3>
              <div className="flex gap-4 text-xs text-muted">
                <span>Ciclo: <strong className="text-navy">{funnel.totalCycleTime}d</strong></span>
                <span>Velocity: <strong className="text-navy">R$ {funnel.velocity.toLocaleString("pt-BR")}/dia</strong></span>
              </div>
            </div>
            <div className="space-y-3">
              {funnel.stages.map((stage, idx) => (
                <div key={stage.stage} className="flex items-center gap-3">
                  <div className="w-24 text-xs font-medium text-navy truncate">{stage.label}</div>
                  <div className="flex-1 h-8 bg-zinc-100 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full rounded-lg gradient-brand opacity-80 transition-all duration-700"
                      style={{ width: `${(stage.passedThrough / maxFunnel) * 100}%` }}
                    />
                    <span className="absolute inset-0 flex items-center px-3 text-xs font-bold text-navy">
                      {stage.count}
                    </span>
                  </div>
                  <div className="w-16 text-right">
                    <p className="text-xs font-bold text-navy">{stage.conversionRate}%</p>
                    <p className="text-[9px] text-muted">{stage.avgDays}d avg</p>
                  </div>
                  {idx < funnel.stages.length - 1 && (
                    <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-navy">Saúde do Pipeline</h3>
            <HealthIndicator value={funnel.totalCycleTime} good={30} label="dias ciclo médio (meta: <30)" />
            <HealthIndicator value={100 - funnel.stalePct} good={80} label={`% pipeline ativo (${funnel.staleDeals} parados)`} />
            <HealthIndicator value={funnel.stages[funnel.stages.length - 1]?.conversionRate || 0} good={15} label="% conversão total" />
            <div className="pt-3 border-t border-border">
              <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Velocity Formula</p>
              <p className="text-xs text-navy font-mono">deals × win% × value / cycle</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cohort Analysis */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-navy uppercase tracking-wider">Cohort de Captadores</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50/80 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Cohort</th>
                <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Novos</th>
                <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Ativos Hoje</th>
                <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Retenção</th>
                <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Captações</th>
                <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Instalados</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map((c) => (
                <tr key={c.mes} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-navy">{c.mes}</td>
                  <td className="px-4 py-3 text-navy">{c.novos}</td>
                  <td className="px-4 py-3 text-navy">{c.ativosHoje}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full gradient-brand" style={{ width: `${c.retencao}%` }} />
                      </div>
                      <span className={`text-xs font-bold ${c.retencao >= 50 ? "text-primary-dark" : c.retencao >= 30 ? "text-secondary" : "text-red-500"}`}>
                        {c.retencao}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-navy">{c.indicacoes}</td>
                  <td className="px-4 py-3 font-bold text-navy">{c.instalados}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Network Health + Projeção */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Network */}
        <section className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-navy uppercase tracking-wider">Network Health</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-navy">{network.captadoresAtivos}</p>
              <p className="text-xs text-muted">captadores ativos (30d)</p>
            </div>
            <div>
              <p className="text-2xl font-bold gradient-brand-text">{network.cobertura}%</p>
              <p className="text-xs text-muted">taxa de atividade</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-navy">+{network.novosCaptadoresMes}</p>
              <p className="text-xs text-muted">novos este mês</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-navy">{network.totalRegioes}</p>
              <p className="text-xs text-muted">regiões cobertas</p>
            </div>
          </div>
          <div className="pt-3 border-t border-border">
            <p className="text-xs font-semibold text-navy mb-2">Top Regiões</p>
            <div className="space-y-1.5">
              {network.topRegioes.slice(0, 5).map((r) => (
                <div key={r.regiao} className="flex items-center justify-between text-xs">
                  <span className="text-muted">{r.regiao}</span>
                  <span className="text-navy font-medium">{r.pontos} pontos · {r.instalados} inst.</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Projeção */}
        <section className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-navy uppercase tracking-wider">Projeção 12 Meses</h2>
          <div className="space-y-4">
            {projecao.map((p) => (
              <div key={p.cenario} className={`p-4 rounded-xl border ${
                p.cenario === "Base" ? "border-primary/30 bg-primary/5" : "border-border"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    p.cenario === "Conservador" ? "text-muted" :
                    p.cenario === "Base" ? "text-primary-dark" : "text-secondary"
                  }`}>{p.cenario}</span>
                  <span className="text-xs text-muted">+{p.crescimento}% growth</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-lg font-bold text-navy">R$ {p.mrrProjetado.toLocaleString("pt-BR")}</p>
                    <p className="text-[10px] text-muted">MRR projetado</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-navy">{p.maquinas12m}</p>
                    <p className="text-[10px] text-muted">máquinas</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}