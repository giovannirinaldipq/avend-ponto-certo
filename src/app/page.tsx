import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <span className="text-lg font-bold text-navy tracking-tight">Radar <span className="text-primary font-normal text-sm">by Avend</span></span>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-navy hover:text-secondary transition-colors link-animated"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="btn-primary"
          >
            Cadastrar
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden gradient-dark py-20 sm:py-32 px-6">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-[120px]"></div>
            <div className="absolute bottom-10 right-20 w-96 h-96 bg-accent rounded-full blur-[150px]"></div>
          </div>
          <div className="relative max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight hero-animate-title">
              Achou um ponto?
              <br />
              <span className="gradient-brand-text">Coloca no Radar!</span>
            </h1>
            <p className="text-lg text-zinc-300 max-w-xl mx-auto hero-animate-subtitle">
              Capte locais ideais para máquinas de vending da AVEND. Quando a máquina
              for instalada, você recebe um bônus + participação no faturamento por 6 meses.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 hero-animate-cta">
              <Link
                href="/cadastro"
                className="px-8 py-3.5 text-base font-semibold text-navy gradient-brand rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
              >
                Quero ser captador
              </Link>
              <Link
                href="/login"
                className="px-8 py-3.5 text-base font-medium text-white border border-white/20 rounded-xl hover:bg-white/5 transition-all hover:border-white/40 hover:scale-105"
              >
                Ja tenho conta
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center space-y-3 p-6 stagger-item">
              <div className="w-14 h-14 mx-auto gradient-brand rounded-2xl flex items-center justify-center text-navy font-bold text-xl shadow-lg shadow-primary/20">1</div>
              <h3 className="font-semibold text-navy text-lg">Cadastre-se</h3>
              <p className="text-sm text-muted">Crie sua conta gratuitamente em menos de 2 minutos</p>
            </div>
            <div className="text-center space-y-3 p-6 stagger-item">
              <div className="w-14 h-14 mx-auto gradient-brand rounded-2xl flex items-center justify-center text-navy font-bold text-xl shadow-lg shadow-primary/20">2</div>
              <h3 className="font-semibold text-navy text-lg">Capte pontos</h3>
              <p className="text-sm text-muted">Visite locais, fale com o responsavel e cadastre no sistema</p>
            </div>
            <div className="text-center space-y-3 p-6 stagger-item">
              <div className="w-14 h-14 mx-auto gradient-brand rounded-2xl flex items-center justify-center text-navy font-bold text-xl shadow-lg shadow-primary/20">3</div>
              <h3 className="font-semibold text-navy text-lg">Receba</h3>
              <p className="text-sm text-muted">Bonus na instalacao + 5% do faturamento por 6 meses</p>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy">Como funciona a remuneracao</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-zinc-200 text-left space-y-2 card">
                <p className="text-sm font-medium text-primary uppercase tracking-wide">Na instalacao</p>
                <p className="text-3xl font-bold text-navy">R$ 500</p>
                <p className="text-sm text-muted">Bonus pago quando a maquina e instalada no ponto que voce indicou</p>
              </div>
              <div className="p-6 rounded-2xl border border-zinc-200 text-left space-y-2 card">
                <p className="text-sm font-medium text-accent uppercase tracking-wide">Recorrencia</p>
                <p className="text-3xl font-bold text-navy">5% <span className="text-lg font-normal text-muted">por 6 meses</span></p>
                <p className="text-sm text-muted">Percentual sobre o faturamento bruto da maquina, todo mes</p>
              </div>
            </div>
          </div>
        </section>

        {/* Parcerias */}
        <section className="px-6 py-16 bg-zinc-50">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-navy">Parcerias Estratégicas</h2>
              <p className="text-sm text-muted mt-2">Duas formas de crescer junto com a AVEND</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <a href="/parceria" className="card p-8 text-left space-y-4 hover:shadow-lg transition-shadow group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy group-hover:text-primary-dark transition-colors">Quero ser parceiro</h3>
                <p className="text-sm text-muted">Tenha seus produtos nas nossas máquinas de vending. Ideal para marcas de alimentos, bebidas e conveniência.</p>
                <span className="text-sm font-medium text-primary-dark inline-flex items-center gap-1">
                  Enviar proposta
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </span>
              </a>
              <a href="/parceria-rede" className="card p-8 text-left space-y-4 hover:shadow-lg transition-shadow group">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy group-hover:text-secondary transition-colors">Tenho uma rede</h3>
                <p className="text-sm text-muted">Instale máquinas em todas as suas unidades. Ideal para redes de academias, hospitais, universidades e empresas.</p>
                <span className="text-sm font-medium text-secondary inline-flex items-center gap-1">
                  Falar com expansão
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="gradient-dark px-6 py-8 text-center">
        <p className="text-lg font-bold text-white mb-2">Achou um ponto? <span className="gradient-brand-text">Coloca no Radar!</span></p>
        <p className="text-sm text-zinc-400">Radar by Avend &copy; {new Date().getFullYear()} — Todos os direitos reservados</p>
      </footer>
    </div>
  );
}
