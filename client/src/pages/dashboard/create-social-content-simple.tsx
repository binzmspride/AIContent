import React, { useState, useMemo } from 'react';
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
  contentSource: 'manual' | 'existing-article' | 'create-new-seo';
  briefDescription: string;
  selectedArticleId?: number;
  referenceLink?: string;
  platforms: string[];
  seoTopic?: string;
  seoKeywords?: string;
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
    platforms: [],
    seoTopic: '',
    seoKeywords: ''
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
  const [savedArticleId, setSavedArticleId] = useState<number | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Search state for existing articles
  const [searchQuery, setSearchQuery] = useState('');
  
  // Publishing states
  const [publishingStatus, setPublishingStatus] = useState<Record<string, 'idle' | 'publishing' | 'scheduled' | 'published' | 'error'>>({});
  const [publishResults, setPublishResults] = useState<Record<string, { success: boolean; url?: string; error?: string }>>({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulingPlatform, setSchedulingPlatform] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState('');
  
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

  // Filter articles based on search query
  const filteredArticles = useMemo(() => {
    if (!articlesData) return [];
    if (!searchQuery.trim()) return articlesData;
    
    return articlesData.filter((article: any) => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.keywords && article.keywords.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [articlesData, searchQuery]);

  // Fetch image library
  const { data: imagesData, isLoading: imagesLoading } = useQuery({
    queryKey: ['/api/dashboard/images'],
    enabled: includeImage && imageSource === 'library',
    select: (response: any) => {
      console.log('Images API response:', response);
      const images = response?.data?.images || response?.images || [];
      console.log('Images array:', images);
      return images;
    }
  });

  // Fetch social connections
  const { data: connectionsData } = useQuery({
    queryKey: ['/api/social-connections'],
  });

  const connections = (connectionsData as any)?.data || [];

  // Publishing mutations
  const publishNowMutation = useMutation({
    mutationFn: async ({ platform, content, imageUrls }: { platform: string; content: string; imageUrls?: string[] }) => {
      const connectionForPlatform = connections.find((conn: any) => 
        conn.platform === platform && conn.isActive
      );
      
      if (!connectionForPlatform) {
        throw new Error(`Chưa kết nối tài khoản ${platform}`);
      }

      const response = await apiRequest('POST', '/api/social/publish-now', {
        platform,
        content,
        imageUrls,
        connectionId: connectionForPlatform.id
      });
      return await response.json();
    },
    onSuccess: (data: any, variables) => {
      setPublishingStatus(prev => ({ ...prev, [variables.platform]: 'published' }));
      setPublishResults(prev => ({ 
        ...prev, 
        [variables.platform]: { success: true, url: data.data?.url } 
      }));
      toast({
        title: "Đăng thành công",
        description: `Bài viết đã được đăng lên ${variables.platform}`
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

  const schedulePostMutation = useMutation({
    mutationFn: async ({ platform, content, imageUrls, scheduledTime }: { 
      platform: string; 
      content: string; 
      imageUrls?: string[]; 
      scheduledTime: string;
    }) => {
      const connectionForPlatform = connections.find((conn: any) => 
        conn.platform === platform && conn.isActive
      );
      
      if (!connectionForPlatform) {
        throw new Error(`Chưa kết nối tài khoản ${platform}`);
      }

      const response = await apiRequest('POST', '/api/scheduled-posts', {
        title: `Social Media Content - ${new Date().toLocaleDateString('vi-VN')}`,
        content,
        connectionId: connectionForPlatform.id,
        scheduledTime,
        imageUrls: imageUrls || []
      });
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



  // Generate social content for "Tạo bài viết SEO mới" flow
  const generateSocialContentMutation = useMutation({
    mutationFn: async () => {
      // Prepare payload based on content source
      let payload = {};
      
      if (formData.contentSource === 'create-new-seo') {
        payload = {
          topic: formData.seoTopic,
          keywords: formData.seoKeywords,
          url: formData.referenceLink || "",
          extract_content: "false", 
          post_to_linkedin: formData.platforms.includes('linkedin') ? "true" : "false",
          post_to_facebook: formData.platforms.includes('facebook') ? "true" : "false", 
          post_to_x: formData.platforms.includes('twitter') ? "true" : "false",
          post_to_instagram: formData.platforms.includes('instagram') ? "true" : "false",
          genSEO: true,
          approve_extract: "false"
        };
      } else {
        payload = formData;
      }
      
      const response = await apiRequest('POST', '/api/social/generate-content', payload);
      return await response.json();
    },
    onSuccess: (data: any) => {
      console.log('Generate social success data:', data);
      
      // Extract content from response structure
      let content = '';
      if (data?.data?.content) {
        content = data.data.content;
      } else if (data?.content) {
        content = data.content;
      } else if (data?.success && data?.data) {
        // Handle different response structures
        const responseData = data.data;
        if (typeof responseData === 'string') {
          content = responseData;
        } else if (responseData.output) {
          content = responseData.output;
        }
      }
      
      if (content) {
        setExtractedContent(content);
        setCurrentStep(2);
        toast({
          title: "Thành công",
          description: "Đã tạo nội dung social media thành công",
        });
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể tạo nội dung social media",
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      console.error('Generate social error:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi tạo nội dung",
        variant: "destructive"
      });
    }
  });

  // Step 1: Extract content (for existing article flow)
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
        // Convert markdown format to HTML for ReactQuill
        const htmlContent = content
          .replace(/\n/g, '<br>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/^[\*\-\+] (.*?)(?=<br>|$)/gm, '<li>$1</li>')
          .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
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
      const response = await apiRequest('POST', '/api/dashboard/images/generate', {
        title: `Social Media Image - ${new Date().toLocaleDateString('vi-VN')}`,
        prompt,
        sourceText: extractedContent || '',
        articleId: formData.selectedArticleId ? parseInt(formData.selectedArticleId) : null
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      console.log('Image generation response:', data);
      if (data?.success && data?.data?.imageUrl) {
        setSelectedImage({
          id: data.data.id || Date.now(),
          imageUrl: data.data.imageUrl,
          url: data.data.imageUrl, // Fallback for compatibility
          title: data.data.title || 'Generated Image',
          prompt: imagePrompt,
          type: 'generated'
        });
        toast({
          title: "Thành công",
          description: "Đã tạo ảnh mới thành công"
        });
        // Refresh image library to show new image
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/images'] });
      } else {
        throw new Error(data?.error || 'Không thể tạo ảnh');
      }
    },
    onError: (error: any) => {
      console.error('Image generation error:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo ảnh. Vui lòng thử lại.",
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
      
      // Prepare save data with image information
      const saveData = {
        content: contentArray,
        title: `Social Media Content - ${new Date().toLocaleDateString('vi-VN')}`,
        platforms: formData.platforms,
        contentSource: 'wizard-generated',
        // Include image information if image is selected
        imageData: selectedImage ? {
          id: selectedImage.id,
          imageUrl: selectedImage.imageUrl || selectedImage.url,
          title: selectedImage.title || selectedImage.prompt || 'Social Media Image',
          prompt: selectedImage.prompt,
          type: selectedImage.type || 'selected'
        } : null,
        // Include extracted content and reference info
        extractedContent: extractedContent,
        sourceArticleId: formData.selectedArticleId ? parseInt(formData.selectedArticleId) : null,
        referenceLink: formData.referenceLink
      };
      
      console.log('Saving social content with data:', saveData);
      return await apiRequest('POST', '/api/social/save-created-content', saveData);
    },
    onSuccess: (response: any) => {
      console.log('Save response:', response);
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/articles'] });
      
      // Save the article ID for viewing later
      if (response?.data?.id) {
        setSavedArticleId(response.data.id);
      }
      
      setCurrentStep(4);
      toast({
        title: "Hoàn thành",
        description: "Nội dung và hình ảnh đã được lưu thành công"
      });
    },
    onError: (error: any) => {
      console.error('Save error:', error);
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
    // Add validation for create-new-seo
    if (formData.contentSource === 'create-new-seo') {
      if (!formData.seoTopic || !formData.seoKeywords) {
        toast({
          title: "Thiếu thông tin",
          description: "Vui lòng nhập đầy đủ chủ đề chính và từ khóa",
          variant: "destructive"
        });
        return;
      }
      // Use generateSocialContentMutation for SEO creation
      generateSocialContentMutation.mutate();
    } else {
      extractMutation.mutate();
    }
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
    setPublishingStatus({});
    setPublishResults({});
  };

  const handlePublishNow = (platform: string) => {
    if (!generatedContent || !generatedContent[platform]) {
      toast({
        title: "Lỗi",
        description: "Không có nội dung để đăng",
        variant: "destructive"
      });
      return;
    }

    setPublishingStatus(prev => ({ ...prev, [platform]: 'publishing' }));
    
    const content = generatedContent[platform];
    const imageUrls = selectedImage ? [selectedImage.imageUrl || selectedImage.url] : [];
    
    publishNowMutation.mutate({ platform, content, imageUrls });
  };

  const handleSchedulePost = (platform: string) => {
    if (!generatedContent || !generatedContent[platform]) {
      toast({
        title: "Lỗi",
        description: "Không có nội dung để lên lịch",
        variant: "destructive"
      });
      return;
    }

    setSchedulingPlatform(platform);
    setShowScheduleModal(true);
  };

  const handleConfirmSchedule = () => {
    if (!scheduledTime) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn thời gian đăng",
        variant: "destructive"
      });
      return;
    }

    const scheduledDate = new Date(scheduledTime);
    if (scheduledDate <= new Date()) {
      toast({
        title: "Lỗi",
        description: "Thời gian đăng phải sau thời điểm hiện tại",
        variant: "destructive"
      });
      return;
    }

    const content = generatedContent[schedulingPlatform];
    const imageUrls = selectedImage ? [selectedImage.imageUrl || selectedImage.url] : [];
    
    setPublishingStatus(prev => ({ ...prev, [schedulingPlatform]: 'publishing' }));
    schedulePostMutation.mutate({ 
      platform: schedulingPlatform, 
      content, 
      imageUrls, 
      scheduledTime 
    });
    
    setShowScheduleModal(false);
    setScheduledTime('');
    setSchedulingPlatform('');
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

  if (currentStep === 4) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto p-6 space-y-6">
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
              {/* Platform Cards */}
              <div className="grid gap-6">
                {formData.platforms.map(platform => {
                  const connectionStatus = getConnectionStatus(platform);
                  const publishStatus = publishingStatus[platform] || 'idle';
                  const result = publishResults[platform];
                  
                  return (
                    <Card key={platform} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getPlatformIcon(platform)}
                            <div>
                              <h3 className="font-semibold">{getPlatformName(platform)}</h3>
                              <div className="flex items-center space-x-2">
                                {connectionStatus === 'connected' ? (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Đã kết nối
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Chưa kết nối
                                  </Badge>
                                )}
                                {publishStatus === 'published' && (
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Đã đăng
                                  </Badge>
                                )}
                                {publishStatus === 'scheduled' && (
                                  <Badge className="bg-blue-100 text-blue-800">
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
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Content Preview */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Nội dung:</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                            {generatedContent?.[platform] || 'Không có nội dung'}
                          </p>
                        </div>

                        {/* Image Preview */}
                        {selectedImage && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Hình ảnh:</h4>
                            <img 
                              src={selectedImage.imageUrl || selectedImage.url} 
                              alt={selectedImage.title || "Selected image"} 
                              className="w-24 h-24 object-cover rounded-lg"
                              onError={(e) => {
                                console.error('Image load error:', e);
                                console.log('selectedImage object:', selectedImage);
                              }}
                            />
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                          {connectionStatus === 'connected' ? (
                            <>
                              <Button
                                onClick={() => handlePublishNow(platform)}
                                disabled={publishStatus === 'publishing' || publishStatus === 'published'}
                                className="flex items-center space-x-2"
                              >
                                {publishStatus === 'publishing' ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Send className="w-4 h-4" />
                                )}
                                <span>
                                  {publishStatus === 'publishing' ? 'Đang đăng...' : 
                                   publishStatus === 'published' ? 'Đã đăng' : 'Đăng ngay'}
                                </span>
                              </Button>
                              
                              <Button
                                variant="outline"
                                onClick={() => handleSchedulePost(platform)}
                                disabled={publishStatus === 'publishing' || publishStatus === 'scheduled'}
                                className="flex items-center space-x-2"
                              >
                                <Clock className="w-4 h-4" />
                                <span>
                                  {publishStatus === 'scheduled' ? 'Đã lên lịch' : 'Đặt lịch'}
                                </span>
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => window.location.href = '/dashboard/social-connections'}
                              className="flex items-center space-x-2"
                            >
                              <Settings className="w-4 h-4" />
                              <span>Kết nối tài khoản</span>
                            </Button>
                          )}
                        </div>

                        {/* Result Messages */}
                        {result && (
                          <div className={`p-3 rounded-lg ${
                            result.success 
                              ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {result.success ? (
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4" />
                                <span>
                                  {publishStatus === 'published' ? 'Đăng bài thành công!' : 'Lên lịch thành công!'}
                                </span>
                                {result.url && (
                                  <a 
                                    href={result.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    Xem bài đăng
                                  </a>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <AlertCircle className="w-4 h-4" />
                                <span>{result.error}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
                
                <div className="flex space-x-3">
                  <Button onClick={handleStartNew} variant="outline">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Tạo nội dung mới
                  </Button>
                  
                  <Button onClick={() => window.location.href = '/dashboard/scheduled-posts'}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Bài viết đã lên lịch
                  </Button>
                  
                  <Button 
                    onClick={() => window.location.href = '/dashboard/my-articles'}
                    className="flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Xem bài viết</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Modal */}
          {showScheduleModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle>Đặt lịch đăng bài</CardTitle>
                  <p className="text-sm text-gray-600">
                    Lên lịch cho {getPlatformName(schedulingPlatform)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Thời gian đăng
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowScheduleModal(false);
                        setScheduledTime('');
                        setSchedulingPlatform('');
                      }}
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleConfirmSchedule}
                      disabled={!scheduledTime || schedulePostMutation.isPending}
                      className="flex-1"
                    >
                      {schedulePostMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Clock className="w-4 h-4 mr-2" />
                      )}
                      Xác nhận
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
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
                  onValueChange={(value: 'manual' | 'existing-article' | 'create-new-seo') => 
                    setFormData({ ...formData, contentSource: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="existing-article">Từ bài viết có sẵn</SelectItem>
                    <SelectItem value="manual">Tự nhập mô tả</SelectItem>
                    <SelectItem value="create-new-seo">Tạo bài SEO mới</SelectItem>
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
                      
                      {/* Article Selection Dropdown with Search */}
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
                          {/* Search Input inside dropdown */}
                          <div className="p-2 border-b">
                            <Input
                              placeholder="Tìm kiếm bài viết theo tiêu đề hoặc từ khóa..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="h-8"
                            />
                          </div>
                          
                          {/* Article List */}
                          <div className="max-h-60 overflow-y-auto">
                            {filteredArticles.map((article: any) => (
                              <SelectItem key={article.id} value={article.id.toString()}>
                                <span className="font-medium">{article.title}</span>
                              </SelectItem>
                            ))}
                            {filteredArticles.length === 0 && searchQuery && (
                              <div className="px-2 py-1 text-sm text-gray-500">
                                Không tìm thấy bài viết nào
                              </div>
                            )}
                          </div>
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

              {/* SEO Article Creation */}
              {formData.contentSource === 'create-new-seo' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Chủ đề chính *</Label>
                    <Input
                      placeholder="Ví dụ: Cây cảnh xanh trong nhà"
                      value={formData.seoTopic || ''}
                      onChange={(e) => setFormData({ ...formData, seoTopic: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Từ khóa *</Label>
                    <Input
                      placeholder="Ví dụ: cây cảnh xanh, chăm sóc cây, không gian xanh"
                      value={formData.seoKeywords || ''}
                      onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Manual Content */}
              {formData.contentSource === 'manual' && (
                <div className="space-y-3">
                  <Label>Mô tả nội dung *</Label>
                  <Textarea
                    placeholder="Nhập mô tả ngắn gọn về nội dung bạn muốn tạo..."
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
                  type="url"
                  placeholder="https://example.com/article"
                  value={formData.referenceLink || ''}
                  onChange={(e) => setFormData({ ...formData, referenceLink: e.target.value })}
                />
              </div>



              {/* Platform Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Nền tảng mục tiêu *</Label>
                <div className="grid grid-cols-2 gap-4">
                  {platformOptions.map((platform) => {
                    const isSelected = formData.platforms.includes(platform.value);
                    return (
                      <div
                        key={platform.value}
                        className={`relative group cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 ${
                          isSelected 
                            ? 'ring-2 ring-blue-500 shadow-lg scale-105' 
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => handlePlatformToggle(platform.value, !isSelected)}
                      >
                        <div className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{platform.icon}</span>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {platform.label}
                                </div>
                                <div className={`w-6 h-1 rounded-full mt-1 ${platform.color}`} />
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-500' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {isSelected && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Selection overlay effect */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-500/10 rounded-xl pointer-events-none" />
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Selected platforms preview */}
                {formData.platforms.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.platforms.map((platform) => {
                      const platformInfo = platformOptions.find(p => p.value === platform);
                      return (
                        <div
                          key={platform}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                        >
                          <span>{platformInfo?.icon}</span>
                          <span>{platformInfo?.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleExtract}
                  disabled={extractMutation.isPending || generateSocialContentMutation.isPending}
                  className="flex-1"
                >
                  {extractMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang trích xuất...
                    </>
                  ) : generateSocialContentMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang tạo nội dung social...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      {formData.contentSource === 'create-new-seo' ? 'Tạo bài viết & Trích xuất' : 'Trích xuất ý chính'}
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
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Bước 2: Tạo nội dung</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="flex items-center gap-2"
                  title="Tạo lại nội dung"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs">Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span className="text-xs">Tạo lại</span>
                    </>
                  )}
                </Button>
              </div>
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
                          <div className="grid grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                            {imagesData && imagesData.length > 0 ? (
                              imagesData.map((image: any) => (
                                <div
                                  key={image.id}
                                  className={`cursor-pointer border-2 rounded-lg p-2 transition-all hover:shadow-md ${
                                    selectedImage?.id === image.id 
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                  }`}
                                  onClick={() => setSelectedImage(image)}
                                >
                                  <div className="relative">
                                    <img
                                      src={image.imageUrl || image.url}
                                      alt={image.title || image.prompt || 'Library image'}
                                      className="w-full h-20 object-cover rounded"
                                      loading="lazy"
                                      onError={(e) => {
                                        console.log('Image load error:', image);
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const fallback = target.nextElementSibling as HTMLElement;
                                        if (fallback) fallback.style.display = 'flex';
                                      }}
                                    />
                                    <div 
                                      className="w-full h-20 bg-gray-100 dark:bg-gray-700 rounded flex flex-col items-center justify-center text-xs text-gray-500 absolute top-0 left-0" 
                                      style={{ display: 'none' }}
                                    >
                                      <ImageIcon className="w-6 h-6 mb-1" />
                                      <span>Không thể tải</span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                                    {image.title || image.prompt || 'Không có mô tả'}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-3 text-center py-8 text-muted-foreground">
                                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Không có ảnh trong thư viện</p>
                                <p className="text-sm mt-1">Hãy tạo ảnh mới hoặc upload ảnh</p>
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