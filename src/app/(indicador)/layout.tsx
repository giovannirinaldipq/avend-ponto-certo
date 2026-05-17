"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { TIERS } from "@/lib/tiers";
import NotificacoesBell from "@/components/NotificacoesBell";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/nova-indicacao", label: "Nova Indicação", icon: "M12 4v16m8-8H4" },
  { href: "/indicacoes", label: "Indicações", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { href: "/parcerias", label: "Parcerias", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  { href: "/ranking", label: "Ranking", icon: "M13 10V3L4 14h7v7l9-11h-7" },
  { href: "/financeiro", label: "Financeiro", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/materiais", label: "Materiais", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
  { href: "/perfil", label: "Meu Perfil", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

export default function IndicadorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ nome: string; tier: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    document.cookie = "token=; Path=/; Max-Age=0";
    router.push("/login");
  }

  const tierInfo = user ? TIERS[user.tier] : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 gradient-dark-rich px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Abrir menu de navegação"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-lg font-bold text-white tracking-tight">Radar <span className="text-primary font-normal text-sm">by Avend</span></span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <NotificacoesBell />
          {tierInfo && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border" style={{ borderColor: tierInfo.cor + '40', color: tierInfo.cor, backgroundColor: tierInfo.cor + '10' }}>
              {tierInfo.label}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className={`
          fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-border pt-16 px-3 transform transition-transform duration-200 ease-out
          sm:relative sm:translate-x-0 sm:pt-4
          ${menuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
        `}>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    pathname === item.href
                      ? "gradient-brand-subtle text-navy shadow-sm"
                      : "text-muted hover:bg-zinc-50 hover:text-navy"
                  }`}
                >
                  <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {menuOpen && (
          <div
            className="fixed inset-0 z-30 bg-navy/30 backdrop-blur-sm sm:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}

        <main className="flex-1 p-4 sm:p-6 overflow-auto pb-24 sm:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
