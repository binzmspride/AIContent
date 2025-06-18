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
import { Sparkles, FileText, CheckCircle, Loader2, ArrowRight, Eye } from 'lucide-react';

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

  // Step 1: Extract content
  const extractMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/social/extract-content', formData);
    },
    onSuccess: (response: any) => {
      console.log('=== EXTRACT SUCCESS ===');
      console.log('Extract response:', response);
      console.log('Response data:', response.data);
      console.log('Extracted content:', response.data?.extractedContent);
      
      const content = response.data?.extractedContent || response.extractedContent || '';
      console.log('Final content to set:', content);
      console.log('Content length:', content.length);
      
      if (content && content.length > 0) {
        setExtractedContent(content);
        setCurrentStep(2);
        console.log('=== MOVING TO STEP 2 ===');
        toast({
          title: "Thành công",
          description: `Đã trích xuất nội dung (${content.length} ký tự)`
        });
      } else {
        console.log('=== NO CONTENT RECEIVED ===');
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

  // Step 2: Generate content
  const generateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/social/create-final-content', {
        extractedContent,
        platforms: formData.platforms,
        contentSource: formData.contentSource,
        selectedArticleId: formData.selectedArticleId,
        referenceLink: formData.referenceLink
      });
    },
    onSuccess: (response: any) => {
      setGeneratedContent(response);
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

              <Button
                onClick={handleExtract}
                disabled={extractMutation.isPending}
                className="w-full"
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
                <Label>Nội dung đã trích xuất</Label>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg max-h-40 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{extractedContent}</pre>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Chỉnh sửa nội dung (tùy chọn)</Label>
                <Textarea
                  value={extractedContent}
                  onChange={(e) => setExtractedContent(e.target.value)}
                  rows={6}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="w-full"
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
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Save */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Bước 3: Xem trước & Lưu</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {generatedContent && Array.isArray(generatedContent) && (
                <div className="space-y-4">
                  {generatedContent.map((item: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="font-medium mb-2">
                        {item.output?.['Nền tảng đăng'] || 'Unknown Platform'}
                      </div>
                      <div className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
                        {item.output?.['Nội dung bài viết'] || 'No content'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="w-full"
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
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}