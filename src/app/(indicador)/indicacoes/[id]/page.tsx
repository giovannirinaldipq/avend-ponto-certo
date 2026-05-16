"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FotoGaleria from "@/components/FotoGaleria";
import ComunicacaoTimeline from "@/components/ComunicacaoTimeline";
import ScorePreditivo from "@/components/ScorePreditivo";

type Indicacao = {
  id: string;
  nomeEstabelecimento: string;
  endereco: string;
  cidade: string;
  estado: string;
  tipoLocal: string;
  fluxoPessoas: string;
  interesseDecissor: string;
  temEspaco: string;
  temEnergia: string;
  temConcorrente: boolean;
  score: number;
  status: string;
  fotos: string;
  createdAt: string;
  faturamentoMensal: number | null;
};

const STATUS_LABELS: Record<string, string> = { INDICADO: "Indicado", EM_ANALISE: "Em Analise", AGUARDANDO_FRANQUEADO: "Aguardando", EM_NEGOCIACAO: "Negociacao", INSTALADO: "Instalado", ATIVO: "Ativo", RECUSADO: "Recusado" };
const STATUS_BADGE: Record<string, string> = { INDICADO: "badge-indicado", EM_ANALISE: "badge-analise", AGUARDANDO_FRANQUEADO: "badge-aguardando", EM_NEGOCIACAO: "badge-negociacao", INSTALADO: "badge-instalado", ATIVO: "badge-ativo", RECUSADO: "badge-recusado" };

export default function IndicacaoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const [indicacao, setIndicacao] = useState<Indicacao | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`/api/indicacoes/${params.id}`)
      .then((r) => r.json())
      .then((d) => setIndicacao(d.indicacao));
  }, [params.id]);

  const fotos: string[] = indicacao ? JSON.parse(indicacao.fotos || "[]") : [];

  async function handleUploadFotos(urls: string[]) {
    if (!indicacao) return;
    setUploading(true);
    await fetch(`/api/indicacoes/${indicacao.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fotos: urls }),
    });
    const existing = JSON.parse(indicacao.fotos || "[]");
    setIndicacao((prev) => prev ? { ...prev, fotos: JSON.stringify([...existing, ...urls]) } : prev);
    setUploading(false);
  }

  if (!indicacao) {
    return <div className="animate-pulse space-y-4 max-w-3xl mx-auto"><div className="h-8 w-64 bg-zinc-200 rounded-lg"></div><div className="h-32 bg-zinc-100 rounded-2xl"></div></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="text-sm text-muted hover:text-navy transition-colors">&larr; Voltar</button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">{indicacao.nomeEstabelecimento}</h1>
          <p className="text-sm text-muted mt-1">{indicacao.endereco} — {indicacao.cidade}/{indicacao.estado}</p>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-bold ${indicacao.score >= 70 ? "gradient-brand-text" : indicacao.score >= 50 ? "text-secondary" : "text-muted"}`}>{indicacao.score}</p>
          <span className={`badge ${STATUS_BADGE[indicacao.status] || ""}`}>{STATUS_LABELS[indicacao.status] || indicacao.status}</span>
        </div>
      </div>

      <FotoGaleria fotos={fotos} onUpload={handleUploadFotos} uploading={uploading} />

      <div className="card p-4">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-muted">Tipo</dt><dd className="text-navy font-medium">{indicacao.tipoLocal}</dd></div>
          <div><dt className="text-muted">Status</dt><dd><span className={`badge ${STATUS_BADGE[indicacao.status]}`}>{STATUS_LABELS[indicacao.status]}</span></dd></div>
          <div><dt className="text-muted">Cadastrado em</dt><dd className="text-navy">{new Date(indicacao.createdAt).toLocaleDateString("pt-BR")}</dd></div>
          {indicacao.faturamentoMensal && <div><dt className="text-muted">Faturamento</dt><dd className="text-navy font-medium">R$ {indicacao.faturamentoMensal.toLocaleString("pt-BR")}/mes</dd></div>}
        </dl>
      </div>

      <ScorePreditivo
        score={indicacao.score}
        tipoLocal={indicacao.tipoLocal}
        fluxoPessoas={indicacao.fluxoPessoas}
        interesseDecissor={indicacao.interesseDecissor}
        temEspaco={indicacao.temEspaco}
        temEnergia={indicacao.temEnergia}
        temConcorrente={indicacao.temConcorrente}
      />

      <ComunicacaoTimeline indicacaoId={indicacao.id} />
    </div>
  );
}
