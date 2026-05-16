"use client";

import { useEffect, useState } from "react";
import FeedAtividade from "@/components/FeedAtividade";

type Metricas = {
  crescimentoMensal: { mes: string; indicacoes: number }[];
  tempoMedioConversao: number;
  indicadoresAtivos: number;
  indicadoresInativos: number;
  totalIndicadores: number;
  receitaTotal: number;
  receitaPendente: number;
  scoreMedio: number;
  taxaConversao: number;
  totalInstalados: number;
  totalIndicacoes: number;
  faturamentoMensal: number;
};

export default function AdminDashboardPage() {
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/metricas")
      .then((r) => r.json())
      .then((d) => setMetricas(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !metricas) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-zinc-200 rounded-lg"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="card-metric p-5 h-24"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5 h-64"></div>
          <div className="card p-5 h-64"></div>
        </div>
      </div>
    );
  }

  const maxCrescimento = Math.max(...metricas.crescimentoMensal.map((m) => m.indicacoes), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
          <p className="text-sm text-muted mt-0.5">Visão executiva do Radar by Avend</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/relatorios?tipo=pipeline" className="btn-secondary text-xs px-3 py-2">Exportar Pipeline</a>
          <a href="/api/relatorios?tipo=financeiro" className="btn-secondary text-xs px-3 py-2">Exportar Financeiro</a>
          <a href="/api/relatorios?tipo=indicadores" className="btn-secondary text-xs px-3 py-2">Exportar Captadores</a>
        </div>
      </div>

      {/* KPIs Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-metric p-5 animate-fade-in">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Indicações</p>
          <p className="text-3xl font-bold text-navy mt-1">{metricas.totalIndicacoes}</p>
          <p className="text-xs text-muted mt-1">{metricas.totalInstalados} instalados</p>
        </div>
        <div className="card-metric p-5 animate-fade-in">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Taxa Conversão</p>
          <p className="text-3xl font-bold gradient-brand-text mt-1">{metricas.taxaConversao}%</p>
          <p className="text-xs text-muted mt-1">indicado → instalado</p>
        </div>
        <div className="card-metric p-5 animate-fade-in">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Tempo Médio</p>
          <p className="text-3xl font-bold text-navy mt-1">{metricas.tempoMedioConversao}<span className="text-sm font-normal text-muted"> dias</span></p>
          <p className="text-xs text-muted mt-1">até instalação</p>
        </div>
        <div className="card-metric p-5 animate-fade-in">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Score Médio</p>
          <p className="text-3xl font-bold text-navy mt-1">{metricas.scoreMedio}</p>
          <p className="text-xs text-muted mt-1">qualidade dos pontos</p>
        </div>
      </div>

      {/* KPIs Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-metric p-5 animate-fade-in">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Receita Paga</p>
          <p className="text-2xl font-bold gradient-brand-text mt-1">R$ {metricas.receitaTotal.toLocaleString("pt-BR")}</p>
        </div>
        <div className="card-metric p-5 animate-fade-in">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Pendente</p>
          <p className="text-2xl font-bold text-secondary mt-1">R$ {metricas.receitaPendente.toLocaleString("pt-BR")}</p>
        </div>
        <div className="card-metric p-5 animate-fade-in">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Captadores Ativos</p>
          <p className="text-2xl font-bold text-navy mt-1">{metricas.indicadoresAtivos}<span className="text-sm font-normal text-muted"> / {metricas.totalIndicadores}</span></p>
          <p className="text-xs text-muted mt-1">{metricas.indicadoresInativos} inativos (30d)</p>
        </div>
        <div className="card-metric p-5 animate-fade-in">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Faturamento Mensal</p>
          <p className="text-2xl font-bold text-navy mt-1">R$ {metricas.faturamentoMensal.toLocaleString("pt-BR")}</p>
          <p className="text-xs text-muted mt-1">máquinas ativas</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Crescimento Mensal */}
        <div className="card p-5 animate-fade-in">
          <h3 className="text-sm font-semibold text-navy mb-4">Crescimento Mensal</h3>
          <div className="flex items-end gap-3 h-40">
            {metricas.crescimentoMensal.map((m) => (
              <div key={m.mes} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-navy">{m.indicacoes}</span>
                <div className="w-full rounded-t-lg transition-all duration-700 gradient-brand" style={{
                  height: `${(m.indicacoes / maxCrescimento) * 100}%`,
                  minHeight: m.indicacoes > 0 ? "8px" : "2px",
                  opacity: m.indicacoes > 0 ? 1 : 0.2,
                }}></div>
                <span className="text-[10px] text-muted text-center">{m.mes}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Atividade Recente */}
        <div className="card p-5 animate-fade-in">
          <h3 className="text-sm font-semibold text-navy mb-4">Atividade Recente</h3>
          <FeedAtividade limit={8} />
        </div>
      </div>

      {/* Captadores Health */}
      <div className="card p-5 animate-fade-in">
        <h3 className="text-sm font-semibold text-navy mb-4">Saúde da Rede</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e8eaf0" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#00e5c8" strokeWidth="3" strokeDasharray={`${metricas.taxaConversao}, 100`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-navy">{metricas.taxaConversao}%</span>
            </div>
            <p className="text-xs text-muted">Conversão</p>
          </div>
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e8eaf0" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#4040bf" strokeWidth="3" strokeDasharray={`${metricas.totalIndicadores > 0 ? Math.round((metricas.indicadoresAtivos / metricas.totalIndicadores) * 100) : 0}, 100`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-navy">{metricas.totalIndicadores > 0 ? Math.round((metricas.indicadoresAtivos / metricas.totalIndicadores) * 100) : 0}%</span>
            </div>
            <p className="text-xs text-muted">Captadores Ativos</p>
          </div>
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e8eaf0" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#8b2fc9" strokeWidth="3" strokeDasharray={`${metricas.scoreMedio}, 100`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-navy">{metricas.scoreMedio}</span>
            </div>
            <p className="text-xs text-muted">Score Médio</p>
          </div>
        </div>
      </div>
    </div>
  );
}
