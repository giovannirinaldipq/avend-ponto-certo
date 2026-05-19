"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "/gestao-pc2026/dashboard", label: "Dashboard" },
  { href: "/gestao-pc2026/pipeline", label: "Pipeline" },
  { href: "/gestao-pc2026/indicadores", label: "Captadores" },
  { href: "/gestao-pc2026/parcerias", label: "Parcerias" },
  { href: "/gestao-pc2026/financeiro", label: "Financeiro" },
  { href: "/gestao-pc2026/investidor", label: "Investidor" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ nome: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); });
  }, []);

  async function handleLogout() {
    document.cookie = "token=; Path=/; Max-Age=0";
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 gradient-dark px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-6">
          <Link href="/gestao-pc2026/pipeline" className="flex items-center gap-2">
            <span className="text-lg font-bold text-white tracking-tight">Radar <span className="text-primary font-normal text-sm">by Avend</span></span>
            <span className="text-xs font-medium text-primary px-2 py-0.5 rounded-md bg-primary/10">Admin</span>
          </Link>
          <nav className="hidden sm:flex gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  pathname === item.href
                    ? "bg-white/10 text-primary"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-xs text-zinc-400">{user.nome}</span>
          )}
          <button
            onClick={handleLogout}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
