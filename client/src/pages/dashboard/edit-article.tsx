import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { useLanguage } from "@/hooks/use-language";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation, useParams } from "wouter";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Article } from "@shared/schema";
import Head from "@/components/head";

const EditArticle = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const articleId = params && params.id ? parseInt(params.id) : null;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [keywords, setKeywords] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch article data
  const { data: articleData, isLoading } = useQuery<{ success: boolean; data: Article }>({
    queryKey: [`/api/dashboard/articles/${articleId}`],
    enabled: !!articleId,
  });

  // Update form when article data is loaded
  useEffect(() => {
    if (articleData?.success && articleData.data) {
      setTitle(articleData.data.title);
      setContent(articleData.data.content);
      setKeywords(articleData.data.keywords || "");
      setStatus(articleData.data.status as "draft" | "published");
    }
  }, [articleData]);

  // Update article mutation
  const updateArticleMutation = useMutation({
    mutationFn: async (articleData: {
      title: string;
      content: string;
      keywords?: string;
      status: "draft" | "published";
    }) => {
      if (!articleId) {
        throw new Error("Article ID is missing");
      }
      const response = await apiRequest(
        "PATCH",
        `/api/dashboard/articles/${articleId}`,
        articleData
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("dashboard.editArticle.successTitle"),
        description: t("dashboard.editArticle.successMessage"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/articles"] });
      setLocation("/dashboard/my-articles");
    },
    onError: (error: Error) => {
      toast({
        title: t("dashboard.editArticle.errorTitle"),
        description: error.message || t("dashboard.editArticle.errorMessage"),
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!title.trim() || !content.trim()) {
      toast({
        title: t("dashboard.editArticle.validationTitle"),
        description: t("dashboard.editArticle.validationMessage"),
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    updateArticleMutation.mutate({
      title,
      content,
      keywords,
      status,
    });
  };

  // Quill editor modules and formats
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "align",
    "link",
    "image",
  ];

  // If loading, show skeleton loader
  if (isLoading) {
    return (
      <DashboardLayout
        title={t("dashboard.editArticle.title")}
        description={t("dashboard.editArticle.description")}
      >
        <Head>
          <title>{t("dashboard.editArticle.pageTitle")} - {t("common.appName")}</title>
        </Head>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-40 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-40" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-28" />
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // If article not found, show error
  if (!isLoading && !articleData?.success) {
    return (
      <DashboardLayout
        title={t("dashboard.editArticle.title")}
        description={t("dashboard.editArticle.description")}
      >
        <Head>
          <title>{t("dashboard.editArticle.pageTitle")} - {t("common.appName")}</title>
        </Head>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">{t("dashboard.editArticle.notFoundTitle")}</CardTitle>
            <CardDescription>{t("dashboard.editArticle.notFoundDescription")}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation("/dashboard/my-articles")}>
              {t("common.goBack")}
            </Button>
          </CardFooter>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t("dashboard.editArticle.title")}
      description={t("dashboard.editArticle.description")}
    >
      <Head>
        <title>{t("dashboard.editArticle.pageTitle")} - {t("common.appName")}</title>
      </Head>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.editArticle.formTitle")}</CardTitle>
            <CardDescription>
              {t("dashboard.editArticle.formDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t("dashboard.editArticle.titleLabel")}</Label>
              <Input
                id="title"
                placeholder={t("dashboard.editArticle.titlePlaceholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">{t("dashboard.editArticle.contentLabel")}</Label>
              <div className={`bg-white dark:bg-gray-950 transition-all ${isSubmitting ? 'opacity-50' : ''}`}>
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  formats={formats}
                  placeholder={t("dashboard.editArticle.contentPlaceholder")}
                  className="h-72 mb-12 rounded-md border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">{t("dashboard.editArticle.keywordsLabel")}</Label>
              <Input
                id="keywords"
                placeholder={t("dashboard.editArticle.keywordsPlaceholder")}
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{t("dashboard.editArticle.statusLabel")}</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as "draft" | "published")}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder={t("dashboard.editArticle.statusPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t("dashboard.editArticle.statusDraft")}</SelectItem>
                  <SelectItem value="published">{t("dashboard.editArticle.statusPublished")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setLocation("/dashboard/my-articles")}
              type="button"
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("common.saving") : t("common.saveChanges")}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </DashboardLayout>
  );
};

export default EditArticle;