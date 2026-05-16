"use client";

import { useState } from "react";

const SCRIPTS = [
  {
    titulo: "Abordagem inicial",
    texto: "Bom dia! Meu nome é [seu nome], sou parceiro da AVEND. Estamos expandindo nossa rede de máquinas de vending aqui na região e esse local tem um perfil excelente. Posso falar com o responsável por 2 minutinhos?",
  },
  {
    titulo: "Apresentação ao decisor",
    texto: "A AVEND instala máquinas de snacks e bebidas sem nenhum custo para o estabelecimento. A gente cuida de tudo: instalação, manutenção e reposição. As condições são negociadas diretamente com cada ponto para atender da melhor forma. É uma conveniência a mais para seus clientes e funcionários.",
  },
  {
    titulo: "Lidando com objeções",
    texto: "Entendo sua preocupação. A máquina ocupa menos de 1m², não precisa de manutenção da sua parte e não tem custo nenhum. Se por qualquer motivo não funcionar, a gente retira sem burocracia. Vários [tipo de local] da região já têm e o feedback é muito positivo.",
  },
];

const FAQ = [
  { pergunta: "Quanto custa para o estabelecimento?", resposta: "Nada. A AVEND arca com todos os custos de instalação, manutenção e reposição de produtos." },
  { pergunta: "Qual o tamanho da máquina?", resposta: "As máquinas ocupam entre 0,5m² e 1m². Precisam de uma tomada 220V próxima." },
  { pergunta: "E se a máquina der problema?", resposta: "A AVEND tem equipe técnica própria e resolve qualquer problema de forma rápida, priorizando o mínimo de impacto para o ponto." },
  { pergunta: "O ponto recebe algo em troca?", resposta: "Negociamos diretamente com cada estabelecimento para encontrar a melhor condição para ambos os lados." },
  { pergunta: "Como funciona o contrato?", resposta: "O contrato é definido conforme o perfil do ponto e suas necessidades. Nos adequamos para atender da melhor forma possível." },
  { pergunta: "Quais produtos a máquina vende?", resposta: "O mix de produtos é selecionado com base em estudos e na demanda específica de cada local, garantindo as melhores opções para quem frequenta o ponto." },
];

const DICAS = [
  "Visite o local em horário de pico para avaliar o fluxo real de pessoas",
  "Tire fotos do espaço sugerido para a máquina — isso aumenta seu score",
  "Fale diretamente com quem decide (gerente, proprietário, síndico)",
  "Mencione que não há custo e que a AVEND cuida de tudo",
  "Locais com 100+ pessoas/dia e sem concorrente têm score mais alto",
  "Hospitais, universidades e empresas são os melhores tipos de ponto",
  "Registre a indicação no mesmo dia da visita — informações frescas são mais precisas",
];

export default function MateriaisPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  function copyScript(idx: number) {
    navigator.clipboard.writeText(SCRIPTS[idx].texto);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-navy">Central de Materiais</h1>
        <p className="text-sm text-muted mt-1">
          Tudo que você precisa para abordar decisores e indicar pontos com confiança.
        </p>
      </div>

      {/* Scripts de Abordagem */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-navy flex items-center gap-2">
          <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          Scripts de Abordagem
        </h2>
        <p className="text-sm text-muted">Copie e adapte esses textos para suas conversas com decisores.</p>
        <div className="space-y-3">
          {SCRIPTS.map((script, idx) => (
            <div key={idx} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-navy">{script.titulo}</h3>
                <button
                  onClick={() => copyScript(idx)}
                  className="text-xs text-secondary font-medium hover:underline flex items-center gap-1"
                >
                  {copiedIdx === idx ? (
                    <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Copiado</>
                  ) : (
                    <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copiar</>
                  )}
                </button>
              </div>
              <p className="text-sm text-muted leading-relaxed">{script.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dicas */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-navy flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
          Dicas para Aumentar seu Score
        </h2>
        <div className="card p-5">
          <ul className="space-y-3">
            {DICAS.map((dica, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm">
                <span className="w-6 h-6 rounded-full gradient-brand flex items-center justify-center text-navy text-xs font-bold flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-muted leading-relaxed">{dica}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-navy flex items-center gap-2">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Perguntas Frequentes
        </h2>
        <p className="text-sm text-muted">Respostas para as objeções mais comuns dos decisores.</p>
        <div className="space-y-2">
          {FAQ.map((item, idx) => (
            <div key={idx} className="card overflow-hidden">
              <button
                onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left"
              >
                <span className="text-sm font-medium text-navy">{item.pergunta}</span>
                <svg
                  className={`w-4 h-4 text-muted transition-transform ${faqOpen === idx ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {faqOpen === idx && (
                <div className="px-4 pb-4 text-sm text-muted leading-relaxed border-t border-border pt-3">
                  {item.resposta}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="card p-6 gradient-brand-subtle text-center">
        <p className="text-lg font-bold text-navy mb-1">Achou um ponto? <span className="gradient-brand-text">Coloca no Radar!</span></p>
        <p className="text-sm text-muted mb-4">Use o que aprendeu aqui e registre sua próxima captação.</p>
        <a href="/nova-indicacao" className="btn-primary inline-block">Nova Indicação</a>
      </div>
    </div>
  );
}
