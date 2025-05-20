import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    // Sử dụng tương đối URL cho API
    const fullUrl = url;
    
    console.log(`API Request: ${method} ${fullUrl}`, data);
    
    const res = await fetch(fullUrl, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    
    if (!res.ok) {
      // Clone response để sau này vẫn có thể sử dụng body stream
      const clonedRes = res.clone();
      
      try {
        // Thử đọc và parse JSON từ response
        const errorData = await clonedRes.json();
        console.error(`API Error: ${res.status}`, errorData);
        throw new Error(errorData.error || errorData.message || res.statusText);
      } catch (jsonError) {
        // Nếu parse JSON thất bại, thử đọc text 
        try {
          const responseText = await clonedRes.text();
          console.error(`API Error (Text): ${res.status} - ${responseText}`);
          throw new Error(responseText || res.statusText);
        } catch (textError) {
          // Nếu cả hai đều thất bại, sử dụng status text
          console.error(`API Error (Status): ${res.status} - ${res.statusText}`);
          throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
        }
      }
    }
    
    return res;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Sử dụng tương đối URL cho API
    const url = queryKey[0] as string;
    const fullUrl = url;
      
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
