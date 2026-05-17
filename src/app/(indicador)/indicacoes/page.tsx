"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { STATUS_LIST, STATUS_BADGE } from "@/lib/constants";

type Indicacao = {
  id: string;
  nomeEstabelecimento: string;
  cidade: string;
  estado: string;
  score: number;
  status: string;
  createdAt: string;
};

type IndicacoesResponse = {
  indicacoes: Indicacao[];
  total: number;
  page: number;
  pages: number;
};

export default function IndicacoesPage() {
  const [view, setView] = useState<"kanban" | "lista">("kanban");
  const [page, setPage] = useState(1);

  const { data, error, isLoading, mutate } = useSWR<IndicacoesResponse>(
    view === "lista" ? `/api/indicacoes?page=${page}&limit=20` : `/api/indicacoes?all=true`,
    fetcher
  );

  const indicacoes = data?.indicacoes || [];
  const totalPages = data?.pages || 1;

  const grouped = STATUS_LIST.map((col) => ({
    ...col,
    items: indicacoes.filter((i) => i.status === col.key),
  }));

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-zinc-200 rounded-lg"></div>
          <div className="h-9 w-36 bg-zinc-100 rounded-xl"></div>
        </div>
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[240px] space-y-2">
              <div className="h-6 w-20 bg-zinc-100 rounded"></div>
              <div className="h-24 bg-zinc-50 rounded-xl"></div>
              <div className="h-24 bg-zinc-50 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-sm text-red-600">Não foi possível carregar as indicações.</p>
        <button onClick={() => mutate()} className="btn-primary">Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Minhas Indicações</h1>
        <div className="flex gap-1 bg-white border border-border rounded-xl p-1">
          <button
            onClick={() => setView("kanban")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${view === "kanban" ? "gradient-brand-subtle text-navy shadow-sm" : "text-muted"}`}
            aria-label="Visualização Kanban"
          >
            Kanban
          </button>
          <button
            onClick={() => setView("lista")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${view === "lista" ? "gradient-brand-subtle text-navy shadow-sm" : "text-muted"}`}
            aria-label="Visualização Lista"
          >
            Lista
          </button>
        </div>
      </div>

      {indicacoes.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">Nenhuma indicação cadastrada ainda.</p>
      ) : view === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {grouped.filter((g) => g.items.length > 0).map((col) => (
            <div key={col.key} className="min-w-[240px] flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <span className={`badge ${col.badge}`}>
                  {col.label}
                </span>
                <span className="text-xs text-muted font-medium">{col.items.length}</span>
              </div>
              <div className="space-y-2">
                {col.items.map((ind) => (
                  <Link href={`/indicacoes/${ind.id}`} key={ind.id} className="card p-3.5 block hover:scale-[1.02] transition-transform">
                    <p className="text-sm font-medium text-navy">{ind.nomeEstabelecimento}</p>
                    <p className="text-xs text-muted mt-1">{ind.cidade}/{ind.estado}</p>
                    {ind.status === "AGUARDANDO_FRANQUEADO" && (
                      <p className="text-[10px] mt-2 px-2 py-1 rounded-lg bg-secondary/10 text-secondary font-medium">
                        🏪 Pronto! Aguardando franqueado — clique para indicar
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-[11px] text-muted">
                        {new Date(ind.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                      <span className="text-xs font-bold gradient-brand-text">Score {ind.score}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50/80 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Local</th>
                  <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Cidade</th>
                  <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Score</th>
                  <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Data</th>
                </tr>
              </thead>
              <tbody>
                {indicacoes.map((ind) => {
                  const col = STATUS_LIST.find((c) => c.key === ind.status);
                  return (
                    <tr key={ind.id} className="border-b border-border/50 last:border-0 hover:bg-zinc-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-navy">{ind.nomeEstabelecimento}</td>
                      <td className="px-4 py-3 text-muted">{ind.cidade}/{ind.estado}</td>
                      <td className="px-4 py-3"><span className="font-bold gradient-brand-text">{ind.score}</span></td>
                      <td className="px-4 py-3">
                        <span className={`badge ${col?.badge || ""}`}>
                          {col?.label || ind.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted">{new Date(ind.createdAt).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
    </div>
  );
}
