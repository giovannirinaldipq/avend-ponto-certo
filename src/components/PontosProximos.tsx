"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PontoProximo = {
  id: string;
  nomeEstabelecimento: string;
  cidade: string;
  estado: string;
  tipoLocal: string;
  score: number;
  status: string;
  distanciaKm: number;
};

function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function PontosProximos() {
  const [pontos, setPontos] = useState<PontoProximo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setErro("Geolocalização não disponível");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch("/api/indicacoes");
          const data = await res.json();
          const indicacoes = data.indicacoes || [];

          const proximos = indicacoes
            .filter((i: { latitude: number | null; longitude: number | null }) => i.latitude && i.longitude)
            .map((i: { id: string; nomeEstabelecimento: string; cidade: string; estado: string; tipoLocal: string; score: number; status: string; latitude: number; longitude: number }) => ({
              id: i.id,
              nomeEstabelecimento: i.nomeEstabelecimento,
              cidade: i.cidade,
              estado: i.estado,
              tipoLocal: i.tipoLocal,
              score: i.score,
              status: i.status,
              distanciaKm: calcularDistancia(latitude, longitude, i.latitude, i.longitude),
            }))
            .sort((a: PontoProximo, b: PontoProximo) => a.distanciaKm - b.distanciaKm)
            .slice(0, 5);

          setPontos(proximos);
        } catch {
          setErro("Erro ao buscar pontos");
        }
        setLoading(false);
      },
      () => {
        setErro("Permissão de localização negada");
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, []);

  if (loading) {
    return (
      <div className="card p-5 animate-pulse">
        <div className="h-4 w-40 bg-zinc-100 rounded mb-3"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-zinc-50 rounded-lg"></div>)}
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-navy mb-2 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4040bf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          Pontos Próximos
        </h3>
        <p className="text-xs text-muted">{erro}. Ative a localização para ver pontos próximos a você.</p>
      </div>
    );
  }

  if (pontos.length === 0) {
    return null;
  }

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4040bf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        Pontos Próximos a Você
      </h3>
      <div className="space-y-2">
        {pontos.map((p) => (
          <Link
            key={p.id}
            href={`/indicacoes/${p.id}`}
            className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-zinc-50/80 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{
                background: p.score >= 70 ? 'rgba(0,229,200,0.12)' : 'rgba(64,64,191,0.1)',
                color: p.score >= 70 ? '#00a896' : '#4040bf',
              }}>
                {p.score}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-navy truncate">{p.nomeEstabelecimento}</p>
                <p className="text-[11px] text-muted">{p.tipoLocal} · {p.cidade}</p>
              </div>
            </div>
            <span className="text-xs text-muted font-medium flex-shrink-0 ml-2">
              {p.distanciaKm < 1 ? `${Math.round(p.distanciaKm * 1000)}m` : `${p.distanciaKm.toFixed(1)}km`}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
