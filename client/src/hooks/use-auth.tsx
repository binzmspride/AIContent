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

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation<User, Error, LoginData>({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Login failed");
      }
      return data.data;
    },
    onSuccess: (userData: User) => {
      queryClient.setQueryData(["/api/user"], userData);
      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng ${userData.fullName || userData.username}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Đăng nhập thất bại",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation<User, Error, RegisterData>({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", userData);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Registration failed");
      }
      return data.data;
    },
    onSuccess: (userData: User) => {
      queryClient.setQueryData(["/api/user"], userData);
      toast({
        title: "Đăng ký thành công",
        description: "Tài khoản của bạn đã được tạo thành công",
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
