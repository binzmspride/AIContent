import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
import { Copy, Download, ExternalLink, Pencil, AlertCircle } from "lucide-react";
import { GenerateContentRequest, GenerateContentResponse } from "@shared/types";
import { copyToClipboard, downloadAsFile } from "@/lib/utils";
import Head from "@/components/head";

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  contentType: z.enum(["blog", "product", "news", "social"]),
  keywords: z.string().min(3, {
    message: "Keywords must be at least 3 characters.",
  }),
  length: z.enum(["short", "medium", "long", "extra_long"]),
  tone: z.enum(["professional", "conversational", "informative", "persuasive", "humorous"]),
  prompt: z.string().min(10, {
    message: "Content description must be at least 10 characters.",
  }),
  addHeadings: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [generatedContent, setGeneratedContent] = useState<GenerateContentResponse | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      contentType: "blog",
      keywords: "",
      length: "medium",
      tone: "conversational",
      prompt: "",
      addHeadings: true,
    },
  });

  const generateContentMutation = useMutation({
    mutationFn: async (data: GenerateContentRequest) => {
      const res = await apiRequest("POST", "/api/dashboard/generate-content", data);
      const responseData = await res.json();
      if (!responseData.success) {
        throw new Error(responseData.error || "Failed to generate content");
      }
      return responseData.data as GenerateContentResponse;
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      toast({
        title: "Content generated successfully",
        description: `Used ${data.creditsUsed} credits`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate content",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    if ((user?.credits || 0) < 1) {
      toast({
        title: "Insufficient credits",
        description: "Please purchase more credits to generate content",
        variant: "destructive",
      });
      return;
    }

    generateContentMutation.mutate(data);
  };

  const handleCopyContent = () => {
    if (generatedContent) {
      copyToClipboard(generatedContent.content)
        .then(() => {
          toast({
            title: "Copied to clipboard",
            description: "Content has been copied to clipboard",
          });
        })
        .catch(() => {
          toast({
            title: "Failed to copy",
            description: "Could not copy content to clipboard",
            variant: "destructive",
          });
        });
    }
  };

  const handleDownloadContent = () => {
    if (generatedContent) {
      downloadAsFile(
        generatedContent.content,
        `${generatedContent.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`,
        "text/html"
      );
    }
  };

  const handleSaveArticle = async () => {
    if (generatedContent) {
      try {
        await apiRequest("POST", "/api/dashboard/articles", {
          title: generatedContent.title,
          content: generatedContent.content,
          keywords: generatedContent.keywords.join(", "),
          creditsUsed: generatedContent.creditsUsed,
        });
        
        toast({
          title: "Article saved",
          description: "Article has been saved successfully",
        });
      } catch (error) {
        toast({
          title: "Failed to save article",
          description: "Could not save the article",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      <Head>
        <title>{t("dashboard.createContent")} - {t("common.appName")}</title>
      </Head>
      
      <DashboardLayout>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-secondary-900">{t("dashboard.create.title")}</h1>
          <div className="text-secondary-500 bg-secondary-100 px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1 text-accent-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>
            {user?.credits || 0} {t("common.credits")}
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("dashboard.create.form.articleTitle")}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter a title for your article"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="contentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("dashboard.create.form.contentType")}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select content type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="blog">
                                {t("dashboard.create.form.contentTypeOptions.blog")}
                              </SelectItem>
                              <SelectItem value="product">
                                {t("dashboard.create.form.contentTypeOptions.product")}
                              </SelectItem>
                              <SelectItem value="news">
                                {t("dashboard.create.form.contentTypeOptions.news")}
                              </SelectItem>
                              <SelectItem value="social">
                                {t("dashboard.create.form.contentTypeOptions.social")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("dashboard.create.form.keywords")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="E.g: seo, wordpress, marketing"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("dashboard.create.form.length")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select content length" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="short">
                              {t("dashboard.create.form.lengthOptions.short")}
                            </SelectItem>
                            <SelectItem value="medium">
                              {t("dashboard.create.form.lengthOptions.medium")}
                            </SelectItem>
                            <SelectItem value="long">
                              {t("dashboard.create.form.lengthOptions.long")}
                            </SelectItem>
                            <SelectItem value="extra_long">
                              {t("dashboard.create.form.lengthOptions.extraLong")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("dashboard.create.form.tone")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select content tone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="professional">
                              {t("dashboard.create.form.toneOptions.professional")}
                            </SelectItem>
                            <SelectItem value="conversational">
                              {t("dashboard.create.form.toneOptions.conversational")}
                            </SelectItem>
                            <SelectItem value="informative">
                              {t("dashboard.create.form.toneOptions.informative")}
                            </SelectItem>
                            <SelectItem value="persuasive">
                              {t("dashboard.create.form.toneOptions.persuasive")}
                            </SelectItem>
                            <SelectItem value="humorous">
                              {t("dashboard.create.form.toneOptions.humorous")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("dashboard.create.form.prompt")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the content you want to create in detail. The more specific, the better the results."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="addHeadings"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          {t("dashboard.create.form.addHeadings")}
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                {(user?.credits || 0) < 1 && (
                  <div className="flex items-center p-4 mb-4 text-sm text-amber-800 rounded-lg bg-amber-50">
                    <AlertCircle className="flex-shrink-0 inline w-5 h-5 mr-3" />
                    <span className="sr-only">Warning</span>
                    <div>
                      You don't have enough credits to generate content. Please 
                      <a href="/dashboard/credits" className="font-medium underline ml-1">purchase more credits</a>.
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={generateContentMutation.isPending}
                  >
                    {t("dashboard.create.form.saveDraft")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={generateContentMutation.isPending || (user?.credits || 0) < 1}
                  >
                    {generateContentMutation.isPending
                      ? t("common.loading")
                      : t("dashboard.create.form.generate")}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Result Section */}
        {generatedContent && (
          <div className="mt-8">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-secondary-900">
                    {t("dashboard.create.result.title")}
                  </h2>
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCopyContent}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      {t("dashboard.create.result.copy")}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDownloadContent}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {t("dashboard.create.result.download")}
                    </Button>
                  </div>
                </div>
                
                <div className="border border-secondary-200 rounded-md p-4 prose max-w-none" 
                  dangerouslySetInnerHTML={{ __html: generatedContent.content }}
                />
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <div className="border-t border-secondary-200 pt-4">
                      <h3 className="text-sm font-medium text-secondary-700 mb-2">
                        {t("dashboard.create.result.publishTo")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" disabled={true}>
                          <svg
                            className="h-4 w-4 mr-2 text-blue-600"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 19.5c-5.2 0-9.5-4.3-9.5-9.5S6.8 2.5 12 2.5s9.5 4.3 9.5 9.5-4.3 9.5-9.5 9.5zm-4.5-8.5c0 2.5 2.5 4.5 5 4.5v-2c-1.9 0-3.5-1.2-3.5-2.5V11H7.5v2zm9-3.5c0-2.5-2.5-4.5-5-4.5v2c1.9 0 3.5 1.2 3.5 2.5v1.5h1.5V9.5z" />
                          </svg>
                          WordPress
                          <span className="text-xs ml-1">({t("dashboard.create.result.notConnected")})</span>
                        </Button>
                        <Button variant="outline" size="sm" disabled={true}>
                          <svg
                            className="h-4 w-4 mr-2 text-blue-600"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z" />
                          </svg>
                          Facebook
                          <span className="text-xs ml-1">({t("dashboard.create.result.notConnected")})</span>
                        </Button>
                        <Button variant="outline" size="sm" disabled={true}>
                          <svg
                            className="h-4 w-4 mr-2"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1Z" />
                          </svg>
                          TikTok
                          <span className="text-xs ml-1">({t("dashboard.create.result.notConnected")})</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="border-t border-secondary-200 pt-4">
                      <h3 className="text-sm font-medium text-secondary-700 mb-2">
                        {t("common.actions")}
                      </h3>
                      <Button
                        variant="outline"
                        onClick={handleSaveArticle}
                        className="w-full"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        {t("dashboard.create.result.editArticle")}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}
