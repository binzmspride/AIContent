import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Image, Upload, Palette, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WizardData {
  imageOption: 'none' | 'generate' | 'library';
  selectedImageId?: number;
  imagePrompt?: string;
  generatedImageUrl?: string;
}

interface ImageManagementStepProps {
  data: WizardData;
  onDataChange: (updates: Partial<WizardData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function ImageManagementStep({ data, onDataChange, onNext }: ImageManagementStepProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch images from library
  const { data: imagesData } = useQuery({
    queryKey: ['/api/images'],
    select: (response: any) => response?.data || []
  });

  // Generate image mutation
  const generateImageMutation = useMutation({
    mutationFn: async (prompt: string) => {
      return await apiRequest('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
    },
    onSuccess: (response) => {
      onDataChange({ generatedImageUrl: response.data.imageUrl });
      setIsGenerating(false);
      toast({
        title: "Thành công",
        description: "Đã tạo hình ảnh thành công"
      });
    },
    onError: (error: any) => {
      setIsGenerating(false);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo hình ảnh",
        variant: "destructive"
      });
    }
  });

  const handleGenerateImage = () => {
    if (!data.imagePrompt?.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập mô tả hình ảnh",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    generateImageMutation.mutate(data.imagePrompt);
  };

  const handleImageSelect = (imageId: number) => {
    onDataChange({ selectedImageId: imageId });
  };

  const canProceed = 
    data.imageOption === 'none' || 
    (data.imageOption === 'generate' && data.generatedImageUrl) ||
    (data.imageOption === 'library' && data.selectedImageId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Image className="w-5 h-5" />
            <span>Bước 3: Quản lý hình ảnh</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Options */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Lựa chọn hình ảnh</Label>
            <RadioGroup
              value={data.imageOption}
              onValueChange={(value: 'none' | 'generate' | 'library') => 
                onDataChange({ imageOption: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none">Không sử dụng hình ảnh</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="generate" id="generate" />
                <Label htmlFor="generate">Tạo hình ảnh bằng AI</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="library" id="library" />
                <Label htmlFor="library">Chọn từ thư viện</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Generate Image Section */}
          {data.imageOption === 'generate' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base font-medium">Mô tả hình ảnh</Label>
                <Textarea
                  placeholder="Mô tả chi tiết về hình ảnh bạn muốn tạo..."
                  value={data.imagePrompt || ''}
                  onChange={(e) => onDataChange({ imagePrompt: e.target.value })}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleGenerateImage}
                disabled={isGenerating || generateImageMutation.isPending}
                className="w-full"
              >
                {(isGenerating || generateImageMutation.isPending) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tạo hình ảnh...
                  </>
                ) : (
                  <>
                    <Palette className="w-4 h-4 mr-2" />
                    Tạo hình ảnh
                  </>
                )}
              </Button>

              {/* Generated Image Preview */}
              {data.generatedImageUrl && (
                <div className="space-y-3">
                  <Label className="text-base font-medium flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Hình ảnh đã tạo</span>
                  </Label>
                  <div className="border rounded-lg p-4">
                    <img
                      src={data.generatedImageUrl}
                      alt="Generated image"
                      className="w-full max-w-md mx-auto rounded-lg"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleGenerateImage}
                    disabled={isGenerating || generateImageMutation.isPending}
                    className="w-full"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Tạo hình ảnh khác
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Image Library Section */}
          {data.imageOption === 'library' && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Chọn từ thư viện</Label>
              
              {imagesData && imagesData.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagesData.map((image: any) => (
                    <div
                      key={image.id}
                      className={`border-2 rounded-lg p-2 cursor-pointer transition-colors ${
                        data.selectedImageId === image.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleImageSelect(image.id)}
                    >
                      <img
                        src={image.url}
                        alt={image.prompt || 'Image'}
                        className="w-full h-32 object-cover rounded"
                      />
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 truncate">
                        {image.prompt || 'Không có mô tả'}
                      </div>
                      {data.selectedImageId === image.id && (
                        <div className="mt-1 flex items-center text-blue-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm">Đã chọn</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có hình ảnh trong thư viện</p>
                </div>
              )}
            </div>
          )}

          {/* No Image Selected */}
          {data.imageOption === 'none' && (
            <div className="text-center py-8 text-gray-500">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Image className="w-6 h-6 opacity-50" />
              </div>
              <p>Bài viết sẽ được đăng không có hình ảnh</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Button */}
      {canProceed && (
        <div className="flex justify-end">
          <Button onClick={onNext} className="px-8">
            Tiếp theo: Xem trước
          </Button>
        </div>
      )}
    </div>
  );
}