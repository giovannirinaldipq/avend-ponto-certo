"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

type Notificacao = {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  link: string | null;
  createdAt: string;
};

export default function NotificacoesBell() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotificacoes();
    const interval = setInterval(loadNotificacoes, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function loadNotificacoes() {
    fetch("/api/notificacoes")
      .then((r) => r.json())
      .then((d) => {
        setNotificacoes(d.notificacoes || []);
        setNaoLidas(d.naoLidas || 0);
      })
      .catch(() => {});
  }

  async function marcarTodasLidas() {
    await fetch("/api/notificacoes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marcarTodasLidas: true }),
    });
    setNaoLidas(0);
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  }

  async function marcarLida(id: string) {
    await fetch("/api/notificacoes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNaoLidas((n) => Math.max(0, n - 1));
    setNotificacoes((prev) => prev.map((n) => n.id === id ? { ...n, lida: true } : n));
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Notificações"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {naoLidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-border z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-navy">Notificações</h3>
            {naoLidas > 0 && (
              <button onClick={marcarTodasLidas} className="text-[11px] text-secondary font-medium hover:underline">
                Marcar todas como lidas
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notificacoes.length === 0 ? (
              <p className="text-sm text-muted text-center py-8">Nenhuma notificação</p>
            ) : (
              notificacoes.slice(0, 15).map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-border/50 last:border-0 transition-colors ${!n.lida ? "bg-primary/5" : "hover:bg-zinc-50"}`}
                  onClick={() => { if (!n.lida) marcarLida(n.id); }}
                >
                  {n.link ? (
                    <Link href={n.link} onClick={() => setOpen(false)} className="block">
                      <p className="text-sm font-medium text-navy leading-snug">{n.titulo}</p>
                      <p className="text-xs text-muted mt-0.5">{n.mensagem}</p>
                      <p className="text-[10px] text-muted/60 mt-1">{timeAgo(n.createdAt)}</p>
                    </Link>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-navy leading-snug">{n.titulo}</p>
                      <p className="text-xs text-muted mt-0.5">{n.mensagem}</p>
                      <p className="text-[10px] text-muted/60 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
