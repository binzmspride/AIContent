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
import { Image, Coins, FileText, Loader2, RefreshCw, Download, Eye, Save, ChevronDown, ChevronUp, Link, X, Hash, Users, MessageCircle, Play, Info, Trash2, Copy, Zap } from 'lucide-react';
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
  const [showLibraryDialog, setShowLibraryDialog] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [expandedPrompts, setExpandedPrompts] = useState<Record<string, boolean>>({});
  const [savedImageIds, setSavedImageIds] = useState<Set<number>>(new Set());
  const [selectedImageForDetail, setSelectedImageForDetail] = useState<GeneratedImage | null>(null);
  const [showImageDetailDialog, setShowImageDetailDialog] = useState(false);
  const [activePreviewFormat, setActivePreviewFormat] = useState<string>('original');

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

  // Truncate text component
  const TruncatedText = ({ text, maxLength = 100, id }: { text: string; maxLength?: number; id: string }) => {
    const isExpanded = expandedPrompts[id] || false;
    const shouldTruncate = text.length > maxLength;
    
    const toggleExpanded = () => {
      setExpandedPrompts(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    };

    if (!shouldTruncate) {
      return <span className="text-sm text-muted-foreground">{text}</span>;
    }

    return (
      <div className="text-sm text-muted-foreground">
        <span>{isExpanded ? text : `${text.slice(0, maxLength)}...`}</span>
        <button
          onClick={toggleExpanded}
          className="ml-2 text-blue-600 hover:text-blue-800 underline text-xs inline-flex items-center gap-1"
        >
          {isExpanded ? (
            <>
              Thu gọn <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              Xem thêm <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      </div>
    );
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/images'] });
      
      // Mark this image as saved
      if (generatedImage?.id) {
        setSavedImageIds(prev => new Set(prev.add(generatedImage.id!)));
      }
      
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

  // Get preview style for social media formats
  const getPreviewStyle = (format: string) => {
    switch (format) {
      case 'facebook':
        return { aspectRatio: '1.91/1', maxWidth: '500px', description: 'Facebook Post (1200x630px)' };
      case 'instagram':
        return { aspectRatio: '1/1', maxWidth: '400px', description: 'Instagram Post (1080x1080px)' };
      case 'twitter':
        return { aspectRatio: '16/9', maxWidth: '500px', description: 'Twitter Post (1200x675px)' };
      case 'linkedin':
        return { aspectRatio: '1.91/1', maxWidth: '500px', description: 'LinkedIn Post (1200x630px)' };
      case 'youtube':
        return { aspectRatio: '16/9', maxWidth: '560px', description: 'YouTube Thumbnail (1280x720px)' };
      default:
        return { aspectRatio: 'auto', maxWidth: '100%', description: 'Kích thước gốc' };
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
                    {imagesData.images
                      .slice(0, 3) // Limit to 3 images
                      .map((image: GeneratedImage) => (
                      <div 
                        key={image.id} 
                        className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          setSelectedImageForDetail(image);
                          setActivePreviewFormat('original');
                          setShowImageDetailDialog(true);
                        }}
                      >
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
                    
                    {/* View More Button */}
                    {imagesData.images.length > 3 && (
                      <Button 
                        variant="outline" 
                        className="w-full mt-3"
                        onClick={() => setShowLibraryDialog(true)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Xem thêm ({imagesData.images.length - 3} ảnh)
                      </Button>
                    )}
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
                  <div className="space-y-1">
                    <p className="text-sm"><span className="font-medium">Chủ đề:</span> {generatedImage.title}</p>
                    <div className="text-sm">
                      <span className="font-medium">Mô tả (prompt):</span>
                      <TruncatedText 
                        text={generatedImage.prompt.split(', photorealistic')[0].split(', cartoon style')[0].split(', anime style')[0].split(', watercolor')[0].split(', oil painting')[0].split(', pencil sketch')[0].split(', minimalist')[0].split(', vintage')[0].split(', futuristic')[0].split(', abstract')[0].split(', pop art')[0].split(', cyberpunk')[0]}
                        maxLength={100}
                        id={`preview-prompt-${generatedImage.id || 'current'}`}
                      />
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Phong cách:</span> 
                      <span className="text-muted-foreground">
                        {imageStyle === 'realistic' && ' Thực tế (Realistic)'}
                        {imageStyle === 'cartoon' && ' Hoạt hình (Cartoon)'}
                        {imageStyle === 'anime' && ' Anime/Manga'}
                        {imageStyle === 'watercolor' && ' Màu nước (Watercolor)'}
                        {imageStyle === 'oil_painting' && ' Sơn dầu (Oil Painting)'}
                        {imageStyle === 'sketch' && ' Phác thảo (Sketch)'}
                        {imageStyle === 'minimalist' && ' Tối giản (Minimalist)'}
                        {imageStyle === 'vintage' && ' Cổ điển (Vintage)'}
                        {imageStyle === 'futuristic' && ' Tương lai (Futuristic)'}
                        {imageStyle === 'abstract' && ' Trừu tượng (Abstract)'}
                        {imageStyle === 'pop_art' && ' Pop Art'}
                        {imageStyle === 'cyberpunk' && ' Cyberpunk'}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
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

        {/* Image Library Dialog */}
        <Dialog open={showLibraryDialog} onOpenChange={setShowLibraryDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Thư viện hình ảnh</DialogTitle>
              <DialogDescription>
                Tất cả hình ảnh đã lưu trong thư viện của bạn
              </DialogDescription>
            </DialogHeader>
            
            <div className="overflow-y-auto max-h-[60vh]">
              {imagesLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Đang tải...</p>
                </div>
              ) : imagesData?.images?.filter((image: GeneratedImage) => image.status === 'saved').length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {imagesData.images
                    .filter((image: GeneratedImage) => image.status === 'saved')
                    .map((image: GeneratedImage) => (
                    <div key={image.id} className="border rounded-lg overflow-hidden">
                      <div className="aspect-video bg-muted overflow-hidden">
                        <img 
                          src={image.imageUrl} 
                          alt={image.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.svg';
                          }}
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm truncate mb-1">{image.title}</h4>
                        <div className="mb-2">
                          <TruncatedText 
                            text={image.prompt}
                            maxLength={100}
                            id={`library-prompt-${image.id}`}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {image.creditsUsed} tín dụng • {new Date(image.createdAt || '').toLocaleDateString('vi-VN')}
                        </p>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1 text-xs"
                            asChild
                          >
                            <a href={image.imageUrl} download target="_blank">
                              <Download className="mr-1 h-3 w-3" />
                              Tải xuống
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Image className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Chưa có hình ảnh nào trong thư viện
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setShowLibraryDialog(false)}>
                Đóng
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Image Detail Dialog */}
        <Dialog open={showImageDetailDialog} onOpenChange={setShowImageDetailDialog}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0">
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b p-6">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Image className="h-6 w-6" />
                  Chi tiết hình ảnh
                </DialogTitle>
                <DialogDescription className="text-base">
                  Xem chi tiết và xem hình ảnh với các kích thước mạng xã hội
                </DialogDescription>
              </DialogHeader>
            </div>
            
            {selectedImageForDetail && (
              <div className="p-6 space-y-8">
                {/* Social Media Preview Tabs */}
                <div className="flex gap-1 bg-muted p-1 rounded-lg overflow-x-auto">
                  <Button 
                    size="sm" 
                    variant={activePreviewFormat === 'original' ? 'default' : 'outline'} 
                    className="flex-1"
                    onClick={() => setActivePreviewFormat('original')}
                  >
                    <Link className="mr-1 h-3 w-3" />
                    Kích thước gốc
                  </Button>
                  <Button 
                    size="sm" 
                    variant={activePreviewFormat === 'facebook' ? 'default' : 'outline'} 
                    className="flex-1"
                    onClick={() => setActivePreviewFormat('facebook')}
                  >
                    <Hash className="mr-1 h-3 w-3" />
                    Facebook Post
                  </Button>
                  <Button 
                    size="sm" 
                    variant={activePreviewFormat === 'instagram' ? 'default' : 'outline'} 
                    className="flex-1"
                    onClick={() => setActivePreviewFormat('instagram')}
                  >
                    <Hash className="mr-1 h-3 w-3" />
                    Instagram Post
                  </Button>
                  <Button 
                    size="sm" 
                    variant={activePreviewFormat === 'twitter' ? 'default' : 'outline'} 
                    className="flex-1"
                    onClick={() => setActivePreviewFormat('twitter')}
                  >
                    <MessageCircle className="mr-1 h-3 w-3" />
                    Twitter Post
                  </Button>
                  <Button 
                    size="sm" 
                    variant={activePreviewFormat === 'linkedin' ? 'default' : 'outline'} 
                    className="flex-1"
                    onClick={() => setActivePreviewFormat('linkedin')}
                  >
                    <Users className="mr-1 h-3 w-3" />
                    LinkedIn Post
                  </Button>
                  <Button 
                    size="sm" 
                    variant={activePreviewFormat === 'youtube' ? 'default' : 'outline'} 
                    className="flex-1"
                    onClick={() => setActivePreviewFormat('youtube')}
                  >
                    <Play className="mr-1 h-3 w-3" />
                    YouTube Thumbnail
                  </Button>
                </div>

                {/* Enhanced Social Media Preview */}
                <div className="space-y-4">
                  {/* Format Title and Description */}
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">
                      {getPreviewStyle(activePreviewFormat).description.split('(')[0].trim()}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {getPreviewStyle(activePreviewFormat).description.includes('(') 
                        ? getPreviewStyle(activePreviewFormat).description.split('(')[1].replace(')', '')
                        : 'Kích thước gốc'
                      }
                    </p>
                  </div>

                  {/* Social Media Mockup Container */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-8 rounded-xl border shadow-inner">
                    <div className="mx-auto flex flex-col items-center">
                      {activePreviewFormat !== 'original' && (
                        <div className="w-full max-w-md mb-4">
                          {/* Social Media Header Mockup */}
                          <div className="bg-white dark:bg-gray-800 rounded-t-lg p-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full flex items-center justify-center">
                                {activePreviewFormat === 'instagram' && <Hash className="h-4 w-4 text-white" />}
                                {activePreviewFormat === 'facebook' && <Hash className="h-4 w-4 text-white" />}
                                {activePreviewFormat === 'twitter' && <MessageCircle className="h-4 w-4 text-white" />}
                                {activePreviewFormat === 'linkedin' && <Users className="h-4 w-4 text-white" />}
                                {activePreviewFormat === 'youtube' && <Play className="h-4 w-4 text-white" />}
                              </div>
                              <div>
                                <p className="font-medium text-sm">your_account</p>
                                <p className="text-xs text-muted-foreground">Sponsored</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Image Preview */}
                      <div 
                        className={`rounded-lg overflow-hidden shadow-xl ${
                          activePreviewFormat === 'original' ? 'border-2 border-dashed border-primary/30' : 'border border-gray-200 dark:border-gray-700'
                        }`}
                        style={{
                          aspectRatio: getPreviewStyle(activePreviewFormat).aspectRatio,
                          maxWidth: getPreviewStyle(activePreviewFormat).maxWidth,
                          width: '100%'
                        }}
                      >
                        <img 
                          src={selectedImageForDetail.imageUrl} 
                          alt={selectedImageForDetail.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.svg';
                          }}
                        />
                      </div>

                      {activePreviewFormat !== 'original' && (
                        <div className="w-full max-w-md mt-0">
                          {/* Social Media Footer Mockup */}
                          <div className="bg-white dark:bg-gray-800 rounded-b-lg p-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Caption của bạn... #hashtag
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Usage Guidelines */}
                  {activePreviewFormat !== 'original' && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Hướng dẫn sử dụng cho {getPreviewStyle(activePreviewFormat).description.split('(')[0].trim()}:
                      </h4>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        {activePreviewFormat === 'instagram' && (
                          <>
                            <li>• Tối ưu cho thuật toán Instagram</li>
                            <li>• Phù hợp với định dạng hiển thị của Instagram</li>
                          </>
                        )}
                        {activePreviewFormat === 'facebook' && (
                          <>
                            <li>• Tối ưu cho Facebook News Feed</li>
                            <li>• Kích thước lý tưởng cho chia sẻ trên Facebook</li>
                          </>
                        )}
                        {activePreviewFormat === 'twitter' && (
                          <>
                            <li>• Tối ưu cho Twitter timeline</li>
                            <li>• Hiển thị tốt trên cả desktop và mobile</li>
                          </>
                        )}
                        {activePreviewFormat === 'linkedin' && (
                          <>
                            <li>• Chuyên nghiệp cho LinkedIn</li>
                            <li>• Phù hợp với nội dung kinh doanh</li>
                          </>
                        )}
                        {activePreviewFormat === 'youtube' && (
                          <>
                            <li>• Kích thước thumbnail chuẩn YouTube</li>
                            <li>• Tối ưu cho hiển thị trong danh sách video</li>
                          </>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Image Details Section */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Thông tin cơ bản
                    </h3>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 space-y-4">
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-muted-foreground">Tên hình ảnh:</span>
                        <h4 className="font-medium text-lg">{selectedImageForDetail.title}</h4>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-muted-foreground">Prompt:</span>
                        <p className="text-sm leading-relaxed bg-white dark:bg-gray-800 p-3 rounded-lg border">
                          {selectedImageForDetail.prompt && (
                            <TruncatedText 
                              text={selectedImageForDetail.prompt} 
                              maxLength={200}
                              id={`detail-${selectedImageForDetail.id}`}
                            />
                          )}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Credits sử dụng:</span>
                        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {selectedImageForDetail.creditsUsed} credits
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Trạng thái:</span>
                        <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800">
                          Đã lưu
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Ngày tạo:</span>
                        <span className="text-sm">{new Date(selectedImageForDetail.createdAt || '').toLocaleDateString('vi-VN', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Thao tác nhanh
                    </h3>
                    <div className="space-y-3">
                      <Button 
                        className="w-full justify-start gap-3 h-12" 
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedImageForDetail.imageUrl);
                          toast({ 
                            title: "Thành công!", 
                            description: "Đã sao chép URL hình ảnh vào clipboard" 
                          });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                        Sao chép URL hình ảnh
                      </Button>
                      <Button 
                        className="w-full justify-start gap-3 h-12" 
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = selectedImageForDetail.imageUrl;
                          link.download = selectedImageForDetail.title + '.jpg';
                          link.click();
                          toast({ 
                            title: "Đang tải xuống...", 
                            description: "Hình ảnh sẽ được tải xuống shortly" 
                          });
                        }}
                      >
                        <Download className="h-4 w-4" />
                        Tải xuống hình ảnh
                      </Button>
                      <Button 
                        className="w-full justify-start gap-3 h-12" 
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedImageForDetail.prompt);
                          toast({ 
                            title: "Thành công!", 
                            description: "Đã sao chép prompt vào clipboard" 
                          });
                        }}
                      >
                        <FileText className="h-4 w-4" />
                        Sao chép prompt
                      </Button>
                      <Button 
                        className="w-full justify-start gap-3 h-12" 
                        variant="destructive"
                        onClick={() => {
                          // Add delete functionality here if needed
                          toast({ 
                            title: "Chức năng đang phát triển", 
                            description: "Tính năng xóa hình ảnh sẽ sớm được bổ sung" 
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa hình ảnh
                      </Button>
                    </div>
                    
                    {/* Close Button */}
                    <div className="pt-4 border-t">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowImageDetailDialog(false)}
                        className="w-full"
                      >
                        Đóng
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}