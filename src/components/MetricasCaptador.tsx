"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

type MetricasData = {
  streak: number;
  metas: {
    mensal: { meta: number; atual: number; progresso: number };
    semanal: { meta: number; atual: number; progresso: number };
  };
  benchmarks: {
    meuScoreMedio: number;
    mediaRede: number;
    percentil: number;
    meuVolumeMes: number;
    mediaVolumeMes: number;
  };
  performanceMensal: { mes: string; indicacoes: number; scoreMedio: number; instalados: number }[];
};

export default function MetricasCaptador() {
  const { data, isLoading } = useSWR<MetricasData>("/api/metricas/captador", fetcher);

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-pulse">
        <div className="card p-5 h-40"></div>
        <div className="card p-5 h-40"></div>
        <div className="card p-5 h-40"></div>
      </div>
    );
  }

  const { streak, metas, benchmarks, performanceMensal } = data;
  const maxPerf = Math.max(...performanceMensal.map((p) => p.indicacoes), 1);

  return (
    <div className="space-y-4">
      {/* Streak + Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Streak */}
        <div className="card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
              <span className="text-lg">🔥</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-navy">{streak}</p>
              <p className="text-[10px] text-muted uppercase tracking-wider">dias seguidos</p>
            </div>
          </div>
          <p className="text-xs text-muted">
            {streak >= 7 ? "Incrível! Mantenha o ritmo." : streak >= 3 ? "Bom ritmo! Continue assim." : "Capte hoje para iniciar uma sequência!"}
          </p>
        </div>

        {/* Meta Semanal */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Meta Semanal</p>
            <span className="text-xs font-bold text-navy">{metas.semanal.atual}/{metas.semanal.meta}</span>
          </div>
          <div className="h-3 bg-zinc-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-700 gradient-brand"
              style={{ width: `${metas.semanal.progresso}%` }}
            />
          </div>
          <p className="text-xs text-muted">
            {metas.semanal.progresso >= 100 ? "Meta batida! 🎉" : `Faltam ${metas.semanal.meta - metas.semanal.atual} captações`}
          </p>
        </div>

        {/* Meta Mensal */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Meta Mensal</p>
            <span className="text-xs font-bold text-navy">{metas.mensal.atual}/{metas.mensal.meta}</span>
          </div>
          <div className="h-3 bg-zinc-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${metas.mensal.progresso}%`,
                background: metas.mensal.progresso >= 100 ? "linear-gradient(90deg, #00e5c8, #4040bf)" : "linear-gradient(90deg, #4040bf, #8b2fc9)",
              }}
            />
          </div>
          <p className="text-xs text-muted">
            {metas.mensal.progresso >= 100 ? "Parabéns! Meta do mês concluída!" : `${metas.mensal.progresso}% concluído`}
          </p>
        </div>
      </div>

      {/* Benchmarks + Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Benchmarks */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-navy mb-4">Seu Desempenho vs Rede</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted">Score Médio</span>
                <span className="font-bold text-navy">{benchmarks.meuScoreMedio} <span className="text-muted font-normal">vs {benchmarks.mediaRede} da rede</span></span>
              </div>
              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden relative">
                <div className="h-full rounded-full bg-zinc-300" style={{ width: `${(benchmarks.mediaRede / 100) * 100}%` }} />
                <div className="h-full rounded-full gradient-brand absolute top-0 left-0" style={{ width: `${(benchmarks.meuScoreMedio / 100) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted">Volume Mensal</span>
                <span className="font-bold text-navy">{benchmarks.meuVolumeMes} <span className="text-muted font-normal">vs {benchmarks.mediaVolumeMes} da rede</span></span>
              </div>
              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden relative">
                <div className="h-full rounded-full bg-zinc-300" style={{ width: `${Math.min(100, (benchmarks.mediaVolumeMes / Math.max(benchmarks.meuVolumeMes, benchmarks.mediaVolumeMes, 1)) * 100)}%` }} />
                <div className="h-full rounded-full gradient-brand absolute top-0 left-0" style={{ width: `${Math.min(100, (benchmarks.meuVolumeMes / Math.max(benchmarks.meuVolumeMes, benchmarks.mediaVolumeMes, 1)) * 100)}%` }} />
              </div>
            </div>
            <div className="pt-3 border-t border-border flex items-center gap-3">
              <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center">
                <span className="text-sm font-bold text-navy">P{benchmarks.percentil}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-navy">Top {100 - benchmarks.percentil}%</p>
                <p className="text-xs text-muted">Seu score está acima de {benchmarks.percentil}% dos captadores</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-navy mb-4">Evolução Mensal</h3>
          <div className="flex items-end gap-3 h-32">
            {performanceMensal.map((p) => (
              <div key={p.mes} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-navy">{p.indicacoes}</span>
                <div className="w-full relative rounded-t-md overflow-hidden bg-zinc-100" style={{ height: "90px" }}>
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-t-md transition-all duration-700 gradient-brand"
                    style={{ height: `${(p.indicacoes / maxPerf) * 100}%`, opacity: 0.85 }}
                  />
                </div>
                <span className="text-[9px] text-muted">{p.mes}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs text-muted">
            <span>Score médio: <strong className="text-navy">{performanceMensal[performanceMensal.length - 1]?.scoreMedio || 0}</strong></span>
            <span>Instalados: <strong className="text-navy">{performanceMensal.reduce((s, p) => s + p.instalados, 0)}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}