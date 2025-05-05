import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/use-language";
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
import { Mail, CheckCircle } from "lucide-react";
import Head from "@/components/head";

// Forgot password form schema
const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: "Vui lòng nhập một địa chỉ email hợp lệ",
  }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [location, navigate] = useLocation();
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  
  // Forgot password form
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  
  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setStatus("submitting");
    
    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
        }),
      });
      
      // Bất kể phản hồi thế nào, ta đều hiển thị thông báo thành công
      // Điều này giúp tránh rò rỉ thông tin về việc tài khoản có tồn tại không
      setStatus("success");
    } catch (error) {
      console.error("Forgot password error:", error);
      // Vẫn hiển thị thành công để tránh rò rỉ thông tin
      setStatus("success");
    }
  };
  
  return (
    <>
      <Head>
        <title>{t("auth.forgotPassword.title")} - {t("common.appName")}</title>
      </Head>
      
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-md w-full space-y-8 bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50 shadow-lg">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-slate-100">{t("auth.forgotPassword.title")}</h2>
            
            <div className="mt-8">
              {status === "idle" && (
                <div className="space-y-6">
                  <div className="flex justify-center mb-4">
                    <Mail className="h-16 w-16 text-primary" />
                  </div>
                  <p className="text-slate-300 mb-4">{t("auth.forgotPassword.instructions")}</p>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">{t("auth.forgotPassword.email")}</FormLabel>
                            <FormControl>
                              <Input type="email" className="bg-slate-700/50 border-slate-600" {...field} />
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
                        {status === "submitting" ? t("common.loading") : t("auth.forgotPassword.submit")}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="text-center mt-4">
                    <Button variant="link" className="text-primary" onClick={() => navigate("/auth")}>
                      {t("auth.forgotPassword.backToLogin")}
                    </Button>
                  </div>
                </div>
              )}
              
              {status === "success" && (
                <div className="flex flex-col items-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                  <p className="text-slate-300 mb-6">{t("auth.forgotPassword.success")}</p>
                  <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => navigate("/auth")}>
                    {t("auth.forgotPassword.backToLogin")}
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