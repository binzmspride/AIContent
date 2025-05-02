import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  User,
  KeyRound,
  Languages,
  Moon,
  Sun,
  Monitor,
  Shield,
} from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import Head from "@/components/head";

// Profile update schema
const profileSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
});

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(8, {
    message: "Current password must be at least 8 characters",
  }),
  newPassword: z.string().min(8, {
    message: "New password must be at least 8 characters",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Preferences schema
const preferencesSchema = z.object({
  language: z.enum(["vi", "en"]),
  theme: z.enum(["light", "dark", "system"]),
});

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();

  // Profile form
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
    },
  });

  // Password form
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Preferences form
  const preferencesForm = useForm<z.infer<typeof preferencesSchema>>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      language: language as "vi" | "en",
      theme: theme as "light" | "dark" | "system",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      const res = await apiRequest("PATCH", "/api/dashboard/profile", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("POST", "/api/dashboard/change-password", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully",
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Password change failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: z.infer<typeof passwordSchema>) => {
    const { currentPassword, newPassword } = data;
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const onPreferencesSubmit = (data: z.infer<typeof preferencesSchema>) => {
    // Update language
    if (data.language !== language) {
      setLanguage(data.language);
    }
    
    // Update theme
    if (data.theme !== theme) {
      setTheme(data.theme);
    }
    
    toast({
      title: "Preferences saved",
      description: "Your preferences have been updated",
    });
  };

  return (
    <>
      <Head>
        <title>{t("dashboard.settings")} - {t("common.appName")}</title>
      </Head>
      
      <DashboardLayout title={t("dashboard.settings")}>
        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="profile">{t("dashboard.settings.profile.title")}</TabsTrigger>
            <TabsTrigger value="password">{t("dashboard.settings.password.title")}</TabsTrigger>
            <TabsTrigger value="preferences">{t("dashboard.settings.preferences.title")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  {t("dashboard.settings.profile.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <FormField
                      control={profileForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("dashboard.settings.profile.fullName")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("dashboard.settings.profile.email")}</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={updateProfileMutation.isPending || !profileForm.formState.isDirty}
                      >
                        {updateProfileMutation.isPending ? t("common.loading") : t("dashboard.settings.profile.save")}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <KeyRound className="h-5 w-5 mr-2" />
                  {t("dashboard.settings.password.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("dashboard.settings.password.current")}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("dashboard.settings.password.new")}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("dashboard.settings.password.confirm")}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                      >
                        {changePasswordMutation.isPending ? t("common.loading") : t("dashboard.settings.password.update")}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Languages className="h-5 w-5 mr-2" />
                  {t("dashboard.settings.preferences.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...preferencesForm}>
                  <form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)} className="space-y-6">
                    <FormField
                      control={preferencesForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("dashboard.settings.preferences.language")}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="vi">
                                {t("dashboard.settings.preferences.languages.vietnamese")}
                              </SelectItem>
                              <SelectItem value="en">
                                {t("dashboard.settings.preferences.languages.english")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={preferencesForm.control}
                      name="theme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("dashboard.settings.preferences.theme")}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select theme" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="light" className="flex items-center">
                                <div className="flex items-center">
                                  <Sun className="h-4 w-4 mr-2" />
                                  {t("dashboard.settings.preferences.themes.light")}
                                </div>
                              </SelectItem>
                              <SelectItem value="dark">
                                <div className="flex items-center">
                                  <Moon className="h-4 w-4 mr-2" />
                                  {t("dashboard.settings.preferences.themes.dark")}
                                </div>
                              </SelectItem>
                              <SelectItem value="system">
                                <div className="flex items-center">
                                  <Monitor className="h-4 w-4 mr-2" />
                                  {t("dashboard.settings.preferences.themes.system")}
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={!preferencesForm.formState.isDirty}
                      >
                        {t("dashboard.settings.preferences.save")}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
              
              <CardHeader className="mt-4">
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security
                </CardTitle>
                <CardDescription>
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Two-factor authentication</h3>
                      <p className="text-sm text-secondary-500">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline">Set up</Button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Active sessions</h3>
                      <p className="text-sm text-secondary-500">
                        Manage your active login sessions
                      </p>
                    </div>
                    <Button variant="outline">View</Button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Login history</h3>
                      <p className="text-sm text-secondary-500">
                        View your recent login activity
                      </p>
                    </div>
                    <Button variant="outline">View history</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardLayout>
    </>
  );
}
