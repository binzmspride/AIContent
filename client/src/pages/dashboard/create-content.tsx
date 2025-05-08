import { useState, useRef, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { 
  Copy, 
  Download, 
  ExternalLink, 
  Pencil, 
  AlertCircle, 
  KeyRound, 
  List, 
  FileText, 
  PaintBucket, 
  AlignJustify,
  Image,
  Link as LinkIcon,
  X
} from "lucide-react";
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
        
        <div className="mb-2">
          <p className="text-sm text-gray-500 mb-4">{t("dashboard.create.subtitle")}</p>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="keywords" className="w-full">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-1 h-auto bg-transparent">
                    <TabsTrigger value="keywords" className="flex items-center justify-start px-4 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow rounded-md text-gray-700 dark:text-gray-200">
                      <KeyRound className="h-5 w-5 mr-2" />
                      <span>{t("dashboard.create.tabs.keywords")}</span>
                    </TabsTrigger>
                    <TabsTrigger value="outline" className="flex items-center justify-start px-4 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow rounded-md text-gray-700 dark:text-gray-200">
                      <List className="h-5 w-5 mr-2" />
                      <span>{t("dashboard.create.tabs.outline")}</span>
                    </TabsTrigger>
                    <TabsTrigger value="content" className="flex items-center justify-start px-4 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow rounded-md text-gray-700 dark:text-gray-200">
                      <FileText className="h-5 w-5 mr-2" />
                      <span>{t("dashboard.create.tabs.content")}</span>
                    </TabsTrigger>
                    <TabsTrigger value="style" className="flex items-center justify-start px-4 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow rounded-md text-gray-700 dark:text-gray-200">
                      <PaintBucket className="h-5 w-5 mr-2" />
                      <span>{t("dashboard.create.tabs.style")}</span>
                    </TabsTrigger>
                    <TabsTrigger value="format" className="flex items-center justify-start px-4 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow rounded-md text-gray-700 dark:text-gray-200">
                      <AlignJustify className="h-5 w-5 mr-2" />
                      <span>{t("dashboard.create.tabs.format")}</span>
                    </TabsTrigger>
                    <TabsTrigger value="media" className="flex items-center justify-start px-4 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow rounded-md text-gray-700 dark:text-gray-200">
                      <Image className="h-5 w-5 mr-2" />
                      <span>{t("dashboard.create.tabs.media")}</span>
                    </TabsTrigger>
                    <TabsTrigger value="links" className="flex items-center justify-start px-4 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow rounded-md text-gray-700 dark:text-gray-200">
                      <LinkIcon className="h-5 w-5 mr-2" />
                      <span>{t("dashboard.create.tabs.links")}</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="flex-1">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <TabsContent value="keywords" className="mt-0 border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-100">{t("dashboard.create.keywords.title")}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{t("dashboard.create.keywords.description")}</p>
                        
                        <div className="space-y-4">
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
                          
                          {/* Từ khóa chính */}
                          <div>
                            <Label htmlFor="mainKeyword" className="text-gray-700 dark:text-gray-200 mb-1 block">{t("dashboard.create.keywords.mainKeyword")} <span className="text-red-500">*</span></Label>
                            
                            {form.watch("keywords").split(",")[0] && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                <Badge
                                  className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-100"
                                >
                                  <span className="mr-1">{form.watch("keywords").split(",")[0]}</span>
                                  <button
                                    type="button"
                                    className="flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-600 dark:text-blue-100 hover:bg-blue-200 hover:text-blue-800 dark:hover:bg-blue-800 dark:hover:text-white focus:outline-none"
                                    onClick={() => {
                                      const currentKeywords = form.watch("keywords").split(",").filter(Boolean);
                                      const secondaryKeywords = currentKeywords.slice(1);
                                      form.setValue("keywords", secondaryKeywords.join(","));
                                    }}
                                  >
                                    <span className="sr-only">Remove main keyword</span>
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              </div>
                            )}
                            
                            <Input 
                              id="mainKeyword"
                              placeholder={t("dashboard.create.keywords.mainKeywordPlaceholder")}
                              className="mt-1"
                              value={form.watch("keywords").split(",")[0] ? "" : form.watch("keywords").split(",")[0] || ""}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = e.target as HTMLInputElement;
                                  const keyword = input.value.trim();
                                  if (keyword) {
                                    const currentKeywords = form.watch("keywords").split(",").filter(Boolean);
                                    if (currentKeywords.length === 0) {
                                      currentKeywords.push(keyword);
                                    } else {
                                      currentKeywords[0] = keyword;
                                    }
                                    form.setValue("keywords", currentKeywords.join(","));
                                    input.value = "";
                                  }
                                }
                              }}
                              onChange={(e) => {
                                if (!form.watch("keywords").split(",")[0]) {
                                  const currentKeywords = form.watch("keywords").split(",").filter(Boolean);
                                  currentKeywords[0] = e.target.value;
                                  form.setValue("keywords", currentKeywords.join(","));
                                }
                              }}
                              onBlur={(e) => {
                                const keyword = e.target.value.trim();
                                if (keyword && !form.watch("keywords").split(",")[0]) {
                                  const currentKeywords = form.watch("keywords").split(",").filter(Boolean);
                                  if (currentKeywords.length === 0) {
                                    currentKeywords.push(keyword);
                                  } else {
                                    currentKeywords[0] = keyword;
                                  }
                                  form.setValue("keywords", currentKeywords.join(","));
                                  e.target.value = "";
                                }
                              }}
                            />
                          </div>
                          
                          {/* Từ khóa phụ */}
                          <div>
                            <Label htmlFor="secondaryKeyword" className="text-gray-700 dark:text-gray-200 mb-1 block">{t("dashboard.create.keywords.secondaryKeyword")}</Label>
                            
                            <div className="flex flex-wrap gap-2 mb-2">
                              {form.watch("keywords").split(",").filter(Boolean).map((keyword, index) => {
                                if (index === 0) return null; // Skip main keyword
                                return (
                                  <Badge
                                    key={index}
                                    className="inline-flex items-center rounded-full bg-cyan-50 px-2.5 py-1 text-sm font-medium text-cyan-700 dark:bg-cyan-900 dark:text-cyan-100"
                                  >
                                    <span className="mr-1">{keyword.trim()}</span>
                                    <button
                                      type="button"
                                      className="flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-cyan-600 dark:text-cyan-100 hover:bg-cyan-200 hover:text-cyan-800 dark:hover:bg-cyan-800 dark:hover:text-white focus:outline-none"
                                      onClick={() => {
                                        const currentKeywords = form.watch("keywords").split(",").filter(Boolean);
                                        currentKeywords.splice(index, 1);
                                        form.setValue("keywords", currentKeywords.join(","));
                                      }}
                                    >
                                      <span className="sr-only">Remove keyword</span>
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                );
                              })}
                            </div>
                            
                            <div className="flex mt-1">
                              <Input 
                                id="secondaryKeyword"
                                placeholder={t("dashboard.create.keywords.secondaryKeywordPlaceholder")}
                                className="flex-1"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const input = e.target as HTMLInputElement;
                                    const keyword = input.value.trim();
                                    if (keyword) {
                                      const currentKeywords = form.watch("keywords").split(",").filter(Boolean);
                                      currentKeywords.push(keyword);
                                      form.setValue("keywords", currentKeywords.join(","));
                                      input.value = "";
                                    }
                                  }
                                }}
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                className="ml-2 bg-blue-500 text-white hover:bg-blue-600"
                                onClick={() => {
                                  const input = document.getElementById("secondaryKeyword") as HTMLInputElement;
                                  const keyword = input.value.trim();
                                  if (keyword) {
                                    const currentKeywords = form.watch("keywords").split(",").filter(Boolean);
                                    // Đảm bảo từ khóa chính vẫn ở vị trí đầu tiên
                                    const mainKeyword = currentKeywords.length > 0 ? currentKeywords[0] : "";
                                    // Lấy các từ khóa phụ hiện tại
                                    const secondaryKeywords = currentKeywords.length > 1 ? currentKeywords.slice(1) : [];
                                    // Thêm từ khóa mới vào mảng từ khóa phụ
                                    secondaryKeywords.push(keyword);
                                    // Gộp lại với từ khóa chính
                                    const newKeywords = [mainKeyword, ...secondaryKeywords].filter(Boolean);
                                    form.setValue("keywords", newKeywords.join(","));
                                    input.value = "";
                                  }
                                }}
                              >
                                {t("dashboard.create.keywords.addNew")}
                              </Button>
                            </div>
                          </div>
                          
                          {/* Từ khóa liên quan */}
                          <div>
                            <Label htmlFor="relatedKeyword" className="text-gray-700 dark:text-gray-200 mb-1 block">{t("dashboard.create.keywords.relatedKeyword")}</Label>
                            
                            <div className="flex mt-1">
                              <Input 
                                id="relatedKeyword"
                                placeholder={t("dashboard.create.keywords.relatedKeywordPlaceholder")}
                                className="flex-1"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const input = e.target as HTMLInputElement;
                                    const keyword = input.value.trim();
                                    if (keyword) {
                                      const currentKeywords = form.watch("keywords").split(",").filter(Boolean);
                                      currentKeywords.push(keyword);
                                      form.setValue("keywords", currentKeywords.join(","));
                                      input.value = "";
                                    }
                                  }
                                }}
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                className="ml-2 bg-blue-500 text-white hover:bg-blue-600"
                                onClick={() => {
                                  const input = document.getElementById("relatedKeyword") as HTMLInputElement;
                                  const keyword = input.value.trim();
                                  if (keyword) {
                                    const currentKeywords = form.watch("keywords").split(",").filter(Boolean);
                                    // Đảm bảo từ khóa chính vẫn ở vị trí đầu tiên
                                    const mainKeyword = currentKeywords.length > 0 ? currentKeywords[0] : "";
                                    // Lấy các từ khóa phụ hiện tại
                                    const secondaryKeywords = currentKeywords.length > 1 ? currentKeywords.slice(1) : [];
                                    // Thêm từ khóa mới vào mảng từ khóa phụ
                                    secondaryKeywords.push(keyword);
                                    // Gộp lại với từ khóa chính
                                    const newKeywords = [mainKeyword, ...secondaryKeywords].filter(Boolean);
                                    form.setValue("keywords", newKeywords.join(","));
                                    input.value = "";
                                  }
                                }}
                              >
                                {t("dashboard.create.keywords.addNew")}
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t mt-4">
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
                      </TabsContent>
                      
                      <TabsContent value="content" className="mt-0 border rounded-lg p-4">
                        <FormField
                          control={form.control}
                          name="prompt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("dashboard.create.form.prompt")}</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe the content you want to create in detail. The more specific, the better the results."
                                  className="min-h-[150px]"
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
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-4">
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
                      </TabsContent>
                      
                      <TabsContent value="style" className="mt-0 border rounded-lg p-4">
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
                      </TabsContent>
                      
                      <TabsContent value="outline" className="mt-0 border rounded-lg p-4">
                        <p className="text-sm text-gray-500">Tính năng đang phát triển</p>
                      </TabsContent>
                      
                      <TabsContent value="format" className="mt-0 border rounded-lg p-4">
                        <p className="text-sm text-gray-500">Tính năng đang phát triển</p>
                      </TabsContent>
                      
                      <TabsContent value="media" className="mt-0 border rounded-lg p-4">
                        <p className="text-sm text-gray-500">Tính năng đang phát triển</p>
                      </TabsContent>
                      
                      <TabsContent value="links" className="mt-0 border rounded-lg p-4">
                        <p className="text-sm text-gray-500">Tính năng đang phát triển</p>
                      </TabsContent>
                      
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
                        >
                          {t("dashboard.create.form.reset")}
                        </Button>
                        <Button
                          type="submit"
                          disabled={generateContentMutation.isPending || (user?.credits || 0) < 1}
                        >
                          {generateContentMutation.isPending ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {t("common.loading")}
                            </span>
                          ) : (
                            t("dashboard.create.form.generate")
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </div>
              
              {generatedContent && (
                <div className="mt-8 border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold">{generatedContent.title}</h2>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCopyContent}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleDownloadContent}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleSaveArticle}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Save Article
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {generatedContent.keywords.map((keyword, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  
                  <div 
                    className="prose prose-sm md:prose-base lg:prose-lg max-w-none" 
                    dangerouslySetInnerHTML={{ __html: generatedContent.content }}
                  />
                </div>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </DashboardLayout>
    </>
  );
}