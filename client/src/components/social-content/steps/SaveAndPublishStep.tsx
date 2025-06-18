import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Save, Send, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WizardData {
  platforms: string[];
  generatedContent?: {
    [platform: string]: string;
  };
  imageOption: 'none' | 'generate' | 'library';
  selectedImageId?: number;
  generatedImageUrl?: string;
  title?: string;
  saveToLibrary: boolean;
  schedulePost: boolean;
  publishImmediately: boolean;
}

interface SaveAndPublishStepProps {
  data: WizardData;
  onDataChange: (updates: Partial<WizardData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onComplete: (data: WizardData) => void;
}

const platformNames = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  twitter: 'Twitter/X'
};

export function SaveAndPublishStep({ data, onDataChange, onComplete }: SaveAndPublishStepProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  // Save content mutation
  const saveContentMutation = useMutation({
    mutationFn: async () => {
      // Transform content for saving
      const contentArray = data.platforms.map(platform => ({
        output: {
          'Nội dung bài viết': data.generatedContent?.[platform] || '',
          'Nền tảng đăng': platformNames[platform as keyof typeof platformNames]
        }
      }));

      const payload = {
        content: contentArray,
        title: data.title || `Social Media Content - ${new Date().toLocaleDateString('vi-VN')}`,
        platforms: data.platforms,
        contentSource: 'wizard-generated',
        selectedArticleId: null
      };

      return await apiRequest('/api/social/save-created-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    },
    onSuccess: () => {
      // Invalidate articles cache to refresh "Nội dung đã tạo" list
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/articles'] });
      
      setIsSaving(false);
      toast({
        title: "Thành công",
        description: "Nội dung đã được lưu vào thư viện"
      });
      
      onComplete(data);
    },
    onError: (error: any) => {
      setIsSaving(false);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu nội dung",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    if (!data.title?.trim()) {
      onDataChange({ 
        title: `Social Media Content - ${new Date().toLocaleDateString('vi-VN')}` 
      });
    }

    setIsSaving(true);
    saveContentMutation.mutate();
  };

  const getContentPreview = () => {
    const firstPlatform = data.platforms[0];
    const content = data.generatedContent?.[firstPlatform] || '';
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Save className="w-5 h-5" />
            <span>Bước 5: Lưu & Xuất bản</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content Summary */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Tóm tắt nội dung</Label>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
              <div>
                <span className="font-medium">Nền tảng: </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {data.platforms.map(platform => (
                    <Badge key={platform} variant="secondary">
                      {platformNames[platform as keyof typeof platformNames]}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="font-medium">Hình ảnh: </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {data.imageOption === 'none' ? 'Không có' : 
                   data.imageOption === 'generate' ? 'Được tạo bằng AI' : 'Từ thư viện'}
                </span>
              </div>
              
              <div>
                <span className="font-medium">Nội dung mẫu: </span>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  "{getContentPreview()}"
                </div>
              </div>
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Tiêu đề lưu trữ</Label>
            <Input
              placeholder={`Social Media Content - ${new Date().toLocaleDateString('vi-VN')}`}
              value={data.title || ''}
              onChange={(e) => onDataChange({ title: e.target.value })}
            />
          </div>

          <Separator />

          {/* Action Options */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Tùy chọn lưu trữ và xuất bản</Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="saveToLibrary"
                  checked={data.saveToLibrary}
                  onCheckedChange={(checked) => 
                    onDataChange({ saveToLibrary: checked as boolean })
                  }
                />
                <Label htmlFor="saveToLibrary" className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Lưu vào thư viện "Nội dung đã tạo"</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2 opacity-50">
                <Checkbox
                  id="schedulePost"
                  checked={data.schedulePost}
                  onCheckedChange={(checked) => 
                    onDataChange({ schedulePost: checked as boolean })
                  }
                  disabled={true}
                />
                <Label htmlFor="schedulePost" className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Lên lịch đăng (Sắp có)</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2 opacity-50">
                <Checkbox
                  id="publishImmediately"
                  checked={data.publishImmediately}
                  onCheckedChange={(checked) => 
                    onDataChange({ publishImmediately: checked as boolean })
                  }
                  disabled={true}
                />
                <Label htmlFor="publishImmediately" className="flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Đăng ngay lập tức (Sắp có)</span>
                </Label>
              </div>
            </div>
          </div>

          {/* Platform Status */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Trạng thái nền tảng</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.platforms.map(platform => (
                <div key={platform} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full bg-green-500`} />
                    <span>{platformNames[platform as keyof typeof platformNames]}</span>
                  </div>
                  <Badge variant="outline">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Sẵn sàng
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving || saveContentMutation.isPending}
              className="px-8"
            >
              {(isSaving || saveContentMutation.isPending) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Hoàn thành & Lưu
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      {saveContentMutation.isSuccess && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <div className="font-medium text-green-800 dark:text-green-400">
                  Hoàn thành thành công!
                </div>
                <div className="text-sm text-green-600 dark:text-green-300">
                  Nội dung đã được lưu vào thư viện. Bạn có thể xem trong phần "Nội dung đã tạo".
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}