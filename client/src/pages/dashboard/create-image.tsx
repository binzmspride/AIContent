import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Image, 
  Loader2, 
  FileText, 
  Eye, 
  Download, 
  RefreshCw,
  ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DashboardLayout } from '@/components/dashboard/Layout';

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
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('realistic');
  const [selectedArticleId, setSelectedArticleId] = useState('none');
  const [sourceText, setSourceText] = useState('');
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch articles for selection
  const { data: articlesData, isLoading: articlesLoading } = useQuery({
    queryKey: ['/api/dashboard/articles'],
  });

  // Fetch recent images
  const { data: imagesData, isLoading: imagesLoading } = useQuery({
    queryKey: ['/api/dashboard/images'],
  });

  // Generate image mutation
  const generateImageMutation = useMutation({
    mutationFn: async (imageData: GeneratedImage) => {
      return apiRequest('/api/dashboard/images', {
        method: 'POST',
        body: JSON.stringify(imageData),
      });
    },
    onSuccess: (data) => {
      setGeneratedImage(data.image);
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/images'] });
      
      // Show success animation
      function fire(particleRatio: number, opts: any) {
        confetti({
          ...opts,
          particleCount: Math.floor(200 * particleRatio),
          spread: 26,
          startVelocity: 55,
        });
      }
      
      fire(0.25, {
        origin: { y: 0.6 },
      });
      fire(0.2, {
        origin: { y: 0.6 },
      });
      
      toast({
        title: "Thành công!",
        description: "Hình ảnh đã được tạo thành công.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi tạo hình ảnh.",
        variant: "destructive",
      });
    },
  });

  const handleArticleSelect = (articleId: string) => {
    setSelectedArticleId(articleId);
    
    if (articleId === 'none' || articleId === 'no-articles') {
      setSourceText('');
      return;
    }

    if (articlesData?.articles) {
      const article = articlesData.articles.find((a: Article) => a.id.toString() === articleId);
      if (article) {
        setSourceText(article.textContent || article.content || '');
        
        // Auto-generate a title based on article title
        if (!title.trim()) {
          setTitle(`Hình ảnh cho: ${article.title}`);
        }
        
        // Auto-generate prompt based on article content
        if (!prompt.trim() && article.textContent) {
          const summary = article.textContent.slice(0, 200) + '...';
          setPrompt(`Tạo hình ảnh minh họa cho nội dung: ${summary}`);
        }
      }
    }
  };

  const handleGenerateImage = () => {
    if (!title.trim() || !prompt.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ tiêu đề và mô tả hình ảnh.",
        variant: "destructive",
      });
      return;
    }

    const imageData: GeneratedImage = {
      title: title.trim(),
      prompt: `${prompt.trim()}. Style: ${imageStyle}`,
      imageUrl: '',
      sourceText: sourceText || undefined,
      creditsUsed: 2,
      status: 'generated',
    };

    generateImageMutation.mutate(imageData);
  };

  const handleRegenerateImage = () => {
    if (generatedImage) {
      generateImageMutation.mutate({
        ...generatedImage,
        id: undefined, // Remove ID to create new image
      });
    }
  };

  const handleReset = () => {
    setTitle('');
    setPrompt('');
    setImageStyle('realistic');
    setSelectedArticleId('none');
    setSourceText('');
    setGeneratedImage(null);
  };

  return (
    <DashboardLayout>
      <div className="w-full px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Tạo hình ảnh với AI</h1>
            <p className="text-muted-foreground mt-2">
              Tạo hình ảnh từ văn bản mô tả hoặc nội dung bài viết SEO
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              2 tín dụng/hình ảnh
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Form - takes 3 columns */}
          <div className="xl:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Tạo hình ảnh với AI
                </CardTitle>
                <CardDescription>
                  Tạo hình ảnh từ văn bản mô tả hoặc nội dung bài viết SEO
                </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column - Basic Info */}
                <div className="space-y-4">
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
                      rows={8}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageStyle">Phong cách hình ảnh</Label>
                    <Select value={imageStyle} onValueChange={setImageStyle}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phong cách hình ảnh" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realistic">Thực tế (Realistic)</SelectItem>
                        <SelectItem value="cartoon">Hoạt hình (Cartoon)</SelectItem>
                        <SelectItem value="anime">Anime</SelectItem>
                        <SelectItem value="watercolor">Màu nước (Watercolor)</SelectItem>
                        <SelectItem value="oil_painting">Sơn dầu (Oil Painting)</SelectItem>
                        <SelectItem value="sketch">Phác thảo (Sketch)</SelectItem>
                        <SelectItem value="minimalist">Tối giản (Minimalist)</SelectItem>
                        <SelectItem value="vintage">Cổ điển (Vintage)</SelectItem>
                        <SelectItem value="futuristic">Tương lai (Futuristic)</SelectItem>
                        <SelectItem value="abstract">Trừu tượng (Abstract)</SelectItem>
                        <SelectItem value="pop_art">Nghệ thuật Pop (Pop Art)</SelectItem>
                        <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Right column - Article Source */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="article-select">Chọn bài viết làm nguồn (Tùy chọn)</Label>
                    <Select value={selectedArticleId} onValueChange={handleArticleSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn bài viết để sử dụng nội dung" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Không sử dụng bài viết</SelectItem>
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
                      <div className="p-3 bg-muted rounded-md max-h-48 overflow-y-auto">
                        <p className="text-sm whitespace-pre-wrap">{sourceText}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <Button 
                  onClick={handleGenerateImage}
                  disabled={generateImageMutation.isPending || !title.trim() || !prompt.trim()}
                  className="flex-1"
                  size="lg"
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
                <Button variant="outline" onClick={handleReset} size="lg">
                  Đặt lại
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Image Preview */}
          {generatedImage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Hình ảnh đã tạo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={generatedImage.imageUrl} 
                    alt={generatedImage.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.svg';
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">{generatedImage.title}</h3>
                  <div className="text-sm text-muted-foreground">
                    <p className="line-clamp-3">{generatedImage.prompt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {generatedImage.creditsUsed} tín dụng
                    </Badge>
                    <Badge variant="outline">{generatedImage.status}</Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleRegenerateImage}
                    disabled={generateImageMutation.isPending}
                    variant="outline"
                    size="sm"
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
                  <Button asChild variant="outline" size="sm">
                    <a href={generatedImage.imageUrl} download target="_blank">
                      <Download className="mr-2 h-4 w-4" />
                      Tải xuống
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips & Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Hướng dẫn và mẹo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p><strong>Mô tả hiệu quả:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Sử dụng mô tả chi tiết về đối tượng, màu sắc, bối cảnh</li>
                  <li>Thêm từ khóa như "chất lượng cao", "4K", "HDR" để có hình ảnh đẹp hơn</li>
                  <li>Mô tả cảm xúc và không khí bạn muốn truyền tải</li>
                </ul>
              </div>
              
              <div className="text-sm space-y-2">
                <p><strong>Phong cách phổ biến:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Realistic:</strong> Phù hợp cho ảnh sản phẩm, doanh nghiệp</li>
                  <li><strong>Minimalist:</strong> Tốt cho logo, biểu tượng đơn giản</li>
                  <li><strong>Cartoon:</strong> Phù hợp cho nội dung giải trí, trẻ em</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          </div>

          {/* Right Sidebar - Recent Images */}
          <div className="xl:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Hình ảnh gần đây
                </CardTitle>
              </CardHeader>
              <CardContent>
                {imagesLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">Đang tải...</p>
                  </div>
                ) : imagesData?.images?.length > 0 ? (
                  <div className="space-y-3">
                    {imagesData.images.slice(0, 6).map((image: GeneratedImage) => (
                      <div key={image.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
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
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {image.prompt}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                              {image.creditsUsed} tín dụng
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setTitle(image.title);
                                setPrompt(image.prompt.replace(/\. Style:.*$/, ''));
                              }}
                              className="text-xs"
                            >
                              Sử dụng lại
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Chưa có hình ảnh nào
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tạo hình ảnh đầu tiên của bạn!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}