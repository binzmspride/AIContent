import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useDbTranslations } from '@/hooks/use-db-translations';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { DashboardLayout } from '@/components/dashboard/Layout';
import { SocialContentWizard } from '@/components/social-content/SocialContentWizard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Sparkles, FileText, TrendingUp, Loader2, ImageIcon, Check, Copy, Eye, Zap, ChevronsUpDown } from 'lucide-react';

interface SocialContentForm {
  contentSource: string;
  briefDescription: string;
  selectedArticleId?: number;
  referenceLink?: string;
  platforms: string[];
  includeImage: boolean;
  imageSource?: string;
  imagePrompt?: string;
  approveExtract: boolean;
}

export default function CreateSocialContentPage() {
  const { user } = useAuth();
  const { t, language } = useDbTranslations();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [form, setForm] = useState<SocialContentForm>({
    contentSource: '',
    briefDescription: '',
    selectedArticleId: undefined,
    referenceLink: '',
    platforms: [],
    includeImage: false,
    imageSource: 'ai-generated',
    imagePrompt: '',
    approveExtract: false
  });

  const [selectedImage, setSelectedImage] = useState<any>(null);

  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState('facebook');
  const [open, setOpen] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [extractedData, setExtractedData] = useState<string>('');
  const [showFinalResultDialog, setShowFinalResultDialog] = useState(false);
  const [finalSocialContent, setFinalSocialContent] = useState<any>(null);
  const [savingToCreatedContent, setSavingToCreatedContent] = useState(false);

  // Fetch user's articles when content source is from existing articles
  const { data: articlesData } = useQuery({
    queryKey: ['/api/dashboard/articles'],
    enabled: form.contentSource === 'existing-article'
  });

  // Fetch user's images when image source is from library
  const { data: imagesData } = useQuery({
    queryKey: ['/api/dashboard/images'],
    enabled: form.includeImage && form.imageSource === 'from-library'
  });

  // Get selected article for display
  const selectedArticle = articlesData?.data?.articles?.find((article: any) => 
    article.id === form.selectedArticleId
  );

  const platforms = [
    { id: 'facebook', name: 'Facebook', description: 'Bài đăng Facebook' },
    { id: 'twitter', name: 'Twitter', description: 'Tweet Twitter' },
    { id: 'instagram', name: 'Instagram', description: 'Bài đăng Instagram' },
    { id: 'linkedin', name: 'LinkedIn', description: 'Bài đăng LinkedIn' },
    { id: 'tiktok', name: 'TikTok', description: 'Nội dung TikTok' }
  ];

  const contentSources = [
    { value: 'ai-keyword', label: 'AI từ từ khóa' },
    { value: 'existing-article', label: 'Từ bài viết có sẵn' },
    { value: 'custom-input', label: 'Tự nhập nội dung' }
  ];

  const imageSources = [
    { value: 'ai-generated', label: 'AI Generated', icon: Sparkles },
    { value: 'from-library', label: 'From Library', icon: ImageIcon },
    { value: 'upload', label: 'Upload New', icon: FileText }
  ];

  const generateContentMutation = useMutation({
    mutationFn: async (data: SocialContentForm) => {
      const response = await apiRequest('POST', '/api/social/generate-content', data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data.data);
      // Lưu extracted data từ response
      if (data.data && data.data.output) {
        setExtractedData(data.data.output);
      }
      setShowResultDialog(true);
      toast({
        title: "Thành công",
        description: "Đã tạo nội dung social media thành công!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi tạo nội dung",
        variant: "destructive",
      });
    }
  });

  // Mutation cho việc phê duyệt và gửi đến webhook tạo Social Media Content
  const approveContentMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        extracted_data: extractedData,
        genSEO: form.contentSource === 'ai-keyword',
        approve_extract: form.approveExtract
      };
      
      console.log('API Request: POST /api/social/create-final-content', payload);
      const response = await apiRequest('POST', '/api/social/create-final-content', payload);
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Content approval successful:', data);
      setShowResultDialog(false);
      setFinalSocialContent(data.data);
      setShowFinalResultDialog(true);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Phê duyệt thành công",
        description: "Nội dung đã được phê duyệt và tạo bài đăng thành công",
      });
    },
    onError: (error: any) => {
      console.error('Error approving content:', error);
      toast({
        title: "Lỗi phê duyệt",
        description: error.message || "Có lỗi xảy ra khi phê duyệt nội dung",
        variant: "destructive",
      });
    }
  });

  const handlePlatformChange = (platformId: string, checked: boolean) => {
    setForm(prev => ({
      ...prev,
      platforms: checked 
        ? [...prev.platforms, platformId]
        : prev.platforms.filter(p => p !== platformId)
    }));
  };

  const handleSubmit = () => {
    if (!form.contentSource || form.platforms.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn nguồn nội dung và nền tảng",
        variant: "destructive",
      });
      return;
    }

    if (form.contentSource === 'existing-article' && !form.selectedArticleId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn bài viết",
        variant: "destructive",
      });
      return;
    }

    if (form.contentSource !== 'existing-article' && !form.briefDescription) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mô tả ngắn gọn",
        variant: "destructive",
      });
      return;
    }

    generateContentMutation.mutate(form);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "Nội dung đã được sao chép vào clipboard",
    });
  };

  const handleSaveToCreatedContent = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/social/save-created-content', {
        content: finalSocialContent,
        title: `Social Media Content - ${new Date().toLocaleDateString('vi-VN')}`,
        platforms: form.platforms,
        contentSource: form.contentSource,
        selectedArticleId: form.selectedArticleId || null
      });
    },
    onSuccess: () => {
      // Invalidate articles cache to refresh "Nội dung đã tạo" list
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/articles'] });
      
      toast({
        title: "Thành công",
        description: "Nội dung đã được lưu vào 'Nội dung đã tạo'",
      });
      setShowFinalResultDialog(false);
      // Reset form sau khi lưu thành công
      setForm({
        contentSource: 'manual',
        briefDescription: '',
        selectedArticleId: '',
        referenceLink: '',
        platforms: [],
        includeImage: false,
        imageSource: 'generate',
        selectedImageId: '',
        imagePrompt: ''
      });
      setExtractedData('');
      setFinalSocialContent(null);
    },
    onError: (error: any) => {
      console.error('Error saving content:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu nội dung",
        variant: "destructive",
      });
    }
  });

  const getPreviewContent = () => {
    if (!generatedContent || !generatedContent.platforms) return null;
    return generatedContent.platforms[previewMode];
  };

  return (
    <DashboardLayout key={`social-content-${language}`}>
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{t('dashboard.create.socialContent.title')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('dashboard.create.socialContent.subtitle')}
            </p>
          </div>
          <Button onClick={handleSubmit} disabled={generateContentMutation.isPending}>
            {generateContentMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Tạo với AI
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Content Creation Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tạo nội dung mới</CardTitle>
                <CardDescription>
                  Cấu hình và tạo nội dung social media cho nhiều nền tảng
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Content Source */}
                <div className="space-y-2">
                  <Label htmlFor="contentSource">Nguồn nội dung</Label>
                  <Select 
                    value={form.contentSource} 
                    onValueChange={(value) => setForm(prev => ({ ...prev, contentSource: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nguồn nội dung" />
                    </SelectTrigger>
                    <SelectContent>
                      {contentSources.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Article Selection (when source is existing-article) */}
                {form.contentSource === 'existing-article' && (
                  <div className="space-y-2">
                    <Label>Chọn bài viết</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between"
                        >
                          {selectedArticle ? (
                            <div className="flex flex-col items-start">
                              <span className="font-medium text-sm">{selectedArticle.title}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(selectedArticle.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          ) : (
                            "Chọn bài viết từ danh sách"
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput placeholder="Tìm kiếm bài viết..." />
                          <CommandEmpty>Không tìm thấy bài viết nào.</CommandEmpty>
                          <CommandGroup className="max-h-60 overflow-auto">
                            {articlesData?.data?.articles?.map((article: any) => (
                              <CommandItem
                                key={article.id}
                                value={`${article.title} ${article.textContent || ''}`}
                                onSelect={() => {
                                  setForm(prev => ({ ...prev, selectedArticleId: article.id }));
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    form.selectedArticleId === article.id ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium text-sm">{article.title}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {/* Approve Extract checkbox (only when using existing article) */}
                {form.contentSource === 'existing-article' && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="approveExtract"
                        checked={form.approveExtract}
                        onCheckedChange={(checked) => setForm(prev => ({ ...prev, approveExtract: checked as boolean }))}
                      />
                      <Label htmlFor="approveExtract" className="text-sm font-normal cursor-pointer">
                        Trích xuất nội dung từ bài viết có sẵn
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cho phép hệ thống trích xuất và tối ưu hóa nội dung từ bài viết đã chọn
                    </p>
                  </div>
                )}

                {/* Brief Description (only when not using existing article) */}
                {form.contentSource !== 'existing-article' && (
                  <div className="space-y-2">
                    <Label htmlFor="briefDescription">Mô tả ngắn gọn</Label>
                    <Textarea
                      id="briefDescription"
                      placeholder="Mô tả ngắn gọn về nội dung bạn muốn tạo..."
                      value={form.briefDescription}
                      onChange={(e) => setForm(prev => ({ ...prev, briefDescription: e.target.value }))}
                      rows={4}
                    />
                  </div>
                )}

                {/* Reference Link for existing article */}
                {form.contentSource === 'existing-article' && (
                  <div className="space-y-2">
                    <Label htmlFor="referenceLink">{t('dashboard.create.socialContent.step1.referenceLink')}</Label>
                    <Input
                      id="referenceLink"
                      type="url"
                      placeholder={t('dashboard.create.socialContent.step1.referencePlaceholder')}
                      value={form.referenceLink}
                      onChange={(e) => setForm(prev => ({ ...prev, referenceLink: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('dashboard.create.socialContent.referenceDescription')}
                    </p>
                  </div>
                )}

                {/* Reference Link (only when using AI from keywords) */}
                {form.contentSource === 'ai-keyword' && (
                  <div className="space-y-2">
                    <Label htmlFor="referenceLink">{t('dashboard.create.socialContent.step1.referenceLink')}</Label>
                    <Input
                      id="referenceLink"
                      type="url"
                      placeholder={t('dashboard.create.socialContent.step1.referencePlaceholder')}
                      value={form.referenceLink}
                      onChange={(e) => setForm(prev => ({ ...prev, referenceLink: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('dashboard.create.socialContent.referenceHelp')}
                    </p>
                  </div>
                )}

                {/* Target Platforms */}
                <div className="space-y-3">
                  <Label>{t('dashboard.create.socialContent.step1.platforms')}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {platforms.map((platform) => (
                      <div key={platform.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={platform.id}
                          checked={form.platforms.includes(platform.id)}
                          onCheckedChange={(checked) => handlePlatformChange(platform.id, checked as boolean)}
                        />
                        <Label 
                          htmlFor={platform.id}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {platform.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image Generation Section */}
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Image Generation</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeImage"
                        checked={form.includeImage}
                        onCheckedChange={(checked) => setForm(prev => ({ ...prev, includeImage: checked as boolean }))}
                      />
                      <Label htmlFor="includeImage" className="text-sm">Include Image</Label>
                    </div>
                  </div>

                  {form.includeImage && (
                    <div className="space-y-4">
                      {/* Image Source */}
                      <div className="space-y-2">
                        <Label>Image Source</Label>
                        <Select 
                          value={form.imageSource} 
                          onValueChange={(value) => setForm(prev => ({ ...prev, imageSource: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select image source" />
                          </SelectTrigger>
                          <SelectContent>
                            {imageSources.map((source) => (
                              <SelectItem key={source.value} value={source.value}>
                                <div className="flex items-center gap-2">
                                  <source.icon className="h-4 w-4" />
                                  {source.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* AI Image Prompt */}
                      {form.imageSource === 'ai-generated' && (
                        <div className="space-y-2">
                          <Label htmlFor="imagePrompt">AI Image Prompt</Label>
                          <Textarea
                            id="imagePrompt"
                            placeholder="Describe the image you want to generate..."
                            value={form.imagePrompt || ''}
                            onChange={(e) => setForm(prev => ({ ...prev, imagePrompt: e.target.value }))}
                            rows={3}
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            className="w-fit"
                            disabled={!form.imagePrompt?.trim()}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Image
                          </Button>
                        </div>
                      )}

                      {/* Image Library Selection */}
                      {form.imageSource === 'from-library' && (
                        <div className="space-y-3">
                          <Label>Select Image from Library</Label>
                          {imagesData?.images && imagesData.images.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto border rounded-lg p-3">
                              {imagesData.images.map((image: any) => (
                                <div
                                  key={image.id}
                                  className={`relative aspect-square rounded-lg border-2 cursor-pointer transition-all ${
                                    selectedImage?.id === image.id 
                                      ? 'border-primary ring-2 ring-primary/20' 
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                  onClick={() => setSelectedImage(image)}
                                >
                                  <img
                                    src={image.imageUrl}
                                    alt={image.title}
                                    className="w-full h-full object-cover rounded-md"
                                  />
                                  {selectedImage?.id === image.id && (
                                    <div className="absolute inset-0 bg-primary/10 rounded-md flex items-center justify-center">
                                      <Check className="w-6 h-6 text-primary" />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p>Không có ảnh nào trong thư viện</p>
                              <p className="text-sm">Hãy tạo ảnh mới hoặc upload ảnh trước</p>
                            </div>
                          )}
                          
                          {selectedImage && (
                            <div className="bg-muted p-3 rounded-lg">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={selectedImage.imageUrl} 
                                  alt={selectedImage.title}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{selectedImage.title}</p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {selectedImage.prompt}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Generated Content Display */}
            {generatedContent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Nội dung đã tạo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(generatedContent.platforms || {}).map(([platform, content]: [string, any]) => (
                      <div key={platform} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="capitalize">
                            {platform}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(content.text)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{content.text}</p>
                        {content.hashtags && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground mb-1">Hashtags:</p>
                            <p className="text-sm text-blue-600">{content.hashtags}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Preview & Stats */}
          <div className="space-y-6">
            {/* Preview Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedContent ? (
                  <div className="space-y-4">
                    {/* Platform Selector */}
                    <Select value={previewMode} onValueChange={setPreviewMode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {form.platforms.map((platformId) => {
                          const platform = platforms.find(p => p.id === platformId);
                          return (
                            <SelectItem key={platformId} value={platformId}>
                              {platform?.name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    {/* Preview Content */}
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <div className="text-sm">
                        {getPreviewContent()?.text || "Nội dung sẽ hiển thị ở đây"}
                      </div>
                      {getPreviewContent()?.hashtags && (
                        <div className="mt-2 text-sm text-blue-600">
                          {getPreviewContent().hashtags}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Nội dung đã tạo sẽ hiển thị ở đây
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Thống kê nhanh
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-primary">
                      {form.platforms.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Nền tảng</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-primary">
                      {user?.credits || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Tín dụng còn</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hướng dẫn tạo content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-1">Mô tả chi tiết</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Cung cấp mô tả càng chi tiết càng tốt để AI tạo nội dung phù hợp
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-medium text-green-900 dark:text-green-100 text-sm mb-1">Chọn nền tảng</h4>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Mỗi nền tảng có định dạng và phong cách riêng
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h4 className="font-medium text-purple-900 dark:text-purple-100 text-sm mb-1">Hashtags</h4>
                    <p className="text-xs text-purple-700 dark:text-purple-300">
                      AI sẽ tự động thêm hashtags phù hợp cho từng nền tảng
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog hiển thị kết quả từ AI */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              Chỉnh sửa Nội dung Trích xuất
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {generatedContent && (
              <div className="space-y-4">
                {/* Output section */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Output</Label>
                  <div className="border rounded-lg max-h-64 overflow-y-auto">
                    <div className="p-4 text-sm whitespace-pre-wrap">
                      {generatedContent.output || 'Không có nội dung output'}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <Button 
                    className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                    disabled={approveContentMutation.isPending}
                    onClick={() => {
                      approveContentMutation.mutate();
                    }}
                  >
                    {approveContentMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Phê duyệt
                  </Button>
                  
                  <Button 
                    variant="destructive"
                    className="flex items-center gap-2"
                    disabled={generateContentMutation.isPending}
                    onClick={() => {
                      setShowResultDialog(false);
                      // Tự động tạo lại nội dung
                      generateContentMutation.mutate(form);
                      toast({
                        title: "Đang tạo lại",
                        description: "Đang tạo lại nội dung với cùng thông tin...",
                      });
                    }}
                  >
                    {generateContentMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    Từ chối & Trích xuất lại
                  </Button>
                </div>
              </div>
            )}

            {/* Status message */}
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300">
                Nội dung đã được trích xuất. Vui lòng xem xét và phê duyệt.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog hiển thị kết quả cuối cùng - Bài viết đã tạo */}
      <Dialog open={showFinalResultDialog} onOpenChange={setShowFinalResultDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Bài viết đã tạo
            </DialogTitle>
            <DialogDescription>
              Nội dung đã được tạo thành công cho các nền tảng mạng xã hội
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {finalSocialContent && Array.isArray(finalSocialContent) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {finalSocialContent.map((item, index) => {
                  const platform = item.output?.['Nền tảng đăng']?.toLowerCase();
                  const content = item.output?.['Nội dung bài viết'];
                  
                  const platformConfig = {
                    linkedin: {
                      name: 'LinkedIn',
                      color: 'blue-600',
                      bgColor: 'blue-50 dark:bg-blue-950/20'
                    },
                    facebook: {
                      name: 'Facebook', 
                      color: 'blue-500',
                      bgColor: 'blue-50 dark:bg-blue-950/20'
                    },
                    x: {
                      name: 'X (Twitter)',
                      color: 'gray-800 dark:text-gray-200',
                      bgColor: 'gray-50 dark:bg-gray-800/20'
                    },
                    instagram: {
                      name: 'Instagram',
                      color: 'pink-500', 
                      bgColor: 'pink-50 dark:bg-pink-950/20'
                    }
                  };

                  const config = platformConfig[platform] || {
                    name: platform || 'Unknown',
                    color: 'gray-500',
                    bgColor: 'gray-50 dark:bg-gray-800/20'
                  };

                  return (
                    <div key={index} className="space-y-3">
                      <h3 className={`font-medium text-sm text-${config.color} flex items-center gap-2`}>
                        <div className={`w-4 h-4 bg-${config.color} rounded ${platform === 'instagram' ? 'bg-gradient-to-r from-pink-500 to-purple-500' : ''}`}></div>
                        {config.name}
                      </h3>
                      <div className={`p-4 ${config.bgColor} rounded-lg border`}>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">{t('dashboard.create.socialContent.articleContent')}:</p>
                          <div className="text-sm whitespace-pre-wrap bg-white dark:bg-gray-800 p-3 rounded border">
                            {content || t('dashboard.create.socialContent.noContent')}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Fallback for non-array response */}
            {finalSocialContent && !Array.isArray(finalSocialContent) && (
              <div className="space-y-3">
                <h3 className="font-medium text-sm">{t('dashboard.create.socialContent.generatedContent')}:</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                  <div className="text-sm whitespace-pre-wrap">
                    {finalSocialContent.output || JSON.stringify(finalSocialContent, null, 2)}
                  </div>
                </div>
              </div>
            )}

            {/* Debug info - hiển thị toàn bộ response để check structure */}
            {finalSocialContent && (
              <div className="mt-6">
                <details className="space-y-2">
                  <summary className="cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400">
{t('dashboard.create.socialContent.viewFullResponse')}
                  </summary>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border max-h-40 overflow-y-auto">
                    <pre className="text-xs">
                      {JSON.stringify(finalSocialContent, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                onClick={() => handleSaveToCreatedContent.mutate()}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                disabled={handleSaveToCreatedContent.isPending}
              >
                {handleSaveToCreatedContent.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t('social.action.save', 'Đang lưu...')}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {t('social.nav.finish', 'Hoàn thành')}
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  if (finalSocialContent) {
                    navigator.clipboard.writeText(JSON.stringify(finalSocialContent, null, 2));
                    toast({
                      title: t('social.action.copy', 'Đã sao chép'),
                      description: t('social.action.copyDesc', 'Toàn bộ nội dung đã được sao chép vào clipboard'),
                    });
                  }
                }}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                {t('social.action.copyAll', 'Copy tất cả')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}