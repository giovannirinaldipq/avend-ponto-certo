"use client";
import { useState, useEffect } from "react";

type Comunicacao = { id: string; tipo: string; mensagem: string; createdAt: string; autor: { nome: string; role: string } };

const TIPOS = [
  { value: "NOTA", label: "Nota" },
  { value: "LIGACAO", label: "Ligação" },
  { value: "VISITA", label: "Visita" },
  { value: "EMAIL", label: "E-mail" },
  { value: "WHATSAPP", label: "WhatsApp" },
];

export default function ComunicacaoTimeline({ indicacaoId }: { indicacaoId: string }) {
  const [comunicacoes, setComunicacoes] = useState<Comunicacao[]>([]);
  const [tipo, setTipo] = useState("NOTA");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/indicacoes/" + indicacaoId + "/comunicacoes")
      .then((r) => r.json())
      .then((d) => setComunicacoes(d.comunicacoes || []))
      .finally(() => setLoading(false));
  }, [indicacaoId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!mensagem.trim()) return;
    setEnviando(true);
    const res = await fetch("/api/indicacoes/" + indicacaoId + "/comunicacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, mensagem: mensagem.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      setComunicacoes((prev) => [data.comunicacao, ...prev]);
      setMensagem("");
    }
    setEnviando(false);
  }

  const tipoInfo = (t: string) => TIPOS.find((x) => x.value === t) || TIPOS[0];
  const tipoIcon = (t: string) => {
    switch(t) { case "LIGACAO": return "L"; case "VISITA": return "V"; case "EMAIL": return "E"; case "WHATSAPP": return "W"; default: return "N"; }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-navy">Comunicacao e Feedback</h3>

      <form onSubmit={handleSubmit} className="card p-4 space-y-3">
        <div className="flex gap-2">
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="input-field w-auto text-sm">
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <span className="text-xs text-muted self-center">Registrar interacao</span>
        </div>
        <textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Descreva a comunicacao, feedback ou observacao..."
          rows={3}
          className="input-field text-sm resize-none"
        />
        <button type="submit" disabled={enviando || !mensagem.trim()} className="btn-primary text-sm disabled:opacity-50">
          {enviando ? "Enviando..." : "Enviar"}
        </button>
      </form>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 bg-zinc-100 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 bg-zinc-100 rounded"></div>
                <div className="h-4 w-full bg-zinc-50 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : comunicacoes.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-muted">Nenhuma comunicacao registrada.</p>
          <p className="text-xs text-muted mt-1">Registre ligacoes, visitas e notas sobre este ponto.</p>
        </div>
      ) : (
        <div className="space-y-0">
          {comunicacoes.map((com, idx) => (
            <div key={com.id} className="flex gap-3 relative animate-fade-in" style={{ animationDelay: `${idx * 30}ms`, opacity: 0 }}>
              {idx < comunicacoes.length - 1 && (
                <div className="absolute left-4 top-10 bottom-0 w-px bg-border"></div>
              )}
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-white border border-border shadow-sm z-10 text-secondary">
                {tipoIcon(com.tipo)}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-navy">{com.autor.nome}</span>
                  <span className="badge badge-aguardando text-[9px]">{tipoInfo(com.tipo).label}</span>
                  <span className="text-[10px] text-muted ml-auto">
                    {new Date(com.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{com.mensagem}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
