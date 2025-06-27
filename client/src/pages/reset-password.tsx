import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CheckCircle, XCircle, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Head from "@/components/head";

// Reset password form schema
const resetPasswordSchema = z.object({
  password: z.string().min(8, {
    message: "Mật khẩu phải có ít nhất 8 ký tự",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  
  // Extract token from URL
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const tokenFromUrl = query.get("token");
    
    if (!tokenFromUrl) {
      setStatus("error");
      setErrorMessage(t("auth.resetPassword.noToken"));
    } else {
      setToken(tokenFromUrl);
    }
  }, []);
  
  // Reset password form
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  
  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast({
        title: "Lỗi",
        description: "Token đặt lại mật khẩu không hợp lệ",
        variant: "destructive",
      });
      return;
    }
    
    setStatus("submitting");
    
    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: data.password,
        }),
      });
      
      const responseData = await response.json();
      
      if (responseData.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(responseData.error || t("auth.resetPassword.unknownError"));
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setStatus("error");
      setErrorMessage(t("auth.resetPassword.serverError"));
    }
  };
  
  return (
    <>
      <Head>
        <title>{t("auth.resetPassword.title")} - {t("common.appName")}</title>
      </Head>
      
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-md w-full space-y-8 bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50 shadow-lg">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-slate-100">{t("auth.resetPassword.title")}</h2>
            
            <div className="mt-8">
              {status === "idle" && token && (
                <div className="space-y-6">
                  <div className="flex justify-center mb-4">
                    <KeyRound className="h-16 w-16 text-primary" />
                  </div>
                  <p className="text-slate-300 mb-4">{t("auth.resetPassword.instructions")}</p>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">{t("auth.resetPassword.newPassword")}</FormLabel>
                            <FormControl>
                              <Input type="password" className="bg-slate-700/50 border-slate-600" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">{t("auth.resetPassword.confirmPassword")}</FormLabel>
                            <FormControl>
                              <Input type="password" className="bg-slate-700/50 border-slate-600" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90"
                        disabled={status === "submitting"}
                      >
                        {status === "submitting" ? t("common.loading") : t("auth.resetPassword.submit")}
                      </Button>
                    </form>
                  </Form>
                </div>
              )}
              
              {status === "success" && (
                <div className="flex flex-col items-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                  <p className="text-slate-300 mb-6">{t("auth.resetPassword.success")}</p>
                  <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => navigate("/auth")}>
                    {t("auth.resetPassword.loginButton")}
                  </Button>
                </div>
              )}
              
              {status === "error" && (
                <div className="flex flex-col items-center">
                  <XCircle className="h-16 w-16 text-red-500 mb-4" />
                  <p className="text-slate-300 mb-2">{t("auth.resetPassword.failure")}</p>
                  <p className="text-red-400 mb-6">{errorMessage}</p>
                  <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => navigate("/auth")}>
                    {t("auth.resetPassword.backToLogin")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}