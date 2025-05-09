import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/Layout";
import { useLanguage } from "@/hooks/use-language";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertCircle,
  Database,
  Globe,
  KeyRound,
  Mail,
  RefreshCw,
  Save,
  Server,
  Settings as SettingsIcon,
  Sparkles,
  Webhook,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import Head from "@/components/head";

// System settings interface
interface SystemSettings {
  // General settings
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  // Feature flags
  enableNewUsers: boolean;
  enableArticleCreation: boolean;
  enableAutoPublish: boolean;
  maintenanceMode: boolean;
  // AI settings
  aiModel: "gpt-3.5-turbo" | "gpt-4" | "claude-3-opus" | "claude-3-sonnet";
  aiTemperature: number;
  aiContextLength: number;
  systemPromptPrefix: string;
  // Credit settings
  defaultUserCredits: number;
  creditCostPerArticle: number;
  creditCostPerImage: number;
  // Email settings
  smtpServer: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  emailSender: string;
  appBaseUrl: string;
  // API integration settings
  openaiApiKey: string;
  claudeApiKey: string;
  wordpressApiUrl: string;
  wordpressApiUser: string;
  wordpressApiKey: string;
  // Webhook settings
  webhookSecret: string;
  notificationWebhookUrl: string;
  // System info
  version: string;
  lastBackup: string;
  dbStatus: "online" | "limited" | "offline";
}

// General settings form schema
const generalSettingsSchema = z.object({
  siteName: z.string().min(2, "Site name must be at least 2 characters"),
  siteDescription: z.string().min(10, "Site description must be at least 10 characters"),
  contactEmail: z.string().email("Must be a valid email address"),
  supportEmail: z.string().email("Must be a valid email address"),
  enableNewUsers: z.boolean(),
  enableArticleCreation: z.boolean(),
  enableAutoPublish: z.boolean(),
  maintenanceMode: z.boolean(),
});

// AI settings form schema
const aiSettingsSchema = z.object({
  aiModel: z.enum(["gpt-3.5-turbo", "gpt-4", "claude-3-opus", "claude-3-sonnet"]),
  aiTemperature: z.coerce.number().min(0).max(1),
  aiContextLength: z.coerce.number().min(1000).max(100000),
  systemPromptPrefix: z.string(),
  defaultUserCredits: z.coerce.number().min(0),
  creditCostPerArticle: z.coerce.number().min(1),
  creditCostPerImage: z.coerce.number().min(1),
});

// Email settings form schema
const emailSettingsSchema = z.object({
  smtpServer: z.string().min(4, "SMTP server must be valid"),
  smtpPort: z.coerce.number().min(1).max(65535),
  smtpUsername: z.string().min(1, "SMTP username is required"),
  smtpPassword: z.string().min(1, "SMTP password is required"),
  emailSender: z.string().email("Must be a valid email address"),
  appBaseUrl: z.string().url("Must be a valid URL"),
});

// API integration settings form schema
const apiSettingsSchema = z.object({
  openaiApiKey: z.string().min(1, "OpenAI API key is required"),
  claudeApiKey: z.string().optional(),
  wordpressApiUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  wordpressApiUser: z.string().optional().or(z.literal("")),
  wordpressApiKey: z.string().optional().or(z.literal("")),
});

// Webhook settings form schema
const webhookSettingsSchema = z.object({
  webhookSecret: z.string().min(10, "Webhook secret must be at least 10 characters"),
  notificationWebhookUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;
type AiSettingsValues = z.infer<typeof aiSettingsSchema>;
type EmailSettingsValues = z.infer<typeof emailSettingsSchema>;
type ApiSettingsValues = z.infer<typeof apiSettingsSchema>;
type WebhookSettingsValues = z.infer<typeof webhookSettingsSchema>;

export default function AdminSettings() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  // Fetch system settings
  const { data: settingsResponse, isLoading } = useQuery<{ success: boolean, data: SystemSettings }>({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      // Mock data until API is available
      const mockSettings: SystemSettings = {
        siteName: "SEO AI Writer",
        siteDescription: "AI-powered SEO content generation platform",
        contactEmail: "contact@example.com",
        supportEmail: "support@example.com",
        
        enableNewUsers: true,
        enableArticleCreation: true,
        enableAutoPublish: false,
        maintenanceMode: false,
        
        aiModel: "gpt-3.5-turbo",
        aiTemperature: 0.7,
        aiContextLength: 4000,
        systemPromptPrefix: "Create SEO-friendly content that is engaging and valuable to readers while optimizing for search engines.",
        
        defaultUserCredits: 50,
        creditCostPerArticle: 10,
        creditCostPerImage: 5,
        
        smtpServer: "smtp.example.com",
        smtpPort: 587,
        smtpUsername: "noreply@example.com",
        smtpPassword: "password123",
        emailSender: "SEO AI Writer <noreply@example.com>",
        appBaseUrl: "http://localhost:5000",
        
        openaiApiKey: "sk-*************************************",
        claudeApiKey: "",
        wordpressApiUrl: "https://yourblog.com/wp-json/wp/v2",
        wordpressApiUser: "admin",
        wordpressApiKey: "xxxx xxxx xxxx xxxx xxxx xxxx",
        
        webhookSecret: "whsec_********************************",
        notificationWebhookUrl: "https://hooks.n8n.cloud/webhook/12345-abcdef-67890",
        
        version: "1.2.4",
        lastBackup: "2023-06-05T08:30:00Z",
        dbStatus: "online",
      };
      
      return {
        success: true,
        data: mockSettings
      };
    },
  });

  const settings = settingsResponse?.data;

  // Forms for different setting sections
  const generalForm = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      siteName: settings?.siteName || "",
      siteDescription: settings?.siteDescription || "",
      contactEmail: settings?.contactEmail || "",
      supportEmail: settings?.supportEmail || "",
      enableNewUsers: settings?.enableNewUsers || false,
      enableArticleCreation: settings?.enableArticleCreation || false,
      enableAutoPublish: settings?.enableAutoPublish || false,
      maintenanceMode: settings?.maintenanceMode || false,
    },
  });

  const aiForm = useForm<AiSettingsValues>({
    resolver: zodResolver(aiSettingsSchema),
    defaultValues: {
      aiModel: settings?.aiModel || "gpt-3.5-turbo",
      aiTemperature: settings?.aiTemperature || 0.7,
      aiContextLength: settings?.aiContextLength || 4000,
      systemPromptPrefix: settings?.systemPromptPrefix || "",
      defaultUserCredits: settings?.defaultUserCredits || 50,
      creditCostPerArticle: settings?.creditCostPerArticle || 10,
      creditCostPerImage: settings?.creditCostPerImage || 5,
    },
  });

  const emailForm = useForm<EmailSettingsValues>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      smtpServer: settings?.smtpServer || "",
      smtpPort: settings?.smtpPort || 587,
      smtpUsername: settings?.smtpUsername || "",
      smtpPassword: settings?.smtpPassword || "",
      emailSender: settings?.emailSender || "",
      appBaseUrl: settings?.appBaseUrl || "http://localhost:5000",
    },
  });

  const apiForm = useForm<ApiSettingsValues>({
    resolver: zodResolver(apiSettingsSchema),
    defaultValues: {
      openaiApiKey: settings?.openaiApiKey || "",
      claudeApiKey: settings?.claudeApiKey || "",
      wordpressApiUrl: settings?.wordpressApiUrl || "",
      wordpressApiUser: settings?.wordpressApiUser || "",
      wordpressApiKey: settings?.wordpressApiKey || "",
    },
  });

  const webhookForm = useForm<WebhookSettingsValues>({
    resolver: zodResolver(webhookSettingsSchema),
    defaultValues: {
      webhookSecret: settings?.webhookSecret || "",
      notificationWebhookUrl: settings?.notificationWebhookUrl || "",
    },
  });

  // Update settings when data is loaded
  useEffect(() => {
    if (settings) {
      generalForm.reset({
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        contactEmail: settings.contactEmail,
        supportEmail: settings.supportEmail,
        enableNewUsers: settings.enableNewUsers,
        enableArticleCreation: settings.enableArticleCreation,
        enableAutoPublish: settings.enableAutoPublish,
        maintenanceMode: settings.maintenanceMode,
      });
      
      aiForm.reset({
        aiModel: settings.aiModel,
        aiTemperature: settings.aiTemperature,
        aiContextLength: settings.aiContextLength,
        systemPromptPrefix: settings.systemPromptPrefix,
        defaultUserCredits: settings.defaultUserCredits,
        creditCostPerArticle: settings.creditCostPerArticle,
        creditCostPerImage: settings.creditCostPerImage,
      });
      
      emailForm.reset({
        smtpServer: settings.smtpServer,
        smtpPort: settings.smtpPort,
        smtpUsername: settings.smtpUsername,
        smtpPassword: settings.smtpPassword,
        emailSender: settings.emailSender,
        appBaseUrl: settings.appBaseUrl,
      });
      
      apiForm.reset({
        openaiApiKey: settings.openaiApiKey,
        claudeApiKey: settings.claudeApiKey || "",
        wordpressApiUrl: settings.wordpressApiUrl || "",
        wordpressApiUser: settings.wordpressApiUser || "",
        wordpressApiKey: settings.wordpressApiKey || "",
      });
      
      webhookForm.reset({
        webhookSecret: settings.webhookSecret,
        notificationWebhookUrl: settings.notificationWebhookUrl || "",
      });
    }
  }, [settings]);

  // Update general settings mutation
  const updateGeneralSettingsMutation = useMutation({
    mutationFn: async (data: GeneralSettingsValues) => {
      const res = await apiRequest("PATCH", "/api/admin/settings/general", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Cài đặt chung đã được cập nhật",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update AI settings mutation
  const updateAiSettingsMutation = useMutation({
    mutationFn: async (data: AiSettingsValues) => {
      const res = await apiRequest("PATCH", "/api/admin/settings/ai", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Cài đặt AI đã được cập nhật",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update email settings mutation
  const updateEmailSettingsMutation = useMutation({
    mutationFn: async (data: EmailSettingsValues) => {
      const res = await apiRequest("PATCH", "/api/admin/settings/email", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Cài đặt email đã được cập nhật",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update API settings mutation
  const updateApiSettingsMutation = useMutation({
    mutationFn: async (data: ApiSettingsValues) => {
      const res = await apiRequest("PATCH", "/api/admin/settings/api", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Cài đặt API đã được cập nhật",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update webhook settings mutation
  const updateWebhookSettingsMutation = useMutation({
    mutationFn: async (data: WebhookSettingsValues) => {
      const res = await apiRequest("PATCH", "/api/admin/settings/webhook", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Cài đặt webhook đã được cập nhật",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Test email settings mutation
  const testEmailSettingsMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await apiRequest("POST", "/api/admin/settings/email/test", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Email kiểm tra đã được gửi",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Trigger database backup mutation
  const triggerBackupMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/settings/backup");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Quá trình sao lưu đã được khởi động",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handlers
  const onGeneralSubmit = (data: GeneralSettingsValues) => {
    updateGeneralSettingsMutation.mutate(data);
  };

  const onAiSubmit = (data: AiSettingsValues) => {
    updateAiSettingsMutation.mutate(data);
  };

  const onEmailSubmit = (data: EmailSettingsValues) => {
    updateEmailSettingsMutation.mutate(data);
  };

  const onApiSubmit = (data: ApiSettingsValues) => {
    updateApiSettingsMutation.mutate(data);
  };

  const onWebhookSubmit = (data: WebhookSettingsValues) => {
    updateWebhookSettingsMutation.mutate(data);
  };

  const [testEmailAddress, setTestEmailAddress] = useState("");

  const handleTestEmail = () => {
    // Check if we have a test email address
    if (!testEmailAddress) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập địa chỉ email để kiểm tra",
        variant: "destructive",
      });
      return;
    }

    // Validate the email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmailAddress)) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập địa chỉ email hợp lệ",
        variant: "destructive",
      });
      return;
    }
    
    // Send the test email
    testEmailSettingsMutation.mutate({ email: testEmailAddress });
  };

  const handleBackup = () => {
    triggerBackupMutation.mutate();
  };

  // Generate a new webhook secret
  const generateWebhookSecret = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "whsec_";
    for (let i = 0; i < 32; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    webhookForm.setValue("webhookSecret", result);
  };

  return (
    <>
      <Head>
        <title>{t("admin.settingsPage.title") || "Cài đặt hệ thống"} - {t("common.appName") || "SEO AI Writer"}</title>
      </Head>
      
      <AdminLayout title={t("admin.settingsPage.title") || "Cài đặt hệ thống"}>
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
          {/* Settings navigation */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <Tabs
                  orientation="vertical"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="space-y-2"
                >
                  <TabsList className="flex flex-col h-auto items-stretch">
                    <TabsTrigger value="general" className="justify-start">
                      <Globe className="h-4 w-4 mr-2" />
                      {t("admin.settingsPage.general") || "Cài đặt chung"}
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="justify-start">
                      <Sparkles className="h-4 w-4 mr-2" />
                      {t("admin.settingsPage.ai") || "Cài đặt AI"}
                    </TabsTrigger>
                    <TabsTrigger value="email" className="justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      {t("admin.settingsPage.email") || "Cài đặt email"}
                    </TabsTrigger>
                    <TabsTrigger value="api" className="justify-start">
                      <KeyRound className="h-4 w-4 mr-2" />
                      {t("admin.settingsPage.api") || "Cài đặt API"}
                    </TabsTrigger>
                    <TabsTrigger value="webhook" className="justify-start">
                      <Webhook className="h-4 w-4 mr-2" />
                      {t("admin.settingsPage.webhook") || "Webhook"}
                    </TabsTrigger>
                    <TabsTrigger value="system" className="justify-start">
                      <Server className="h-4 w-4 mr-2" />
                      {t("admin.settingsPage.system") || "Hệ thống"}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* System status card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("admin.settingsPage.systemStatus") || "Trạng thái hệ thống"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("admin.settingsPage.version") || "Phiên bản"}</span>
                  <span className="font-medium">{settings?.version || "1.0.0"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("admin.settingsPage.database") || "Cơ sở dữ liệu"}</span>
                  <span className={`font-medium ${settings?.dbStatus === "online" ? "text-green-600" : settings?.dbStatus === "limited" ? "text-yellow-600" : "text-red-600"}`}>
                    {settings?.dbStatus === "online" ? "Online" : settings?.dbStatus === "limited" ? "Limited" : "Offline"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("admin.settingsPage.lastBackup") || "Sao lưu gần đây"}</span>
                  <span className="font-medium">
                    {settings?.lastBackup ? format(new Date(settings.lastBackup), "dd/MM/yyyy HH:mm") : "N/A"}
                  </span>
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleBackup}
                    disabled={triggerBackupMutation.isPending}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    {triggerBackupMutation.isPending 
                      ? (t("admin.settingsPage.backingUp") || "Đang sao lưu...") 
                      : (t("admin.settingsPage.backupNow") || "Sao lưu ngay")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings content */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="hidden">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="ai">AI</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="api">API</TabsTrigger>
                <TabsTrigger value="webhook">Webhook</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>
            {/* General Settings */}
            <TabsContent value="general" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("admin.settingsPage.general") || "Cài đặt chung"}</CardTitle>
                  <CardDescription>
                    {t("admin.settingsPage.generalDescription") || "Cấu hình các thông tin chung của ứng dụng"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...generalForm}>
                    <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-4">
                      <FormField
                        control={generalForm.control}
                        name="siteName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("admin.settingsPage.siteName") || "Tên trang web"}</FormLabel>
                            <FormControl>
                              <Input placeholder="SEO AI Writer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={generalForm.control}
                        name="siteDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("admin.settingsPage.siteDescription") || "Mô tả trang web"}</FormLabel>
                            <FormControl>
                              <Input placeholder="AI-powered SEO content generation platform" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={generalForm.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("admin.settingsPage.contactEmail") || "Email liên hệ"}</FormLabel>
                              <FormControl>
                                <Input placeholder="contact@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={generalForm.control}
                          name="supportEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("admin.settingsPage.supportEmail") || "Email hỗ trợ"}</FormLabel>
                              <FormControl>
                                <Input placeholder="support@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <FormField
                          control={generalForm.control}
                          name="enableNewUsers"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  {t("admin.settingsPage.enableNewUsers") || "Cho phép đăng ký mới"}
                                </FormLabel>
                                <FormDescription>
                                  {t("admin.settingsPage.enableNewUsersDescription") || "Cho phép người dùng mới đăng ký tài khoản"}
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={generalForm.control}
                          name="enableArticleCreation"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  {t("admin.settingsPage.enableArticleCreation") || "Cho phép tạo bài viết"}
                                </FormLabel>
                                <FormDescription>
                                  {t("admin.settingsPage.enableArticleCreationDescription") || "Cho phép người dùng tạo bài viết mới"}
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={generalForm.control}
                          name="enableAutoPublish"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  {t("admin.settingsPage.enableAutoPublish") || "Cho phép tự động xuất bản"}
                                </FormLabel>
                                <FormDescription>
                                  {t("admin.settingsPage.enableAutoPublishDescription") || "Cho phép tự động xuất bản bài viết đến các kênh đã kết nối"}
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={generalForm.control}
                          name="maintenanceMode"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-yellow-50">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base flex items-center">
                                  <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                                  {t("admin.settingsPage.maintenanceMode") || "Chế độ bảo trì"}
                                </FormLabel>
                                <FormDescription>
                                  {t("admin.settingsPage.maintenanceModeDescription") || "Kích hoạt chế độ bảo trì, chỉ admin mới truy cập được"}
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="pt-4 border-t mt-6">
                        <Button 
                          type="submit" 
                          className="flex items-center"
                          disabled={updateGeneralSettingsMutation.isPending || !generalForm.formState.isDirty}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {updateGeneralSettingsMutation.isPending 
                            ? (t("common.saving") || "Đang lưu...") 
                            : (t("common.saveChanges") || "Lưu thay đổi")}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Settings */}
            <TabsContent value="ai" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("admin.settingsPage.ai") || "Cài đặt AI"}</CardTitle>
                  <CardDescription>
                    {t("admin.settingsPage.aiDescription") || "Cấu hình các thông số cho AI và hệ thống credits"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...aiForm}>
                    <form onSubmit={aiForm.handleSubmit(onAiSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={aiForm.control}
                          name="aiModel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("admin.settingsPage.aiModel") || "Mô hình AI"}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t("admin.settingsPage.selectAiModel") || "Chọn mô hình AI"} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                                  <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={aiForm.control}
                          name="aiTemperature"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("admin.settingsPage.aiTemperature") || "Nhiệt độ AI"} ({field.value})</FormLabel>
                              <FormControl>
                                <Input 
                                  type="range" 
                                  min="0" 
                                  max="1" 
                                  step="0.1" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>
                                {t("admin.settingsPage.aiTemperatureDescription") || "Mức độ sáng tạo của AI (0: ít ngẫu nhiên, 1: nhiều ngẫu nhiên)"}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={aiForm.control}
                        name="aiContextLength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("admin.settingsPage.aiContextLength") || "Độ dài ngữ cảnh (tokens)"}</FormLabel>
                            <FormControl>
                              <Input type="number" min="1000" max="100000" step="1000" {...field} />
                            </FormControl>
                            <FormDescription>
                              {t("admin.settingsPage.aiContextLengthDescription") || "Số lượng tokens tối đa cho mỗi yêu cầu AI"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={aiForm.control}
                        name="systemPromptPrefix"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("admin.settingsPage.systemPromptPrefix") || "Prefix cho System Prompt"}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              {t("admin.settingsPage.systemPromptPrefixDescription") || "Hướng dẫn mặc định được thêm vào tất cả các yêu cầu AI"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <h3 className="text-lg font-medium pt-6 border-t mt-6">{t("admin.settingsPage.creditSettings") || "Cài đặt credits"}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={aiForm.control}
                          name="defaultUserCredits"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("admin.settingsPage.defaultUserCredits") || "Credits mặc định"}</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" {...field} />
                              </FormControl>
                              <FormDescription>
                                {t("admin.settingsPage.defaultUserCreditsDescription") || "Credits cấp cho người dùng mới"}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={aiForm.control}
                          name="creditCostPerArticle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("admin.settingsPage.creditCostPerArticle") || "Chi phí cho bài viết"}</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" {...field} />
                              </FormControl>
                              <FormDescription>
                                {t("admin.settingsPage.creditCostPerArticleDescription") || "Số credits cần thiết cho mỗi bài viết"}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={aiForm.control}
                          name="creditCostPerImage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("admin.settingsPage.creditCostPerImage") || "Chi phí cho hình ảnh"}</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" {...field} />
                              </FormControl>
                              <FormDescription>
                                {t("admin.settingsPage.creditCostPerImageDescription") || "Số credits cần thiết cho mỗi hình ảnh"}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="pt-4 border-t mt-6">
                        <Button 
                          type="submit" 
                          className="flex items-center"
                          disabled={updateAiSettingsMutation.isPending || !aiForm.formState.isDirty}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {updateAiSettingsMutation.isPending 
                            ? (t("common.saving") || "Đang lưu...") 
                            : (t("common.saveChanges") || "Lưu thay đổi")}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Settings */}
            <TabsContent value="email" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("admin.settingsPage.email") || "Cài đặt email"}</CardTitle>
                  <CardDescription>
                    {t("admin.settingsPage.emailDescription") || "Cấu hình máy chủ SMTP để gửi email thông báo"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={emailForm.control}
                          name="smtpServer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("admin.settings.smtpServer") || "Máy chủ SMTP"}</FormLabel>
                              <FormControl>
                                <Input placeholder="smtp.example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={emailForm.control}
                          name="smtpPort"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("admin.settings.smtpPort") || "Cổng SMTP"}</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="587" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={emailForm.control}
                          name="smtpUsername"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("admin.settings.smtpUsername") || "Tên đăng nhập SMTP"}</FormLabel>
                              <FormControl>
                                <Input placeholder="noreply@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={emailForm.control}
                          name="smtpPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("admin.settings.smtpPassword") || "Mật khẩu SMTP"}</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={emailForm.control}
                        name="emailSender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("admin.settings.emailSender") || "Người gửi email"}</FormLabel>
                            <FormControl>
                              <Input placeholder="SEO AI Writer <noreply@example.com>" {...field} />
                            </FormControl>
                            <FormDescription>
                              {t("admin.settings.emailSenderDescription") || "Tên và email hiển thị khi gửi thông báo"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={emailForm.control}
                        name="appBaseUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("admin.settings.appBaseUrl") || "URL cơ sở của ứng dụng"}</FormLabel>
                            <FormControl>
                              <Input placeholder="https://yourdomain.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              {t("admin.settings.appBaseUrlDescription") || "URL gốc của ứng dụng, sử dụng cho các liên kết trong email"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="border-t mt-6 pt-4">
                        <h4 className="font-medium text-sm mb-2">{t("admin.settings.testEmailTitle") || "Kiểm tra cài đặt email"}</h4>
                        <div className="flex space-x-2 mb-6">
                          <div className="flex-1">
                            <Input
                              type="email"
                              placeholder={t("admin.settings.testEmailPlaceholder") || "Nhập email để kiểm tra"}
                              value={testEmailAddress}
                              onChange={(e) => setTestEmailAddress(e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="flex items-center whitespace-nowrap"
                            onClick={handleTestEmail}
                            disabled={testEmailSettingsMutation.isPending || isLoading}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            {testEmailSettingsMutation.isPending 
                              ? (t("admin.settings.sendingTest") || "Đang gửi...") 
                              : (t("admin.settings.testEmailButton") || "Gửi email kiểm tra")}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4">
                        <Button 
                          type="submit" 
                          className="flex items-center"
                          disabled={updateEmailSettingsMutation.isPending || !emailForm.formState.isDirty}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {updateEmailSettingsMutation.isPending 
                            ? (t("common.saving") || "Đang lưu...") 
                            : (t("common.saveChanges") || "Lưu thay đổi")}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Settings */}
            <TabsContent value="api" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("admin.settingsPage.api") || "Cài đặt API"}</CardTitle>
                  <CardDescription>
                    {t("admin.settingsPage.apiDescription") || "Cấu hình kết nối với các dịch vụ API bên ngoài"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...apiForm}>
                    <form onSubmit={apiForm.handleSubmit(onApiSubmit)} className="space-y-4">
                      <h3 className="text-lg font-medium">{t("admin.settingsPage.aiApiKeys") || "Khóa API cho AI"}</h3>
                      
                      <FormField
                        control={apiForm.control}
                        name="openaiApiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("admin.settingsPage.openaiApiKey") || "OpenAI API Key"}</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="sk-..." {...field} />
                            </FormControl>
                            <FormDescription>
                              {t("admin.settingsPage.openaiApiKeyDescription") || "API Key cho OpenAI GPT (bắt đầu bằng 'sk-')"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={apiForm.control}
                        name="claudeApiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("admin.settingsPage.claudeApiKey") || "Claude API Key (Anthropic)"}</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="sk-ant-..." {...field} value={field.value || ""} />
                            </FormControl>
                            <FormDescription>
                              {t("admin.settingsPage.claudeApiKeyDescription") || "API Key cho Anthropic Claude (tùy chọn)"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <h3 className="text-lg font-medium pt-6 border-t mt-6">{t("admin.settingsPage.wordpressSettings") || "Cài đặt WordPress"}</h3>
                      
                      <FormField
                        control={apiForm.control}
                        name="wordpressApiUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("admin.settingsPage.wordpressApiUrl") || "WordPress API URL"}</FormLabel>
                            <FormControl>
                              <Input placeholder="https://yourblog.com/wp-json/wp/v2" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormDescription>
                              {t("admin.settingsPage.wordpressApiUrlDescription") || "URL gốc API WordPress của bạn"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={apiForm.control}
                          name="wordpressApiUser"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("admin.settingsPage.wordpressApiUser") || "WordPress Username"}</FormLabel>
                              <FormControl>
                                <Input placeholder="admin" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={apiForm.control}
                          name="wordpressApiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("admin.settingsPage.wordpressApiKey") || "WordPress Application Password"}</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="xxxx xxxx xxxx xxxx" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="pt-4 border-t mt-6">
                        <Button 
                          type="submit" 
                          className="flex items-center"
                          disabled={updateApiSettingsMutation.isPending || !apiForm.formState.isDirty}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {updateApiSettingsMutation.isPending 
                            ? (t("common.saving") || "Đang lưu...") 
                            : (t("common.saveChanges") || "Lưu thay đổi")}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Webhook Settings */}
            <TabsContent value="webhook" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("admin.settingsPage.webhook") || "Cài đặt webhook"}</CardTitle>
                  <CardDescription>
                    {t("admin.settingsPage.webhookDescription") || "Cấu hình webhook cho n8n và các dịch vụ khác"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...webhookForm}>
                    <form onSubmit={webhookForm.handleSubmit(onWebhookSubmit)} className="space-y-4">
                      <FormField
                        control={webhookForm.control}
                        name="webhookSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("admin.settingsPage.webhookSecret") || "Webhook Secret"}</FormLabel>
                            <div className="flex space-x-2">
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={generateWebhookSecret}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </div>
                            <FormDescription>
                              {t("admin.settingsPage.webhookSecretDescription") || "Khóa bí mật để xác thực webhook, bắt đầu bằng 'whsec_'"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={webhookForm.control}
                        name="notificationWebhookUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("admin.settings.notificationWebhook") || "Webhook thông báo (n8n)"}</FormLabel>
                            <FormControl>
                              <Input placeholder="https://hooks.n8n.cloud/webhook/..." {...field} value={field.value || ""} />
                            </FormControl>
                            <FormDescription>
                              {t("admin.settings.notificationWebhookDescription") || "URL webhook để nhận thông báo về sự kiện hệ thống"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="rounded-md border p-4 mt-6 bg-muted/50">
                        <h3 className="text-sm font-medium mb-2">{t("admin.settings.availableWebhookEvents") || "Sự kiện webhook có sẵn"}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="flex items-start">
                              <code className="text-xs bg-muted p-1 rounded mr-2">user.registered</code>
                              <span className="text-xs text-muted-foreground">Khi người dùng mới đăng ký</span>
                            </div>
                            <div className="flex items-start">
                              <code className="text-xs bg-muted p-1 rounded mr-2">article.created</code>
                              <span className="text-xs text-muted-foreground">Khi bài viết mới được tạo</span>
                            </div>
                            <div className="flex items-start">
                              <code className="text-xs bg-muted p-1 rounded mr-2">payment.successful</code>
                              <span className="text-xs text-muted-foreground">Khi thanh toán thành công</span>
                            </div>
                            <div className="flex items-start">
                              <code className="text-xs bg-muted p-1 rounded mr-2">credits.depleted</code>
                              <span className="text-xs text-muted-foreground">Khi credits của người dùng hết</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t mt-6">
                        <Button 
                          type="submit" 
                          className="flex items-center"
                          disabled={updateWebhookSettingsMutation.isPending || !webhookForm.formState.isDirty}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {updateWebhookSettingsMutation.isPending 
                            ? (t("common.saving") || "Đang lưu...") 
                            : (t("common.saveChanges") || "Lưu thay đổi")}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Info */}
            <TabsContent value="system" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("admin.settingsPage.systemInfo") || "Thông tin hệ thống"}</CardTitle>
                  <CardDescription>
                    {t("admin.settingsPage.systemInfoDescription") || "Xem thông tin và trạng thái của hệ thống"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">{t("admin.settings.version") || "Phiên bản"}</h3>
                        <p className="text-base font-medium">{settings?.version || "1.0.0"}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">{t("admin.settings.database") || "Cơ sở dữ liệu"}</h3>
                        <p className={`text-base font-medium flex items-center ${
                          settings?.dbStatus === "online" 
                            ? "text-green-600" 
                            : settings?.dbStatus === "limited" 
                              ? "text-yellow-600" 
                              : "text-red-600"
                        }`}>
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            settings?.dbStatus === "online" 
                              ? "bg-green-600" 
                              : settings?.dbStatus === "limited" 
                                ? "bg-yellow-600" 
                                : "bg-red-600"
                          }`}></span>
                          {settings?.dbStatus === "online" 
                            ? "Online" 
                            : settings?.dbStatus === "limited" 
                              ? "Limited" 
                              : "Offline"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">{t("admin.settings.lastBackup") || "Sao lưu gần đây"}</h3>
                        <p className="text-base font-medium">
                          {settings?.lastBackup 
                            ? format(new Date(settings.lastBackup), "dd/MM/yyyy HH:mm") 
                            : "N/A"}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">{t("admin.settings.environment") || "Môi trường"}</h3>
                        <p className="text-base font-medium">Production</p>
                      </div>
                    </div>
                    
                    <div className="rounded-md border p-4 mt-4">
                      <h3 className="text-sm font-medium mb-2">{t("admin.settings.systemActions") || "Thao tác hệ thống"}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                          onClick={handleBackup}
                          disabled={triggerBackupMutation.isPending}
                        >
                          <Database className="h-4 w-4 mr-2" />
                          {triggerBackupMutation.isPending 
                            ? (t("admin.settings.backingUp") || "Đang sao lưu...") 
                            : (t("admin.settings.backupNow") || "Sao lưu ngay")}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {t("admin.settings.refreshSystemInfo") || "Làm mới thông tin"}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="rounded-md border p-4 mt-4 bg-muted/50">
                      <h3 className="text-sm font-medium mb-2">{t("admin.settings.systemLog") || "Nhật ký hệ thống"}</h3>
                      <div className="bg-muted rounded-md p-2 max-h-40 overflow-y-auto text-xs font-mono">
                        <p>[2023-06-05 08:30:00] System backup completed successfully</p>
                        <p>[2023-06-05 07:45:12] User registration spike detected (15 new users in 5 minutes)</p>
                        <p>[2023-06-04 22:15:30] Database maintenance completed</p>
                        <p>[2023-06-04 18:30:10] API rate limit increased to 100 req/min</p>
                        <p>[2023-06-04 10:25:45] OpenAI API credentials updated</p>
                        <p>[2023-06-03 14:10:22] System update v1.2.4 applied successfully</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <p className="text-sm text-muted-foreground">
                    {t("admin.settings.systemInfoFooter") || "Hệ thống được phát triển bởi SEO AI Writer Team. Để được hỗ trợ, vui lòng liên hệ support@example.com"}
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            </Tabs>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}