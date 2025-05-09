import { QueryClient } from "@tanstack/react-query";

export async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || "Error desconocido en la solicitud API");
  }
}

export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
    },
  });

  await throwIfResNotOk(res);

  return res.json();
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const [url] = queryKey as [string];
        return apiRequest(url);
      },
    },
  },
});
