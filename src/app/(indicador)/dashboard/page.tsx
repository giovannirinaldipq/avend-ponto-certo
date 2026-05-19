"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { MapPin, CheckCircle, DollarSign, Target, TrendingUp } from "lucide-react";
import { TIERS, proximoTier } from "@/lib/tiers";
import { STATUS_LABELS, STATUS_BADGE } from "@/lib/constants";
import PontosProximos from "@/components/PontosProximos";
import MissoesOnboarding from "@/components/MissoesOnboarding";
import MetricasCaptador from "@/components/MetricasCaptador";
import ScoreRing from "@/components/ScoreRing";
import ButtonPremium from "@/components/ButtonPremium";
import { SkeletonDashboard } from "@/components/LoadingSkeleton";
import { KPICard, ThemeToggle } from "@/components/ui";
import { BarChart } from "@/components/charts";

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

const stagger = {
  container: { transition: { staggerChildren: 0.05 } },
  item: {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  },
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
  const emNegociacao = indicacoes.filter((i) => i.status === "EM_NEGOCIACAO").length;
  const recusados = indicacoes.filter((i) => i.status === "RECUSADO").length;
  const taxaConversao = totalIndicacoes > 0 ? Math.round((pontosInstalados / totalIndicacoes) * 100) : 0;
  const scoreMedia = totalIndicacoes > 0 ? Math.round(indicacoes.reduce((s, i) => s + i.score, 0) / totalIndicacoes) : 0;

  const tierInfo = user ? TIERS[user.tier] : TIERS.BRONZE;
  const nextTier = user ? proximoTier(user.tier) : null;

  const faturamentoTotal = indicacoes
    .filter((i) => i.faturamentoMensal)
    .reduce((s, i) => s + (i.faturamentoMensal || 0), 0);
  const recorrenciaMensal = faturamentoTotal * 0.05;
  const projecao6Meses = recorrenciaMensal * 6 + pontosInstalados * 500;
  const potencialExtra = emNegociacao * 500 + emNegociacao * 8000 * 0.05 * 6;

  const statusCounts = [
    { name: "Indicados", value: indicacoes.filter((i) => i.status === "INDICADO").length, color: "#4040bf" },
    { name: "Análise", value: indicacoes.filter((i) => i.status === "EM_ANALISE").length, color: "#8b2fc9" },
    { name: "Negociação", value: emNegociacao, color: "#00e5c8" },
    { name: "Instalados", value: pontosInstalados, color: "#1a1145" },
    { name: "Recusados", value: recusados, color: "#dc3545" },
  ];

  if (loading) {
    return <SkeletonDashboard className="max-w-6xl mx-auto" />;
  }

  return (
    <motion.div
      className="space-y-6 max-w-6xl mx-auto"
      initial="initial"
      animate="animate"
      variants={stagger.container}
    >
      {/* Header */}
      <motion.div variants={stagger.item} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">
            Olá, {user?.nome?.split(" ")[0] || "..."}
          </h1>
          <p className="text-sm text-muted mt-0.5">Achou um ponto? <span className="font-semibold gradient-brand-text">Coloca no Radar!</span></p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle size="sm" />
          <Link href="/nova-indicacao" className="hidden sm:block">
            <ButtonPremium glow pulse icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}>
              Nova Indicação
            </ButtonPremium>
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger.item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Indicações"
          value={totalIndicacoes}
          icon={<MapPin size={18} />}
          color="secondary"
          trend={emNegociacao > 0 ? { value: emNegociacao, label: "em negociação" } : undefined}
        />
        <KPICard
          title="Conversão"
          value={taxaConversao}
          format="percent"
          icon={<CheckCircle size={18} />}
          color="primary"
          sparklineData={[10, 25, 35, taxaConversao]}
        />
        <KPICard
          title="Recebido"
          value={financeiro.totalPago}
          format="currency"
          icon={<DollarSign size={18} />}
          color="accent"
          trend={financeiro.totalPendente > 0 ? { value: financeiro.totalPendente, label: "pendente" } : undefined}
        />
        <KPICard
          title="Score Médio"
          value={scoreMedia}
          icon={<Target size={18} />}
          color="success"
        />
      </motion.div>

      {/* Missões de Onboarding */}
      <motion.div variants={stagger.item}>
        <MissoesOnboarding
          totalIndicacoes={totalIndicacoes}
          pontosInstalados={pontosInstalados}
          temFoto={indicacoes.some((i) => { try { return JSON.parse(i.fotos || "[]").length > 0; } catch { return false; } })}
          temPix={!!user?.chavePix}
        />
      </motion.div>

      {/* Middle Row: Chart + Projeção */}
      <motion.div variants={stagger.item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-border p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-navy">Pipeline de Indicações</h2>
            <span className="text-xs text-muted">{totalIndicacoes} total</span>
          </div>
          <BarChart data={statusCounts} height={160} showXAxis barRadius={8} />
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-primary" />
            <h2 className="font-semibold text-navy">Projeção de Ganhos</h2>
          </div>
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
      </motion.div>

      {/* Métricas Avançadas */}
      <motion.div variants={stagger.item}>
        <MetricasCaptador />
      </motion.div>

      {/* Pontos Próximos */}
      <motion.div variants={stagger.item}>
        <PontosProximos />
      </motion.div>

      {/* Mapa */}
      {indicacoes.filter((i) => i.latitude && i.longitude).length > 0 && (
        <motion.div variants={stagger.item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-navy">Meus Pontos no Mapa</h2>
            <span className="text-xs text-muted">{indicacoes.filter((i) => i.latitude && i.longitude).length} com localização</span>
          </div>
          <MapaPontos pontos={indicacoes} height="280px" linkPrefix="/indicacoes" />
        </motion.div>
      )}

      {/* Bottom Row: Tier + Recentes */}
      <motion.div variants={stagger.item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-border p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, rgba(0,229,200,0.03), rgba(64,64,191,0.03))" }}></div>
          <h2 className="font-semibold text-navy mb-4 relative">Progresso do Tier</h2>
          <div className="flex items-center gap-4 mb-4 relative">
            <motion.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold"
              style={{ backgroundColor: tierInfo.cor + '18', color: tierInfo.cor }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              {tierInfo.label.charAt(0)}
            </motion.div>
            <div>
              <p className="font-bold text-navy">{tierInfo.label}</p>
              <p className="text-xs text-muted">{totalIndicacoes} indicações · {pontosInstalados} instalados</p>
            </div>
          </div>
          {nextTier && (
            <div className="space-y-2 relative">
              <div className="flex justify-between text-xs">
                <span className="text-muted">Próximo: <strong style={{ color: nextTier.cor }}>{nextTier.label}</strong></span>
                <span className="text-muted">{nextTier.indicacoesMinimas} ind. / {nextTier.pontosInstalados} inst.</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{
                  width: `${Math.min(100, (totalIndicacoes / Math.max(nextTier.indicacoesMinimas, 1)) * 100)}%`,
                }}></div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 lg:col-span-2">
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
            <div className="space-y-1">
              {indicacoes.slice(0, 5).map((ind, i) => (
                <motion.div
                  key={ind.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ScoreRing score={ind.score} size={36} strokeWidth={3} showLabel={false} />
                    <div>
                      <p className="text-sm font-medium text-navy">{ind.nomeEstabelecimento}</p>
                      <p className="text-xs text-muted">{ind.cidade}</p>
                    </div>
                  </div>
                  <span className={`badge ${STATUS_BADGE[ind.status] || ""}`}>
                    {STATUS_LABELS[ind.status] || ind.status}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Mobile CTA */}
      <div className="sm:hidden fixed bottom-4 left-4 right-4 z-40">
        <Link href="/nova-indicacao" className="block">
          <ButtonPremium glow className="w-full py-3.5" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}>
            Nova Indicação
          </ButtonPremium>
        </Link>
      </div>
    </motion.div>
  );
}
