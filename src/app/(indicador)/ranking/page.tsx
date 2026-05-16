"use client";

import { useEffect, useState } from "react";
import { TIERS } from "@/lib/tiers";

type RankingItem = {
  id: string;
  nome: string;
  tier: string;
  totalIndicacoes: number;
  pontosInstalados: number;
  posicao: number;
};

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ranking")
      .then((r) => r.json())
      .then((d) => {
        setRanking(d.ranking || []);
        setUserId(d.userId || "");
      })
      .finally(() => setLoading(false));
  }, []);

  const myPosition = ranking.find((r) => r.id === userId);

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto animate-pulse">
        <div className="h-8 w-48 bg-zinc-200 rounded-lg"></div>
        <div className="h-24 bg-zinc-100 rounded-2xl"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-zinc-50 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-navy">Ranking</h1>
        <p className="text-sm text-muted mt-1">Classificação dos captadores por performance</p>
      </div>

      {myPosition && (
        <div className="card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-center gap-4 relative">
            <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center">
              <span className="text-2xl font-bold text-navy">#{myPosition.posicao}</span>
            </div>
            <div>
              <p className="font-bold text-navy text-lg">Sua posição</p>
              <p className="text-sm text-muted">
                {myPosition.totalIndicacoes} indicações · {myPosition.pontosInstalados} instalados
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-navy">Leaderboard</h2>
        </div>
        <div className="divide-y divide-border/50">
          {ranking.map((item) => {
            const tierInfo = TIERS[item.tier] || TIERS.BRONZE;
            const isMe = item.id === userId;
            return (
              <div
                key={item.id}
                className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${isMe ? "bg-primary/5" : "hover:bg-zinc-50/50"}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  item.posicao === 1 ? "bg-yellow-100 text-yellow-700" :
                  item.posicao === 2 ? "bg-zinc-200 text-zinc-700" :
                  item.posicao === 3 ? "bg-orange-100 text-orange-700" :
                  "bg-zinc-100 text-muted"
                }`}>
                  {item.posicao}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium truncate ${isMe ? "text-navy font-bold" : "text-navy"}`}>
                      {item.nome} {isMe && <span className="text-xs text-primary">(você)</span>}
                    </p>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ color: tierInfo.cor, backgroundColor: tierInfo.cor + "15" }}
                    >
                      {tierInfo.label}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-navy">{item.pontosInstalados}</p>
                  <p className="text-[10px] text-muted">instalados</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted">{item.totalIndicacoes}</p>
                  <p className="text-[10px] text-muted">indicações</p>
                </div>
              </div>
            );
          })}
        </div>
        {ranking.length === 0 && (
          <p className="text-sm text-muted py-8 text-center">Nenhum captador no ranking ainda.</p>
        )}
      </div>
    </div>
  );
}
