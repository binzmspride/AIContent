import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/dashboard/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, FileText, CheckCircle, Loader2, ArrowRight, Eye, RefreshCw, ImageIcon, Upload, Plus, Library, ArrowLeft, Heart, MessageCircle, Send, ThumbsUp, Share, Repeat } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface FormData {
  contentSource: 'manual' | 'existing-article';
  briefDescription: string;
  selectedArticleId?: number;
  referenceLink?: string;
  platforms: string[];
}

const platformOptions = [
  { value: 'facebook', label: 'Facebook', color: 'bg-blue-600' },
  { value: 'instagram', label: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { value: 'tiktok', label: 'TikTok', color: 'bg-black' },
  { value: 'linkedin', label: 'LinkedIn', color: 'bg-blue-700' },
  { value: 'twitter', label: 'Twitter/X', color: 'bg-gray-900' }
];

export default function CreateSocialContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    contentSource: 'manual',
    briefDescription: '',
    platforms: []
  });
  const [extractedContent, setExtractedContent] = useState('');
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  // Navigation functions
  const canGoBack = currentStep > 1;
  const goBack = () => {
    if (canGoBack) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goNext = () => {
    setCurrentStep(currentStep + 1);
  };
  
  // Image management states
  const [includeImage, setIncludeImage] = useState(false);
  const [imageSource, setImageSource] = useState<'library' | 'create' | 'upload'>('library');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Fetch existing articles (SEO articles from "Bài viết của tôi")
  const { data: articlesData, isLoading: articlesLoading } = useQuery({
    queryKey: ['/api/dashboard/articles?limit=100'], // Get more articles
    select: (response: any) => {
      const articles = response?.data?.articles || response?.articles || [];
      console.log('All articles loaded:', articles);
      
      // Filter only SEO content articles (exclude social media content)
      const filteredArticles = articles.filter((article: any) => {
        // Check various conditions that indicate this is a real SEO article
        const hasContent = article.content && article.content.trim().length > 0;
        const isNotSocialMedia = !article.type || article.type !== 'social_media';
        const hasTitle = article.title && article.title.trim().length > 0;
        const isNotDefaultTitle = article.title !== 'Bài viết mới' && 
                                  article.title !== 'Default Title' &&
                                  !article.title.startsWith('Social Media Content'); // Exclude default/social media titles
        
        console.log(`Article ${article.id}: title="${article.title}", type="${article.type}", hasContent=${hasContent}, isValidTitle=${isNotDefaultTitle}`);
        
        return hasContent && isNotSocialMedia && hasTitle && isNotDefaultTitle;
      });
      
      console.log('Filtered SEO articles:', filteredArticles);
      return filteredArticles;
    }
  });

  // Fetch image library
  const { data: imagesData, isLoading: imagesLoading } = useQuery({
    queryKey: ['/api/dashboard/images'],
    enabled: includeImage && imageSource === 'library',
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/dashboard/images?limit=50');
      const data = await response.json();
      console.log('Images API response:', data);
      console.log('Images array:', data?.data?.images);
      return data?.success ? data.data?.images || [] : [];
    }
  });

  // Step 1: Extract content
  const extractMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/social/extract-content', formData);
      return await response.json();
    },
    onSuccess: (data: any) => {
      console.log('Extract success data:', data);
      
      // Extract content từ response structure: {success: true, data: {extractedContent: "..."}}
      let content = '';
      if (data?.data?.extractedContent) {
        content = data.data.extractedContent;
      } else if (data?.extractedContent) {
        content = data.extractedContent;
      } else if (data?.success && data?.data) {
        // Try to get any content from data object
        content = data.data.content || data.data.text || '';
      }
      
      console.log('Extracted content:', content);
      console.log('Content length:', content.length);
      
      if (content && content.trim().length > 0) {
        setExtractedContent(content);
        setCurrentStep(2);
        toast({
          title: "Thành công",
          description: `Đã trích xuất nội dung (${content.length} ký tự)`
        });
      } else {
        toast({
          title: "Lỗi",
          description: "Không nhận được nội dung từ webhook",
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể trích xuất nội dung",
        variant: "destructive"
      });
    }
  });

  // Image management mutations
  const createImageMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest('POST', '/api/images/generate', {
        prompt,
        format: 'social_media'
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      if (data?.success && data?.data?.url) {
        setSelectedImage({
          id: Date.now(),
          url: data.data.url,
          alt: imagePrompt,
          type: 'generated'
        });
        toast({
          title: "Thành công",
          description: "Đã tạo ảnh mới thành công"
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: "Không thể tạo ảnh. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      if (data?.success && data?.data?.url) {
        setSelectedImage({
          id: Date.now(),
          url: data.data.url,
          alt: uploadedFile?.name || 'Uploaded image',
          type: 'uploaded'
        });
        toast({
          title: "Thành công",
          description: "Đã upload ảnh thành công"
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: "Không thể upload ảnh. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  });

  // Step 2: Generate content
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/social/create-final-content', {
        extractedContent,
        platforms: formData.platforms,
        contentSource: formData.contentSource,
        selectedArticleId: formData.selectedArticleId,
        referenceLink: formData.referenceLink
      });
      return await response.json();
    },
    onSuccess: (response: any) => {
      console.log('Generate mutation success response:', response);
      
      // Extract content from response structure
      let content = [];
      if (response?.data) {
        content = response.data;
      } else if (Array.isArray(response)) {
        content = response;
      } else if (response?.success && response?.data) {
        content = response.data;
      }
      
      console.log('Extracted generated content:', content);
      setGeneratedContent(content);
      setCurrentStep(3);
      toast({
        title: "Thành công",
        description: "Đã tạo nội dung cho tất cả nền tảng"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo nội dung",
        variant: "destructive"
      });
    }
  });

  // Step 3: Save content
  const saveMutation = useMutation({
    mutationFn: async () => {
      const contentArray = generatedContent || [];
      return await apiRequest('POST', '/api/social/save-created-content', {
        content: contentArray,
        title: `Social Media Content - ${new Date().toLocaleDateString('vi-VN')}`,
        platforms: formData.platforms,
        contentSource: 'wizard-generated'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/articles'] });
      setCurrentStep(4);
      toast({
        title: "Hoàn thành",
        description: "Nội dung đã được lưu thành công"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu nội dung",
        variant: "destructive"
      });
    }
  });

  const handlePlatformToggle = (platform: string, checked: boolean) => {
    const newPlatforms = checked 
      ? [...formData.platforms, platform]
      : formData.platforms.filter(p => p !== platform);
    setFormData({ ...formData, platforms: newPlatforms });
  };

  const goToNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleExtract = () => {
    // Validate based on content source
    if (formData.contentSource === 'existing-article' && !formData.selectedArticleId) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn bài viết SEO",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.platforms.length === 0) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn ít nhất một nền tảng",
        variant: "destructive"
      });
      return;
    }
    extractMutation.mutate();
  };

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  const handleStartNew = () => {
    setCurrentStep(1);
    setFormData({
      contentSource: 'manual',
      briefDescription: '',
      platforms: []
    });
    setExtractedContent('');
    setGeneratedContent(null);
  };

  if (currentStep === 4) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-400">
                <CheckCircle className="w-6 h-6" />
                <span>Hoàn thành thành công!</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-green-700 dark:text-green-300">
                Nội dung social media đã được tạo và lưu thành công vào "Nội dung đã tạo".
              </p>
              
              <div className="flex flex-wrap gap-2">
                {formData.platforms.map(platform => (
                  <Badge key={platform} variant="secondary">
                    {platformOptions.find(p => p.value === platform)?.label}
                  </Badge>
                ))}
              </div>

              <div className="flex space-x-4 pt-4">
                <Button onClick={handleStartNew} className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Tạo nội dung mới</span>
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                  Về Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                  </div>
                  <div className="ml-2 text-sm">
                    {step === 1 ? 'Trích xuất' : step === 2 ? 'Tạo nội dung' : 'Hoàn thành'}
                  </div>
                  {step < 3 && <ArrowRight className="w-4 h-4 mx-4 text-gray-400" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Extract Content */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Bước 1: Trích xuất nội dung</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Content Source */}
              <div className="space-y-3">
                <Label>Nguồn nội dung</Label>
                <Select
                  value={formData.contentSource}
                  onValueChange={(value: 'manual' | 'existing-article') => 
                    setFormData({ ...formData, contentSource: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="existing-article">Từ bài viết có sẵn</SelectItem>
                    <SelectItem value="manual">Tự nhập mô tả</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Article Selection */}
              {formData.contentSource === 'existing-article' && (
                <div className="space-y-3">
                  <Label>Chọn bài viết SEO</Label>
                  {articlesData && articlesData.length > 0 ? (
                    <>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Tìm thấy {articlesData.length} bài viết SEO trong "Bài viết của tôi"
                      </div>
                      <Select
                        value={formData.selectedArticleId?.toString() || ''}
                        onValueChange={(value) => 
                          setFormData({ ...formData, selectedArticleId: parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn bài viết SEO..." />
                        </SelectTrigger>
                        <SelectContent>
                          {articlesData.map((article: any) => (
                            <SelectItem key={article.id} value={article.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">{article.title}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Chưa có bài viết SEO nào
                      </p>
                      <p className="text-sm text-gray-500">
                        Hãy tạo bài viết SEO trước trong mục "Tạo nội dung"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Reference Link */}
              <div className="space-y-3">
                <Label>URL tham khảo (tùy chọn)</Label>
                <Input
                  type="url"
                  placeholder="https://example.com/article"
                  value={formData.referenceLink || ''}
                  onChange={(e) => setFormData({ ...formData, referenceLink: e.target.value })}
                />
              </div>



              {/* Platform Selection */}
              <div className="space-y-3">
                <Label>Nền tảng mục tiêu *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {platformOptions.map((platform) => (
                    <div
                      key={platform.value}
                      className="flex items-center space-x-2 p-3 border rounded-lg"
                    >
                      <Checkbox
                        id={platform.value}
                        checked={formData.platforms.includes(platform.value)}
                        onCheckedChange={(checked) => 
                          handlePlatformToggle(platform.value, checked as boolean)
                        }
                      />
                      <Label htmlFor={platform.value} className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                        <span>{platform.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleExtract}
                  disabled={extractMutation.isPending}
                  className="flex-1"
                >
                  {extractMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang trích xuất...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Trích xuất ý chính
                    </>
                  )}
                </Button>
                {extractedContent && (
                  <Button
                    onClick={goToNextStep}
                    variant="outline"
                    className="flex-none"
                  >
                    Tiếp theo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Generate Content */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>Bước 2: Tạo nội dung</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Chỉnh sửa nội dung</Label>
                <div className="bg-white dark:bg-gray-800 rounded-lg border">
                  <ReactQuill
                    value={extractedContent}
                    onChange={setExtractedContent}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link'],
                        ['clean']
                      ],
                    }}
                    formats={[
                      'header', 'bold', 'italic', 'underline',
                      'list', 'bullet', 'link'
                    ]}
                    placeholder="Chỉnh sửa nội dung đã trích xuất..."
                    className="min-h-[200px]"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                {canGoBack && (
                  <Button
                    variant="outline"
                    onClick={goBack}
                    className="flex-none"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                  </Button>
                )}
                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="flex-1"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang tạo nội dung...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Tạo nội dung cho tất cả nền tảng
                    </>
                  )}
                </Button>
                {generatedContent && generatedContent.length > 0 && (
                  <Button
                    onClick={goToNextStep}
                    variant="outline"
                    className="flex-none"
                  >
                    Tiếp theo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Image & Preview */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5" />
                <span>Bước 3: Hình ảnh & Xem trước</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Option Toggle */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-image"
                    checked={includeImage}
                    onCheckedChange={(checked) => setIncludeImage(checked === true)}
                  />
                  <Label htmlFor="include-image">Đăng kèm hình ảnh</Label>
                </div>

                {/* Image Source Selection */}
                {includeImage && (
                  <div className="space-y-4 border rounded-lg p-4">
                    <Label>Chọn nguồn hình ảnh</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <Button
                        variant={imageSource === 'library' ? 'default' : 'outline'}
                        onClick={() => setImageSource('library')}
                        className="flex flex-col items-center space-y-2 h-20"
                      >
                        <Library className="w-6 h-6" />
                        <span className="text-sm">Thư viện</span>
                      </Button>
                      <Button
                        variant={imageSource === 'create' ? 'default' : 'outline'}
                        onClick={() => setImageSource('create')}
                        className="flex flex-col items-center space-y-2 h-20"
                      >
                        <Plus className="w-6 h-6" />
                        <span className="text-sm">Tạo mới</span>
                      </Button>
                      <Button
                        variant={imageSource === 'upload' ? 'default' : 'outline'}
                        onClick={() => setImageSource('upload')}
                        className="flex flex-col items-center space-y-2 h-20"
                      >
                        <Upload className="w-6 h-6" />
                        <span className="text-sm">Upload</span>
                      </Button>
                    </div>

                    {/* Library Selection */}
                    {imageSource === 'library' && (
                      <div className="space-y-3">
                        <Label>Chọn ảnh từ thư viện</Label>
                        {imagesLoading ? (
                          <div className="text-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                            <p className="text-sm text-muted-foreground mt-2">Đang tải...</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-4 max-h-40 overflow-y-auto">
                            {imagesData && imagesData.length > 0 ? (
                              imagesData.map((image: any) => (
                                <div
                                  key={image.id}
                                  className={`cursor-pointer border-2 rounded-lg p-2 ${
                                    selectedImage?.id === image.id ? 'border-blue-500' : 'border-gray-200'
                                  }`}
                                  onClick={() => setSelectedImage(image)}
                                >
                                  <img
                                    src={image.imageUrl || image.url}
                                    alt={image.prompt || image.alt || 'Library image'}
                                    className="w-full h-20 object-cover rounded"
                                    onError={(e) => {
                                      console.log('Image load error:', image);
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling?.setAttribute('style', 'display: flex');
                                    }}
                                  />
                                  <div 
                                    className="w-full h-20 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-sm text-gray-500" 
                                    style={{ display: 'none' }}
                                  >
                                    Không thể tải ảnh
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-3 text-center py-4 text-muted-foreground">
                                Không có ảnh trong thư viện
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Create New Image */}
                    {imageSource === 'create' && (
                      <div className="space-y-3">
                        <Label>Mô tả hình ảnh cần tạo</Label>
                        <Textarea
                          value={imagePrompt}
                          onChange={(e) => setImagePrompt(e.target.value)}
                          placeholder="Ví dụ: Một hình ảnh đẹp về công nghệ, phong cách hiện đại..."
                          rows={3}
                        />
                        <Button
                          onClick={() => createImageMutation.mutate(imagePrompt)}
                          disabled={createImageMutation.isPending || !imagePrompt.trim()}
                          className="w-full"
                        >
                          {createImageMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Đang tạo ảnh...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Tạo hình ảnh
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Upload Image */}
                    {imageSource === 'upload' && (
                      <div className="space-y-3">
                        <Label>Chọn file ảnh từ máy tính</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadedFile(file);
                              uploadImageMutation.mutate(file);
                            }
                          }}
                          disabled={uploadImageMutation.isPending}
                        />
                        {uploadImageMutation.isPending && (
                          <div className="text-center py-2">
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            <p className="text-sm text-muted-foreground mt-1">Đang upload...</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Selected Image Preview */}
                    {selectedImage && (
                      <div className="space-y-2">
                        <Label>Ảnh đã chọn</Label>
                        <div className="border rounded-lg p-3">
                          <img
                            src={selectedImage.imageUrl || selectedImage.url}
                            alt={selectedImage.prompt || selectedImage.alt || 'Selected image'}
                            className="w-full max-w-xs h-32 object-cover rounded mx-auto"
                            onError={(e) => {
                              console.log('Selected image error:', selectedImage);
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NS41IDY0SDExNC41IiBzdHJva2U9IiM5Q0E0QTYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik0xMDAgNDkuNVYxMDguNSIgc3Ryb2tlPSIjOUNBNEE2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K';
                            }}
                          />
                          <p className="text-sm text-center text-muted-foreground mt-2">
                            {selectedImage.prompt || selectedImage.alt || 'Hình ảnh đã chọn'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Content Preview with Platform-specific UI */}
              {generatedContent && Array.isArray(generatedContent) && generatedContent.length > 0 ? (
                <div className="space-y-6">
                  <Label>Xem trước nội dung</Label>
                  {generatedContent.map((item: any, index: number) => {
                    const platform = item.output?.['Nền tảng đăng']?.toLowerCase() || 'unknown';
                    const content = item.output?.['Nội dung bài viết'] || 'No content';
                    
                    // Debug log to see what platforms we're getting
                    console.log('Platform detected:', platform, 'Content:', content.substring(0, 50) + '...');
                    
                    // Instagram Preview
                    if (platform === 'instagram') {
                      return (
                        <div key={index} className="max-w-sm mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                          {/* Instagram Header */}
                          <div className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="w-8 h-8 bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">IG</span>
                            </div>
                            <span className="ml-3 font-semibold text-sm text-gray-900 dark:text-gray-100">your_account</span>
                          </div>
                          
                          {/* Instagram Image */}
                          {includeImage && selectedImage && (
                            <div className="aspect-square">
                              <img
                                src={selectedImage.imageUrl || selectedImage.url}
                                alt="Instagram post"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* Instagram Actions */}
                          <div className="p-3">
                            <div className="flex items-center space-x-4 mb-2">
                              <Heart className="w-6 h-6 text-gray-900 dark:text-gray-100" />
                              <MessageCircle className="w-6 h-6 text-gray-900 dark:text-gray-100" />
                              <Send className="w-6 h-6 text-gray-900 dark:text-gray-100" />
                            </div>
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              <span className="font-semibold">your_account</span> {content}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    // Facebook Preview
                    if (platform === 'facebook') {
                      return (
                        <div key={index} className="max-w-lg mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                          {/* Facebook Header */}
                          <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">FB</span>
                            </div>
                            <div className="ml-3">
                              <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">Your Page</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Vừa xong</div>
                            </div>
                          </div>
                          
                          {/* Facebook Content */}
                          <div className="p-4">
                            <p className="text-sm mb-3 text-gray-900 dark:text-gray-100">{content}</p>
                            {includeImage && selectedImage && (
                              <img
                                src={selectedImage.imageUrl || selectedImage.url}
                                alt="Facebook post"
                                className="w-full rounded-lg"
                              />
                            )}
                          </div>
                          
                          {/* Facebook Actions */}
                          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                            <div className="flex justify-around">
                              <button 
                                className="social-preview-button flex items-center space-x-1 text-gray-600 dark:text-gray-400 text-sm py-2 rounded transition-colors"
                                style={{ background: 'transparent', backgroundColor: 'transparent', border: '0', borderColor: 'transparent' }}
                              >
                                <ThumbsUp className="w-4 h-4" />
                                <span>Thích</span>
                              </button>
                              <button 
                                className="social-preview-button flex items-center space-x-1 text-gray-600 dark:text-gray-400 text-sm py-2 rounded transition-colors"
                                style={{ background: 'transparent', backgroundColor: 'transparent', border: '0', borderColor: 'transparent' }}
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span>Bình luận</span>
                              </button>
                              <button 
                                className="social-preview-button flex items-center space-x-1 text-gray-600 dark:text-gray-400 text-sm py-2 rounded transition-colors"
                                style={{ background: 'transparent', backgroundColor: 'transparent', border: '0', borderColor: 'transparent' }}
                              >
                                <Share className="w-4 h-4" />
                                <span>Chia sẻ</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    // LinkedIn Preview
                    if (platform === 'linkedin') {
                      return (
                        <div key={index} className="max-w-lg mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                          {/* LinkedIn Header */}
                          <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">LI</span>
                            </div>
                            <div className="ml-3">
                              <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">Your Professional Profile</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Your Job Title • 1 giờ</div>
                            </div>
                          </div>
                          
                          {/* LinkedIn Content */}
                          <div className="p-4">
                            <p className="text-sm leading-relaxed mb-3 text-gray-900 dark:text-gray-100">{content}</p>
                            {includeImage && selectedImage && (
                              <img
                                src={selectedImage.imageUrl || selectedImage.url}
                                alt="LinkedIn post"
                                className="w-full rounded"
                              />
                            )}
                          </div>
                          
                          {/* LinkedIn Actions */}
                          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
                            <div className="flex justify-around">
                              <button 
                                className="social-preview-button flex items-center space-x-1 text-gray-600 dark:text-gray-400 text-sm py-1 rounded transition-colors"
                                style={{ background: 'transparent', backgroundColor: 'transparent', border: '0', borderColor: 'transparent' }}
                              >
                                <ThumbsUp className="w-4 h-4" />
                                <span>Thích</span>
                              </button>
                              <button 
                                className="social-preview-button flex items-center space-x-1 text-gray-600 dark:text-gray-400 text-sm py-1 rounded transition-colors"
                                style={{ background: 'transparent', backgroundColor: 'transparent', border: '0', borderColor: 'transparent' }}
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span>Bình luận</span>
                              </button>
                              <button 
                                className="social-preview-button flex items-center space-x-1 text-gray-600 dark:text-gray-400 text-sm py-1 rounded transition-colors"
                                style={{ background: 'transparent', backgroundColor: 'transparent', border: '0', borderColor: 'transparent' }}
                              >
                                <Share className="w-4 h-4" />
                                <span>Chia sẻ</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    // Twitter/X Preview
                    if (platform === 'x' || platform === 'twitter') {
                      return (
                        <div key={index} className="max-w-lg mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                          {/* Twitter Header */}
                          <div className="flex items-start p-4">
                            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">X</span>
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="flex items-center space-x-1">
                                <span className="font-bold text-sm text-gray-900 dark:text-gray-100">Your Account</span>
                                <span className="text-gray-500 dark:text-gray-400 text-sm">@youraccount • 1h</span>
                              </div>
                              <p className="text-sm mt-2 text-gray-900 dark:text-gray-100">{content}</p>
                              {includeImage && selectedImage && (
                                <img
                                  src={selectedImage.imageUrl || selectedImage.url}
                                  alt="Twitter post"
                                  className="w-full rounded-2xl mt-3"
                                />
                              )}
                              
                              {/* Twitter Actions */}
                              <div className="flex justify-between mt-3 max-w-md">
                                <button 
                                  className="social-preview-button flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-sm rounded transition-colors p-1"
                                  style={{ background: 'transparent', backgroundColor: 'transparent', border: '0', borderColor: 'transparent' }}
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  <span>24</span>
                                </button>
                                <button 
                                  className="social-preview-button flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-sm rounded transition-colors p-1"
                                  style={{ background: 'transparent', backgroundColor: 'transparent', border: '0', borderColor: 'transparent' }}
                                >
                                  <Repeat className="w-4 h-4" />
                                  <span>12</span>
                                </button>
                                <button 
                                  className="social-preview-button flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-sm rounded transition-colors p-1"
                                  style={{ background: 'transparent', backgroundColor: 'transparent', border: '0', borderColor: 'transparent' }}
                                >
                                  <Heart className="w-4 h-4" />
                                  <span>48</span>
                                </button>
                                <button 
                                  className="social-preview-button flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-sm rounded transition-colors p-1"
                                  style={{ background: 'transparent', backgroundColor: 'transparent', border: '0', borderColor: 'transparent' }}
                                >
                                  <Share className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    // TikTok Preview
                    if (platform === 'tiktok' || platform.includes('tiktok')) {
                      return (
                        <div key={index} className="max-w-sm mx-auto bg-black text-white rounded-lg shadow-sm overflow-hidden">
                          {/* TikTok-style Header */}
                          <div className="p-4">
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">TT</span>
                              </div>
                              <span className="font-semibold text-sm">@youraccount</span>
                            </div>
                            
                            {includeImage && selectedImage && (
                              <div className="aspect-[9/16] max-h-96 rounded-lg overflow-hidden mb-3">
                                <img
                                  src={selectedImage.imageUrl || selectedImage.url}
                                  alt="TikTok post"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            
                            <p className="text-sm">{content}</p>
                          </div>
                        </div>
                      );
                    }
                    
                    // Default preview for unknown platforms
                    return (
                      <div key={index} className="max-w-lg mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
                        <div className="mb-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            {platform || 'Unknown Platform'}
                          </span>
                        </div>
                        
                        {includeImage && selectedImage && (
                          <div className="mb-3">
                            <img
                              src={selectedImage.imageUrl || selectedImage.url}
                              alt="Post image"
                              className="w-full rounded"
                            />
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-900 dark:text-gray-100">{content}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                currentStep === 3 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Chưa có nội dung để xem trước.</p>
                    <p className="text-sm mt-1">Hãy quay lại bước 2 để tạo nội dung.</p>
                  </div>
                )
              )}

              <div className="flex gap-3">
                {canGoBack && (
                  <Button
                    variant="outline"
                    onClick={goBack}
                    className="flex-none"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                  </Button>
                )}
                <Button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="flex-1"
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Lưu vào thư viện
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}