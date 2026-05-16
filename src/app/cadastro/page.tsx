"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AvendLogo from "@/components/AvendLogo";

const STEPS = [
  { label: "Dados pessoais", fields: ["nome", "email", "senha"] },
  { label: "Documentos", fields: ["cpfCnpj", "telefone"] },
  { label: "Pagamento", fields: ["tipoChavePix", "chavePix"] },
];

export default function CadastroPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    cpfCnpj: "",
    telefone: "",
    chavePix: "",
    tipoChavePix: "",
  });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function canAdvance() {
    const step = STEPS[currentStep];
    if (currentStep === 2) return true; // payment is optional
    return step.fields.every((f) => form[f as keyof typeof form].trim() !== "");
  }

  function nextStep() {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    const res = await fetch("/api/auth/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErro(data.error);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative">
      <div className="absolute inset-0 gradient-dark opacity-5"></div>
      <div className="w-full max-w-md space-y-6 relative">
        <div className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <AvendLogo size={56} variant="light" />
          </div>
          <h1 className="text-2xl font-bold text-navy">Criar conta</h1>
          <p className="text-sm text-muted mt-1">
            Cadastre-se para indicar pontos e ganhar
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between px-2">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    i < currentStep
                      ? "gradient-brand text-navy"
                      : i === currentStep
                      ? "bg-secondary text-white shadow-lg shadow-secondary/30"
                      : "bg-zinc-100 text-muted"
                  }`}
                >
                  {i < currentStep ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${i === currentStep ? "text-secondary" : "text-muted"}`}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded transition-colors duration-300 ${i < currentStep ? "gradient-brand" : "bg-zinc-200"}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {erro && (
            <div className="p-3 text-sm text-red-700 bg-red-50 rounded-xl border border-red-100">{erro}</div>
          )}

          {/* Step 1: Personal Data */}
          <div className={`space-y-4 transition-all duration-300 ${currentStep === 0 ? "block animate-fade-in" : "hidden"}`}>
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-navy mb-1">Nome completo</label>
              <input id="nome" type="text" required value={form.nome} onChange={(e) => update("nome", e.target.value)} className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary bg-white" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy mb-1">E-mail</label>
              <input id="email" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary bg-white" />
            </div>
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-navy mb-1">Senha</label>
              <input id="senha" type="password" required minLength={6} value={form.senha} onChange={(e) => update("senha", e.target.value)} className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary bg-white" />
            </div>
          </div>

          {/* Step 2: Documents */}
          <div className={`space-y-4 transition-all duration-300 ${currentStep === 1 ? "block animate-fade-in" : "hidden"}`}>
            <div>
              <label htmlFor="cpfCnpj" className="block text-sm font-medium text-navy mb-1">CPF ou CNPJ</label>
              <input id="cpfCnpj" type="text" required value={form.cpfCnpj} onChange={(e) => update("cpfCnpj", e.target.value)} placeholder="000.000.000-00" className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary bg-white" />
            </div>
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-navy mb-1">Telefone / WhatsApp</label>
              <input id="telefone" type="tel" required value={form.telefone} onChange={(e) => update("telefone", e.target.value)} placeholder="(11) 99999-9999" className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary bg-white" />
            </div>
          </div>

          {/* Step 3: Payment */}
          <div className={`space-y-4 transition-all duration-300 ${currentStep === 2 ? "block animate-fade-in" : "hidden"}`}>
            <p className="text-sm text-muted">Dados para pagamento (opcional agora)</p>
            <div>
              <label htmlFor="tipoChavePix" className="block text-sm text-muted mb-1">Tipo da chave PIX</label>
              <select id="tipoChavePix" value={form.tipoChavePix} onChange={(e) => update("tipoChavePix", e.target.value)} className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary bg-white">
                <option value="">Selecione</option>
                <option value="cpf">CPF</option>
                <option value="email">E-mail</option>
                <option value="telefone">Telefone</option>
                <option value="aleatoria">Chave aleatoria</option>
              </select>
            </div>
            <div>
              <label htmlFor="chavePix" className="block text-sm text-muted mb-1">Chave PIX</label>
              <input id="chavePix" type="text" value={form.chavePix} onChange={(e) => update("chavePix", e.target.value)} className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary bg-white" />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 py-3 text-sm font-medium text-secondary border border-secondary/20 rounded-xl hover:bg-secondary/5 transition-colors"
              >
                Voltar
              </button>
            )}
            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!canAdvance()}
                className="flex-1 py-3 text-sm font-semibold text-navy gradient-brand rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                Continuar
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 text-sm font-semibold text-navy gradient-brand rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                {loading ? "Criando conta..." : "Criar conta"}
              </button>
            )}
          </div>
        </form>

        <p className="text-center text-sm text-muted">
          Ja tem conta?{" "}
          <Link href="/login" className="text-secondary font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
