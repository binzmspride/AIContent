import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Head from "@/components/head";

export default function VerifyEmailPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
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
    const token = query.get("token");
    
    if (!token) {
      setStatus("error");
      setErrorMessage(t("auth.verify.noToken"));
      return;
    }
    
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/verify-email?token=${token}`);
        const data = await response.json();
        
        if (data.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(data.error || t("auth.verify.unknownError"));
        }
      } catch (error) {
        console.error("Email verification error:", error);
        setStatus("error");
        setErrorMessage(t("auth.verify.serverError"));
      }
    };
    
    verifyEmail();
  }, []);
  
  return (
    <>
      <Head>
        <title>{t("auth.verify.title")} - {t("common.appName")}</title>
      </Head>
      
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-md w-full space-y-8 bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50 shadow-lg">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-slate-100">{t("auth.verify.title")}</h2>
            
            <div className="mt-8">
              {status === "loading" && (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                  <p className="text-slate-300">{t("auth.verify.verifying")}</p>
                </div>
              )}
              
              {status === "success" && (
                <div className="flex flex-col items-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                  <p className="text-slate-300 mb-6">{t("auth.verify.success")}</p>
                  <Link href="/auth">
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      {t("auth.verify.loginButton")}
                    </Button>
                  </Link>
                </div>
              )}
              
              {status === "error" && (
                <div className="flex flex-col items-center">
                  <XCircle className="h-16 w-16 text-red-500 mb-4" />
                  <p className="text-slate-300 mb-2">{t("auth.verify.failure")}</p>
                  <p className="text-red-400 mb-6">{errorMessage}</p>
                  <Link href="/auth">
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      {t("auth.verify.backToLogin")}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}