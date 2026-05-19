"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { TIERS } from "@/lib/tiers";

type Indicador = {
  id: string;
  nome: string;
  email: string;
  cpfCnpj: string;
  telefone: string;
  tier: string;
  chavePix: string | null;
  tipoChavePix: string | null;
  createdAt: string;
  _count: { indicacoes: number };
};

type IndicadoresResponse = {
  indicadores: Indicador[];
};

export default function IndicadoresPage() {
  const { data, error, isLoading, mutate } = useSWR<IndicadoresResponse>(
    "/api/indicadores",
    fetcher
  );

  const indicadores = data?.indicadores || [];
  const totalIndicadores = indicadores.length;
  const comPix = indicadores.filter((i) => i.chavePix).length;
  const totalIndicacoes = indicadores.reduce((s, i) => s + (i._count?.indicacoes || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-zinc-200 rounded-lg"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-metric p-5 h-20"></div>
          ))}
        </div>
        <div className="card p-5 h-64"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-sm text-red-600">Não foi possível carregar os captadores.</p>
        <button onClick={() => mutate()} className="btn-primary">Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-navy">Captadores</h1>
          <p className="text-sm text-muted mt-0.5">Rede de parceiros cadastrados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-metric p-5 animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider">Total Captadores</p>
              <p className="text-2xl font-bold text-navy mt-1">{totalIndicadores}</p>
            </div>
            <div className="w-10 h-10 rounded-xl gradient-brand-subtle flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4040bf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
          </div>
        </div>
        <div className="card-metric p-5 animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider">Total Indicações</p>
              <p className="text-2xl font-bold text-navy mt-1">{totalIndicacoes}</p>
            </div>
            <div className="w-10 h-10 rounded-xl gradient-brand-subtle flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
        </div>
        <div className="card-metric p-5 animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider">Com PIX Cadastrado</p>
              <p className="text-2xl font-bold text-navy mt-1">{comPix}</p>
              <p className="text-xs text-muted mt-1">{totalIndicadores - comPix} sem PIX</p>
            </div>
            <div className="w-10 h-10 rounded-xl gradient-brand-subtle flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b2fc9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden animate-fade-in">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-navy">Rede de Captadores</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-zinc-50/80 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Contato</th>
              <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">CPF/CNPJ</th>
              <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">PIX</th>
              <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Tier</th>
              <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Indicações</th>
              <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Desde</th>
            </tr>
          </thead>
          <tbody>
            {indicadores.map((ind) => {
              const tierInfo = TIERS[ind.tier] || TIERS.BRONZE;
              return (
                <tr key={ind.id} className="border-b border-border/50 last:border-0 hover:bg-zinc-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: tierInfo.cor }}>
                        {ind.nome.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-navy">{ind.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-navy">{ind.email}</p>
                    <p className="text-xs text-muted">{ind.telefone}</p>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">{ind.cpfCnpj}</td>
                  <td className="px-4 py-3">
                    {ind.chavePix ? (
                      <div>
                        <p className="text-xs text-navy font-medium">{ind.chavePix}</p>
                        <p className="text-[10px] text-muted">{ind.tipoChavePix}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-muted italic">Não informado</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ color: tierInfo.cor, backgroundColor: tierInfo.cor + '15' }}>
                      {tierInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-navy">{ind._count?.indicacoes || 0}</td>
                  <td className="px-4 py-3 text-muted text-xs">{new Date(ind.createdAt).toLocaleDateString("pt-BR")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {indicadores.length === 0 && (
          <p className="text-sm text-muted py-8 text-center">Nenhum captador cadastrado.</p>
        )}
      </div>
    </div>
  );
}
