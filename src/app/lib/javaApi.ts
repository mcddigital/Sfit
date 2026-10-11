
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
