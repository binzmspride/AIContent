import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Clock, Calendar, Globe, Edit, Trash2, Eye, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { useLocation } from 'wouter';

// Utility function to convert HTML to plain text
function htmlToPlainText(html: string): string {
  if (!html) return '';
  
  // Create a temporary div element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get text content and clean up
  let text = tempDiv.textContent || tempDiv.innerText || '';
  
  // Replace multiple spaces and newlines with single spaces
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

interface ScheduledPost {
  id: number;
  title: string;
  content: string;
  platform: string;
  connectionName: string;
  scheduledTime: string;
  status: 'pending' | 'published' | 'failed';
  createdAt: string;
  articleId?: number;
}

interface Article {
  id: number;
  title: string;
  content: string;
  metaDescription?: string;
  keywords?: string | string[];
  imageUrls?: string[];
  images?: Array<{
    id: number;
    imageUrl: string;
    title: string;
  }>;
  createdAt: string;
}

interface SocialConnection {
  id: number;
  platform: string;
  accountName: string;
  isActive: boolean;
}

export default function ScheduledPosts() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedConnection, setSelectedConnection] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [customContent, setCustomContent] = useState('');

  // Fetch scheduled posts
  const { data: scheduledPostsData, isLoading: postsLoading } = useQuery({
    queryKey: ['/api/scheduled-posts'],
  });

  // Fetch user articles
  const { data: articlesData, isLoading: articlesLoading } = useQuery({
    queryKey: ['/api/dashboard/articles'],
  });

  // Fetch social connections
  const { data: connectionsData, isLoading: connectionsLoading } = useQuery({
    queryKey: ['/api/social-connections'],
  });

  const scheduledPosts: ScheduledPost[] = (scheduledPostsData as any)?.data?.posts || [];
  const articles: Article[] = (articlesData as any)?.data?.articles || [];
  const connections: SocialConnection[] = (connectionsData as any)?.data || [];

  // Create scheduled post mutation
  const createScheduledPostMutation = useMutation({
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
      setSelectedArticle(null);
      setSelectedConnection('');
      setScheduledTime('');
      setCustomContent('');
      toast({
        title: "Thành công",
        description: "Bài đăng đã được lên lịch thành công!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo bài đăng đã lên lịch",
        variant: "destructive",
      });
    },
  });

  // Update scheduled post mutation
  const updateScheduledPostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/scheduled-posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update scheduled post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-posts'] });
      setShowEditDialog(false);
      setEditingPost(null);
      toast({
        title: "Thành công",
        description: "Đã cập nhật bài đăng thành công!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật bài đăng",
        variant: "destructive",
      });
    },
  });

  // Delete scheduled post mutation
  const deleteScheduledPostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await fetch(`/api/scheduled-posts/${postId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete scheduled post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-posts'] });
      toast({
        title: "Thành công",
        description: "Đã xóa bài đăng thành công!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa bài đăng",
        variant: "destructive",
      });
    },
  });

  const publishNowMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/scheduled-posts/${id}/publish-now`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to publish post');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Đăng ngay",
        description: data.success ? "Đã thử đăng bài thành công" : "Đăng bài thất bại, kiểm tra logs",
        variant: data.success ? "default" : "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-posts'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePublishNow = (postId: number) => {
    publishNowMutation.mutate(postId);
  };

  const handleCreateScheduledPost = () => {
    if (!selectedArticle || !selectedConnection || !scheduledTime) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn bài viết, kết nối và thời gian đăng",
        variant: "destructive",
      });
      return;
    }

    const content = customContent || selectedArticle.content;
    const scheduledDateTime = new Date(scheduledTime);

    if (scheduledDateTime <= new Date()) {
      toast({
        title: "Lỗi",
        description: "Thời gian đăng phải trong tương lai",
        variant: "destructive",
      });
      return;
    }

    createScheduledPostMutation.mutate({
      articleId: selectedArticle.id,
      connectionId: parseInt(selectedConnection),
      title: selectedArticle.title,
      content: content,
      scheduledTime: scheduledDateTime.toISOString(),
    });
  };

  const handleEditPost = (post: ScheduledPost) => {
    setEditingPost(post);
    setCustomContent(htmlToPlainText(post.content));
    setScheduledTime(format(parseISO(post.scheduledTime), "yyyy-MM-dd'T'HH:mm"));
    setShowEditDialog(true);
  };

  const handleUpdateScheduledPost = () => {
    if (!editingPost || !customContent || !scheduledTime) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    const scheduledDateTime = new Date(scheduledTime);
    if (scheduledDateTime <= new Date()) {
      toast({
        title: "Lỗi",
        description: "Thời gian đăng phải trong tương lai",
        variant: "destructive",
      });
      return;
    }

    updateScheduledPostMutation.mutate({
      id: editingPost.id,
      data: {
        content: customContent,
        scheduledTime: scheduledDateTime.toISOString(),
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">Chờ đăng</Badge>;
      case 'published':
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">Đã đăng</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">Thất bại</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'wordpress':
        return <Globe className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  if (postsLoading || articlesLoading || connectionsLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#132639' }}>
        <Sidebar />
        <div className="ml-64 min-h-screen">
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#132639' }}>
      <Sidebar />
      <div className="ml-64 min-h-screen">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Bài viết đã lên lịch</h1>
          <p className="text-gray-300 mt-2">
            Quản lý và lên lịch đăng bài viết lên các nền tảng mạng xã hội
          </p>
        </div>
        
        <Dialog 
          open={showCreateDialog} 
          onOpenChange={(open) => {
            setShowCreateDialog(open);
            if (!open) {
              setSelectedArticle(null);
              setSelectedConnection('');
              setScheduledTime('');
              setCustomContent('');
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tạo bài đăng mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tạo bài đăng mới</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Select Article */}
              <div>
                <Label htmlFor="article">Chọn bài viết</Label>
                <Select value={selectedArticle?.id.toString() || ''} onValueChange={(value) => {
                  const article = articles.find(a => a.id === parseInt(value));
                  setSelectedArticle(article || null);
                  setCustomContent('');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn bài viết từ thư viện của bạn..." />
                  </SelectTrigger>
                  <SelectContent>
                    {articles.map((article) => (
                      <SelectItem key={article.id} value={article.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{article.title}</span>
                          <span className="text-sm text-gray-500">
                            {format(parseISO(article.createdAt), 'dd/MM/yyyy', { locale: vi })}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Article Preview */}
              {selectedArticle && (
                <div className="p-4 border rounded-lg" style={{ backgroundColor: '#132639' }}>
                  <h4 className="font-medium mb-2 text-white">{selectedArticle.title}</h4>
                  <p className="text-sm text-gray-300 line-clamp-3">
                    {selectedArticle.content.substring(0, 200)}...
                  </p>
                  
                  {/* Display article images */}
                  {(() => {
                    // Check for images from imageUrls field or images relationship
                    const imageUrls = selectedArticle.imageUrls || [];
                    const relatedImages = selectedArticle.images || [];
                    
                    // Combine both sources
                    let allImages: string[] = [];
                    
                    // Add from imageUrls field
                    if (Array.isArray(imageUrls)) {
                      allImages = [...imageUrls];
                    }
                    
                    // Add from related images (for Social Media Content)
                    relatedImages.forEach(img => {
                      if (img.imageUrl && !allImages.includes(img.imageUrl)) {
                        allImages.push(img.imageUrl);
                      }
                    });
                    
                    if (allImages.length > 0) {
                      return (
                        <div className="mt-3">
                          <p className="text-sm text-gray-400 mb-2">Hình ảnh đã chọn:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {allImages.slice(0, 4).map((imageUrl: string, index: number) => (
                              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-800">
                                <img
                                  src={imageUrl}
                                  alt={`Hình ảnh ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                            ))}
                            {allImages.length > 4 && (
                              <div className="aspect-square rounded-lg bg-gray-800 flex items-center justify-center">
                                <span className="text-sm text-gray-400">+{allImages.length - 4}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  {selectedArticle.keywords && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(() => {
                        const keywordsList = typeof selectedArticle.keywords === 'string' 
                          ? selectedArticle.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k)
                          : Array.isArray(selectedArticle.keywords) 
                            ? selectedArticle.keywords 
                            : [];
                        return keywordsList.slice(0, 3).map((keyword: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* Custom Content */}
              {selectedArticle && (
                <div>
                  <Label htmlFor="customContent">Nội dung tùy chỉnh (tùy chọn)</Label>
                  <Textarea
                    id="customContent"
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    placeholder="Để trống để sử dụng nội dung gốc của bài viết..."
                    rows={4}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Bạn có thể chỉnh sửa nội dung cho phù hợp với nền tảng đăng
                  </p>
                </div>
              )}

              {/* Select Connection */}
              <div>
                <Label htmlFor="connection">Chọn kết nối</Label>
                <Select value={selectedConnection} onValueChange={setSelectedConnection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nền tảng để đăng..." />
                  </SelectTrigger>
                  <SelectContent>
                    {connections.filter(conn => conn.isActive).map((connection) => (
                      <SelectItem key={connection.id} value={connection.id.toString()}>
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(connection.platform)}
                          <span>{connection.accountName}</span>
                          <Badge variant="outline" className="ml-2">
                            {connection.platform}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Schedule Time */}
              <div>
                <Label htmlFor="scheduledTime">Thời gian đăng</Label>
                <Input
                  id="scheduledTime"
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleCreateScheduledPost}
                  disabled={createScheduledPostMutation.isPending}
                >
                  {createScheduledPostMutation.isPending ? 'Đang tạo...' : 'Tạo bài đăng'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Scheduled Post Dialog */}
        <Dialog 
          open={showEditDialog} 
          onOpenChange={(open) => {
            setShowEditDialog(open);
            if (!open) {
              setEditingPost(null);
              setCustomContent('');
              setScheduledTime('');
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa bài viết đã lên lịch</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {editingPost && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#132639' }}>
                  <h3 className="font-medium text-sm text-white">Bài viết gốc:</h3>
                  <p className="text-sm text-gray-300">{editingPost.title}</p>
                  
                  {/* Display article images */}
                  {(() => {
                    // Find the article data for editing post
                    if (!editingPost.articleId || !articlesData?.data?.articles) return null;
                    
                    const article = articlesData.data.articles.find((a: any) => a.id === editingPost.articleId);
                    if (!article) return null;
                    
                    // Check for images from imageUrls field or images relationship
                    const imageUrls = article.imageUrls || [];
                    const relatedImages = article.images || [];
                    
                    // Combine both sources
                    let allImages: string[] = [];
                    
                    // Add from imageUrls field
                    if (Array.isArray(imageUrls)) {
                      allImages = [...imageUrls];
                    }
                    
                    // Add from related images (for Social Media Content)
                    relatedImages.forEach((img: any) => {
                      if (img.imageUrl && !allImages.includes(img.imageUrl)) {
                        allImages.push(img.imageUrl);
                      }
                    });
                    
                    if (allImages.length > 0) {
                      return (
                        <div className="mt-3">
                          <p className="text-sm text-gray-400 mb-2">Hình ảnh đã chọn:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {allImages.slice(0, 4).map((imageUrl: string, index: number) => (
                              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-800">
                                <img
                                  src={imageUrl}
                                  alt={`Hình ảnh ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                            ))}
                            {allImages.length > 4 && (
                              <div className="aspect-square rounded-lg bg-gray-800 flex items-center justify-center">
                                <span className="text-sm text-gray-400">+{allImages.length - 4}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-content">Nội dung bài viết</Label>
                <Textarea
                  id="edit-content"
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  placeholder="Chỉnh sửa nội dung bài viết..."
                  className="min-h-[200px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-scheduled-time">Thời gian đăng</Label>
                <Input
                  id="edit-scheduled-time"
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleUpdateScheduledPost}
                  disabled={updateScheduledPostMutation.isPending}
                >
                  {updateScheduledPostMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật bài đăng'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Scheduled Posts List */}
      <div className="grid gap-4">
        {scheduledPosts.length === 0 ? (
          <Card className="p-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có bài viết nào được lên lịch
            </h3>
            <p className="text-gray-500 mb-4">
              Tạo bài đăng đầu tiên từ các bài viết đã lưu của bạn
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo bài đăng mới
            </Button>
          </Card>
        ) : (
          scheduledPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getPlatformIcon(post.platform)}
                    <div>
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {post.connectionName} • {post.platform}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(post.status)}
                    {post.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPost(post)}
                        disabled={updateScheduledPostMutation.isPending}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/dashboard/publishing-logs?postId=${post.id}`)}
                      title="Xem logs đăng bài"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePublishNow(post.id)}
                      disabled={publishNowMutation.isPending}
                      title="Đăng ngay để test"
                    >
                      {publishNowMutation.isPending ? '...' : 'Đăng ngay'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteScheduledPostMutation.mutate(post.id)}
                      disabled={deleteScheduledPostMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(parseISO(post.scheduledTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        Tạo lúc {format(parseISO(post.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
        </div>
      </div>
    </div>
  );
}