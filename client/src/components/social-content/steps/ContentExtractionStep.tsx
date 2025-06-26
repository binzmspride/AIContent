import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Link, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';

interface WizardData {
  contentSource: 'manual' | 'existing-article';
  briefDescription: string;
  selectedArticleId?: number;
  referenceLink?: string;
  platforms: string[];
  extractedContent?: string;
}

interface ContentExtractionStepProps {
  data: WizardData;
  onDataChange: (updates: Partial<WizardData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const platformOptions = [
  { value: 'facebook', label: 'Facebook', color: 'bg-blue-600' },
  { value: 'instagram', label: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { value: 'tiktok', label: 'TikTok', color: 'bg-black' },
  { value: 'linkedin', label: 'LinkedIn', color: 'bg-blue-700' },
  { value: 'twitter', label: 'Twitter/X', color: 'bg-gray-900' }
];

export function ContentExtractionStep({ data, onDataChange, onNext }: ContentExtractionStepProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isExtracting, setIsExtracting] = useState(false);

  // Fetch existing articles
  const { data: articlesData } = useQuery({
    queryKey: ['/api/dashboard/articles'],
    select: (response: any) => response?.data?.articles || []
  });

  // Extract content mutation
  const extractContentMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        contentSource: data.contentSource,
        briefDescription: data.briefDescription,
        selectedArticleId: data.selectedArticleId,
        referenceLink: data.referenceLink,
        platforms: data.platforms
      };

      return await apiRequest('/api/social/extract-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    },
    onSuccess: (response: any) => {
      onDataChange({ extractedContent: response.extractedContent });
      toast({
        title: "Thành công",
        description: "Đã trích xuất các ý chính từ nội dung"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể trích xuất nội dung",
        variant: "destructive"
      });
    }
  });

  const handlePlatformToggle = (platform: string, checked: boolean) => {
    const newPlatforms = checked 
      ? [...data.platforms, platform]
      : data.platforms.filter(p => p !== platform);
    onDataChange({ platforms: newPlatforms });
  };

  const handleExtractContent = () => {
    if (!data.briefDescription.trim()) {
      toast({
        title: t("common.missingInfo"),
        description: t("dashboard.create.socialContent.step1.descriptionRequired"),
        variant: "destructive"
      });
      return;
    }

    if (data.platforms.length === 0) {
      toast({
        title: t("common.missingInfo"), 
        description: t("dashboard.create.socialContent.step1.platformRequired"),
        variant: "destructive"
      });
      return;
    }

    if (data.contentSource === 'existing-article' && !data.selectedArticleId) {
      toast({
        title: t("common.missingInfo"),
        description: t("dashboard.create.socialContent.step1.articleRequired"),
        variant: "destructive"
      });
      return;
    }

    setIsExtracting(true);
    extractContentMutation.mutate();
  };

  const canProceed = data.extractedContent && data.extractedContent.trim().length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>{t('dashboard.create.socialContent.step1.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content Source */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t('dashboard.create.socialContent.step1.contentSource')}</Label>
            <Select
              value={data.contentSource}
              onValueChange={(value: 'manual' | 'existing-article') => 
                onDataChange({ contentSource: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="existing-article">{t('dashboard.create.socialContent.step1.fromArticle')}</SelectItem>
                <SelectItem value="manual">{t('dashboard.create.socialContent.step1.manual')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Article Selection */}
          {data.contentSource === 'existing-article' && (
            <div className="space-y-3">
              <Label className="text-base font-medium">{t('dashboard.create.socialContent.step1.selectArticle')}</Label>
              <Select
                value={data.selectedArticleId?.toString() || ''}
                onValueChange={(value) => 
                  onDataChange({ selectedArticleId: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('dashboard.create.socialContent.step1.selectArticlePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {articlesData?.map((article: any) => (
                    <SelectItem key={article.id} value={article.id.toString()}>
                      {article.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Reference Link */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              <Link className="w-4 h-4 inline mr-2" />
              {t('dashboard.create.socialContent.step1.referenceLink')}
            </Label>
            <Input
              type="url"
              placeholder={t('dashboard.create.socialContent.step1.referencePlaceholder')}
              value={data.referenceLink || ''}
              onChange={(e) => onDataChange({ referenceLink: e.target.value })}
            />
          </div>

          {/* Brief Description */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t('dashboard.create.socialContent.step1.description')}</Label>
            <Textarea
              placeholder={t('dashboard.create.socialContent.step1.descriptionPlaceholder')}
              value={data.briefDescription}
              onChange={(e) => onDataChange({ briefDescription: e.target.value })}
              rows={4}
            />
          </div>

          {/* Platform Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t('dashboard.create.socialContent.step1.platforms')}</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {platformOptions.map((platform) => (
                <div
                  key={platform.value}
                  className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Checkbox
                    id={platform.value}
                    checked={data.platforms.includes(platform.value)}
                    onCheckedChange={(checked) => 
                      handlePlatformToggle(platform.value, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={platform.value}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                    <span>{platform.label}</span>
                  </Label>
                </div>
              ))}
            </div>
            {data.platforms.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {data.platforms.map((platform) => {
                  const platformInfo = platformOptions.find(p => p.value === platform);
                  return (
                    <Badge key={platform} variant="secondary">
                      {platformInfo?.label}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Extract Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleExtractContent}
              disabled={isExtracting || extractContentMutation.isPending}
              className="px-8 py-2"
            >
              {(isExtracting || extractContentMutation.isPending) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('common.extracting')}
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  {t('dashboard.create.socialContent.step1.extractAndContinue')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Extracted Content */}
      {data.extractedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Nội dung đã trích xuất</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: data.extractedContent
                    .replace(/\n/g, '<br>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/- (.*?)(?=\n|$)/g, '• $1')
                    .replace(/\+ (.*?)(?=\n|$)/g, '&nbsp;&nbsp;• $1')
                }}
              />
            </div>
            <div className="mt-4">
              <Label className="text-base font-medium">Chỉnh sửa nội dung (tùy chọn)</Label>
              <Textarea
                value={data.extractedContent}
                onChange={(e) => onDataChange({ extractedContent: e.target.value })}
                rows={6}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Button */}
      {canProceed && (
        <div className="flex justify-end">
          <Button onClick={onNext} className="px-8">
            Tiếp theo: Tạo nội dung
          </Button>
        </div>
      )}
    </div>
  );
}