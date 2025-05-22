import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { AdminLayout } from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MessageSquare, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Trash2,
  Mail,
  User,
  Calendar,
  Globe
} from "lucide-react";
import Head from "@/components/head";
import type { Feedback } from "@shared/schema";

interface FeedbackWithUser extends Feedback {
  user?: {
    id: number;
    username: string;
    fullName: string;
  };
}

export default function AdminFeedback() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackWithUser | null>(null);

  // Fetch feedback
  const { data: feedbackData, isLoading } = useQuery({
    queryKey: ['/api/admin/feedback', page, statusFilter, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });
      return fetch(`/api/admin/feedback?${params}`, {
        credentials: 'include'
      }).then(res => res.json());
    },
  });

  // Update feedback status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest('PATCH', `/api/admin/feedback/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/feedback'] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái feedback",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái",
        variant: "destructive",
      });
    },
  });

  // Delete feedback
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/admin/feedback/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/feedback'] });
      toast({
        title: "Thành công",
        description: "Đã xóa feedback",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa feedback",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <Badge variant="destructive">Chưa đọc</Badge>;
      case 'read':
        return <Badge variant="secondary">Đã đọc</Badge>;
      case 'replied':
        return <Badge variant="default">Đã phản hồi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const feedback = feedbackData?.data?.feedback || [];
  const pagination = feedbackData?.data?.pagination || {};

  return (
    <>
      <Head>
        <title>Quản lý Feedback - Admin Panel</title>
      </Head>
      
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-secondary-900">
                Feedback từ người dùng
              </h1>
              <p className="text-secondary-500">
                Quản lý và theo dõi feedback từ người dùng
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
              <Input
                placeholder="Tìm kiếm theo tên, email hoặc chủ đề..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="unread">Chưa đọc</SelectItem>
                <SelectItem value="read">Đã đọc</SelectItem>
                <SelectItem value="replied">Đã phản hồi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Feedback Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-secondary-200 dark:border-gray-700">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white font-medium">Người gửi</TableHead>
                  <TableHead className="text-white font-medium">Chủ đề</TableHead>
                  <TableHead className="text-white font-medium">Trang</TableHead>
                  <TableHead className="text-white font-medium">Trạng thái</TableHead>
                  <TableHead className="text-white font-medium">Ngày gửi</TableHead>
                  <TableHead className="text-right text-white font-medium">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Đang tải...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : feedback.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                      <p className="text-secondary-500">Chưa có feedback nào</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  feedback.map((item: FeedbackWithUser) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-secondary-900 dark:text-secondary-100">
                              {item.name}
                            </div>
                            <div className="text-sm text-secondary-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {item.email}
                            </div>
                            {item.user && (
                              <div className="text-xs text-secondary-400">
                                User: {item.user.fullName || item.user.username}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium text-secondary-900 dark:text-secondary-100 truncate">
                            {item.subject}
                          </div>
                          <div className="text-sm text-secondary-500 truncate">
                            {item.message}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-secondary-500">
                          <Globe className="h-3 w-3 mr-1" />
                          {item.page || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(item.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-secondary-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setSelectedFeedback(item)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            {item.status === 'unread' && (
                              <DropdownMenuItem
                                onClick={() => updateStatusMutation.mutate({ id: item.id, status: 'read' })}
                              >
                                Đánh dấu đã đọc
                              </DropdownMenuItem>
                            )}
                            {item.status !== 'replied' && (
                              <DropdownMenuItem
                                onClick={() => updateStatusMutation.mutate({ id: item.id, status: 'replied' })}
                              >
                                Đánh dấu đã phản hồi
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => deleteMutation.mutate(item.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
              <p className="text-sm text-secondary-500">
                Hiển thị {((page - 1) * 10) + 1} - {Math.min(page * 10, pagination.total)} 
                trong tổng số {pagination.total} feedback
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Detail Dialog */}
        <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                Chi tiết feedback
              </DialogTitle>
              <DialogDescription>
                Xem thông tin chi tiết feedback từ người dùng
              </DialogDescription>
            </DialogHeader>
            
            {selectedFeedback && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      Người gửi
                    </label>
                    <p className="text-secondary-900 dark:text-secondary-100">{selectedFeedback.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      Email
                    </label>
                    <p className="text-secondary-900 dark:text-secondary-100">{selectedFeedback.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      Trang
                    </label>
                    <p className="text-secondary-900 dark:text-secondary-100">
                      {selectedFeedback.page || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      Trạng thái
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(selectedFeedback.status)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    Chủ đề
                  </label>
                  <p className="text-secondary-900 dark:text-secondary-100">{selectedFeedback.subject}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    Nội dung
                  </label>
                  <div className="mt-1 p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                    <p className="text-secondary-900 dark:text-secondary-100 whitespace-pre-wrap">
                      {selectedFeedback.message}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    Thời gian gửi
                  </label>
                  <p className="text-secondary-900 dark:text-secondary-100">
                    {format(new Date(selectedFeedback.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                  </p>
                </div>

                {selectedFeedback.user && (
                  <div className="pt-4 border-t border-secondary-200 dark:border-secondary-700">
                    <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      Thông tin người dùng
                    </label>
                    <div className="mt-1 p-3 bg-primary/5 rounded-lg">
                      <p className="text-secondary-900 dark:text-secondary-100">
                        <strong>Tên:</strong> {selectedFeedback.user.fullName || selectedFeedback.user.username}
                      </p>
                      <p className="text-secondary-900 dark:text-secondary-100">
                        <strong>Username:</strong> {selectedFeedback.user.username}
                      </p>
                      <p className="text-secondary-900 dark:text-secondary-100">
                        <strong>ID:</strong> {selectedFeedback.user.id}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  {selectedFeedback.status === 'unread' && (
                    <Button
                      onClick={() => {
                        updateStatusMutation.mutate({ id: selectedFeedback.id, status: 'read' });
                        setSelectedFeedback(null);
                      }}
                      variant="outline"
                    >
                      Đánh dấu đã đọc
                    </Button>
                  )}
                  {selectedFeedback.status !== 'replied' && (
                    <Button
                      onClick={() => {
                        updateStatusMutation.mutate({ id: selectedFeedback.id, status: 'replied' });
                        setSelectedFeedback(null);
                      }}
                    >
                      Đánh dấu đã phản hồi
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}