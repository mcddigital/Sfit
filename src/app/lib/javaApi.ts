
export const JAVA_API_URL =
  "https://smartfit-api-6alp.onrender.com";

// Função principal para comunicação com a API Java
export async function javaApiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(`${JAVA_API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

// =====================================
// CADASTRO DE USUÁRIOS
// =====================================

export interface CadastroUsuario {
  nome: string;
  email: string;
  senha: string;
}

export async function cadastrarUsuario(
  dados: CadastroUsuario
) {
  const response = await javaApiRequest(
    "/api/usuarios",
    {
      method: "POST",
      body: JSON.stringify(dados),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Não foi possível cadastrar o usuário."
    );
  }

  return response.json();
}

// =====================================
// AUTENTICAÇÃO
// =====================================

export interface LoginResponse {
  id: number;
  nome: string;
  email: string;
  token: string;
  mensagem: string;
}

export async function loginJava(
  email: string,
  senha: string
): Promise<LoginResponse> {
  const response = await javaApiRequest(
    "/api/login",
    {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    }
  );

  if (!response.ok) {
    throw new Error("E-mail ou senha inválidos.");
  }

  return response.json();
}

// =====================================
// ATIVIDADES FÍSICAS
// =====================================

export interface AtividadeJava {
  id: number;
  tipo: string;
  duracaoMinutos: number;
  calorias: number;
  data: string;
}

export interface NovaAtividadeJava {
  tipo: string;
  duracaoMinutos: number;
  calorias: number;
  data: string;
}

export async function listarAtividadesJava(
  token: string
): Promise<AtividadeJava[]> {
  const response = await javaApiRequest(
    "/api/atividades",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Erro ao carregar atividades."
    );
  }

  return response.json();
}

export async function salvarAtividadeJava(
  token: string,
  atividade: NovaAtividadeJava
): Promise<AtividadeJava> {
  const response = await javaApiRequest(
    "/api/atividades",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(atividade),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Erro ao salvar atividade."
    );
  }

  return response.json();
}

// =====================================
// METAS
// =====================================

export type TipoMeta =
  | "steps"
  | "minutes"
  | "distance";

export type PeriodoMeta =
  | "daily"
  | "weekly"
  | "monthly";

export interface MetaJava {
  id: number;
  descricao: string;
  objetivoMinutos: number;
  dataCriacao: string;
  tipo: TipoMeta;
  objetivo: number;
  periodo: PeriodoMeta;
}

export interface NovaMetaJava {
  tipo: TipoMeta;
  objetivo: number;
  periodo: PeriodoMeta;
  descricao?: string;
}

// Consultar metas do usuário autenticado
export async function listarMetasJava(
  token: string
): Promise<MetaJava[]> {
  const response = await javaApiRequest(
    "/api/metas",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Não foi possível carregar suas metas."
    );
  }

  return response.json();
}

// Cadastrar uma nova meta no PostgreSQL
export async function salvarMetaJava(
  token: string,
  meta: NovaMetaJava
): Promise<MetaJava> {
  const response = await javaApiRequest(
    "/api/metas",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(meta),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Não foi possível salvar a meta."
    );
  }

  return response.json();
}
