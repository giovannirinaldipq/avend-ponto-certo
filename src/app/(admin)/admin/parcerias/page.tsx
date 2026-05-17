"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { PARCERIA_STATUS_LABELS, PARCERIA_STATUS_BADGE } from "@/lib/constants";

type Parceria = {
  id: string;
  tipo: string;
  nomeEmpresa: string;
  nomeContato: string;
  email: string;
  telefone: string;
  numUnidades: number | null;
  status: string;
  createdAt: string;
};

export default function ParceriasPage() {
  const { data, isLoading } = useSWR<{ parcerias: Parceria[] }>("/api/parcerias", fetcher);
  const [tab, setTab] = useState<"GERAL" | "REDE">("GERAL");

  const parcerias = data?.parcerias?.filter((p) => p.tipo === tab) || [];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-zinc-200 rounded-lg"></div>
        <div className="h-12 w-64 bg-zinc-100 rounded-lg"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="card p-5 h-20"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-navy">Parcerias</h1>
        <p className="text-sm text-muted mt-0.5">Gestão de parcerias comerciais e pontos em escala</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("GERAL")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === "GERAL" ? "bg-primary/10 text-primary-dark" : "text-muted hover:bg-zinc-100"}`}
        >
          Parcerias Gerais
          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-200 text-muted font-bold">
            {data?.parcerias?.filter((p) => p.tipo === "GERAL").length || 0}
          </span>
        </button>
        <button
          onClick={() => setTab("REDE")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === "REDE" ? "bg-primary/10 text-primary-dark" : "text-muted hover:bg-zinc-100"}`}
        >
          Pontos em Escala
          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-200 text-muted font-bold">
            {data?.parcerias?.filter((p) => p.tipo === "REDE").length || 0}
          </span>
        </button>
      </div>

      {/* Lista */}
      {parcerias.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">Nenhuma parceria {tab === "GERAL" ? "geral" : "de pontos em escala"} cadastrada.</p>
      ) : (
        <div className="space-y-3">
          {parcerias.map((p) => (
            <Link
              key={p.id}
              href={`/admin/parcerias/${p.id}`}
              className="card p-4 block transition-all hover:shadow-md hover:border-primary/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-navy">{p.nomeEmpresa}</p>
                  <p className="text-xs text-muted mt-0.5">{p.nomeContato} · {p.email}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${PARCERIA_STATUS_BADGE[p.status]}`}>
                      {PARCERIA_STATUS_LABELS[p.status]}
                    </span>
                    {p.tipo === "REDE" && p.numUnidades && (
                      <p className="text-[10px] text-muted mt-1">{p.numUnidades} unidades est.</p>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}