"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

type Pagamento = {
  id: string;
  tipo: string;
  valor: number;
  mesReferencia: string | null;
  pago: boolean;
  dataPagamento: string | null;
  comprovanteUrl: string | null;
  indicacao: { nomeEstabelecimento: string; cidade: string };
};

type FinanceiroResponse = {
  pagamentos: Pagamento[];
  totalPago: number;
  totalPendente: number;
};

export default function FinanceiroPage() {
  const { data, error, isLoading, mutate } = useSWR<FinanceiroResponse>(
    "/api/financeiro",
    fetcher
  );

  const pagamentos = data?.pagamentos || [];
  const totalPago = data?.totalPago || 0;
  const totalPendente = data?.totalPendente || 0;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-zinc-200 rounded-lg"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-metric p-4 h-20"></div>
          ))}
        </div>
        <div className="card p-5 h-48"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-sm text-red-600">Não foi possível carregar os dados financeiros.</p>
        <button onClick={() => mutate()} className="btn-primary">Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Financeiro</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-metric p-4">
          <p className="text-xs text-muted uppercase tracking-wider font-medium">Total recebido</p>
          <p className="text-2xl font-bold gradient-brand-text mt-1">
            R$ {totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="card-metric p-4">
          <p className="text-xs text-muted uppercase tracking-wider font-medium">Pendente</p>
          <p className="text-2xl font-bold text-secondary mt-1">
            R$ {totalPendente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="card-metric p-4">
          <p className="text-xs text-muted uppercase tracking-wider font-medium">Total geral</p>
          <p className="text-2xl font-bold text-navy mt-1">
            R$ {(totalPago + totalPendente).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-navy">Extrato</h2>
        </div>
        {pagamentos.length === 0 ? (
          <p className="text-sm text-muted py-8 text-center">
            Nenhum pagamento registrado ainda. Quando sua indicação resultar em instalação, os valores aparecerão aqui.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50/80 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Ponto</th>
                <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Valor</th>
                <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody>
              {pagamentos.map((p) => (
                <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-zinc-50/50 transition-colors">
                  <td className="px-4 py-3 text-navy font-medium">{p.indicacao.nomeEstabelecimento}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      p.tipo === "BONUS_INCLUSAO" ? "badge-indicado" : "badge-analise"
                    }`}>
                      {p.tipo === "BONUS_INCLUSAO" ? "Bônus" : `Recorrência ${p.mesReferencia || ""}`}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-navy">
                    R$ {p.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      p.pago ? "badge-ativo" : "badge-aguardando"
                    }`}>
                      {p.pago ? "Pago" : "Pendente"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {p.dataPagamento ? new Date(p.dataPagamento).toLocaleDateString("pt-BR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
