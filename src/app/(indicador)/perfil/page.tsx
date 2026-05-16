"use client";

import { useEffect, useState } from "react";
import { TIERS } from "@/lib/tiers";

type User = {
  id: string;
  nome: string;
  email: string;
  cpfCnpj: string;
  telefone: string;
  tier: string;
  chavePix: string | null;
  tipoChavePix: string | null;
  createdAt: string;
};

export default function PerfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({ nome: "", telefone: "", chavePix: "", tipoChavePix: "" });
  const [senhaForm, setSenhaForm] = useState({ senhaAtual: "", novaSenha: "", confirmar: "" });
  const [saving, setSaving] = useState(false);
  const [savingSenha, setSavingSenha] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgSenha, setMsgSenha] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setUser(d.user);
          setForm({
            nome: d.user.nome,
            telefone: d.user.telefone,
            chavePix: d.user.chavePix || "",
            tipoChavePix: d.user.tipoChavePix || "",
          });
        }
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setUser((prev) => prev ? { ...prev, ...data.user } : prev);
      setMsg("Dados atualizados com sucesso");
    } else {
      setMsg(data.error || "Erro ao salvar");
    }
  }

  async function handleSenha(e: React.FormEvent) {
    e.preventDefault();
    setMsgSenha("");
    if (senhaForm.novaSenha !== senhaForm.confirmar) {
      setMsgSenha("As senhas não coincidem");
      return;
    }
    if (senhaForm.novaSenha.length < 6) {
      setMsgSenha("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }
    setSavingSenha(true);
    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senhaAtual: senhaForm.senhaAtual, novaSenha: senhaForm.novaSenha }),
    });
    const data = await res.json();
    setSavingSenha(false);
    if (res.ok) {
      setMsgSenha("Senha alterada com sucesso");
      setSenhaForm({ senhaAtual: "", novaSenha: "", confirmar: "" });
    } else {
      setMsgSenha(data.error || "Erro ao alterar senha");
    }
  }

  if (!user) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto animate-pulse">
        <div className="h-8 w-48 bg-zinc-200 rounded-lg"></div>
        <div className="h-64 bg-zinc-100 rounded-2xl"></div>
      </div>
    );
  }

  const tierInfo = TIERS[user.tier] || TIERS.BRONZE;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-navy">Meu Perfil</h1>
        <p className="text-sm text-muted mt-1">Gerencie seus dados pessoais e configurações</p>
      </div>

      <div className="card p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white" style={{ backgroundColor: tierInfo.cor }}>
          {user.nome.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-navy text-lg">{user.nome}</p>
          <p className="text-sm text-muted">{user.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: tierInfo.cor, backgroundColor: tierInfo.cor + "15" }}>
              {tierInfo.label}
            </span>
            <span className="text-xs text-muted">Desde {new Date(user.createdAt).toLocaleDateString("pt-BR")}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="card p-5 space-y-4">
        <h2 className="font-semibold text-navy">Dados Pessoais</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted mb-1">Nome completo</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm text-muted mb-1">Telefone</label>
            <input
              type="tel"
              value={form.telefone}
              onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
              className="input-field"
            />
          </div>
        </div>

        <hr className="border-border" />
        <h3 className="font-medium text-navy text-sm">Dados PIX</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted mb-1">Tipo de chave</label>
            <select
              value={form.tipoChavePix}
              onChange={(e) => setForm((f) => ({ ...f, tipoChavePix: e.target.value }))}
              className="input-field"
            >
              <option value="">Selecione</option>
              <option value="cpf">CPF</option>
              <option value="cnpj">CNPJ</option>
              <option value="email">E-mail</option>
              <option value="telefone">Telefone</option>
              <option value="aleatoria">Chave aleatória</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-muted mb-1">Chave PIX</label>
            <input
              type="text"
              value={form.chavePix}
              onChange={(e) => setForm((f) => ({ ...f, chavePix: e.target.value }))}
              placeholder="Sua chave PIX"
              className="input-field"
            />
          </div>
        </div>

        {msg && (
          <p className={`text-sm ${msg.includes("sucesso") ? "text-primary-dark" : "text-red-600"}`}>{msg}</p>
        )}

        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>

      <form onSubmit={handleSenha} className="card p-5 space-y-4">
        <h2 className="font-semibold text-navy">Alterar Senha</h2>

        <div>
          <label className="text-sm text-muted mb-1">Senha atual</label>
          <input
            type="password"
            value={senhaForm.senhaAtual}
            onChange={(e) => setSenhaForm((f) => ({ ...f, senhaAtual: e.target.value }))}
            className="input-field"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted mb-1">Nova senha</label>
            <input
              type="password"
              value={senhaForm.novaSenha}
              onChange={(e) => setSenhaForm((f) => ({ ...f, novaSenha: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm text-muted mb-1">Confirmar nova senha</label>
            <input
              type="password"
              value={senhaForm.confirmar}
              onChange={(e) => setSenhaForm((f) => ({ ...f, confirmar: e.target.value }))}
              className="input-field"
            />
          </div>
        </div>

        {msgSenha && (
          <p className={`text-sm ${msgSenha.includes("sucesso") ? "text-primary-dark" : "text-red-600"}`}>{msgSenha}</p>
        )}

        <button type="submit" disabled={savingSenha} className="btn-secondary disabled:opacity-50">
          {savingSenha ? "Alterando..." : "Alterar senha"}
        </button>
      </form>
    </div>
  );
}
