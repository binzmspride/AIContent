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
import { Image, Coins, FileText, Loader2, RefreshCw, Download, Eye, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

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
  const [imageStyle, setImageStyle] = useState('realistic');
  const [showPreview, setShowPreview] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);

  // Confetti animation function
  const triggerConfetti = () => {
    // Create multiple bursts for better effect
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    // Multiple confetti bursts with different colors and shapes
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
    });
    
    fire(0.2, {
      spread: 60,
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1']
    });
    
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#FFD700', '#FFEAA7', '#96CEB4']
    });
    
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#FF6B6B', '#45B7D1', '#4ECDC4']
    });
    
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#FFD700', '#FFEAA7']
    });
  };

  // Fetch user's articles
  const { data: articlesData, isLoading: articlesLoading } = useQuery({
    queryKey: ['/api/dashboard/articles'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/dashboard/articles');
      const data = await res.json();
      console.log('Articles API response:', data);
      if (data.success && data.data) {
        console.log('Articles array:', data.data.articles);
        return data.data;
      }
      return { articles: [] };
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
      
      // Trigger confetti animation
      setTimeout(() => {
        triggerConfetti();
      }, 500); // Small delay to let the dialog open first
      
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

  // Function to clean HTML content and extract meaningful text
  const cleanHtmlContent = (htmlContent: string): string => {
    if (!htmlContent) return '';
    
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Remove script and style elements
    const scripts = tempDiv.querySelectorAll('script, style');
    scripts.forEach(el => el.remove());
    
    // Get text content
    let text = tempDiv.textContent || tempDiv.innerText || '';
    
    // Clean up the text
    text = text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
      .trim(); // Remove leading/trailing whitespace
    
    // If the text contains meta descriptions, extract the main content
    if (text.includes('Meta Description:')) {
      // Try to extract meaningful paragraphs, excluding meta descriptions
      const paragraphs = tempDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
      const meaningfulText = Array.from(paragraphs)
        .map(p => p.textContent?.trim())
        .filter(text => text && text.length > 10 && !text.includes('Meta Description:') && !text.includes('```'))
        .join('. ');
      
      if (meaningfulText) {
        return meaningfulText;
      }
    }
    
    // Return the full cleaned text without any character limits
    return text;
  };

  const handleArticleSelect = (articleId: string) => {
    setSelectedArticleId(articleId);
    if (articleId && articleId !== 'none' && articlesData?.articles) {
      const article = articlesData.articles.find((a: Article) => a.id.toString() === articleId);
      if (article) {
        // Use the content field (which contains HTML) and clean it
        const cleanedText = cleanHtmlContent(article.content);
        setSourceText(cleanedText);
        // Auto-fill the prompt/description field with the cleaned text
        setPrompt(cleanedText);
        if (!title) {
          setTitle(`Hình ảnh cho: "${article.title}"`);
        }
      }
    } else {
      setSourceText('');
      setPrompt('');
    }
  };

  // Function to get style description for prompt
  const getStyleDescription = (style: string): string => {
    const styleDescriptions: Record<string, string> = {
      realistic: "photorealistic, high quality, detailed",
      cartoon: "cartoon style, colorful, animated",
      anime: "anime style, manga art, Japanese animation",
      watercolor: "watercolor painting, soft brushstrokes, artistic",
      oil_painting: "oil painting style, classic art, textured brushwork",
      sketch: "pencil sketch, hand-drawn, artistic linework",
      minimalist: "minimalist design, clean, simple, modern",
      vintage: "vintage style, retro, classic, aged",
      futuristic: "futuristic, sci-fi, modern technology, sleek",
      abstract: "abstract art, creative, artistic interpretation",
      pop_art: "pop art style, bold colors, graphic design",
      cyberpunk: "cyberpunk style, neon colors, futuristic urban"
    };
    return styleDescriptions[style] || "high quality, detailed";
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

    // Combine the user prompt with style description
    const styleDescription = getStyleDescription(imageStyle);
    const enhancedPrompt = `${prompt.trim()}, ${styleDescription}`;

    generateImageMutation.mutate({
      title: title.trim(),
      prompt: enhancedPrompt,
      sourceText: sourceText.trim() || undefined,
      articleId: selectedArticleId && selectedArticleId !== 'none' ? parseInt(selectedArticleId) : undefined,
    });
  };

  const handleRegenerateImage = () => {
    if (generatedImage) {
      // Combine the original prompt with current style
      const styleDescription = getStyleDescription(imageStyle);
      const enhancedPrompt = `${generatedImage.prompt}, ${styleDescription}`;
      
      generateImageMutation.mutate({
        title: generatedImage.title,
        prompt: enhancedPrompt,
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
    setImageStyle('realistic');
    setGeneratedImage(null);
    setShowPreview(false);
  };

  // Save image to library mutation
  const saveImageMutation = useMutation({
    mutationFn: async (imageData: GeneratedImage) => {
      const response = await apiRequest('POST', '/api/dashboard/images/save', {
        title: imageData.title,
        prompt: imageData.prompt,
        imageUrl: imageData.imageUrl,
        sourceText: imageData.sourceText,
        creditsUsed: imageData.creditsUsed
      });
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to save image');
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/images'] });
      
      // Trigger confetti animation for successful save
      triggerConfetti();
      
      toast({
        title: "Thành công",
        description: "Hình ảnh đã được lưu vào thư viện của bạn!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu hình ảnh",
        variant: "destructive",
      });
    },
  });

  const handleSaveImage = () => {
    if (generatedImage) {
      saveImageMutation.mutate(generatedImage);
    }
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

                <div className="space-y-2">
                  <Label htmlFor="imageStyle">Phong cách hình ảnh</Label>
                  <Select value={imageStyle} onValueChange={setImageStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phong cách hình ảnh..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realistic">Thực tế (Realistic)</SelectItem>
                      <SelectItem value="cartoon">Hoạt hình (Cartoon)</SelectItem>
                      <SelectItem value="anime">Anime/Manga</SelectItem>
                      <SelectItem value="watercolor">Màu nước (Watercolor)</SelectItem>
                      <SelectItem value="oil_painting">Sơn dầu (Oil Painting)</SelectItem>
                      <SelectItem value="sketch">Phác thảo (Sketch)</SelectItem>
                      <SelectItem value="minimalist">Tối giản (Minimalist)</SelectItem>
                      <SelectItem value="vintage">Cổ điển (Vintage)</SelectItem>
                      <SelectItem value="futuristic">Tương lai (Futuristic)</SelectItem>
                      <SelectItem value="abstract">Trừu tượng (Abstract)</SelectItem>
                      <SelectItem value="pop_art">Pop Art</SelectItem>
                      <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Chọn phong cách nghệ thuật cho hình ảnh của bạn
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="article">Lấy nội dung từ bài viết (Tùy chọn)</Label>
                  <Select value={selectedArticleId} onValueChange={handleArticleSelect} disabled={articlesLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        articlesLoading 
                          ? "Đang tải bài viết..." 
                          : articlesData?.articles?.length > 0 
                            ? "Chọn bài viết để lấy nội dung..." 
                            : "Không có bài viết nào"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không chọn bài viết nào</SelectItem>
                      {articlesData?.articles?.length > 0 ? (
                        articlesData.articles.map((article: Article) => (
                          <SelectItem key={article.id} value={article.id.toString()}>
                            {article.title}
                          </SelectItem>
                        ))
                      ) : (
                        !articlesLoading && (
                          <SelectItem value="no-articles" disabled>
                            Không có bài viết nào
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  {articlesLoading && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Đang tải danh sách bài viết...
                    </p>
                  )}
                  {!articlesLoading && articlesData?.articles?.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Bạn chưa có bài viết nào. Hãy tạo bài viết trước để sử dụng nội dung.
                    </p>
                  )}
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
                    onClick={handleSaveImage}
                    disabled={saveImageMutation.isPending}
                    className="flex-1"
                  >
                    {saveImageMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Lưu
                      </>
                    )}
                  </Button>
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
                  <Button asChild variant="outline">
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