import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "Senha obrigatória"),
});

export const registroSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  cpfCnpj: z.string().min(11, "CPF/CNPJ inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
});

export const indicacaoSchema = z.object({
  nomeEstabelecimento: z.string().min(2, "Nome do estabelecimento obrigatório"),
  endereco: z.string().min(5, "Endereço obrigatório"),
  cidade: z.string().min(2, "Cidade obrigatória"),
  estado: z.string().length(2, "Estado deve ter 2 caracteres"),
  tipoLocal: z.string().min(1, "Tipo de local obrigatório"),
  nomeDecissor: z.string().min(2, "Nome do decisor obrigatório"),
  telefoneDecissor: z.string().min(10, "Telefone do decisor inválido"),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  horarioFuncionamento: z.string().optional().default(""),
  fluxoPessoas: z.string().optional().default("ATE_50"),
  cargoDecissor: z.string().nullable().optional(),
  interesseDecissor: z.enum(["SIM", "TALVEZ", "NAO"]).optional().default("TALVEZ"),
  temEspaco: z.enum(["SIM", "NAO", "NAO_SEI"]).optional().default("NAO_SEI"),
  temEnergia: z.enum(["SIM", "NAO", "NAO_SEI"]).optional().default("NAO_SEI"),
  temConcorrente: z.boolean().optional().default(false),
  fotos: z.array(z.string()).optional().default([]),
  fotoUrl: z.string().optional(),
});

export const pagamentoSchema = z.object({
  indicacaoId: z.string().min(1, "Indicação obrigatória"),
  indicadorId: z.string().min(1, "Captador obrigatório"),
  tipo: z.enum(["BONUS_INCLUSAO", "RECORRENCIA"]),
  valor: z.number().positive("Valor deve ser positivo"),
  mesReferencia: z.string().nullable().optional(),
  pago: z.boolean().optional().default(false),
});

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((e) => e.message).join(", ");
}