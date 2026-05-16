"use client";

import { calcularProbabilidadeConversao } from "@/lib/score-preditivo";

type Props = {
  score: number;
  tipoLocal: string;
  fluxoPessoas: string;
  interesseDecissor: string;
  temEspaco: string;
  temEnergia: string;
  temConcorrente: boolean;
};

export default function ScorePreditivo(props: Props) {
  const { probabilidade, fatores } = calcularProbabilidadeConversao(props);

  const cor = probabilidade >= 70 ? "#00e5c8" : probabilidade >= 50 ? "#4040bf" : probabilidade >= 30 ? "#e5a800" : "#dc3545";
  const label = probabilidade >= 70 ? "Alta" : probabilidade >= 50 ? "Média" : probabilidade >= 30 ? "Baixa" : "Muito baixa";

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-navy flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b2fc9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          Probabilidade de Conversão
        </h3>
        <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ color: cor, backgroundColor: cor + "15" }}>
          {label}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e8eaf0" strokeWidth="3" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={cor} strokeWidth="3" strokeDasharray={`${probabilidade}, 100`} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-navy">{probabilidade}%</span>
        </div>
        <div className="flex-1">
          <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${probabilidade}%`, backgroundColor: cor }}></div>
          </div>
          <p className="text-xs text-muted mt-1.5">Baseado em padrões históricos de conversão</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {fatores.map((f) => (
          <div key={f.fator} className="flex items-center gap-2 text-xs">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              f.impacto === "positivo" ? "bg-green-500" : f.impacto === "negativo" ? "bg-red-500" : "bg-yellow-500"
            }`}></span>
            <span className="text-muted font-medium w-28">{f.fator}</span>
            <span className="text-navy">{f.detalhe}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
