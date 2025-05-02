import { AdminLayout } from "@/components/admin/Layout";
import { useLanguage } from "@/hooks/use-language";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Head from "@/components/head";

// Form schema for general settings
const generalSettingsSchema = z.object({
  appName: z.string().min(2, {
    message: "App name must be at least 2 characters.",
  }),
  appDescription: z.string().min(10, {
    message: "App description must be at least 10 characters.",
  }),
  contactEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  enableRegistration: z.boolean().default(true),
  maintenanceMode: z.boolean().default(false),
});

// Form schema for credit settings
const creditSettingsSchema = z.object({
  defaultNewUserCredits: z.number().min(0).default(10),
  creditCostPerArticle: z.number().min(0).default(1),
  referralCreditAmount: z.number().min(0).default(5),
});

// Form schema for storage settings
const storageSettingsSchema = z.object({
  defaultStorageLimit: z.number().min(100).default(1024),
  maxFileSize: z.number().min(1).default(5),
});

type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;
type CreditSettingsValues = z.infer<typeof creditSettingsSchema>;
type StorageSettingsValues = z.infer<typeof storageSettingsSchema>;

interface Settings {
  general: GeneralSettingsValues;
  credit: CreditSettingsValues;
  storage: StorageSettingsValues;
}

export default function AdminSettings() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");

  // Fetch settings
  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ["/api/admin/settings"],
  });

  // Form for general settings
  const generalForm = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: settings?.general || {
      appName: "",
      appDescription: "",
      contactEmail: "",
      enableRegistration: true,
      maintenanceMode: false,
    },
  });

  // Form for credit settings
  const creditForm = useForm<CreditSettingsValues>({
    resolver: zodResolver(creditSettingsSchema),
    defaultValues: settings?.credit || {
      defaultNewUserCredits: 10,
      creditCostPerArticle: 1,
      referralCreditAmount: 5,
    },
  });

  // Form for storage settings
  const storageForm = useForm<StorageSettingsValues>({
    resolver: zodResolver(storageSettingsSchema),
    defaultValues: settings?.storage || {
      defaultStorageLimit: 1024,
      maxFileSize: 5,
    },
  });

  // Update settings when they are loaded
  useEffect(() => {
    if (settings) {
      generalForm.reset(settings.general);
      creditForm.reset(settings.credit);
      storageForm.reset(settings.storage);
    }
  }, [settings, generalForm, creditForm, storageForm]);

  // Mutation for updating settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<Settings>) => {
      const response = await apiRequest("PATCH", "/api/admin/settings", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t("admin.settings.saveSuccess"),
        description: t("admin.settings.settingsUpdated"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
    onError: (error) => {
      toast({
        title: t("admin.settings.saveError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handlers
  const onGeneralSubmit = (values: GeneralSettingsValues) => {
    updateSettingsMutation.mutate({ general: values });
  };

  const onCreditSubmit = (values: CreditSettingsValues) => {
    updateSettingsMutation.mutate({ credit: values });
  };

  const onStorageSubmit = (values: StorageSettingsValues) => {
    updateSettingsMutation.mutate({ storage: values });
  };

  return (
    <>
      <Head>
        <title>{t("admin.settings.title")} - {t("common.appName")}</title>
      </Head>
      
      <AdminLayout title={t("admin.settings.title")}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t("admin.settings.title")}</h1>
          <p className="text-muted-foreground">{t("admin.settings.description")}</p>
        </div>

        <Tabs 
          defaultValue="general" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">{t("admin.settings.generalTab")}</TabsTrigger>
            <TabsTrigger value="credit">{t("admin.settings.creditTab")}</TabsTrigger>
            <TabsTrigger value="storage">{t("admin.settings.storageTab")}</TabsTrigger>
          </TabsList>
          
          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.settings.generalSettings")}</CardTitle>
                <CardDescription>
                  {t("admin.settings.generalSettingsDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...generalForm}>
                  <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-6">
                    <FormField
                      control={generalForm.control}
                      name="appName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("admin.settings.appName")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            {t("admin.settings.appNameDescription")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generalForm.control}
                      name="appDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("admin.settings.appDescription")}</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormDescription>
                            {t("admin.settings.appDescriptionHelp")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generalForm.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("admin.settings.contactEmail")}</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormDescription>
                            {t("admin.settings.contactEmailHelp")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <FormField
                      control={generalForm.control}
                      name="enableRegistration"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              {t("admin.settings.enableRegistration")}
                            </FormLabel>
                            <FormDescription>
                              {t("admin.settings.enableRegistrationHelp")}
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
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              {t("admin.settings.maintenanceMode")}
                            </FormLabel>
                            <FormDescription>
                              {t("admin.settings.maintenanceModeHelp")}
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
                    
                    <Button
                      type="submit"
                      disabled={updateSettingsMutation.isPending}
                    >
                      {updateSettingsMutation.isPending 
                        ? t("common.saving") 
                        : t("common.saveChanges")}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Credit Settings */}
          <TabsContent value="credit">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.settings.creditSettings")}</CardTitle>
                <CardDescription>
                  {t("admin.settings.creditSettingsDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...creditForm}>
                  <form onSubmit={creditForm.handleSubmit(onCreditSubmit)} className="space-y-6">
                    <FormField
                      control={creditForm.control}
                      name="defaultNewUserCredits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("admin.settings.defaultCredits")}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            {t("admin.settings.defaultCreditsHelp")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={creditForm.control}
                      name="creditCostPerArticle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("admin.settings.creditCost")}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              onChange={(e) => field.onChange(Number(e.target.value))} 
                            />
                          </FormControl>
                          <FormDescription>
                            {t("admin.settings.creditCostHelp")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={creditForm.control}
                      name="referralCreditAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("admin.settings.referralCredits")}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              onChange={(e) => field.onChange(Number(e.target.value))} 
                            />
                          </FormControl>
                          <FormDescription>
                            {t("admin.settings.referralCreditsHelp")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="submit"
                      disabled={updateSettingsMutation.isPending}
                    >
                      {updateSettingsMutation.isPending 
                        ? t("common.saving") 
                        : t("common.saveChanges")}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Storage Settings */}
          <TabsContent value="storage">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.settings.storageSettings")}</CardTitle>
                <CardDescription>
                  {t("admin.settings.storageSettingsDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...storageForm}>
                  <form onSubmit={storageForm.handleSubmit(onStorageSubmit)} className="space-y-6">
                    <FormField
                      control={storageForm.control}
                      name="defaultStorageLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("admin.settings.defaultStorage")} (MB)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            {t("admin.settings.defaultStorageHelp")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={storageForm.control}
                      name="maxFileSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("admin.settings.maxFileSize")} (MB)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            {t("admin.settings.maxFileSizeHelp")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="submit"
                      disabled={updateSettingsMutation.isPending}
                    >
                      {updateSettingsMutation.isPending 
                        ? t("common.saving") 
                        : t("common.saveChanges")}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AdminLayout>
    </>
  );
}