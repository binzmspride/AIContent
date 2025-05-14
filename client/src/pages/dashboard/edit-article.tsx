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

  if (isLoading) {
    return (
      <DashboardLayout>
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

  if (!isLoading && !articleData?.success) {
    return (
      <DashboardLayout>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Bài viết không tồn tại</CardTitle>
            <CardDescription>Không tìm thấy bài viết hoặc bạn không có quyền truy cập</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation("/dashboard/my-articles")}>
              Quay lại danh sách
            </Button>
          </CardFooter>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Chỉnh sửa bài viết</CardTitle>
            <CardDescription>
              Cập nhật nội dung và thông tin bài viết của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề</Label>
              <Input
                id="title"
                placeholder="Nhập tiêu đề bài viết"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Nội dung</Label>
              <div className={`bg-white dark:bg-gray-950 transition-all ${isSubmitting ? 'opacity-50' : ''}`}>
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  formats={formats}
                  placeholder="Nhập nội dung bài viết"
                  className="h-72 mb-12 rounded-md border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Từ khóa</Label>
              <Input
                id="keywords"
                placeholder="Nhập từ khóa, phân cách bằng dấu phẩy"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as "draft" | "published")}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                  <SelectItem value="published">Đã xuất bản</SelectItem>
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
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </DashboardLayout>
  );
};

export default EditArticle;