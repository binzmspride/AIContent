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
import { Sparkles, FileText, CheckCircle, Loader2, ArrowRight, Eye, RefreshCw, ImageIcon, Upload, Plus, Library, ArrowLeft, Heart, MessageCircle, Send, ThumbsUp, Share, Repeat, Clock, AlertCircle, Settings, Calendar } from 'lucide-react';
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
  { value: 'facebook', label: 'Facebook', color: 'bg-blue-600', icon: '📘' },
  { value: 'instagram', label: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: '📷' },
  { value: 'linkedin', label: 'LinkedIn', color: 'bg-blue-700', icon: '💼' },
  { value: 'twitter', label: 'Twitter/X', color: 'bg-gray-900', icon: '🐦' }
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
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imagePrompt, setImagePrompt] = useState('');
  const [publishingStatus, setPublishingStatus] = useState<Record<string, 'idle' | 'publishing' | 'scheduled' | 'success' | 'error'>>({});
  const [publishResults, setPublishResults] = useState<Record<string, any>>({});

  // Queries
  const { data: articlesResponse } = useQuery({
    queryKey: ['/api/dashboard/articles'],
    enabled: formData.contentSource === 'existing-article'
  });

  const { data: connectionsResponse } = useQuery({
    queryKey: ['/api/social-connections']
  });

  const { data: imagesResponse } = useQuery({
    queryKey: ['/api/dashboard/images']
  });

  const articlesData = (articlesResponse as any)?.data?.articles?.filter((article: any) => 
    article.title && 
    article.title.trim() !== '' && 
    article.title !== 'Bài viết mới' &&
    article.content && 
    article.content.trim() !== ''
  ) || [];

  const connections = (connectionsResponse as any)?.data || [];
  const images = (imagesResponse as any)?.data || [];

  // Mutations
  const extractMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/social/extract-content', formData);
      return await response.json();
    },
    onSuccess: (data: any) => {
      console.log('Extract success data:', data);
      
      let content = '';
      if (data?.data?.extractedContent) {
        content = data.data.extractedContent;
      } else if (data?.extractedContent) {
        content = data.extractedContent;
      } else if (data?.success && data?.data) {
        content = data.data.content || data.data.text || '';
      }
      
      if (content && content.trim().length > 0) {
        const htmlContent = content
          .replace(/\n/g, '<br>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/^[\*\-\+] (.*?)(?=<br>|$)/gm, '<li>$1</li>')
          .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
          .replace(/<br>(<ul>)/g, '$1')
          .replace(/(<\/ul>)<br>/g, '$1');
        
        setExtractedContent(htmlContent);
        setCurrentStep(2);
        toast({
          title: "Thành công",
          description: `Đã trích xuất nội dung (${content.length} ký tự)`
        });
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể trích xuất nội dung từ bài viết",
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      console.error('Extract error:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể trích xuất nội dung",
        variant: "destructive"
      });
    }
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/social-content/generate', {
        extractedContent,
        platforms: formData.platforms,
        selectedImages
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      if (data?.success) {
        setGeneratedContent(data.data);
        setCurrentStep(3);
        toast({
          title: "Thành công",
          description: "Đã tạo nội dung cho các nền tảng"
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo nội dung",
        variant: "destructive"
      });
    }
  });

  const createImageMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/dashboard/images/generate', {
        prompt: imagePrompt,
        platforms: formData.platforms
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      if (data?.success && data?.data?.url) {
        setSelectedImages(prev => [...prev, data.data.url]);
        setImagePrompt('');
        toast({
          title: "Thành công",
          description: "Đã tạo hình ảnh mới"
        });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/images'] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo hình ảnh",
        variant: "destructive"
      });
    }
  });

  const publishMutation = useMutation({
    mutationFn: async (variables: { platform: string; content: string; images: string[] }) => {
      const response = await apiRequest('POST', '/api/social-content/publish', variables);
      return await response.json();
    },
    onSuccess: (data: any, variables) => {
      setPublishingStatus(prev => ({ ...prev, [variables.platform]: 'success' }));
      setPublishResults(prev => ({ 
        ...prev, 
        [variables.platform]: { success: true, url: data.data?.url } 
      }));
      toast({
        title: "Đã đăng",
        description: `Nội dung đã được đăng lên ${variables.platform}`
      });
    },
    onError: (error: any, variables) => {
      setPublishingStatus(prev => ({ ...prev, [variables.platform]: 'error' }));
      setPublishResults(prev => ({ 
        ...prev, 
        [variables.platform]: { success: false, error: error.message } 
      }));
      toast({
        title: "Lỗi đăng bài",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const scheduleMutation = useMutation({
    mutationFn: async (variables: { platform: string; content: string; images: string[]; scheduledTime: string }) => {
      const response = await apiRequest('POST', '/api/social-content/schedule', variables);
      return await response.json();
    },
    onSuccess: (data: any, variables) => {
      setPublishingStatus(prev => ({ ...prev, [variables.platform]: 'scheduled' }));
      setPublishResults(prev => ({ 
        ...prev, 
        [variables.platform]: { success: true } 
      }));
      toast({
        title: "Đã lên lịch",
        description: `Bài viết sẽ được đăng lên ${variables.platform} vào ${new Date(variables.scheduledTime).toLocaleString('vi-VN')}`
      });
    },
    onError: (error: any, variables) => {
      setPublishingStatus(prev => ({ ...prev, [variables.platform]: 'error' }));
      setPublishResults(prev => ({ 
        ...prev, 
        [variables.platform]: { success: false, error: error.message } 
      }));
      toast({
        title: "Lỗi lên lịch",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handler functions
  const handleExtract = () => {
    if (formData.contentSource === 'existing-article' && !formData.selectedArticleId) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn một bài viết",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.contentSource === 'manual' && !formData.briefDescription.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập mô tả nội dung",
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
    if (!extractedContent.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng có nội dung để tạo",
        variant: "destructive"
      });
      return;
    }
    generateMutation.mutate();
  };

  const goToNextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <span className="text-blue-600">📘</span>;
      case 'instagram': return <span className="text-pink-600">📷</span>;
      case 'linkedin': return <span className="text-blue-700">💼</span>;
      case 'twitter': return <span className="text-blue-400">🐦</span>;
      default: return <span>📱</span>;
    }
  };

  const getPlatformName = (platform: string) => {
    return platformOptions.find(p => p.value === platform)?.label || platform;
  };

  const getConnectionStatus = (platform: string) => {
    const connection = connections.find((conn: any) => 
      conn.platform === platform && conn.isActive
    );
    return connection ? 'connected' : 'disconnected';
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

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
              {/* Content Source Selection */}
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
                          setFormData({ 
                            ...formData, 
                            selectedArticleId: value ? parseInt(value) : undefined 
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn bài viết..." />
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
                    <div className="text-sm text-amber-600 dark:text-amber-400 p-3 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800">
                      Không tìm thấy bài viết SEO nào. Hãy tạo bài viết SEO trước hoặc chọn "Tự nhập mô tả".
                    </div>
                  )}
                </div>
              )}

              {/* Manual Description */}
              {formData.contentSource === 'manual' && (
                <div className="space-y-3">
                  <Label>Mô tả nội dung</Label>
                  <Textarea
                    placeholder="Nhập mô tả về nội dung bạn muốn tạo cho mạng xã hội..."
                    value={formData.briefDescription}
                    onChange={(e) => setFormData({ ...formData, briefDescription: e.target.value })}
                    rows={4}
                  />
                </div>
              )}

              {/* Reference Link */}
              <div className="space-y-3">
                <Label>URL tham khảo (tùy chọn)</Label>
                <Input
                  placeholder="https://example.com/article"
                  value={formData.referenceLink || ''}
                  onChange={(e) => setFormData({ ...formData, referenceLink: e.target.value })}
                />
              </div>

              {/* Platform Selection */}
              <div className="space-y-3">
                <Label>Chọn nền tảng</Label>
                <div className="grid grid-cols-2 gap-3">
                  {platformOptions.map((platform) => (
                    <div
                      key={platform.value}
                      className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                        formData.platforms.includes(platform.value)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-lg transform scale-105'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center p-4 cursor-pointer" onClick={() => {
                        const newPlatforms = formData.platforms.includes(platform.value)
                          ? formData.platforms.filter(p => p !== platform.value)
                          : [...formData.platforms, platform.value];
                        setFormData({ ...formData, platforms: newPlatforms });
                      }}>
                        <Checkbox
                          checked={formData.platforms.includes(platform.value)}
                          onChange={() => {}}
                          className="mr-3"
                        />
                        <span className="text-2xl mr-3">{platform.icon}</span>
                        <span className="font-medium">{platform.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  onClick={handleExtract}
                  disabled={extractMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  {extractMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>
                    {extractMutation.isPending ? "Đang trích xuất..." : "Trích xuất ý chính"}
                  </span>
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
                    style={{ minHeight: '200px' }}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  onClick={goToPreviousStep}
                  variant="outline"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>

                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  {generateMutation.isPending ? "Đang tạo..." : "Tạo nội dung"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review Content */}
        {currentStep === 3 && generatedContent && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Bước 3: Xem trước và chỉnh sửa</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.platforms.map(platform => (
                <div key={platform} className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    {getPlatformIcon(platform)}
                    <span className="font-medium ml-2">{getPlatformName(platform)}</span>
                  </div>
                  <Textarea
                    value={generatedContent[platform] || ''}
                    onChange={(e) => setGeneratedContent({
                      ...generatedContent,
                      [platform]: e.target.value
                    })}
                    rows={4}
                  />
                </div>
              ))}

              <div className="flex justify-between">
                <Button
                  onClick={goToPreviousStep}
                  variant="outline"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>

                <Button
                  onClick={goToNextStep}
                >
                  Tiếp theo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Publish */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="w-6 h-6" />
                <span>Đăng bài và Lên lịch</span>
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Chọn đăng ngay hoặc lên lịch cho từng nền tảng
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                {formData.platforms.map(platform => {
                  const connectionStatus = getConnectionStatus(platform);
                  const publishStatus = publishingStatus[platform] || 'idle';
                  const result = publishResults[platform];

                  return (
                    <div key={platform} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          {getPlatformIcon(platform)}
                          <span className="font-medium ml-2">{getPlatformName(platform)}</span>
                          <Badge 
                            variant={connectionStatus === 'connected' ? 'default' : 'destructive'}
                            className="ml-2"
                          >
                            {connectionStatus === 'connected' ? 'Đã kết nối' : 'Chưa kết nối'}
                          </Badge>
                        </div>
                        
                        {publishStatus === 'success' && result?.success && (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Đã đăng
                          </Badge>
                        )}
                        
                        {publishStatus === 'scheduled' && (
                          <Badge variant="outline" className="text-blue-600">
                            <Clock className="w-3 h-3 mr-1" />
                            Đã lên lịch
                          </Badge>
                        )}
                        
                        {publishStatus === 'error' && (
                          <Badge variant="destructive">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Lỗi
                          </Badge>
                        )}
                      </div>

                      {connectionStatus === 'connected' ? (
                        <div className="space-y-3">
                          <Button
                            onClick={() => publishMutation.mutate({
                              platform,
                              content: generatedContent[platform],
                              images: selectedImages
                            })}
                            disabled={publishMutation.isPending || publishStatus === 'success'}
                            className="w-full"
                          >
                            {publishMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Send className="w-4 h-4 mr-2" />
                            )}
                            Đăng ngay
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500 mb-2">Cần kết nối tài khoản để đăng bài</p>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-2" />
                            Kết nối tài khoản
                          </Button>
                        </div>
                      )}

                      {result && !result.success && (
                        <div className="mt-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-2 rounded">
                          Lỗi: {result.error}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between">
                <Button
                  onClick={goToPreviousStep}
                  variant="outline"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>

                <Button
                  onClick={() => {
                    toast({
                      title: "Hoàn thành",
                      description: "Quy trình tạo nội dung mạng xã hội đã hoàn tất"
                    });
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Hoàn thành
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}