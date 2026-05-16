"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { calcularScore, classificarScore } from "@/lib/score";

const TIPOS_LOCAL = [
  { value: "EMPRESA", label: "Empresa" },
  { value: "HOSPITAL", label: "Hospital" },
  { value: "UNIVERSIDADE", label: "Universidade" },
  { value: "ACADEMIA", label: "Academia" },
  { value: "INDUSTRIA", label: "Indústria" },
  { value: "CONDOMINIO", label: "Condomínio" },
  { value: "COWORKING", label: "Coworking" },
  { value: "SHOPPING", label: "Shopping" },
  { value: "OUTRO", label: "Outro" },
];

const FLUXO_OPTIONS = [
  { value: "ATE_50", label: "Até 50 pessoas/dia" },
  { value: "DE_50_A_150", label: "50 a 150 pessoas/dia" },
  { value: "DE_150_A_500", label: "150 a 500 pessoas/dia" },
  { value: "ACIMA_500", label: "Acima de 500 pessoas/dia" },
];

const ESTADOS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

export default function NovaIndicacaoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({
    nomeEstabelecimento: "",
    endereco: "",
    cidade: "",
    estado: "",
    tipoLocal: "",
    horarioFuncionamento: "",
    fluxoPessoas: "DE_50_A_150",
    nomeDecissor: "",
    telefoneDecissor: "",
    cargoDecissor: "",
    interesseDecissor: "SIM",
    temEspaco: "SIM",
    temEnergia: "SIM",
    temConcorrente: false,
    fotos: [] as string[],
  });

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const score = calcularScore({
    tipoLocal: form.tipoLocal || "OUTRO",
    fluxoPessoas: form.fluxoPessoas,
    interesseDecissor: form.interesseDecissor,
    temEspaco: form.temEspaco,
    temEnergia: form.temEnergia,
    temConcorrente: form.temConcorrente,
    fotos: form.fotos,
  });

  const classificacao = classificarScore(score);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    const res = await fetch("/api/indicacoes", {
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

    router.push("/indicacoes");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Nova Indicação</h1>
        <p className="text-sm text-muted mt-1">Preencha os dados do ponto que você visitou</p>
      </div>

      <div className={`card p-5 text-center relative overflow-hidden ${
        classificacao === "QUENTE" ? "border-primary/30" :
        classificacao === "MORNO" ? "border-secondary/30" :
        "border-border"
      }`}>
        <div className="absolute inset-0 opacity-5" style={{
          background: classificacao === "QUENTE" ? "linear-gradient(135deg, #00e5c8, #4040bf)" :
            classificacao === "MORNO" ? "linear-gradient(135deg, #4040bf, #8b2fc9)" :
            "none"
        }}></div>
        <p className="text-xs font-medium text-muted uppercase tracking-wider relative">Score em tempo real</p>
        <p className="text-5xl font-bold mt-2 relative gradient-brand-text">{score}</p>
        <p className={`text-sm font-semibold mt-1 relative ${
          classificacao === "QUENTE" ? "text-primary-dark" :
          classificacao === "MORNO" ? "text-secondary" :
          "text-muted"
        }`}>
          Ponto {classificacao.toLowerCase()}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {erro && <div className="p-3 text-sm text-red-700 bg-red-50 rounded-xl border border-red-100">{erro}</div>}

        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-navy mb-2">Dados do local</legend>

          <div>
            <label htmlFor="nomeEstabelecimento" className="block text-sm text-muted mb-1">Nome do estabelecimento *</label>
            <input id="nomeEstabelecimento" type="text" required value={form.nomeEstabelecimento} onChange={(e) => update("nomeEstabelecimento", e.target.value)} className="input-field" />
          </div>

          <div>
            <label htmlFor="endereco" className="block text-sm text-muted mb-1">Endereço completo *</label>
            <input id="endereco" type="text" required value={form.endereco} onChange={(e) => update("endereco", e.target.value)} className="input-field" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="cidade" className="block text-sm text-muted mb-1">Cidade *</label>
              <input id="cidade" type="text" required value={form.cidade} onChange={(e) => update("cidade", e.target.value)} className="input-field" />
            </div>
            <div>
              <label htmlFor="estado" className="block text-sm text-muted mb-1">Estado *</label>
              <select id="estado" required value={form.estado} onChange={(e) => update("estado", e.target.value)} className="input-field">
                <option value="">UF</option>
                {ESTADOS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="tipoLocal" className="block text-sm text-muted mb-1">Tipo de local *</label>
              <select id="tipoLocal" required value={form.tipoLocal} onChange={(e) => update("tipoLocal", e.target.value)} className="input-field">
                <option value="">Selecione</option>
                {TIPOS_LOCAL.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="horarioFuncionamento" className="block text-sm text-muted mb-1">Horário de funcionamento</label>
              <input id="horarioFuncionamento" type="text" placeholder="Ex: 8h-22h" value={form.horarioFuncionamento} onChange={(e) => update("horarioFuncionamento", e.target.value)} className="input-field" />
            </div>
          </div>

          <div>
            <label htmlFor="fluxoPessoas" className="block text-sm text-muted mb-1">Fluxo estimado de pessoas</label>
            <select id="fluxoPessoas" value={form.fluxoPessoas} onChange={(e) => update("fluxoPessoas", e.target.value)} className="input-field">
              {FLUXO_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-navy mb-2">Contato do decisor</legend>

          <div>
            <label htmlFor="nomeDecissor" className="block text-sm text-muted mb-1">Nome do responsável *</label>
            <input id="nomeDecissor" type="text" required value={form.nomeDecissor} onChange={(e) => update("nomeDecissor", e.target.value)} className="input-field" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="telefoneDecissor" className="block text-sm text-muted mb-1">Telefone *</label>
              <input id="telefoneDecissor" type="tel" required value={form.telefoneDecissor} onChange={(e) => update("telefoneDecissor", e.target.value)} className="input-field" />
            </div>
            <div>
              <label htmlFor="cargoDecissor" className="block text-sm text-muted mb-1">Cargo</label>
              <input id="cargoDecissor" type="text" value={form.cargoDecissor} onChange={(e) => update("cargoDecissor", e.target.value)} className="input-field" />
            </div>
          </div>

          <div>
            <label htmlFor="interesseDecissor" className="block text-sm text-muted mb-1">O responsável demonstrou interesse?</label>
            <select id="interesseDecissor" value={form.interesseDecissor} onChange={(e) => update("interesseDecissor", e.target.value)} className="input-field">
              <option value="SIM">Sim, demonstrou interesse</option>
              <option value="TALVEZ">Talvez, ficou em dúvida</option>
              <option value="NAO">Não demonstrou interesse</option>
            </select>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-navy mb-2">Infraestrutura</legend>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="temEspaco" className="block text-sm text-muted mb-1">Tem espaço para a máquina?</label>
              <select id="temEspaco" value={form.temEspaco} onChange={(e) => update("temEspaco", e.target.value)} className="input-field">
                <option value="SIM">Sim</option>
                <option value="NAO">Não</option>
                <option value="NAO_SEI">Não sei</option>
              </select>
            </div>
            <div>
              <label htmlFor="temEnergia" className="block text-sm text-muted mb-1">Tem ponto de energia?</label>
              <select id="temEnergia" value={form.temEnergia} onChange={(e) => update("temEnergia", e.target.value)} className="input-field">
                <option value="SIM">Sim</option>
                <option value="NAO">Não</option>
                <option value="NAO_SEI">Não sei</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input id="temConcorrente" type="checkbox" checked={form.temConcorrente} onChange={(e) => update("temConcorrente", e.target.checked)} className="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary" />
            <label htmlFor="temConcorrente" className="text-sm text-muted">Já tem máquina de vending de outro fornecedor</label>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-navy mb-2">Fotos do local</legend>
          <p className="text-xs text-muted">Enviar fotos aumenta seu score em 5 pontos</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={async (e) => {
              const files = e.target.files;
              if (!files) return;
              const urls: string[] = [];
              for (const file of Array.from(files)) {
                const fd = new FormData();
                fd.append("file", file);
                const res = await fetch("/api/upload", { method: "POST", body: fd });
                if (res.ok) {
                  const data = await res.json();
                  urls.push(data.url);
                }
              }
              setForm((prev) => ({ ...prev, fotos: [...prev.fotos, ...urls] }));
            }}
            className="input-field text-sm"
          />
          {form.fotos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {form.fotos.map((url, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden border border-border">
                  <img src={url} alt={`Preview ${i + 1}`} className="w-full h-24 object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, fotos: prev.fotos.filter((_, idx) => idx !== i) }))}
                    className="absolute top-1 right-1 bg-black/60 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center hover:bg-black/80"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </fieldset>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3.5 disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar indicação"}
        </button>
      </form>
    </div>
  );
}
