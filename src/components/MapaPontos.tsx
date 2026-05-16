"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";

type Ponto = {
  id: string;
  nomeEstabelecimento: string;
  cidade: string;
  estado: string;
  score: number;
  status: string;
  latitude: number | null;
  longitude: number | null;
};

function createIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

type Props = {
  pontos: Ponto[];
  height?: string;
  linkPrefix?: string;
};

export default function MapaPontos({ pontos, height = "400px", linkPrefix = "/admin/validacao" }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const pontosComCoord = pontos.filter((p) => p.latitude && p.longitude);
    const center: [number, number] = pontosComCoord.length > 0
      ? [pontosComCoord[0].latitude!, pontosComCoord[0].longitude!]
      : [-23.55, -46.63];

    const map = L.map(mapRef.current, {
      center,
      zoom: 11,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    pontosComCoord.forEach((ponto) => {
      const color = STATUS_COLORS[ponto.status] || "#6b7294";
      const marker = L.marker([ponto.latitude!, ponto.longitude!], {
        icon: createIcon(color),
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family:system-ui;min-width:180px;">
          <p style="font-weight:700;font-size:14px;margin:0 0 4px;color:#1a1145;">${ponto.nomeEstabelecimento}</p>
          <p style="font-size:12px;color:#6b7294;margin:0 0 8px;">${ponto.cidade}/${ponto.estado}</p>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:8px;background:${color}20;color:${color};">${STATUS_LABELS[ponto.status] || ponto.status}</span>
            <span style="font-size:12px;font-weight:700;color:#1a1145;">Score ${ponto.score}</span>
          </div>
          <a href="${linkPrefix}/${ponto.id}" style="font-size:12px;color:#4040bf;text-decoration:none;font-weight:600;">Ver detalhes →</a>
        </div>
      `);
    });

    if (pontosComCoord.length > 1) {
      const bounds = L.latLngBounds(pontosComCoord.map((p) => [p.latitude!, p.longitude!]));
      map.fitBounds(bounds, { padding: [30, 30] });
    }

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [pontos, linkPrefix]);

  const pontosComCoord = pontos.filter((p) => p.latitude && p.longitude);

  if (pontosComCoord.length === 0) {
    return (
      <div className="card p-8 text-center" style={{ height }}>
        <p className="text-sm text-muted">Nenhum ponto com coordenadas para exibir no mapa.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden" style={{ height }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
