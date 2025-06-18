import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, MessageCircle, Share, MoreHorizontal, Bookmark, Send } from 'lucide-react';

interface WizardData {
  platforms: string[];
  generatedContent?: {
    [platform: string]: string;
  };
  imageOption: 'none' | 'generate' | 'library';
  selectedImageId?: number;
  generatedImageUrl?: string;
}

interface SocialPreviewStepProps {
  data: WizardData;
  onDataChange: (updates: Partial<WizardData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

// Mock social media previews
const FacebookPreview = ({ content, imageUrl }: { content: string; imageUrl?: string }) => (
  <div className="bg-white dark:bg-gray-900 border rounded-lg p-4 max-w-md mx-auto">
    <div className="flex items-center space-x-3 mb-3">
      <Avatar className="w-10 h-10">
        <AvatarImage src="/placeholder-avatar.jpg" />
        <AvatarFallback>Page</AvatarFallback>
      </Avatar>
      <div>
        <div className="font-semibold text-sm">Your Page Name</div>
        <div className="text-xs text-gray-500">2 phút · 🌍</div>
      </div>
      <div className="ml-auto">
        <MoreHorizontal className="w-5 h-5 text-gray-400" />
      </div>
    </div>
    
    <div className="text-sm mb-3">{content}</div>
    
    {imageUrl && (
      <div className="mb-3">
        <img src={imageUrl} alt="Post image" className="w-full rounded-lg" />
      </div>
    )}
    
    <div className="flex items-center justify-between py-2 border-t text-gray-500">
      <div className="flex items-center space-x-1">
        <Heart className="w-5 h-5" />
        <span className="text-sm">Thích</span>
      </div>
      <div className="flex items-center space-x-1">
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm">Bình luận</span>
      </div>
      <div className="flex items-center space-x-1">
        <Share className="w-5 h-5" />
        <span className="text-sm">Chia sẻ</span>
      </div>
    </div>
  </div>
);

const InstagramPreview = ({ content, imageUrl }: { content: string; imageUrl?: string }) => (
  <div className="bg-white dark:bg-gray-900 border rounded-lg max-w-md mx-auto">
    <div className="flex items-center justify-between p-3">
      <div className="flex items-center space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src="/placeholder-avatar.jpg" />
          <AvatarFallback>Your</AvatarFallback>
        </Avatar>
        <span className="font-semibold text-sm">yourusername</span>
      </div>
      <MoreHorizontal className="w-5 h-5" />
    </div>
    
    {imageUrl && (
      <div className="aspect-square">
        <img src={imageUrl} alt="Post image" className="w-full h-full object-cover" />
      </div>
    )}
    
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-4">
          <Heart className="w-6 h-6" />
          <MessageCircle className="w-6 h-6" />
          <Send className="w-6 h-6" />
        </div>
        <Bookmark className="w-6 h-6" />
      </div>
      
      <div className="text-sm">
        <span className="font-semibold">yourusername</span> {content}
      </div>
      
      <div className="text-xs text-gray-500 mt-1">2 phút trước</div>
    </div>
  </div>
);

const LinkedInPreview = ({ content, imageUrl }: { content: string; imageUrl?: string }) => (
  <div className="bg-white dark:bg-gray-900 border rounded-lg p-4 max-w-md mx-auto">
    <div className="flex items-center space-x-3 mb-3">
      <Avatar className="w-12 h-12">
        <AvatarImage src="/placeholder-avatar.jpg" />
        <AvatarFallback>You</AvatarFallback>
      </Avatar>
      <div>
        <div className="font-semibold text-sm">Your Name</div>
        <div className="text-xs text-gray-500">Your Title • 2nd</div>
        <div className="text-xs text-gray-500">2 phút • 🌍</div>
      </div>
    </div>
    
    <div className="text-sm mb-3">{content}</div>
    
    {imageUrl && (
      <div className="mb-3">
        <img src={imageUrl} alt="Post image" className="w-full rounded-lg" />
      </div>
    )}
    
    <div className="flex items-center justify-between py-2 border-t text-gray-600">
      <span className="text-xs">👍 ❤️ 💡 12</span>
      <span className="text-xs">3 bình luận</span>
    </div>
    
    <div className="flex items-center justify-around py-2 border-t text-gray-500">
      <div className="flex items-center space-x-1">
        <span className="text-sm">👍 Thích</span>
      </div>
      <div className="flex items-center space-x-1">
        <span className="text-sm">💬 Bình luận</span>
      </div>
      <div className="flex items-center space-x-1">
        <span className="text-sm">🔄 Chia sẻ</span>
      </div>
    </div>
  </div>
);

const TwitterPreview = ({ content, imageUrl }: { content: string; imageUrl?: string }) => (
  <div className="bg-white dark:bg-gray-900 border rounded-lg p-4 max-w-md mx-auto">
    <div className="flex space-x-3">
      <Avatar className="w-10 h-10">
        <AvatarImage src="/placeholder-avatar.jpg" />
        <AvatarFallback>You</AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center space-x-1 mb-1">
          <span className="font-bold text-sm">Your Name</span>
          <span className="text-gray-500 text-sm">@yourusername</span>
          <span className="text-gray-500 text-sm">·</span>
          <span className="text-gray-500 text-sm">2 phút</span>
        </div>
        
        <div className="text-sm mb-3">{content}</div>
        
        {imageUrl && (
          <div className="mb-3">
            <img src={imageUrl} alt="Post image" className="w-full rounded-lg border" />
          </div>
        )}
        
        <div className="flex items-center justify-between max-w-md text-gray-500">
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">12</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-sm">🔄 5</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="w-4 h-4" />
            <span className="text-sm">24</span>
          </div>
          <div className="flex items-center space-x-1">
            <Share className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TikTokPreview = ({ content, imageUrl }: { content: string; imageUrl?: string }) => (
  <div className="bg-black text-white rounded-lg overflow-hidden max-w-md mx-auto" style={{ aspectRatio: '9/16', maxHeight: '400px' }}>
    <div className="relative h-full">
      {imageUrl ? (
        <img src={imageUrl} alt="Video thumbnail" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎵</div>
            <div className="text-lg">Video Content</div>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70">
        <div className="text-sm mb-2">{content}</div>
        <div className="flex items-center space-x-2">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs">You</AvatarFallback>
          </Avatar>
          <span className="text-sm">@yourusername</span>
        </div>
      </div>
      
      <div className="absolute right-4 bottom-20 space-y-4">
        <div className="text-center">
          <Heart className="w-8 h-8 mx-auto mb-1" />
          <div className="text-xs">123</div>
        </div>
        <div className="text-center">
          <MessageCircle className="w-8 h-8 mx-auto mb-1" />
          <div className="text-xs">45</div>
        </div>
        <div className="text-center">
          <Share className="w-8 h-8 mx-auto mb-1" />
          <div className="text-xs">67</div>
        </div>
      </div>
    </div>
  </div>
);

export function SocialPreviewStep({ data, onNext }: SocialPreviewStepProps) {
  const [activeTab, setActiveTab] = useState(data.platforms[0] || 'facebook');

  const getImageUrl = () => {
    if (data.imageOption === 'generate' && data.generatedImageUrl) {
      return data.generatedImageUrl;
    }
    // For library images, we would need to fetch the actual image URL
    // For now, return a placeholder if an image is selected
    if (data.imageOption === 'library' && data.selectedImageId) {
      return '/placeholder-image.jpg'; // This should be replaced with actual image URL
    }
    return undefined;
  };

  const renderPreview = (platform: string) => {
    const content = data.generatedContent?.[platform] || 'Nội dung sẽ hiển thị ở đây...';
    const imageUrl = getImageUrl();

    switch (platform) {
      case 'facebook':
        return <FacebookPreview content={content} imageUrl={imageUrl} />;
      case 'instagram':
        return <InstagramPreview content={content} imageUrl={imageUrl} />;
      case 'linkedin':
        return <LinkedInPreview content={content} imageUrl={imageUrl} />;
      case 'twitter':
        return <TwitterPreview content={content} imageUrl={imageUrl} />;
      case 'tiktok':
        return <TikTokPreview content={content} imageUrl={imageUrl} />;
      default:
        return <div className="text-center text-gray-500">Không hỗ trợ preview cho nền tảng này</div>;
    }
  };

  const platformNames = {
    facebook: 'Facebook',
    instagram: 'Instagram', 
    tiktok: 'TikTok',
    linkedin: 'LinkedIn',
    twitter: 'Twitter/X'
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Bước 4: Xem trước giao diện Social Media</span>
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
              <TabsContent key={platform} value={platform} className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      Preview cho {platformNames[platform as keyof typeof platformNames]}
                    </Badge>
                    <div className="text-sm text-gray-500">
                      {data.imageOption === 'none' ? 'Không có hình ảnh' : 'Có hình ảnh đính kèm'}
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    {renderPreview(platform)}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Next Button */}
      <div className="flex justify-end">
        <Button onClick={onNext} className="px-8">
          Tiếp theo: Lưu & Đăng
        </Button>
      </div>
    </div>
  );
}