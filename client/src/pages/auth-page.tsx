import { useEffect, useState } from "react";
import { useDbTranslations } from "@/hooks/use-db-translations";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import Head from "@/components/head";
import { signInWithGoogle, signInWithFacebook } from "@/lib/firebase";
import { queryClient } from "@/lib/queryClient";

// Login form schema
const loginSchema = z.object({
  username: z.string()
    .min(1, { message: "Vui lòng nhập tên đăng nhập hoặc email" })
    .max(100, { message: "Tên đăng nhập không được quá 100 ký tự" }),
  password: z.string()
    .min(1, { message: "Mật khẩu là bắt buộc" })
    .max(128, { message: "Mật khẩu không được quá 128 ký tự" }),
  rememberMe: z.boolean().optional(),
});

// Register form schema
const registerSchema = z.object({
  fullName: z.string()
    .min(2, { message: "Họ tên phải có ít nhất 2 ký tự" })
    .max(50, { message: "Họ tên không được quá 50 ký tự" })
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, { message: "Họ tên chỉ được chứa chữ cái và khoảng trắng" }),
  email: z.string()
    .min(1, { message: "Email là bắt buộc" })
    .email({ message: "Vui lòng nhập email hợp lệ" })
    .max(100, { message: "Email không được quá 100 ký tự" }),
  password: z.string()
    .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
    .max(128, { message: "Mật khẩu không được quá 128 ký tự" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { 
      message: "Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số" 
    }),
  confirmPassword: z.string()
    .min(1, { message: "Vui lòng xác nhận mật khẩu" }),
  terms: z.boolean()
    .refine((val) => val === true, {
      message: "Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách bảo mật",
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { t } = useDbTranslations();
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isVerified, setIsVerified] = useState(false);
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const { toast } = useToast();
  
  // Check URL params to set default tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'register') {
      setActiveTab('register');
    }
  }, []);
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  
  // Kiểm tra xác thực email thành công
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      setIsVerified(true);
      
      // Hiển thị thông báo xác thực thành công
      toast({
        title: t("auth.verify.success"),
        description: t("auth.login.verifiedSuccess"),
        variant: "default",
      });
      
      // Tự động chuyển sang tab đăng nhập
      setActiveTab("login");
    }
  }, [t, toast, setActiveTab]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    // Additional validation check for terms
    if (!data.terms) {
      toast({
        title: "Lỗi đăng ký",
        description: "Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách bảo mật để tiếp tục đăng ký.",
        variant: "destructive",
      });
      return;
    }
    
    registerMutation.mutate({
      username: data.email,
      email: data.email,
      password: data.password,
      fullName: data.fullName,
    });
  };

  // Google OAuth handler
  const handleGoogleLogin = async () => {
    try {
      setIsProcessingOAuth(true);
      await signInWithGoogle();
      // If successful, the page will redirect to dashboard via useEffect
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: t("auth.login.error") || "Error",
        description: t("auth.login.googleError") || "Failed to login with Google",
        variant: "destructive",
      });
      setIsProcessingOAuth(false);
    }
  };

  // Facebook OAuth handler
  const handleFacebookLogin = async () => {
    try {
      setIsProcessingOAuth(true);
      await signInWithFacebook();
      // If successful, the page will redirect to dashboard via useEffect
    } catch (error) {
      console.error("Facebook login error:", error);
      toast({
        title: t("auth.login.error") || "Error",
        description: t("auth.login.facebookError") || "Failed to login with Facebook",
        variant: "destructive",
      });
      setIsProcessingOAuth(false);
    }
  };
  
  // Handle auth redirect on page load
  useEffect(() => {
    const checkAuthRedirect = async () => {
      try {
        // Import here to avoid circular dependencies
        const { handleAuthRedirect } = await import("@/lib/firebase");
        const result = await handleAuthRedirect();
        
        // If we got a result, that means the user was redirected and authenticated
        if (result && result.success && result.data) {
          // Update the auth state which will trigger the navigation to dashboard
          queryClient.setQueryData(["/api/user"], result.data);
        }
      } catch (error) {
        console.error("Auth redirect error:", error);
        toast({
          title: t("auth.login.error") || "Error",
          description: t("auth.login.redirectError") || "Failed to complete authentication",
          variant: "destructive",
        });
      }
    };
    
    // Run the redirect check
    checkAuthRedirect();
  }, [t]);

  // Check for initialization errors on mount
  useEffect(() => {
    const checkFirebaseInitialization = async () => {
      try {
        // Just import to trigger initialization
        await import("@/lib/firebase");
      } catch (error) {
        console.error("Failed to initialize Firebase:", error);
        toast({
          title: "Configuration Error",
          description: "Social login is not configured correctly. Please try traditional login methods.",
          variant: "destructive",
        });
      }
    };
    
    checkFirebaseInitialization();
  }, []);

  return (
    <>
      <Head>
        <title>{activeTab === "login" ? t("auth.login.title") : t("auth.register.title")} - {t("common.appName")}</title>
      </Head>
      
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left column - Form */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 xl:px-20 bg-slate-900">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="flex justify-center">
              <svg
                className="h-12 w-auto text-primary"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  fill="currentColor"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white font-heading bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {activeTab === "login" ? t("auth.login.title") : t("auth.register.title")}
            </h2>
            <p className="mt-2 text-center text-sm text-slate-400">
              {t("common.or")}{" "}
              <span
                onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
                className="font-medium text-white hover:text-primary cursor-pointer transition-colors"
              >
                {activeTab === "login" ? t("auth.login.switchToRegister") : t("auth.register.switchToLogin")}
              </span>
            </p>
            
            <div className="mt-8">
              <div className="bg-slate-800/50 backdrop-blur-sm py-8 px-6 shadow-lg rounded-xl border border-slate-700/50">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full flex mb-6 border-b border-slate-700">
                    <TabsTrigger value="login" className="flex-1 text-slate-300">{t("nav.login")}</TabsTrigger>
                    <TabsTrigger value="register" className="flex-1 text-slate-300">{t("nav.register")}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="mt-0">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-200">{t("auth.login.username")}</FormLabel>
                              <FormControl>
                                <Input type="text" className="bg-slate-700/50 border-slate-600" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-200">{t("auth.login.password")}</FormLabel>
                              <FormControl>
                                <Input type="password" className="bg-slate-700/50 border-slate-600" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex items-center justify-between">
                          <FormField
                            control={loginForm.control}
                            name="rememberMe"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="border-slate-500 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal text-slate-300">
                                  {t("auth.login.rememberMe")}
                                </FormLabel>
                              </FormItem>
                            )}
                          />

                          <div className="text-sm">
                            <Link href="/forgot-password" className="font-medium text-primary hover:text-primary/80">
                              {t("auth.login.forgotPassword")}
                            </Link>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-primary hover:bg-primary/90 button-hover-effect"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? t("common.loading") : t("auth.login.submit")}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                  
                  <TabsContent value="register" className="mt-0">
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                        <FormField
                          control={registerForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-200">{t("auth.register.name")}</FormLabel>
                              <FormControl>
                                <Input className="bg-slate-700/50 border-slate-600" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-200">{t("auth.register.email")}</FormLabel>
                              <FormControl>
                                <Input type="email" className="bg-slate-700/50 border-slate-600" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-200">{t("auth.register.password")}</FormLabel>
                              <FormControl>
                                <Input type="password" className="bg-slate-700/50 border-slate-600" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-200">{t("auth.register.confirmPassword")}</FormLabel>
                              <FormControl>
                                <Input type="password" className="bg-slate-700/50 border-slate-600" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="terms"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex flex-row items-start space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="border-slate-500 data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-1"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-normal text-slate-300">
                                    {t("auth.register.termsAgree")}{" "}
                                    <a href="#" className="text-primary hover:text-primary/80">
                                      {t("auth.register.terms")}
                                    </a>{" "}
                                    {t("auth.register.and")}{" "}
                                    <a href="#" className="text-primary hover:text-primary/80">
                                      {t("auth.register.privacy")}
                                    </a>
                                  </FormLabel>
                                </div>
                              </div>
                              <FormMessage className="text-sm mt-2" />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full bg-primary hover:bg-primary/90"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? t("common.loading") : t("auth.register.submit")}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>

                <div className="mt-6">
                  {/* Temporarily hidden social login buttons */}
                  {false && (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-slate-800 text-slate-400">
                            {t("auth.login.orContinueWith")}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <Button 
                          variant="outline" 
                          className="w-full bg-transparent text-slate-200 border-slate-700 hover:bg-slate-700/50"
                          onClick={handleGoogleLogin}
                          disabled={isProcessingOAuth || loginMutation.isPending || registerMutation.isPending}
                        >
                          {isProcessingOAuth ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {t("common.processing") || "Processing..."}
                            </span>
                          ) : (
                            <>
                              <FaGoogle className="mr-2 h-4 w-4" />
                              Google
                            </>
                          )}
                        </Button>

                        <Button 
                          variant="outline" 
                          className="w-full bg-transparent text-slate-200 border-slate-700 hover:bg-slate-700/50"
                          onClick={handleFacebookLogin}
                          disabled={isProcessingOAuth || loginMutation.isPending || registerMutation.isPending}
                        >
                          {isProcessingOAuth ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {t("common.processing") || "Processing..."}
                            </span>
                          ) : (
                            <>
                              <FaFacebook className="mr-2 h-4 w-4" />
                              Facebook
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column - Hero */}
        <div className="flex-1 hidden lg:block relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 flex items-center justify-center">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-white tracking-tight sm:text-5xl mb-6">
                {t("common.appName")}
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-lg mx-auto">
                {t("common.tagline")}
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <div className="bg-white/20 rounded-full p-2 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-white text-md font-medium">{t("authPage.highlights.seo")}</p>
                </div>
                <div className="flex items-center space-x-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <div className="bg-white/20 rounded-full p-2 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-white text-md font-medium">{t("authPage.highlights.integration")}</p>
                </div>
                <div className="flex items-center space-x-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <div className="bg-white/20 rounded-full p-2 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-white text-md font-medium">{t("authPage.highlights.credits")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
