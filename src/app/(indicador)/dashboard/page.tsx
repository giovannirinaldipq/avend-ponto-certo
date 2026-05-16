"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { TIERS, proximoTier } from "@/lib/tiers";
import { STATUS_LABELS, STATUS_BADGE } from "@/lib/constants";
import PontosProximos from "@/components/PontosProximos";
import MissoesOnboarding from "@/components/MissoesOnboarding";
import MetricasCaptador from "@/components/MetricasCaptador";

const MapaPontos = dynamic(() => import("@/components/MapaPontos"), { ssr: false });

type UserData = { nome: string; tier: string; chavePix: string | null };
type Indicacao = {
  id: string;
  nomeEstabelecimento: string;
  cidade: string;
  estado: string;
  score: number;
  status: string;
  latitude: number | null;
  longitude: number | null;
  fotos: string;
  createdAt: string;
  faturamentoMensal: number | null;
};

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([]);
  const [financeiro, setFinanceiro] = useState({ totalPago: 0, totalPendente: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user)),
      fetch("/api/indicacoes").then((r) => r.json()).then((d) => setIndicacoes(d.indicacoes || [])),
      fetch("/api/financeiro").then((r) => r.json()).then((d) => setFinanceiro(d)),
    ]).finally(() => setLoading(false));
  }, []);

  const totalIndicacoes = indicacoes.length;
  const pontosInstalados = indicacoes.filter((i) => i.status === "INSTALADO" || i.status === "ATIVO").length;
  const pontosAtivos = indicacoes.filter((i) => i.status === "ATIVO").length;
  const emNegociacao = indicacoes.filter((i) => i.status === "EM_NEGOCIACAO").length;
  const recusados = indicacoes.filter((i) => i.status === "RECUSADO").length;
  const taxaConversao = totalIndicacoes > 0 ? Math.round((pontosInstalados / totalIndicacoes) * 100) : 0;
  const scoreMedia = totalIndicacoes > 0 ? Math.round(indicacoes.reduce((s, i) => s + i.score, 0) / totalIndicacoes) : 0;

  const tierInfo = user ? TIERS[user.tier] : TIERS.BRONZE;
  const nextTier = user ? proximoTier(user.tier) : null;

  // Projeção de ganhos
  const faturamentoTotal = indicacoes
    .filter((i) => i.faturamentoMensal)
    .reduce((s, i) => s + (i.faturamentoMensal || 0), 0);
  const recorrenciaMensal = faturamentoTotal * 0.05;
  const projecao6Meses = recorrenciaMensal * 6 + pontosInstalados * 500;

  // Potencial se converter os em negociação
  const potencialExtra = emNegociacao * 500 + emNegociacao * 8000 * 0.05 * 6;

  // Distribuição por status para mini chart
  const statusCounts = [
    { label: "Indicados", count: indicacoes.filter((i) => i.status === "INDICADO").length, color: "#4040bf" },
    { label: "Análise", count: indicacoes.filter((i) => i.status === "EM_ANALISE").length, color: "#8b2fc9" },
    { label: "Negociação", count: emNegociacao, color: "#00e5c8" },
    { label: "Instalados", count: pontosInstalados, color: "#1a1145" },
    { label: "Recusados", count: recusados, color: "#dc3545" },
  ];
  const maxCount = Math.max(...statusCounts.map((s) => s.count), 1);

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="flex items-start justify-between">
          <div>
            <div className="h-7 w-48 bg-zinc-200 rounded-lg"></div>
            <div className="h-4 w-64 bg-zinc-100 rounded mt-2"></div>
          </div>
          <div className="h-10 w-36 bg-zinc-200 rounded-xl hidden sm:block"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="card-metric p-4 space-y-3">
              <div className="flex justify-between">
                <div className="h-3 w-20 bg-zinc-100 rounded"></div>
                <div className="w-8 h-8 bg-zinc-100 rounded-lg"></div>
              </div>
              <div className="h-8 w-16 bg-zinc-200 rounded"></div>
              <div className="h-3 w-24 bg-zinc-100 rounded"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card p-5 lg:col-span-2 h-52 bg-zinc-50"></div>
          <div className="card p-5 h-52 bg-zinc-50"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-navy">
            Olá, {user?.nome?.split(" ")[0] || "..."}
          </h1>
          <p className="text-sm text-muted mt-0.5">Achou um ponto? <span className="font-semibold gradient-brand-text">Coloca no Radar!</span></p>
        </div>
        <Link href="/nova-indicacao" className="btn-primary hidden sm:inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nova Indicação
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-metric p-4 animate-fade-in animate-fade-in-delay-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">Indicações</span>
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-navy">{totalIndicacoes}</p>
          <p className="text-xs text-muted mt-1">{emNegociacao} em negociação</p>
        </div>

        <div className="card-metric p-4 animate-fade-in animate-fade-in-delay-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">Conversão</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-navy">{taxaConversao}%</p>
          <p className="text-xs text-muted mt-1">{pontosInstalados} pontos ativos</p>
        </div>

        <div className="card-metric p-4 animate-fade-in animate-fade-in-delay-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">Recebido</span>
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-navy">
            R$ {financeiro.totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-muted mt-1">R$ {financeiro.totalPendente.toLocaleString("pt-BR")} pendente</p>
        </div>

        <div className="card-metric p-4 animate-fade-in animate-fade-in-delay-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">Score Médio</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: tierInfo.cor + '15' }}>
              <span className="text-xs font-bold" style={{ color: tierInfo.cor }}>★</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-navy">{scoreMedia}</p>
          <p className="text-xs mt-1" style={{ color: tierInfo.cor }}>Tier {tierInfo.label}</p>
        </div>
      </div>

      {/* Missões de Onboarding */}
      <MissoesOnboarding
        totalIndicacoes={totalIndicacoes}
        pontosInstalados={pontosInstalados}
        temFoto={indicacoes.some((i) => { try { return JSON.parse(i.fotos || "[]").length > 0; } catch { return false; } })}
        temPix={!!user?.chavePix}
      />

      {/* Middle Row: Chart + Projeção */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pipeline Chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-navy">Pipeline de Indicações</h2>
            <span className="text-xs text-muted">{totalIndicacoes} total</span>
          </div>
          <div className="flex items-end gap-3 h-36">
            {statusCounts.map((s) => (
              <div key={s.label} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-navy">{s.count}</span>
                <div className="w-full rounded-t-lg transition-all duration-700" style={{
                  height: `${(s.count / maxCount) * 100}%`,
                  minHeight: s.count > 0 ? '8px' : '2px',
                  background: s.color,
                  opacity: s.count > 0 ? 1 : 0.2,
                }}></div>
                <span className="text-[10px] text-muted text-center leading-tight">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Projeção de Ganhos */}
        <div className="card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2"></div>
          <h2 className="font-semibold text-navy mb-4">Projeção de Ganhos</h2>
          <div className="space-y-4 relative">
            <div>
              <p className="text-xs text-muted">Recorrência mensal</p>
              <p className="text-xl font-bold gradient-brand-text">
                R$ {recorrenciaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Projeção 6 meses</p>
              <p className="text-lg font-bold text-navy">
                R$ {projecao6Meses.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
              </p>
            </div>
            {potencialExtra > 0 && (
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted">Se fechar os {emNegociacao} em negociação</p>
                <p className="text-lg font-bold text-secondary">
                  +R$ {potencialExtra.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Métricas Avançadas: Streak, Metas, Benchmarks */}
      <MetricasCaptador />

      {/* Pontos Próximos */}
      <PontosProximos />

      {/* Mapa dos Pontos */}
      {indicacoes.filter((i) => i.latitude && i.longitude).length > 0 && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-navy">Meus Pontos no Mapa</h2>
            <span className="text-xs text-muted">{indicacoes.filter((i) => i.latitude && i.longitude).length} com localização</span>
          </div>
          <MapaPontos pontos={indicacoes} height="280px" linkPrefix="/indicacoes" />
        </div>
      )}

      {/* Bottom Row: Tier Progress + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tier Progress */}
        <div className="card p-5">
          <h2 className="font-semibold text-navy mb-4">Progresso do Tier</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold" style={{ backgroundColor: tierInfo.cor + '18', color: tierInfo.cor }}>
              {tierInfo.label.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-navy">{tierInfo.label}</p>
              <p className="text-xs text-muted">{totalIndicacoes} indicações · {pontosInstalados} instalados</p>
            </div>
          </div>
          {nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted">Próximo: <strong style={{ color: nextTier.cor }}>{nextTier.label}</strong></span>
                <span className="text-muted">{nextTier.indicacoesMinimas} ind. / {nextTier.pontosInstalados} inst.</span>
              </div>
              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{
                  width: `${Math.min(100, (totalIndicacoes / Math.max(nextTier.indicacoesMinimas, 1)) * 100)}%`,
                  background: `linear-gradient(90deg, ${tierInfo.cor}, ${nextTier.cor})`,
                }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Indicações Recentes */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-navy">Indicações Recentes</h2>
            <Link href="/indicacoes" className="text-xs font-medium text-secondary hover:underline">
              Ver todas →
            </Link>
          </div>
          {indicacoes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted text-sm">Nenhuma indicação ainda</p>
              <Link href="/nova-indicacao" className="btn-primary inline-block mt-3">
                Fazer primeira indicação
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {indicacoes.slice(0, 5).map((ind) => (
                <div key={ind.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-zinc-50/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold" style={{
                      background: ind.score >= 70 ? 'rgba(0,229,200,0.12)' : ind.score >= 50 ? 'rgba(64,64,191,0.1)' : 'rgba(107,114,148,0.1)',
                      color: ind.score >= 70 ? '#00a896' : ind.score >= 50 ? '#4040bf' : '#6b7294',
                    }}>
                      {ind.score}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy">{ind.nomeEstabelecimento}</p>
                      <p className="text-xs text-muted">{ind.cidade}</p>
                    </div>
                  </div>
                  <span className={`badge ${STATUS_BADGE[ind.status] || ""}`}>
                    {STATUS_LABELS[ind.status] || ind.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="sm:hidden fixed bottom-4 left-4 right-4 z-40">
        <Link href="/nova-indicacao" className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-center">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nova Indicação
        </Link>
      </div>
    </div>
  );
}
