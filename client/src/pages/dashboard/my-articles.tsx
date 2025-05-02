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

  // Fetch articles with pagination
  const {
    data: articlesData,
    isLoading,
    refetch,
  } = useQuery<{ articles: Article[], pagination: { total: number; page: number; limit: number; totalPages: number } }>({
    queryKey: ["/api/dashboard/articles", { page: currentPage, limit: 10, status: statusFilter !== "all" ? statusFilter : undefined }],
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
              <DropdownMenuItem onClick={() => window.open(`/article/${article.id}`, '_blank')}>
                <Eye className="mr-2 h-4 w-4" />
                <span>View</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => copyArticleContent(article)}>
                <Copy className="mr-2 h-4 w-4" />
                <span>Copy Content</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/edit-article/${article.id}`}>
                  <a className="flex items-center cursor-pointer w-full">
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </a>
                </Link>
              </DropdownMenuItem>
              {article.status === "draft" && (
                <DropdownMenuItem onClick={() => handleDeleteClick(article.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              )}
              {article.publishedUrl && (
                <DropdownMenuItem onClick={() => window.open(article.publishedUrl, '_blank')}>
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

  useEffect(() => {
    refetch();
  }, [currentPage, statusFilter, refetch]);

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

        <DataTable
          columns={columns}
          data={articlesData?.articles || []}
          searchColumn="title"
          searchPlaceholder={t("dashboard.articles.search")}
        />

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
