import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/dashboard/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Image, Coins, FileText, Loader2, RefreshCw, Download, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Article {
  id: number;
  title: string;
  content: string;
  textContent: string;
  createdAt: string;
  status: string;
}

interface GeneratedImage {
  id?: number;
  title: string;
  prompt: string;
  imageUrl: string;
  sourceText?: string;
  creditsUsed: number;
  status: string;
  createdAt?: string;
}

export default function CreateImagePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState<string>('');
  const [sourceText, setSourceText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);

  // Fetch user's articles
  const { data: articlesData, isLoading: articlesLoading } = useQuery({
    queryKey: ['/api/dashboard/articles'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/dashboard/articles');
      const data = await res.json();
      return data.success ? data.data : { articles: [] };
    },
  });

  // Fetch user's generated images
  const { data: imagesData, isLoading: imagesLoading } = useQuery({
    queryKey: ['/api/dashboard/images'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/dashboard/images');
      const data = await res.json();
      return data.success ? data.data : { images: [] };
    },
  });

  // Generate image mutation
  const generateImageMutation = useMutation({
    mutationFn: async (imageData: {
      title: string;
      prompt: string;
      sourceText?: string;
      articleId?: number;
    }) => {
      const res = await apiRequest('POST', '/api/dashboard/images/generate', imageData);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate image');
      }
      return data.data;
    },
    onSuccess: (data) => {
      setGeneratedImage(data);
      setShowPreview(true);
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/images'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Thành công",
        description: "Hình ảnh đã được tạo thành công!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo hình ảnh",
        variant: "destructive",
      });
    },
  });

  const handleArticleSelect = (articleId: string) => {
    setSelectedArticleId(articleId);
    if (articleId && articlesData?.articles) {
      const article = articlesData.articles.find((a: Article) => a.id.toString() === articleId);
      if (article) {
        setSourceText(article.textContent || '');
        if (!title) {
          setTitle(`Hình ảnh cho: ${article.title}`);
        }
      }
    } else {
      setSourceText('');
    }
  };

  const handleGenerateImage = () => {
    if (!title.trim() || !prompt.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề và mô tả hình ảnh",
        variant: "destructive",
      });
      return;
    }

    generateImageMutation.mutate({
      title: title.trim(),
      prompt: prompt.trim(),
      sourceText: sourceText.trim() || undefined,
      articleId: selectedArticleId ? parseInt(selectedArticleId) : undefined,
    });
  };

  const handleRegenerateImage = () => {
    if (generatedImage) {
      generateImageMutation.mutate({
        title: generatedImage.title,
        prompt: generatedImage.prompt,
        sourceText: generatedImage.sourceText,
        articleId: selectedArticleId ? parseInt(selectedArticleId) : undefined,
      });
    }
  };

  const handleReset = () => {
    setTitle('');
    setPrompt('');
    setSelectedArticleId('');
    setSourceText('');
    setGeneratedImage(null);
    setShowPreview(false);
  };

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Tạo hình ảnh với AI</h1>
            <p className="text-muted-foreground mt-2">
              Tạo hình ảnh từ văn bản mô tả hoặc nội dung bài viết SEO
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Coins className="h-3 w-3" />
              {user?.credits || 0} tín dụng
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Thông tin hình ảnh
                </CardTitle>
                <CardDescription>
                  Nhập thông tin để tạo hình ảnh mới
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề hình ảnh</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề cho hình ảnh..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt">Mô tả hình ảnh (Prompt)</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Mô tả chi tiết hình ảnh bạn muốn tạo..."
                    rows={4}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="article">Lấy nội dung từ bài viết (Tùy chọn)</Label>
                  <Select value={selectedArticleId} onValueChange={handleArticleSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn bài viết để lấy nội dung..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Không chọn bài viết nào</SelectItem>
                      {articlesData?.articles?.map((article: Article) => (
                        <SelectItem key={article.id} value={article.id.toString()}>
                          {article.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {sourceText && (
                  <div className="space-y-2">
                    <Label>Nội dung văn bản từ bài viết</Label>
                    <div className="p-3 bg-muted rounded-md max-h-32 overflow-y-auto">
                      <p className="text-sm">{sourceText}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    onClick={handleGenerateImage}
                    disabled={generateImageMutation.isPending || !title.trim() || !prompt.trim()}
                    className="flex-1"
                  >
                    {generateImageMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <Image className="mr-2 h-4 w-4" />
                        Tạo hình ảnh
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    Đặt lại
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Images */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Hình ảnh gần đây
                </CardTitle>
              </CardHeader>
              <CardContent>
                {imagesLoading ? (
                  <div className="text-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">Đang tải...</p>
                  </div>
                ) : imagesData?.images?.length > 0 ? (
                  <div className="space-y-3">
                    {imagesData.images.slice(0, 5).map((image: GeneratedImage) => (
                      <div key={image.id} className="border rounded-lg p-3">
                        <div className="aspect-video bg-muted rounded-md mb-2 overflow-hidden">
                          <img 
                            src={image.imageUrl} 
                            alt={image.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-image.svg';
                            }}
                          />
                        </div>
                        <h4 className="font-medium text-sm truncate">{image.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {image.creditsUsed} tín dụng • {new Date(image.createdAt || '').toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Chưa có hình ảnh nào được tạo
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Xem trước hình ảnh</DialogTitle>
              <DialogDescription>
                Hình ảnh đã được tạo thành công. Bạn có thể tạo lại hoặc lưu hình ảnh này.
              </DialogDescription>
            </DialogHeader>
            
            {generatedImage && (
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={generatedImage.imageUrl} 
                    alt={generatedImage.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">{generatedImage.title}</h3>
                  <p className="text-sm text-muted-foreground">{generatedImage.prompt}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {generatedImage.creditsUsed} tín dụng đã sử dụng
                    </Badge>
                    <Badge variant="outline">{generatedImage.status}</Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleRegenerateImage}
                    disabled={generateImageMutation.isPending}
                    variant="outline"
                  >
                    {generateImageMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tạo lại...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Tạo lại
                      </>
                    )}
                  </Button>
                  <Button asChild>
                    <a href={generatedImage.imageUrl} download target="_blank">
                      <Download className="mr-2 h-4 w-4" />
                      Tải xuống
                    </a>
                  </Button>
                  <Button variant="outline" onClick={() => setShowPreview(false)}>
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