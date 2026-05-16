"use client";

import Link from "next/link";

type Missao = {
  id: string;
  titulo: string;
  descricao: string;
  completa: boolean;
  link: string;
  recompensa: string;
};

type Props = {
  totalIndicacoes: number;
  pontosInstalados: number;
  temFoto: boolean;
  temPix: boolean;
};

export default function MissoesOnboarding({ totalIndicacoes, pontosInstalados, temFoto, temPix }: Props) {
  const missoes: Missao[] = [
    {
      id: "primeira-indicacao",
      titulo: "Faça sua primeira indicação",
      descricao: "Cadastre um ponto comercial no sistema",
      completa: totalIndicacoes >= 1,
      link: "/nova-indicacao",
      recompensa: "+50 XP",
    },
    {
      id: "tres-indicacoes",
      titulo: "Indique 3 pontos",
      descricao: "Quanto mais indicações, maior sua chance de ganhar",
      completa: totalIndicacoes >= 3,
      link: "/nova-indicacao",
      recompensa: "Tier Prata",
    },
    {
      id: "foto-ponto",
      titulo: "Envie uma foto do local",
      descricao: "Fotos aumentam o score e a credibilidade da indicação",
      completa: temFoto,
      link: "/indicacoes",
      recompensa: "+10 Score",
    },
    {
      id: "cadastrar-pix",
      titulo: "Cadastre sua chave PIX",
      descricao: "Para receber seus pagamentos automaticamente",
      completa: temPix,
      link: "/perfil",
      recompensa: "Pagamento rápido",
    },
    {
      id: "primeiro-instalado",
      titulo: "Tenha um ponto instalado",
      descricao: "Quando sua indicação virar uma máquina instalada",
      completa: pontosInstalados >= 1,
      link: "/indicacoes",
      recompensa: "R$ 500 bônus",
    },
  ];

  const completadas = missoes.filter((m) => m.completa).length;
  const progresso = Math.round((completadas / missoes.length) * 100);

  // Não mostrar se completou tudo
  if (completadas === missoes.length) return null;

  return (
    <div className="card p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-accent/5 -translate-y-1/2 translate-x-1/2"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-navy flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b2fc9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Missões de Início
          </h2>
          <span className="text-xs text-muted font-medium">{completadas}/{missoes.length}</span>
        </div>

        <div className="h-2 bg-zinc-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-700 gradient-brand"
            style={{ width: `${progresso}%` }}
          ></div>
        </div>

        <div className="space-y-2">
          {missoes.map((missao) => (
            <Link
              key={missao.id}
              href={missao.link}
              className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors ${
                missao.completa ? "bg-green-50/50" : "hover:bg-zinc-50/80"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                missao.completa
                  ? "bg-green-500 text-white"
                  : "border-2 border-zinc-200"
              }`}>
                {missao.completa && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${missao.completa ? "text-green-700 line-through" : "text-navy"}`}>
                  {missao.titulo}
                </p>
                <p className="text-[11px] text-muted">{missao.descricao}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                missao.completa ? "bg-green-100 text-green-700" : "bg-accent/10 text-accent"
              }`}>
                {missao.recompensa}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
