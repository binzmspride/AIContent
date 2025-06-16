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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Loader2, Sparkles, FileText, Eye, Copy, Download, Share2, Zap, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialContentForm {
  contentSource: string;
  briefDescription: string;
  selectedArticleId?: number;
  referenceLink?: string;
  platforms: string[];
  includeImage: boolean;
  imageSource?: string;
  imagePrompt?: string;
}

export default function CreateSocialContentPage() {
  const { user } = useAuth();
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
    imagePrompt: ''
  });

  const [selectedImage, setSelectedImage] = useState<any>(null);

  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState('facebook');
  const [open, setOpen] = useState(false);

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
      return await apiRequest('/api/social/generate-content', 'POST', data);
    },
    onSuccess: (data) => {
      setGeneratedContent(data.data);
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

  const getPreviewContent = () => {
    if (!generatedContent || !generatedContent.platforms) return null;
    return generatedContent.platforms[previewMode];
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Tạo Content Social Media</h1>
            <p className="text-muted-foreground mt-2">
              Tạo nội dung tối ưu cho nhiều nền tảng social media
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

                {/* Reference Link (only when using AI from keywords) */}
                {form.contentSource === 'ai-keyword' && (
                  <div className="space-y-2">
                    <Label htmlFor="referenceLink">Link tham khảo (tùy chọn)</Label>
                    <Input
                      id="referenceLink"
                      type="url"
                      placeholder="https://example.com/bai-viet-tham-khao"
                      value={form.referenceLink}
                      onChange={(e) => setForm(prev => ({ ...prev, referenceLink: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Nhập link bài viết để AI tham khảo phong cách và nội dung
                    </p>
                  </div>
                )}

                {/* Target Platforms */}
                <div className="space-y-3">
                  <Label>Nền tảng mục tiêu</Label>
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
    </DashboardLayout>
  );
}