
export const JAVA_API_URL =
  "https://smartfit-api-6alp.onrender.com";

export async function javaApiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const response = await fetch(
    `${JAVA_API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    }
  );

  return response;
}

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
