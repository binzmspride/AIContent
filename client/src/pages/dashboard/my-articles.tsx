import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { useLanguage } from "@/hooks/use-language";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "wouter";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusCircle,
  Pencil,
  Trash2,
  MoreHorizontal,
  Eye,
  Edit,
  ExternalLink,
  Copy,
} from "lucide-react";
import { Article } from "@shared/schema";
import Head from "@/components/head";

export default function MyArticles() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [articleToDelete, setArticleToDelete] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewingArticle, setViewingArticle] = useState<Article | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Fetch articles with pagination
  const {
    data: articlesData,
    isLoading,
    refetch,
  } = useQuery<{
    success: boolean;
    data: {
      articles: Article[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
  }>({
    queryKey: ["/api/dashboard/articles", { 
      page: currentPage, 
      limit: 10, 
      status: statusFilter !== "all" ? statusFilter : undefined 
    }],
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Delete article mutation
  const deleteArticleMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/dashboard/articles/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Article deleted",
        description: "The article has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/articles"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete article",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (id: number) => {
    setArticleToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (articleToDelete) {
      deleteArticleMutation.mutate(articleToDelete);
    }
  };

  const handleViewArticle = (article: Article) => {
    setViewingArticle(article);
    setIsViewDialogOpen(true);
  };

  const copyArticleContent = async (article: Article) => {
    if (navigator.clipboard && article.content) {
      try {
        // Remove HTML tags for plain text copy
        const textContent = article.content.replace(/<[^>]*>/g, '');
        await navigator.clipboard.writeText(textContent);
        toast({
          title: "Content copied",
          description: "Article content copied to clipboard",
        });
      } catch (err) {
        toast({
          title: "Copy failed",
          description: "Could not copy to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  // Define columns for DataTable
  const columns: ColumnDef<Article>[] = [
    {
      accessorKey: "title",
      header: t("dashboard.articles.columns.title"),
    },
    {
      accessorKey: "createdAt",
      header: t("dashboard.articles.columns.createdAt"),
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: "status",
      header: t("dashboard.articles.columns.status"),
      cell: ({ row }) => <StatusBadge status={row.original.status as any} />,
    },
    {
      accessorKey: "keywords",
      header: t("dashboard.articles.columns.keywords"),
      cell: ({ row }) => {
        const keywords = row.original.keywords;
        if (!keywords) return null;
        return keywords.split(',').slice(0, 3).map((kw, i) => (
          <span key={i} className="inline-block bg-secondary-100 text-secondary-800 text-xs px-2 py-1 rounded mr-1 mb-1">
            {kw.trim()}
          </span>
        ));
      },
    },
    {
      id: "actions",
      header: t("dashboard.articles.columns.actions"),
      cell: ({ row }) => {
        const article = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleViewArticle(article)}>
                <Eye className="mr-2 h-4 w-4" />
                <span>Xem nội dung</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => copyArticleContent(article)}>
                <Copy className="mr-2 h-4 w-4" />
                <span>Copy Content</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Link href={`/dashboard/edit-article/${article.id}`}>
                <DropdownMenuItem className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
              </Link>
              {article.status === "draft" && (
                <DropdownMenuItem onClick={() => handleDeleteClick(article.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              )}
              {article.publishedUrl && (
                <DropdownMenuItem onClick={() => window.open(article.publishedUrl || '', '_blank')}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span>View Published</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Status options for filter
  const statusOptions = [
    { value: "all", label: t("dashboard.articles.statuses.all") },
    { value: "draft", label: t("dashboard.articles.statuses.draft") },
    { value: "published", label: t("dashboard.articles.statuses.published") },
    { value: "wordpress", label: t("dashboard.articles.statuses.wordpress") },
    { value: "facebook", label: t("dashboard.articles.statuses.facebook") },
    { value: "tiktok", label: t("dashboard.articles.statuses.tiktok") },
    { value: "twitter", label: t("dashboard.articles.statuses.twitter") },
  ];

  // Refetch khi thay đổi trang hoặc bộ lọc
  useEffect(() => {
    refetch();
  }, [currentPage, statusFilter, refetch]);
  
  // Debug purpose
  useEffect(() => {
    console.log("Articles data:", articlesData);
    // Hiển thị log cho biết nếu có dữ liệu
    if (articlesData?.success && articlesData?.data?.articles) {
      console.log("Articles array:", articlesData.data.articles, "Length:", articlesData.data.articles.length);
    }
  }, [articlesData]);
  
  // Hiển thị trạng thái đang tải
  if (isLoading) {
    return (
      <DashboardLayout title={t("dashboard.myArticles")}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>{t("dashboard.myArticles")} - {t("common.appName")}</title>
      </Head>

      <DashboardLayout title={t("dashboard.myArticles")}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Input
              placeholder={t("dashboard.articles.search")}
              className="max-w-sm"
            />
            <div className="flex items-center space-x-2">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("dashboard.articles.filter")} />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Link href="/dashboard/create-content">
            <Button className="ml-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("dashboard.articles.newArticle")}
            </Button>
          </Link>
        </div>

        {articlesData?.data?.articles && articlesData.data.articles.length > 0 ? (
          <DataTable
            columns={columns}
            data={articlesData.data.articles}
            searchColumn="title"
            searchPlaceholder={t("dashboard.articles.search")}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-10 text-center rounded-lg border border-dashed border-gray-300 bg-gray-50/50 dark:border-gray-600 dark:bg-gray-800/50">
            <div className="mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-12 w-12 text-gray-400 dark:text-gray-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {statusFilter !== "all" 
                ? t("dashboard.articles.noArticlesWithFilter") 
                : t("dashboard.articles.noArticles")}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md">
              {statusFilter !== "all" 
                ? t("dashboard.articles.tryDifferentFilter") 
                : t("dashboard.articles.createFirstArticle")}
            </p>
            <div className="mt-6">
              <Link href="/dashboard/create-content">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t("dashboard.articles.newArticle")}
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Dialog for viewing article content */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {viewingArticle?.title?.replace(/"/g, '') || 'Xem nội dung bài viết'}
              </DialogTitle>
              <DialogDescription>
                Nội dung HTML của bài viết. Bạn có thể cuộn để xem toàn bộ nội dung.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              {viewingArticle?.content ? (
                <div 
                  className="prose prose-blue dark:prose-invert prose-headings:font-semibold prose-img:rounded-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: viewingArticle.content }} 
                />
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Không có nội dung để hiển thị.</p>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Đóng
              </Button>
              {viewingArticle && (
                <Button onClick={() => copyArticleContent(viewingArticle)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Sao chép nội dung
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this article? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
                disabled={deleteArticleMutation.isPending}
              >
                {deleteArticleMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </>
  );
}
