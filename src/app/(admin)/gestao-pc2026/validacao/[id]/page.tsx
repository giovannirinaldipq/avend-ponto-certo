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
  horarioFuncionamento: string;
  fluxoPessoas: string;
  nomeDecissor: string;
  telefoneDecissor: string;
  cargoDecissor: string | null;
  interesseDecissor: string;
  temEspaco: string;
  temEnergia: string;
  temConcorrente: boolean;
  score: number;
  status: string;
  fotos: string;
  dataInstalacao: string | null;
  faturamentoMensal: number | null;
  createdAt: string;
  indicador: { nome: string; email: string; telefone: string; tier: string };
};

const STATUS_FLOW = ["INDICADO", "EM_ANALISE", "AGUARDANDO_FRANQUEADO", "EM_NEGOCIACAO", "INSTALADO", "ATIVO", "RECUSADO"];
const STATUS_LABELS: Record<string, string> = { INDICADO: "Indicado", EM_ANALISE: "Em Analise", AGUARDANDO_FRANQUEADO: "Aguardando Franqueado", EM_NEGOCIACAO: "Em Negociacao", INSTALADO: "Instalado", ATIVO: "Ativo", RECUSADO: "Recusado" };
const STATUS_BADGE: Record<string, string> = { INDICADO: "badge-indicado", EM_ANALISE: "badge-analise", AGUARDANDO_FRANQUEADO: "badge-aguardando", EM_NEGOCIACAO: "badge-negociacao", INSTALADO: "badge-instalado", ATIVO: "badge-ativo", RECUSADO: "badge-recusado" };

export default function ValidacaoPage() {
  const params = useParams();
  const router = useRouter();
  const [indicacao, setIndicacao] = useState<Indicacao | null>(null);
  const [novoStatus, setNovoStatus] = useState("");
  const [faturamento, setFaturamento] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/indicacoes/${params.id}`)
      .then((r) => r.json())
      .then((d) => { setIndicacao(d.indicacao); setNovoStatus(d.indicacao?.status || ""); });
  }, [params.id]);

  async function handleSave() {
    setSaving(true);
    const body: Record<string, unknown> = { status: novoStatus };
    if (novoStatus === "INSTALADO" || novoStatus === "ATIVO") {
      body.dataInstalacao = new Date().toISOString();
      if (faturamento) body.faturamentoMensal = parseFloat(faturamento);
    }
    await fetch(`/api/indicacoes/${params.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    router.push("/gestao-pc2026/pipeline");
  }

  if (!indicacao) {
    return <div className="animate-pulse space-y-4 max-w-3xl mx-auto"><div className="h-8 w-64 bg-zinc-200 rounded-lg"></div><div className="h-48 bg-zinc-100 rounded-2xl"></div></div>;
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
          <p className="text-xs text-muted">Score</p>
        </div>
      </div>

      {(() => {
        const fotos: string[] = JSON.parse(indicacao.fotos || "[]");
        return fotos.length > 0 ? <FotoGaleria fotos={fotos} /> : null;
      })()}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-4 space-y-3">
          <h3 className="font-semibold text-navy text-sm">Dados do Local</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Tipo</dt><dd className="text-navy">{indicacao.tipoLocal}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Horario</dt><dd className="text-navy">{indicacao.horarioFuncionamento || "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Fluxo</dt><dd className="text-navy">{indicacao.fluxoPessoas.replace(/_/g, " ")}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Espaco</dt><dd className="text-navy">{indicacao.temEspaco}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Energia</dt><dd className="text-navy">{indicacao.temEnergia}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Concorrente</dt><dd className="text-navy">{indicacao.temConcorrente ? "Sim" : "Nao"}</dd></div>
          </dl>
        </div>

        <div className="card p-4 space-y-3">
          <h3 className="font-semibold text-navy text-sm">Contato do Decisor</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Nome</dt><dd className="text-navy">{indicacao.nomeDecissor}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Telefone</dt><dd className="text-navy">{indicacao.telefoneDecissor}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Cargo</dt><dd className="text-navy">{indicacao.cargoDecissor || "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Interesse</dt><dd className="text-navy">{indicacao.interesseDecissor}</dd></div>
          </dl>
          <a
            href={`https://wa.me/55${indicacao.telefoneDecissor.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${indicacao.nomeDecissor}, sou da AVEND e gostaria de conversar sobre a instalação de uma máquina de vending no ${indicacao.nomeEstabelecimento}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs flex items-center gap-2 w-full justify-center"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp do Decisor
          </a>
          <hr className="border-border" />
          <h3 className="font-semibold text-navy text-sm">Captador</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Nome</dt><dd className="text-navy">{indicacao.indicador.nome}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">E-mail</dt><dd className="text-navy">{indicacao.indicador.email}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Tier</dt><dd className="text-navy">{indicacao.indicador.tier}</dd></div>
          </dl>
        </div>
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

      <div className="card p-4 space-y-4">
        <h3 className="font-semibold text-navy">Atualizar Status</h3>
        <div className="flex flex-wrap gap-2">
          {STATUS_FLOW.map((s) => (
            <button key={s} onClick={() => setNovoStatus(s)} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${novoStatus === s ? "border-primary bg-primary/10 text-navy" : "border-border text-muted hover:border-secondary/30"}`}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        {(novoStatus === "INSTALADO" || novoStatus === "ATIVO") && (
          <div>
            <label className="text-sm text-muted mb-1">Faturamento mensal estimado (R$)</label>
            <input type="number" value={faturamento} onChange={(e) => setFaturamento(e.target.value)} placeholder="8000" className="input-field w-48" />
          </div>
        )}
        <button onClick={handleSave} disabled={saving || novoStatus === indicacao.status} className="btn-primary disabled:opacity-50">
          {saving ? "Salvando..." : "Salvar alteracao"}
        </button>
      </div>

      <ComunicacaoTimeline indicacaoId={indicacao.id} />
    </div>
  );
}
