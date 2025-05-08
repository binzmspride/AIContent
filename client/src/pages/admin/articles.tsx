import { useState } from "react";
import { AdminLayout } from "@/components/admin/Layout";
import { useLanguage } from "@/hooks/use-language";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Article, articleStatusEnum } from "@shared/schema";
import { formatDate, truncateText } from "@/lib/utils";
import { 
  Eye, 
  Edit, 
  Trash, 
  Search, 
  FileText, 
  Filter,
  ArrowUpDown,
  ExternalLink,
  MoreHorizontal,
  Check,
  X
} from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import Head from "@/components/head";

// Status type
type ArticleStatus = "all" | "draft" | "published" | "deleted";

// Sort type
type SortField = "createdAt" | "updatedAt" | "title";
type SortOrder = "asc" | "desc";

interface ExtendedArticle extends Omit<Article, 'createdAt' | 'updatedAt'> {
  author: {
    id: number;
    username: string;
    fullName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminArticles() {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ArticleStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ExtendedArticle | null>(null);
  const pageSize = 10;

  // Fetch articles data
  const { data: articlesResponse, isLoading } = useQuery<{ success: boolean, data: { articles: ExtendedArticle[], total: number } }>({
    queryKey: ["/api/admin/articles", statusFilter, searchQuery, currentPage, pageSize, sortField, sortOrder],
    queryFn: async () => {
      // Mock data until API is available
      const mockArticles: ExtendedArticle[] = [
        {
          id: 1,
          title: "SEO Best Practices for 2023",
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl ultricies nunc, quis ultricies nisl nisl eget ultricies aliquam, nunc nisl ultricies nunc, quis ultricies nisl.",
          status: "published",
          keywords: "SEO, best practices, 2023",
          userId: 2,
          createdAt: "2023-05-10T14:30:45Z",
          updatedAt: "2023-05-10T15:45:30Z",
          author: {
            id: 2,
            username: "johndoe",
            fullName: "John Doe"
          }
        },
        {
          id: 2,
          title: "Content Marketing Strategies That Work",
          content: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
          status: "published",
          keywords: "content marketing, strategies",
          userId: 3,
          createdAt: "2023-05-12T10:15:20Z",
          updatedAt: "2023-05-12T11:30:15Z",
          author: {
            id: 3,
            username: "janedoe",
            fullName: "Jane Doe"
          }
        },
        {
          id: 3,
          title: "How to Optimize Your Website for Mobile",
          content: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
          status: "draft",
          keywords: "mobile optimization, website",
          userId: 2,
          createdAt: "2023-05-15T09:20:10Z",
          updatedAt: "2023-05-15T09:20:10Z",
          author: {
            id: 2,
            username: "johndoe",
            fullName: "John Doe"
          }
        },
        {
          id: 4,
          title: "Social Media Marketing Tips",
          content: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
          status: "published",
          keywords: "social media, marketing",
          userId: 4,
          createdAt: "2023-05-18T13:45:30Z",
          updatedAt: "2023-05-18T14:30:20Z",
          author: {
            id: 4,
            username: "robertsmith"
          }
        },
        {
          id: 5,
          title: "Email Marketing Campaigns for E-commerce",
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
          status: "deleted",
          keywords: "email marketing, e-commerce",
          userId: 5,
          createdAt: "2023-05-20T11:10:05Z",
          updatedAt: "2023-05-20T16:25:15Z",
          author: {
            id: 5,
            username: "maryjones",
            fullName: "Mary Jones"
          }
        },
        {
          id: 6,
          title: "Voice Search Optimization Guide",
          content: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
          status: "published",
          keywords: "voice search, optimization",
          userId: 3,
          createdAt: "2023-05-22T08:30:40Z",
          updatedAt: "2023-05-22T09:45:25Z",
          author: {
            id: 3,
            username: "janedoe",
            fullName: "Jane Doe"
          }
        },
        {
          id: 7,
          title: "Local SEO for Small Businesses",
          content: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.",
          status: "draft",
          keywords: "local SEO, small business",
          userId: 2,
          createdAt: "2023-05-25T15:20:30Z",
          updatedAt: "2023-05-25T15:20:30Z",
          author: {
            id: 2,
            username: "johndoe",
            fullName: "John Doe"
          }
        },
        {
          id: 8,
          title: "Video Marketing Trends for 2023",
          content: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
          status: "published",
          keywords: "video marketing, trends",
          userId: 4,
          createdAt: "2023-05-28T12:15:10Z",
          updatedAt: "2023-05-28T13:30:45Z",
          author: {
            id: 4,
            username: "robertsmith"
          }
        },
        {
          id: 9,
          title: "E-commerce SEO Strategies",
          content: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.",
          status: "deleted",
          keywords: "e-commerce, SEO",
          userId: 5,
          createdAt: "2023-05-30T09:45:20Z",
          updatedAt: "2023-05-30T10:55:35Z",
          author: {
            id: 5,
            username: "maryjones",
            fullName: "Mary Jones"
          }
        },
        {
          id: 10,
          title: "How to Create Engaging Blog Content",
          content: "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.",
          status: "published",
          keywords: "blog content, engagement",
          userId: 3,
          createdAt: "2023-06-02T14:30:40Z",
          updatedAt: "2023-06-02T15:45:25Z",
          author: {
            id: 3,
            username: "janedoe",
            fullName: "Jane Doe"
          }
        },
      ];
      
      // Filter articles by status
      let filteredArticles = mockArticles;
      if (statusFilter !== "all") {
        filteredArticles = mockArticles.filter(article => article.status === statusFilter);
      }
      
      // Filter articles by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredArticles = filteredArticles.filter(article => 
          article.title.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query) ||
          article.keywords?.toLowerCase().includes(query) ||
          article.author.username.toLowerCase().includes(query) ||
          (article.author.fullName && article.author.fullName.toLowerCase().includes(query))
        );
      }
      
      // Sort articles
      filteredArticles.sort((a, b) => {
        let compareResult = 0;
        
        if (sortField === "title") {
          compareResult = a.title.localeCompare(b.title);
        } else if (sortField === "createdAt") {
          compareResult = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortField === "updatedAt") {
          compareResult = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        }
        
        return sortOrder === "asc" ? compareResult : -compareResult;
      });
      
      // Paginate results
      const paginatedArticles = filteredArticles.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      );
      
      return {
        success: true,
        data: {
          articles: paginatedArticles,
          total: filteredArticles.length
        }
      };
    },
  });

  const articlesData = articlesResponse?.data;
  const totalPages = articlesData ? Math.ceil(articlesData.total / pageSize) : 0;

  // Delete article mutation
  const deleteArticleMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/articles/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Bài viết đã được xóa",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      setIsDeleteDialogOpen(false);
      setSelectedArticle(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Change article status mutation
  const changeStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: ArticleStatus }) => {
      const res = await apiRequest("PATCH", `/api/admin/articles/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Trạng thái bài viết đã được cập nhật",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleViewClick = (article: ExtendedArticle) => {
    setSelectedArticle(article);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (article: ExtendedArticle) => {
    setSelectedArticle(article);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedArticle) {
      deleteArticleMutation.mutate(selectedArticle.id);
    }
  };

  const handleChangeStatus = (id: number, status: ArticleStatus) => {
    if (status !== "all") {
      changeStatusMutation.mutate({ id, status });
    }
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as ArticleStatus);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // If already sorting by this field, toggle sort order
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // If sorting by a new field, default to descending order
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Published</Badge>;
      case "draft":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Draft</Badge>;
      case "deleted":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Deleted</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <>
      <Head>
        <title>{t("admin.articlesManagement.title") || "Quản lý bài viết"} - {t("common.appName") || "SEO AI Writer"}</title>
      </Head>
      
      <AdminLayout title={t("admin.articlesManagement.title") || "Quản lý bài viết"}>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t("admin.articlesManagement.title") || "Quản lý bài viết"}</h1>
            <p className="text-muted-foreground">{t("admin.articlesManagement.description") || "Xem và quản lý tất cả bài viết trong hệ thống"}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("admin.articlesManagement.search") || "Tìm kiếm bài viết..."}
                className="pl-8 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t("common.filter") || "Lọc theo trạng thái"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.articlesManagement.allStatuses") || "Tất cả trạng thái"}</SelectItem>
                <SelectItem value="published">{t("common.published") || "Đã xuất bản"}</SelectItem>
                <SelectItem value="draft">{t("common.draft") || "Bản nháp"}</SelectItem>
                <SelectItem value="deleted">{t("common.deleted") || "Đã xóa"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.articlesManagement.allArticles") || "Tất cả bài viết"}</CardTitle>
            <CardDescription>
              {t("admin.articlesManagement.totalCount") || "Tổng số:"} {articlesData?.total || 0} {t("admin.articlesManagement.articles") || "bài viết"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("title")}>
                    <div className="flex items-center">
                      {t("common.title") || "Tiêu đề"}
                      {sortField === "title" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortOrder === "asc" ? "transform rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>{t("admin.articlesManagement.author") || "Tác giả"}</TableHead>
                  <TableHead>{t("common.status") || "Trạng thái"}</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                    <div className="flex items-center">
                      {t("admin.articlesManagement.createdAt") || "Ngày tạo"}
                      {sortField === "createdAt" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortOrder === "asc" ? "transform rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("updatedAt")}>
                    <div className="flex items-center">
                      {t("admin.articlesManagement.updatedAt") || "Cập nhật lần cuối"}
                      {sortField === "updatedAt" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortOrder === "asc" ? "transform rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">{t("admin.common.actions") || "Thao tác"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      {t("common.loading") || "Đang tải..."}
                    </TableCell>
                  </TableRow>
                ) : articlesData?.articles && articlesData.articles.length > 0 ? (
                  articlesData.articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">{article.id}</TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="font-medium truncate" title={article.title}>
                          {truncateText(article.title, 40)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {article.author.fullName || article.author.username}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(article.status)}
                      </TableCell>
                      <TableCell>{formatDate(article.createdAt as string)}</TableCell>
                      <TableCell>{formatDate(article.updatedAt as string)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">{t("admin.common.openMenu") || "Mở menu"}</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t("admin.common.actions") || "Thao tác"}</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewClick(article)}>
                              <Eye className="mr-2 h-4 w-4" />
                              {t("admin.common.view") || "Xem chi tiết"}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              {t("admin.common.edit") || "Chỉnh sửa"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>{t("common.changeStatus") || "Đổi trạng thái"}</DropdownMenuLabel>
                            {article.status !== "published" && (
                              <DropdownMenuItem onClick={() => handleChangeStatus(article.id, "published")}>
                                <Check className="mr-2 h-4 w-4 text-green-600" />
                                {t("common.publish") || "Xuất bản"}
                              </DropdownMenuItem>
                            )}
                            {article.status !== "draft" && (
                              <DropdownMenuItem onClick={() => handleChangeStatus(article.id, "draft")}>
                                <FileText className="mr-2 h-4 w-4 text-yellow-600" />
                                {t("common.markAsDraft") || "Đánh dấu là bản nháp"}
                              </DropdownMenuItem>
                            )}
                            {article.status !== "deleted" && (
                              <DropdownMenuItem onClick={() => handleChangeStatus(article.id, "deleted")}>
                                <X className="mr-2 h-4 w-4 text-red-600" />
                                {t("common.markAsDeleted") || "Đánh dấu là đã xóa"}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteClick(article)}>
                              <Trash className="mr-2 h-4 w-4" />
                              {t("admin.common.delete") || "Xóa vĩnh viễn"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      {t("admin.articlesManagement.noArticles") || "Không tìm thấy bài viết nào"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          {totalPages > 1 && (
            <CardFooter className="flex justify-center border-t p-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(index + 1);
                        }}
                        isActive={currentPage === index + 1}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          )}
        </Card>

        {/* View Article Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("admin.articlesManagement.view") || "Chi tiết bài viết"}</DialogTitle>
              <DialogDescription>
                {t("common.articleDetails") || "Thông tin chi tiết của bài viết"}
              </DialogDescription>
            </DialogHeader>
            
            {selectedArticle && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold mb-2">{selectedArticle.title}</h2>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>ID: {selectedArticle.id}</span>
                    <span>•</span>
                    <span>{t("admin.articlesManagement.author") || "Tác giả"}: {selectedArticle.author.fullName || selectedArticle.author.username}</span>
                    <span>•</span>
                    <span>{getStatusBadge(selectedArticle.status)}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{t("common.keywords") || "Từ khóa"}</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.keywords?.split(',').map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{t("common.content") || "Nội dung"}</h3>
                  <div className="p-4 border rounded-lg bg-muted/30 text-sm whitespace-pre-wrap">
                    {selectedArticle.content}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">{t("admin.articlesManagement.createdAt") || "Ngày tạo"}</h3>
                    <p>{formatDate(selectedArticle.createdAt as string)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">{t("admin.articlesManagement.updatedAt") || "Cập nhật lần cuối"}</h3>
                    <p>{formatDate(selectedArticle.updatedAt as string)}</p>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                {t("common.close") || "Đóng"}
              </Button>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                {t("admin.common.edit") || "Chỉnh sửa"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>{t("admin.articlesManagement.delete") || "Xóa bài viết"}</DialogTitle>
              <DialogDescription>
                {t("common.deleteConfirmation") || "Bạn có chắc chắn muốn xóa vĩnh viễn bài viết này? Hành động này không thể hoàn tác."}
              </DialogDescription>
            </DialogHeader>
            
            {selectedArticle && (
              <div className="py-4">
                <p><strong>{t("common.title") || "Tiêu đề"}:</strong> {selectedArticle.title}</p>
                <p><strong>{t("admin.articlesManagement.author") || "Tác giả"}:</strong> {selectedArticle.author.fullName || selectedArticle.author.username}</p>
                <p><strong>{t("common.status") || "Trạng thái"}:</strong> {selectedArticle.status}</p>
                <p><strong>{t("admin.articlesManagement.createdAt") || "Ngày tạo"}:</strong> {formatDate(selectedArticle.createdAt as string)}</p>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                {t("common.cancel") || "Hủy"}
              </Button>
              <Button 
                type="button"
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteArticleMutation.isPending}
              >
                {deleteArticleMutation.isPending 
                  ? (t("common.deleting") || "Đang xóa...") 
                  : (t("common.delete") || "Xóa")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}