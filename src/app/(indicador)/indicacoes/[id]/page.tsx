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
  franqueado: string | null;
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
  const [showFranqueadoForm, setShowFranqueadoForm] = useState(false);
  const [franqueadoForm, setFranqueadoForm] = useState({ nome: "", telefone: "", tipo: "indicar" });
  const [franqueadoEnviado, setFranqueadoEnviado] = useState(false);

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

      {/* Card Aguardando Franqueado */}
      {indicacao.status === "AGUARDANDO_FRANQUEADO" && (
        <div className="card p-5 border-2 border-secondary/30 bg-secondary/5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-navy">Ponto pronto! Aguardando franqueado</p>
              <p className="text-xs text-muted mt-1">
                Este ponto já foi negociado e está pronto para operar. Só falta um franqueado para colocar a máquina aqui.
              </p>
            </div>
          </div>

          {franqueadoEnviado ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-green-700">Indicação enviada! A equipe AVEND vai entrar em contato.</p>
            </div>
          ) : !showFranqueadoForm ? (
            <div className="flex gap-2">
              <button
                onClick={() => { setShowFranqueadoForm(true); setFranqueadoForm({ ...franqueadoForm, tipo: "indicar" }); }}
                className="btn-secondary text-xs flex-1"
              >
                Indicar alguém para ser franqueado
              </button>
              <button
                onClick={() => { setShowFranqueadoForm(true); setFranqueadoForm({ ...franqueadoForm, tipo: "eu" }); }}
                className="btn-primary text-xs flex-1"
              >
                Quero ser franqueado aqui
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-2 border-t border-secondary/20">
              <p className="text-xs font-medium text-navy">
                {franqueadoForm.tipo === "eu" ? "Seus dados para contato:" : "Dados de quem você indica:"}
              </p>
              <input
                type="text"
                placeholder="Nome completo"
                value={franqueadoForm.nome}
                onChange={(e) => setFranqueadoForm({ ...franqueadoForm, nome: e.target.value })}
                className="input-field text-sm"
              />
              <input
                type="tel"
                placeholder="Telefone / WhatsApp"
                value={franqueadoForm.telefone}
                onChange={(e) => setFranqueadoForm({ ...franqueadoForm, telefone: e.target.value })}
                className="input-field text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (!franqueadoForm.nome || !franqueadoForm.telefone) return;
                    const msg = franqueadoForm.tipo === "eu"
                      ? `Captador quer ser franqueado: ${franqueadoForm.nome} - ${franqueadoForm.telefone}`
                      : `Captador indica franqueado: ${franqueadoForm.nome} - ${franqueadoForm.telefone}`;
                    await fetch(`/api/indicacoes/${indicacao.id}/comunicacoes`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ tipo: "NOTA", mensagem: msg }),
                    });
                    setFranqueadoEnviado(true);
                    setShowFranqueadoForm(false);
                  }}
                  className="btn-primary text-xs flex-1"
                >
                  Enviar
                </button>
                <button
                  onClick={() => setShowFranqueadoForm(false)}
                  className="btn-secondary text-xs"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
