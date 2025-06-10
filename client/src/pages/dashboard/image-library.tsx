import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/dashboard/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image, Loader2, Search, Download, Eye, Trash2, Calendar, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedImage {
  id: number;
  title: string;
  prompt: string;
  imageUrl: string;
  sourceText?: string;
  creditsUsed: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function ImageLibraryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);

  // Fetch user's generated images
  const { data: imagesData, isLoading: imagesLoading } = useQuery({
    queryKey: ['/api/dashboard/images'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/dashboard/images');
      const data = await res.json();
      return data.success ? data.data : { images: [] };
    },
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      const response = await apiRequest('DELETE', `/api/dashboard/images/${imageId}`);
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete image');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/images'] });
      toast({
        title: "Thành công",
        description: "Hình ảnh đã được xóa khỏi thư viện!",
      });
      setShowImageDialog(false);
      setSelectedImage(null);
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa hình ảnh",
        variant: "destructive",
      });
    },
  });

  // Filter images based on search and status
  const filteredImages = imagesData?.images?.filter((image: GeneratedImage) => {
    const matchesSearch = image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || image.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleImageClick = (image: GeneratedImage) => {
    setSelectedImage(image);
    setShowImageDialog(true);
  };

  const handleDeleteImage = () => {
    if (selectedImage) {
      deleteImageMutation.mutate(selectedImage.id);
    }
  };

  const handleDownloadImage = (imageUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${title.replace(/\s+/g, '-')}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Thư viện hình ảnh AI</h1>
            <p className="text-muted-foreground">
              Quản lý và xem lại tất cả hình ảnh đã tạo bằng AI
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {filteredImages.length} hình ảnh
            </Badge>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Tìm kiếm</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Tìm theo tiêu đề hoặc mô tả..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <Label htmlFor="status">Trạng thái</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="generated">Đã tạo</SelectItem>
                    <SelectItem value="saved">Đã lưu</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images Grid */}
        {imagesLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Đang tải thư viện hình ảnh...</p>
          </div>
        ) : filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image: GeneratedImage) => (
              <Card key={image.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-muted rounded-t-lg overflow-hidden">
                  <img 
                    src={image.imageUrl} 
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.svg';
                    }}
                    onClick={() => handleImageClick(image)}
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{image.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{image.prompt}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {image.creditsUsed} tín dụng
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {image.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(image.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(image);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadImage(image.imageUrl, image.title);
                        }}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Chưa có hình ảnh nào</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Không tìm thấy hình ảnh nào phù hợp với bộ lọc.'
                  : 'Bạn chưa tạo hình ảnh nào. Hãy bắt đầu tạo hình ảnh đầu tiên!'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Image Detail Dialog */}
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Chi tiết hình ảnh</DialogTitle>
              <DialogDescription>
                Xem chi tiết và quản lý hình ảnh của bạn
              </DialogDescription>
            </DialogHeader>
            
            {selectedImage && (
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={selectedImage.imageUrl} 
                    alt={selectedImage.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedImage.title}</h3>
                    <p className="text-muted-foreground">{selectedImage.prompt}</p>
                  </div>
                  
                  {selectedImage.sourceText && (
                    <div>
                      <Label className="text-sm font-medium">Nội dung tham khảo:</Label>
                      <div className="mt-1 p-3 bg-muted rounded-md max-h-32 overflow-y-auto">
                        <p className="text-sm">{selectedImage.sourceText}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {selectedImage.creditsUsed} tín dụng đã sử dụng
                      </Badge>
                      <Badge variant="outline">{selectedImage.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tạo ngày: {new Date(selectedImage.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    onClick={() => handleDownloadImage(selectedImage.imageUrl, selectedImage.title)}
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Tải xuống
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleDeleteImage}
                    disabled={deleteImageMutation.isPending}
                  >
                    {deleteImageMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xóa...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                    Đóng
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}