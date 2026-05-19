"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErro(data.error);
      return;
    }

    if (data.user.role === "ADMIN" || data.user.role === "OPERADOR") {
      router.push("/gestao-pc2026/pipeline");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-dark-rich relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-[120px]"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-[150px]"></div>
        </div>
        <div className="relative text-center space-y-8 max-w-md">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Radar <span className="text-primary font-normal">by Avend</span>
            </h1>
          </div>
          <p className="text-2xl font-bold text-white leading-snug">
            Achou um ponto?<br />
            <span className="gradient-brand-text">Coloca no Radar!</span>
          </p>
          <p className="text-zinc-400 text-base leading-relaxed">
            Capte locais para máquinas de vending, acompanhe o progresso e receba por cada instalação.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">R$500</p>
              <p className="text-xs text-zinc-500 mt-1">por instalação</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">5%</p>
              <p className="text-xs text-zinc-500 mt-1">do faturamento</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">6 meses</p>
              <p className="text-xs text-zinc-500 mt-1">de recorrência</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-navy">Bem-vindo de volta</h2>
            <p className="text-sm text-muted mt-2">Entre na sua conta para continuar</p>
          </div>

          {/* Mobile slogan */}
          <div className="lg:hidden text-center py-3 px-4 rounded-xl gradient-brand-subtle">
            <p className="text-sm font-semibold text-navy">Achou um ponto? <span className="gradient-brand-text">Coloca no Radar!</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {erro && (
              <div className="p-3 text-sm text-red-700 bg-red-50 rounded-xl border border-red-100">{erro}</div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy mb-1.5">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-navy mb-1.5">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-center text-sm text-muted">
            Não tem conta?{" "}
            <Link href="/cadastro" className="text-secondary font-semibold hover:underline">
              Cadastre-se grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
