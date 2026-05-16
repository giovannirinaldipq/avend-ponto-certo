"use client";

import { useEffect, useState } from "react";

type Atividade = {
  id: string;
  tipo: "INDICACAO_CRIADA" | "STATUS_ALTERADO" | "PAGAMENTO";
  titulo: string;
  subtitulo: string;
  data: string;
  cor: string;
};

const TIPO_ICONS: Record<string, string> = {
  INDICACAO_CRIADA: "N",
  STATUS_ALTERADO: "S",
  PAGAMENTO: "$",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

export default function FeedAtividade({ limit = 10 }: { limit?: number }) {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/atividades")
      .then((r) => r.json())
      .then((d) => setAtividades((d.atividades || []).slice(0, limit)))
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 bg-zinc-100 rounded-full flex-shrink-0"></div>
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-3/4 bg-zinc-100 rounded"></div>
              <div className="h-2.5 w-1/2 bg-zinc-50 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (atividades.length === 0) {
    return <p className="text-sm text-muted text-center py-4">Nenhuma atividade recente.</p>;
  }

  return (
    <div className="space-y-0">
      {atividades.map((atv, idx) => (
        <div key={atv.id} className="flex gap-3 relative py-2.5">
          {idx < atividades.length - 1 && (
            <div className="absolute left-4 top-10 bottom-0 w-px bg-border"></div>
          )}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 border-2 border-white shadow-sm z-10"
            style={{ backgroundColor: atv.cor + "18", color: atv.cor }}
          >
            {TIPO_ICONS[atv.tipo]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-navy leading-snug truncate">{atv.titulo}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-muted">{atv.subtitulo}</span>
              <span className="text-[10px] text-muted/60">{timeAgo(atv.data)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
