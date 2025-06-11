import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  email: string;
  password: string;
  fullName?: string;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
  loginMutation: {} as UseMutationResult<User, Error, LoginData>,
  logoutMutation: {} as UseMutationResult<void, Error, void>,
  registerMutation: {} as UseMutationResult<User, Error, RegisterData>,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (error.message.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const loginMutation = useMutation<User, Error, LoginData>({
    mutationFn: async (credentials: LoginData) => {
      console.log("Login attempt with:", credentials);
      try {
        // Sử dụng fetch trực tiếp để xem lỗi rõ hơn
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
          credentials: "include",
        });
        
        const data = await res.json();
        console.log("Login response:", data);
        
        if (!data.success) {
          throw new Error(data.error || "Đăng nhập thất bại");
        }
        
        return data.data;
      } catch (error: any) {
        console.error("Login error:", error);
        throw new Error(error.message || "Đăng nhập thất bại");
      }
    },
    onSuccess: (userData: User) => {
      console.log("Login successful, user data:", userData);
      queryClient.setQueryData(["/api/user"], userData);
      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng ${userData.fullName || userData.username}`,
      });
    },
    onError: (error: Error) => {
      console.error("Login error in callback:", error);
      toast({
        title: "Đăng nhập thất bại",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation<any, Error, RegisterData>({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", userData);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Đăng ký thất bại");
      }
      return data;
    },
    onSuccess: (response) => {
      // Không cập nhật user vì cần xác thực email trước
      toast({
        title: "Đăng ký thành công",
        description: response.message || "Vui lòng kiểm tra email của bạn để xác thực tài khoản",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Đăng ký thất bại",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Đăng xuất thành công",
        description: "Bạn đã đăng xuất khỏi hệ thống",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Đăng xuất thất bại",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
