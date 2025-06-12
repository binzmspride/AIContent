import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Calendar, Clock, Edit, Trash2, Eye, Plus, Play, Pause, X } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Sidebar } from "@/components/dashboard/Sidebar";

interface ScheduledPost {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  platforms: any[];
  scheduledTime: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  publishedUrls?: Record<string, string>;
  errorLogs?: any[];
  createdAt: string;
  updatedAt: string;
}

interface SocialConnection {
  id: number;
  platform: string;
  accountName: string;
  isActive: boolean;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
};

const statusLabels = {
  pending: "Đang chờ",
  processing: "Đang xử lý",
  completed: "Hoàn thành",
  failed: "Thất bại",
  cancelled: "Đã hủy"
};

const platformLabels = {
  wordpress: "WordPress",
  facebook: "Facebook",
  twitter: "Twitter",
  linkedin: "LinkedIn",
  instagram: "Instagram"
};

export default function ScheduledPosts() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  // Fetch scheduled posts
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['/api/scheduled-posts', { status: statusFilter === 'all' ? undefined : statusFilter }],
  });

  // Fetch social connections
  const { data: connectionsData } = useQuery({
    queryKey: ['/api/social-connections'],
  });

  // Create scheduled post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/scheduled-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create scheduled post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-posts'] });
      setShowCreateDialog(false);
      toast({
        title: "Thành công",
        description: "Bài viết đã được lên lịch thành công!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo bài viết đã lên lịch",
        variant: "destructive",
      });
    },
  });

  // Cancel post mutation
  const cancelPostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await fetch(`/api/scheduled-posts/${postId}/cancel`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to cancel post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-posts'] });
      toast({
        title: "Thành công",
        description: "Bài viết đã được hủy thành công!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể hủy bài viết",
        variant: "destructive",
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await fetch(`/api/scheduled-posts/${postId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-posts'] });
      toast({
        title: "Thành công",
        description: "Bài viết đã được xóa thành công!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa bài viết",
        variant: "destructive",
      });
    },
  });

  const handleCreatePost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const selectedPlatforms = [];
    const connections = connectionsData?.data || [];
    
    // Collect selected platforms
    connections.forEach((conn: SocialConnection) => {
      if (formData.get(`platform_${conn.id}`)) {
        selectedPlatforms.push({
          connectionId: conn.id,
          platform: conn.platform,
          accountName: conn.accountName
        });
      }
    });

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một nền tảng để đăng bài",
        variant: "destructive",
      });
      return;
    }

    const scheduledTime = new Date(
      `${formData.get('scheduledDate')}T${formData.get('scheduledTime')}`
    );

    if (scheduledTime <= new Date()) {
      toast({
        title: "Lỗi",
        description: "Thời gian đăng bài phải trong tương lai",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({
      title: formData.get('title'),
      content: formData.get('content'),
      excerpt: formData.get('excerpt'),
      platforms: selectedPlatforms,
      scheduledTime: scheduledTime.toISOString(),
    });
  };

  const posts = postsData?.data?.posts || [];
  const connections = connectionsData?.data || [];

  if (postsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="ml-64 min-h-screen">
        <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Bài viết đã lên lịch
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quản lý và theo dõi các bài viết được lên lịch đăng tự động
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tạo bài đăng mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo bài đăng đã lên lịch</DialogTitle>
              <DialogDescription>
                Tạo bài viết mới và lên lịch đăng lên các nền tảng mạng xã hội
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <Label htmlFor="title">Tiêu đề</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Nhập tiêu đề bài viết..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="content">Nội dung</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Nhập nội dung bài viết..."
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="excerpt">Mô tả ngắn (tùy chọn)</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  placeholder="Mô tả ngắn cho bài viết..."
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduledDate">Ngày đăng</Label>
                  <Input
                    id="scheduledDate"
                    name="scheduledDate"
                    type="date"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="scheduledTime">Giờ đăng</Label>
                  <Input
                    id="scheduledTime"
                    name="scheduledTime"
                    type="time"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label>Chọn nền tảng đăng bài</Label>
                <div className="mt-2 space-y-2">
                  {connections.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Chưa có kết nối nào. Vui lòng thêm kết nối mạng xã hội trước.
                    </p>
                  ) : (
                    connections.map((conn: SocialConnection) => (
                      <div key={conn.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`platform_${conn.id}`}
                          name={`platform_${conn.id}`}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`platform_${conn.id}`} className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {platformLabels[conn.platform as keyof typeof platformLabels] || conn.platform}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({conn.accountName})
                          </span>
                          {!conn.isActive && (
                            <Badge variant="secondary" className="text-xs">
                              Không hoạt động
                            </Badge>
                          )}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={createPostMutation.isPending || connections.length === 0}
                >
                  {createPostMutation.isPending ? "Đang tạo..." : "Tạo bài đăng"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div>
              <Label htmlFor="status-filter">Lọc theo trạng thái</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Đang chờ</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="failed">Thất bại</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách bài viết</CardTitle>
          <CardDescription>
            {posts.length} bài viết được tìm thấy
          </CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Chưa có bài viết nào
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Bắt đầu bằng cách tạo bài viết đầu tiên của bạn
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo bài đăng mới
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Nền tảng</TableHead>
                    <TableHead>Thời gian đăng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post: ScheduledPost) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{post.title}</div>
                          {post.excerpt && (
                            <div className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                              {post.excerpt}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {post.platforms.map((platform: any, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {platformLabels[platform.platform as keyof typeof platformLabels] || platform.platform}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {format(new Date(post.scheduledTime), "dd/MM/yyyy HH:mm", { locale: vi })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[post.status]}>
                          {statusLabels[post.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPost(post);
                              setShowViewDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {post.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelPostMutation.mutate(post.id)}
                              disabled={cancelPostMutation.isPending}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePostMutation.mutate(post.id)}
                            disabled={deletePostMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Post Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết bài viết</DialogTitle>
          </DialogHeader>
          
          {selectedPost && (
            <div className="space-y-4">
              <div>
                <Label>Tiêu đề</Label>
                <p className="text-sm mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  {selectedPost.title}
                </p>
              </div>
              
              <div>
                <Label>Nội dung</Label>
                <div className="text-sm mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded whitespace-pre-wrap">
                  {selectedPost.content}
                </div>
              </div>
              
              {selectedPost.excerpt && (
                <div>
                  <Label>Mô tả ngắn</Label>
                  <p className="text-sm mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    {selectedPost.excerpt}
                  </p>
                </div>
              )}
              
              <div>
                <Label>Nền tảng đăng bài</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedPost.platforms.map((platform: any, index: number) => (
                    <Badge key={index} variant="outline">
                      {platformLabels[platform.platform as keyof typeof platformLabels] || platform.platform}
                      <span className="ml-1 text-xs">({platform.accountName})</span>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Thời gian đăng</Label>
                  <p className="text-sm mt-1">
                    {format(new Date(selectedPost.scheduledTime), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </p>
                </div>
                <div>
                  <Label>Trạng thái</Label>
                  <div className="mt-1">
                    <Badge className={statusColors[selectedPost.status]}>
                      {statusLabels[selectedPost.status]}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {selectedPost.publishedUrls && Object.keys(selectedPost.publishedUrls).length > 0 && (
                <div>
                  <Label>Liên kết bài viết đã đăng</Label>
                  <div className="space-y-1 mt-1">
                    {Object.entries(selectedPost.publishedUrls).map(([platform, url]) => (
                      <div key={platform} className="text-sm">
                        <span className="font-medium">
                          {platformLabels[platform as keyof typeof platformLabels] || platform}:
                        </span>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:text-blue-700 underline"
                        >
                          {url}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedPost.errorLogs && selectedPost.errorLogs.length > 0 && (
                <div>
                  <Label>Nhật ký lỗi</Label>
                  <div className="text-sm mt-1 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                    {selectedPost.errorLogs.map((error: any, index: number) => (
                      <div key={index} className="mb-1">
                        {JSON.stringify(error, null, 2)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </div>
  );
}