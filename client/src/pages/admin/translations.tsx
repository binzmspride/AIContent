import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Languages, 
  Search, 
  Filter, 
  Plus,
  Edit,
  Save,
  X,
  Globe
} from "lucide-react";
import Head from "@/components/head";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const translationSchema = z.object({
  key: z.string().min(1, "Key không được để trống"),
  vi: z.string().min(1, "Bản dịch tiếng Việt không được để trống"),
  en: z.string().min(1, "Bản dịch tiếng Anh không được để trống"),
  category: z.string().min(1, "Danh mục không được để trống"),
});

type TranslationFormValues = z.infer<typeof translationSchema>;

interface Translation {
  id: number;
  key: string;
  vi: string;
  en: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminTranslations() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form for adding new translation
  const form = useForm<TranslationFormValues>({
    resolver: zodResolver(translationSchema),
    defaultValues: {
      key: "",
      vi: "",
      en: "",
      category: "common",
    },
  });

  // Fetch translations
  const { data: translationsData, isLoading } = useQuery({
    queryKey: ['/api/admin/translations', page, categoryFilter, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(searchTerm && { search: searchTerm }),
      });
      return fetch(`/api/admin/translations?${params}`, {
        credentials: 'include'
      }).then(res => res.json());
    },
  });

  // Add translation
  const addMutation = useMutation({
    mutationFn: (data: TranslationFormValues) =>
      apiRequest('/api/admin/translations', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/translations'] });
      toast({
        title: "Thành công",
        description: "Đã thêm bản dịch mới",
      });
      form.reset();
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm bản dịch",
        variant: "destructive",
      });
    },
  });

  // Update translation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TranslationFormValues> }) =>
      apiRequest('PATCH', `/api/admin/translations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/translations'] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật bản dịch",
      });
      setEditingId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật bản dịch",
        variant: "destructive",
      });
    },
  });

  // Delete translation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/admin/translations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/translations'] });
      toast({
        title: "Thành công",
        description: "Đã xóa bản dịch",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa bản dịch",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TranslationFormValues) => {
    addMutation.mutate(data);
  };

  const handleUpdate = (id: number, field: string, value: string) => {
    updateMutation.mutate({ id, data: { [field]: value } });
  };

  const getCategoryBadge = (category: string) => {
    const categoryLabels: { [key: string]: string } = {
      common: 'Chung',
      nav: 'Điều hướng',
      landing: 'Trang chủ',
      dashboard: 'Dashboard',
      admin: 'Admin',
      auth: 'Đăng nhập',
      forms: 'Form',
      social: 'Mạng xã hội',
      articles: 'Bài viết',
      credits: 'Tín dụng',
      plans: 'Gói dịch vụ',
      connections: 'Kết nối',
      sidebar: 'Thanh bên',
      'image-library': 'Thư viện ảnh',
      'scheduled-posts': 'Lên lịch',
      translations: 'Bản dịch',
    };
    
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      common: 'default',
      nav: 'secondary',
      landing: 'outline',
      dashboard: 'destructive',
      admin: 'secondary',
      social: 'default',
      articles: 'outline',
      credits: 'secondary',
      plans: 'destructive',
    };
    
    return <Badge variant={variants[category] || 'outline'}>
      {categoryLabels[category] || category}
    </Badge>;
  };

  const translations = translationsData?.data?.translations || [];
  const pagination = translationsData?.data?.pagination || {};

  const categories = [
    'common', 
    'nav', 
    'landing', 
    'dashboard', 
    'admin', 
    'auth', 
    'forms',
    'social',
    'articles',
    'credits',
    'plans',
    'connections',
    'sidebar',
    'image-library',
    'scheduled-posts',
    'translations'
  ];

  return (
    <>
      <Head>
        <title>Quản lý Bản dịch - Admin Panel</title>
      </Head>
      
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Quản lý Bản dịch
              </h1>
              <p className="text-gray-300">
                Chỉnh sửa các văn bản hiển thị trên website
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm bản dịch
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center">
                    <Languages className="h-5 w-5 mr-2 text-primary" />
                    Thêm bản dịch mới
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Tạo một cặp key-value mới cho hệ thống đa ngôn ngữ
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Key</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., nav.home, landing.hero.title"
                              className="bg-gray-700 border-gray-600 text-white"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Danh mục</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                <SelectValue placeholder="Chọn danh mục" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="vi"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">Tiếng Việt</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Văn bản tiếng Việt"
                                className="bg-gray-700 border-gray-600 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="en"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">English</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="English text"
                                className="bg-gray-700 border-gray-600 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddDialogOpen(false)}
                        className="border-gray-600 text-gray-300"
                      >
                        Hủy
                      </Button>
                      <Button 
                        type="submit"
                        className="bg-primary hover:bg-primary/90"
                        disabled={addMutation.isPending}
                      >
                        {addMutation.isPending ? "Đang thêm..." : "Thêm"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo key hoặc nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px] bg-gray-700 border-gray-600 text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Lọc theo trang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trang</SelectItem>
                <SelectItem value="common">Chung</SelectItem>
                <SelectItem value="nav">Điều hướng</SelectItem>
                <SelectItem value="landing">Trang chủ</SelectItem>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="admin">Admin Panel</SelectItem>
                <SelectItem value="auth">Đăng nhập/Đăng ký</SelectItem>
                <SelectItem value="forms">Form</SelectItem>
                <SelectItem value="social">Nội dung mạng xã hội</SelectItem>
                <SelectItem value="articles">Bài viết</SelectItem>
                <SelectItem value="credits">Tín dụng</SelectItem>
                <SelectItem value="plans">Gói dịch vụ</SelectItem>
                <SelectItem value="connections">Kết nối</SelectItem>
                <SelectItem value="sidebar">Thanh bên</SelectItem>
                <SelectItem value="image-library">Thư viện hình ảnh</SelectItem>
                <SelectItem value="scheduled-posts">Bài viết lên lịch</SelectItem>
                <SelectItem value="translations">Quản lý bản dịch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Translations Table */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white font-medium">Key</TableHead>
                  <TableHead className="text-white font-medium">Danh mục</TableHead>
                  <TableHead className="text-white font-medium">Tiếng Việt</TableHead>
                  <TableHead className="text-white font-medium">English</TableHead>
                  <TableHead className="text-right text-white font-medium">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2 text-white">Đang tải...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : translations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Languages className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">Chưa có bản dịch nào</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  translations.map((item: Translation) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-mono text-sm text-white">
                          {item.key}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getCategoryBadge(item.category)}
                      </TableCell>
                      <TableCell>
                        {editingId === item.id ? (
                          <Textarea 
                            defaultValue={item.vi}
                            className="bg-gray-700 border-gray-600 text-white min-h-[60px]"
                            onBlur={(e) => handleUpdate(item.id, 'vi', e.target.value)}
                          />
                        ) : (
                          <div 
                            className="text-white cursor-pointer hover:bg-gray-700 p-2 rounded"
                            onClick={() => setEditingId(item.id)}
                          >
                            {item.vi}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === item.id ? (
                          <Textarea 
                            defaultValue={item.en}
                            className="bg-gray-700 border-gray-600 text-white min-h-[60px]"
                            onBlur={(e) => handleUpdate(item.id, 'en', e.target.value)}
                          />
                        ) : (
                          <div 
                            className="text-white cursor-pointer hover:bg-gray-700 p-2 rounded"
                            onClick={() => setEditingId(item.id)}
                          >
                            {item.en}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {editingId === item.id ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                              className="border-gray-600 text-gray-300"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(item.id)}
                              className="border-gray-600 text-gray-300"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Hiển thị {((page - 1) * 20) + 1} - {Math.min(page * 20, pagination.total)} 
                trong tổng số {pagination.total} bản dịch
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="border-gray-600 text-gray-300"
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                  className="border-gray-600 text-gray-300"
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}