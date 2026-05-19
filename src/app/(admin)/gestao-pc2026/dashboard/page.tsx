"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Clock, Target, DollarSign, Users, Zap, Activity } from "lucide-react";
import FeedAtividade from "@/components/FeedAtividade";
import { KPICard, ThemeToggle } from "@/components/ui";
import { AreaChart, BarChart } from "@/components/charts";
import { cn, formatCurrency } from "@/lib/design-system";

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

const stagger = {
  container: { transition: { staggerChildren: 0.06 } },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  },
};

export default function AdminDashboardPage() {
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [loading, setLoading] = useState(true);
  const [aguardandoFranqueado, setAguardandoFranqueado] = useState(0);

  useEffect(() => {
    fetch("/api/metricas")
      .then((r) => r.json())
      .then((d) => setMetricas(d))
      .finally(() => setLoading(false));
    fetch("/api/indicacoes?status=AGUARDANDO_FRANQUEADO&all=true")
      .then((r) => r.json())
      .then((d) => setAguardandoFranqueado(d.total || 0))
      .catch(() => {});
  }, []);

  if (loading || !metricas) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 skeleton rounded-lg"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28 rounded-2xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="skeleton h-64 rounded-2xl"></div>
          <div className="skeleton h-64 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const chartData = metricas.crescimentoMensal.map((m) => ({
    name: m.mes,
    value: m.indicacoes,
  }));

  return (
    <motion.div
      className="space-y-6"
      initial="initial"
      animate="animate"
      variants={stagger.container}
    >
      {/* Header */}
      <motion.div variants={stagger.item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
          <p className="text-sm text-muted mt-0.5">Visão executiva do Radar by Avend</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle size="sm" />
          <a href="/api/relatorios?tipo=pipeline" className="btn-secondary text-xs px-3 py-2">Pipeline</a>
          <a href="/api/relatorios?tipo=financeiro" className="btn-secondary text-xs px-3 py-2">Financeiro</a>
          <a href="/api/relatorios?tipo=indicadores" className="btn-secondary text-xs px-3 py-2">Captadores</a>
        </div>
      </motion.div>

      {/* KPIs Row 1 */}
      <motion.div variants={stagger.item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Indicações"
          value={metricas.totalIndicacoes}
          icon={<BarChart3 size={20} />}
          color="primary"
          sparklineData={chartData.map((d) => d.value)}
          trend={{ value: 12, label: "vs mês anterior" }}
        />
        <KPICard
          title="Taxa Conversão"
          value={metricas.taxaConversao}
          format="percent"
          icon={<TrendingUp size={20} />}
          color="accent"
        />
        <KPICard
          title="Tempo Médio"
          value={metricas.tempoMedioConversao}
          suffix="dias"
          icon={<Clock size={20} />}
          color="secondary"
        />
        <KPICard
          title="Score Médio"
          value={metricas.scoreMedio}
          icon={<Target size={20} />}
          color="success"
        />
      </motion.div>

      {/* KPIs Row 2 */}
      <motion.div variants={stagger.item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Receita Paga"
          value={metricas.receitaTotal}
          format="currency"
          icon={<DollarSign size={20} />}
          color="primary"
        />
        <KPICard
          title="Pendente"
          value={metricas.receitaPendente}
          format="currency"
          icon={<DollarSign size={20} />}
          color="warning"
        />
        <KPICard
          title="Captadores Ativos"
          value={metricas.indicadoresAtivos}
          suffix={`/ ${metricas.totalIndicadores}`}
          icon={<Users size={20} />}
          color="secondary"
        />
        <KPICard
          title="Faturamento Mensal"
          value={metricas.faturamentoMensal}
          format="currency"
          icon={<Zap size={20} />}
          color="accent"
        />
      </motion.div>

      {/* Franqueado Alert */}
      {aguardandoFranqueado > 0 && (
        <motion.a
          href="/gestao-pc2026/pipeline"
          variants={stagger.item}
          whileHover={{ scale: 1.005 }}
          className="block group"
        >
          <div className="relative overflow-hidden rounded-2xl border-2 border-secondary/40 bg-gradient-to-r from-secondary/10 via-secondary/5 to-primary/5 p-6 hover:shadow-lg transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-secondary/20 border border-secondary/30 flex items-center justify-center">
                  <span className="text-3xl">🏪</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-navy">Pontos disponíveis para franqueados</p>
                  <p className="text-sm text-muted mt-0.5">Negociados e prontos para operar</p>
                  <p className="text-xs text-secondary font-medium mt-1 group-hover:underline">Ver no pipeline →</p>
                </div>
              </div>
              <p className="text-5xl font-black text-secondary">{aguardandoFranqueado}</p>
            </div>
          </div>
        </motion.a>
      )}

      {/* Charts Row */}
      <motion.div variants={stagger.item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-navy">Crescimento Mensal</h3>
            <Activity size={16} className="text-muted" />
          </div>
          <AreaChart
            data={chartData}
            height={180}
            showXAxis
            formatValue={(v) => `${v} indicações`}
          />
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-sm font-semibold text-navy mb-4">Atividade Recente</h3>
          <FeedAtividade limit={8} />
        </div>
      </motion.div>

      {/* Health Rings */}
      <motion.div variants={stagger.item} className="bg-white rounded-2xl border border-border p-6">
        <h3 className="text-sm font-semibold text-navy mb-6">Saúde da Rede</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <HealthRing value={metricas.taxaConversao} label="Conversão" color="#00e5c8" />
          <HealthRing
            value={metricas.totalIndicadores > 0 ? Math.round((metricas.indicadoresAtivos / metricas.totalIndicadores) * 100) : 0}
            label="Captadores Ativos"
            color="#4040bf"
          />
          <HealthRing value={metricas.scoreMedio} label="Score Médio" color="#8b2fc9" />
        </div>
      </motion.div>
    </motion.div>
  );
}

function HealthRing({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="text-center">
      <motion.div
        className="relative w-20 h-20 mx-auto mb-3"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            className="text-border"
            strokeWidth="3"
          />
          <motion.path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${value}, 100`}
            initial={{ strokeDasharray: "0, 100" }}
            animate={{ strokeDasharray: `${value}, 100` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-navy">
          {value}%
        </span>
      </motion.div>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
