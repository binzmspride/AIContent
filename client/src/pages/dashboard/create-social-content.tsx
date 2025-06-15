import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Loader2, Sparkles, FileText, Eye, Copy, Download, Share2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialContentForm {
  contentSource: string;
  briefDescription: string;
  platforms: string[];
  includeImage: boolean;
}

export default function CreateSocialContentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [form, setForm] = useState<SocialContentForm>({
    contentSource: '',
    briefDescription: '',
    platforms: [],
    includeImage: false
  });

  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState('facebook');

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
    if (!form.contentSource || !form.briefDescription || form.platforms.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
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

                {/* Brief Description */}
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

                {/* Include Image Option */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeImage"
                    checked={form.includeImage}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, includeImage: checked as boolean }))}
                  />
                  <Label htmlFor="includeImage" className="text-sm">
                    Bao gồm hình ảnh
                  </Label>
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