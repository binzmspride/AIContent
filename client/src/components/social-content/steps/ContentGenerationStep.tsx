import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, Edit, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WizardData {
  contentSource: 'manual' | 'existing-article';
  briefDescription: string;
  selectedArticleId?: number;
  referenceLink?: string;
  platforms: string[];
  extractedContent?: string;
  generatedContent?: {
    [platform: string]: string;
  };
}

interface ContentGenerationStepProps {
  data: WizardData;
  onDataChange: (updates: Partial<WizardData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const platformNames = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  twitter: 'Twitter/X'
};

export function ContentGenerationStep({ data, onDataChange, onNext }: ContentGenerationStepProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(data.platforms[0] || 'facebook');
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate content mutation
  const generateContentMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        extractedContent: data.extractedContent,
        platforms: data.platforms,
        contentSource: data.contentSource,
        selectedArticleId: data.selectedArticleId,
        referenceLink: data.referenceLink,
        genSEO: data.contentSource === 'existing-article' ? false : true
      };

      return await apiRequest('/api/social/create-final-content', 'POST', payload);
    },
    onSuccess: (response) => {
      // Transform response data to match our expected format
      const generatedContent: { [platform: string]: string } = {};
      
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((item: any) => {
          if (item.output) {
            const platform = item.output['Nền tảng đăng']?.toLowerCase();
            const content = item.output['Nội dung bài viết'];
            if (platform && content) {
              generatedContent[platform] = content;
            }
          }
        });
      }

      onDataChange({ generatedContent });
      setIsGenerating(false);
      
      toast({
        title: "Thành công",
        description: "Đã tạo nội dung cho tất cả nền tảng"
      });
    },
    onError: (error: any) => {
      setIsGenerating(false);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo nội dung",
        variant: "destructive"
      });
    }
  });

  const handleGenerateContent = () => {
    if (!data.extractedContent) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng hoàn thành bước trích xuất nội dung trước",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    generateContentMutation.mutate();
  };

  const handleContentEdit = (platform: string, content: string) => {
    const updatedContent = {
      ...data.generatedContent,
      [platform]: content
    };
    onDataChange({ generatedContent: updatedContent });
  };

  const hasGeneratedContent = data.generatedContent && Object.keys(data.generatedContent).length > 0;
  const canProceed = hasGeneratedContent;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5" />
            <span>Bước 2: Tạo nội dung cho từng nền tảng</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Source Content Preview */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Nội dung nguồn</Label>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg max-h-32 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                {data.extractedContent}
              </pre>
            </div>
          </div>

          {/* Target Platforms */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Nền tảng được chọn</Label>
            <div className="flex flex-wrap gap-2">
              {data.platforms.map((platform) => (
                <Badge key={platform} variant="secondary">
                  {platformNames[platform as keyof typeof platformNames]}
                </Badge>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          {!hasGeneratedContent && (
            <div className="flex justify-center">
              <Button
                onClick={handleGenerateContent}
                disabled={isGenerating || generateContentMutation.isPending}
                className="px-8 py-2"
              >
                {(isGenerating || generateContentMutation.isPending) ? (
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Content */}
      {hasGeneratedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Nội dung đã tạo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {data.platforms.map((platform) => (
                  <TabsTrigger key={platform} value={platform}>
                    {platformNames[platform as keyof typeof platformNames]}
                  </TabsTrigger>
                ))}
              </TabsList>

              {data.platforms.map((platform) => (
                <TabsContent key={platform} value={platform} className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">
                        Nội dung cho {platformNames[platform as keyof typeof platformNames]}
                      </Label>
                      <Badge variant="outline">
                        <Edit className="w-3 h-3 mr-1" />
                        Có thể chỉnh sửa
                      </Badge>
                    </div>
                    
                    <Textarea
                      value={data.generatedContent?.[platform] || ''}
                      onChange={(e) => handleContentEdit(platform, e.target.value)}
                      rows={8}
                      placeholder="Nội dung sẽ xuất hiện ở đây..."
                      className="resize-none"
                    />
                    
                    <div className="text-sm text-gray-500">
                      Độ dài: {data.generatedContent?.[platform]?.length || 0} ký tự
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Regenerate Button */}
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={handleGenerateContent}
                disabled={isGenerating || generateContentMutation.isPending}
              >
                {(isGenerating || generateContentMutation.isPending) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tạo lại...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Tạo lại nội dung
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Button */}
      {canProceed && (
        <div className="flex justify-end">
          <Button onClick={onNext} className="px-8">
            Tiếp theo: Quản lý hình ảnh
          </Button>
        </div>
      )}
    </div>
  );
}