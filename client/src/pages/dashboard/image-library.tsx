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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Loader2, Search, Download, Eye, Trash2, Calendar, Filter, Facebook, Instagram, Twitter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

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
  const [selectedSocialFormat, setSelectedSocialFormat] = useState('original');

  // Simple confetti function for downloads
  const triggerDownloadConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
    });
  };

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
    
    // Trigger confetti for successful download
    triggerDownloadConfetti();
    
    toast({
      title: "Thành công",
      description: "Hình ảnh đã được tải xuống!",
    });
  };

  // Social media format configurations
  const socialFormats = {
    original: { name: 'Kích thước gốc', aspect: 'aspect-auto', description: 'Kích thước gốc của hình ảnh' },
    facebook_post: { name: 'Facebook Post', aspect: 'aspect-[1.91/1]', description: '1200 x 630px - Tối ưu cho bài đăng Facebook' },
    instagram_post: { name: 'Instagram Post', aspect: 'aspect-square', description: '1080 x 1080px - Tối ưu cho bài đăng Instagram' },
    twitter_post: { name: 'Twitter Post', aspect: 'aspect-[16/9]', description: '1200 x 675px - Tối ưu cho bài đăng Twitter' },
    linkedin_post: { name: 'LinkedIn Post', aspect: 'aspect-[1.91/1]', description: '1200 x 630px - Tối ưu cho LinkedIn' },
    youtube_thumbnail: { name: 'YouTube Thumbnail', aspect: 'aspect-[16/9]', description: '1280 x 720px - Tối ưu cho thumbnail YouTube' }
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredImages.map((image: GeneratedImage) => (
              <div 
                key={image.id} 
                className="group relative cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:-translate-y-3"
                onClick={() => handleImageClick(image)}
              >
                {/* Main Card Container with Enhanced Parallax */}
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  {/* Gradient Overlay for Depth */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10 dark:to-white/10 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Enhanced Image Container with Multi-Layer Parallax */}
                  <div className="relative aspect-square overflow-hidden rounded-t-2xl">
                    {/* Background Layer (slowest movement) */}
                    <div className="absolute inset-0 transform group-hover:scale-125 transition-transform duration-1000 ease-out">
                      <img 
                        src={image.imageUrl} 
                        alt={image.title}
                        className="w-full h-full object-cover blur-lg opacity-20"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-image.svg';
                        }}
                      />
                    </div>
                    
                    {/* Middle Layer (medium movement) */}
                    <div className="absolute inset-0 transform group-hover:scale-110 transition-transform duration-700 ease-out">
                      <img 
                        src={image.imageUrl} 
                        alt={image.title}
                        className="w-full h-full object-cover blur-sm opacity-40"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-image.svg';
                        }}
                      />
                    </div>
                    
                    {/* Foreground Image (fastest movement) */}
                    <div className="relative z-20 transform group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500 ease-out">
                      <img 
                        src={image.imageUrl} 
                        alt={image.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-image.svg';
                        }}
                      />
                    </div>
                    
                    {/* Enhanced Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1200 ease-out"></div>
                    
                    {/* Status Badge with Animation */}
                    <div className="absolute top-3 right-3 z-30 transform group-hover:scale-110 transition-transform duration-300">
                      <Badge variant="secondary" className="bg-green-100/90 dark:bg-green-900/90 text-green-800 dark:text-green-200 shadow-lg backdrop-blur-sm">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        {image.status}
                      </Badge>
                    </div>
                    
                    {/* Floating Action Buttons */}
                    <div className="absolute top-3 left-3 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transform -translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(image);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadImage(image.imageUrl, image.title);
                        }}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Content Area with Floating Effect */}
                  <div className="p-4 relative z-20 transform group-hover:-translate-y-1 transition-transform duration-300">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {image.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {image.prompt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            {image.creditsUsed} credits
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(image.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                      
                      {/* Hover Actions */}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 px-2 text-xs flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageClick(image);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Xem
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 px-2 text-xs flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadImage(image.imageUrl, image.title);
                          }}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Tải
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Glow Effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* Floating Shadow */}
                <div className="absolute inset-0 bg-black/10 dark:bg-white/5 rounded-2xl -z-10 transform translate-y-2 scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-4 transition-all duration-500"></div>
              </div>
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
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết hình ảnh</DialogTitle>
              <DialogDescription>
                Xem chi tiết và xem trước hình ảnh với các kích thước mạng xã hội
              </DialogDescription>
            </DialogHeader>
            
            {selectedImage && (
              <div className="space-y-6">
                {/* Social Media Format Tabs */}
                <Tabs value={selectedSocialFormat} onValueChange={setSelectedSocialFormat} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
                    {Object.entries(socialFormats).map(([key, format]) => (
                      <TabsTrigger key={key} value={key} className="text-xs flex items-center gap-1">
                        {key === 'facebook_post' && <Facebook className="h-3 w-3" />}
                        {key === 'instagram_post' && <Instagram className="h-3 w-3" />}
                        {key === 'twitter_post' && <Twitter className="h-3 w-3" />}
                        {key === 'original' && <Image className="h-3 w-3" />}
                        <span className="truncate">{format.name}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {Object.entries(socialFormats).map(([key, format]) => (
                    <TabsContent key={key} value={key} className="space-y-4">
                      <div className="text-center">
                        <h3 className="font-semibold text-lg">{format.name}</h3>
                        <p className="text-sm text-muted-foreground">{format.description}</p>
                      </div>
                      
                      <div className="flex justify-center">
                        <div className="relative">
                          {/* Platform Frame Simulation */}
                          {key.includes('facebook') && (
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-md">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                  <Facebook className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <div className="font-semibold text-sm">Tên trang của bạn</div>
                                  <div className="text-xs text-gray-500">2 giờ trước</div>
                                </div>
                              </div>
                              <div className={`${format.aspect} bg-muted rounded overflow-hidden`}>
                                <img 
                                  src={selectedImage.imageUrl} 
                                  alt={selectedImage.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="mt-3 text-sm">Mô tả bài đăng của bạn...</div>
                            </div>
                          )}
                          
                          {key.includes('instagram') && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border max-w-md">
                              <div className="flex items-center gap-3 p-3 border-b">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                  <Instagram className="h-4 w-4 text-white" />
                                </div>
                                <div className="font-semibold text-sm">your_account</div>
                              </div>
                              <div className={`${format.aspect} bg-muted overflow-hidden`}>
                                <img 
                                  src={selectedImage.imageUrl} 
                                  alt={selectedImage.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-3">
                                <div className="text-sm">Caption của bạn... #hashtag</div>
                              </div>
                            </div>
                          )}
                          
                          {key.includes('twitter') && (
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border max-w-md">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                                  <Twitter className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <div className="font-semibold text-sm">Tên tài khoản</div>
                                  <div className="text-xs text-gray-500">@username</div>
                                </div>
                              </div>
                              <div className="text-sm mb-3">Tweet content của bạn...</div>
                              <div className={`${format.aspect} bg-muted rounded-lg overflow-hidden`}>
                                <img 
                                  src={selectedImage.imageUrl} 
                                  alt={selectedImage.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          )}
                          
                          {key.includes('linkedin') && (
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-md">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center">
                                  <span className="text-white font-bold text-xs">in</span>
                                </div>
                                <div>
                                  <div className="font-semibold text-sm">Tên của bạn</div>
                                  <div className="text-xs text-gray-500">Chức vụ tại Công ty</div>
                                </div>
                              </div>
                              <div className="text-sm mb-3">Nội dung bài đăng LinkedIn...</div>
                              <div className={`${format.aspect} bg-muted rounded overflow-hidden`}>
                                <img 
                                  src={selectedImage.imageUrl} 
                                  alt={selectedImage.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          )}
                          
                          {key.includes('youtube') && (
                            <div className="bg-black rounded-lg shadow-lg max-w-md">
                              <div className={`${format.aspect} bg-muted rounded-t-lg overflow-hidden relative`}>
                                <img 
                                  src={selectedImage.imageUrl} 
                                  alt={selectedImage.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-1 text-xs rounded">
                                  10:24
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center opacity-90">
                                    <div className="w-0 h-0 border-l-4 border-l-white border-y-2 border-y-transparent ml-1"></div>
                                  </div>
                                </div>
                              </div>
                              <div className="p-3 text-white">
                                <div className="font-semibold text-sm">Tiêu đề video của bạn</div>
                                <div className="text-xs text-gray-300">Tên kênh • 1K lượt xem</div>
                              </div>
                            </div>
                          )}
                          
                          {key === 'original' && (
                            <div className={`${format.aspect} bg-muted rounded-lg overflow-hidden max-w-md border-2 border-dashed border-gray-300`}>
                              <img 
                                src={selectedImage.imageUrl} 
                                alt={selectedImage.title}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {key !== 'original' && (
                        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                            Hướng dẫn sử dụng cho {format.name}:
                          </h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                            {key.includes('facebook') && (
                              <>
                                <li>• Tốt nhất cho engagement trên Facebook</li>
                                <li>• Hiển thị rõ ràng trên timeline và news feed</li>
                              </>
                            )}
                            {key.includes('instagram') && (
                              <>
                                <li>• Tối ưu cho thuật toán Instagram</li>
                                <li>• Phù hợp với định dạng hiển thị của Instagram</li>
                              </>
                            )}
                            {key.includes('twitter') && (
                              <>
                                <li>• Hiển thị đẹp trên Twitter timeline</li>
                                <li>• Tăng tỷ lệ retweet và like</li>
                              </>
                            )}
                            {key.includes('linkedin') && (
                              <>
                                <li>• Chuyên nghiệp cho môi trường doanh nghiệp</li>
                                <li>• Tăng engagement trong mạng lưới công việc</li>
                              </>
                            )}
                            {key.includes('youtube') && (
                              <>
                                <li>• Thumbnail hấp dẫn tăng click-through rate</li>
                                <li>• Tuân thủ quy chuẩn của YouTube</li>
                              </>
                            )}
                          </ul>
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
                
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