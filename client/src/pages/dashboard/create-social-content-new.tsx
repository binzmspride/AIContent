import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/dashboard/Layout';
import { SocialContentWizard } from '@/components/social-content/SocialContentWizard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileText, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';

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
  imageOption: 'none' | 'generate' | 'library';
  selectedImageId?: number;
  imagePrompt?: string;
  generatedImageUrl?: string;
  title?: string;
  saveToLibrary: boolean;
  schedulePost: boolean;
  publishImmediately: boolean;
}

export default function CreateSocialContent() {
  const { user } = useAuth();
  const [showWizard, setShowWizard] = useState(false);
  const [completedProject, setCompletedProject] = useState<WizardData | null>(null);

  const handleStartWizard = () => {
    setShowWizard(true);
    setCompletedProject(null);
  };

  const handleWizardComplete = (data: WizardData) => {
    setCompletedProject(data);
    setShowWizard(false);
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
  };

  const handleStartNew = () => {
    setCompletedProject(null);
    setShowWizard(true);
  };

  if (showWizard) {
    return (
      <DashboardLayout>
        <SocialContentWizard 
          onComplete={handleWizardComplete}
          onCancel={handleWizardCancel}
        />
      </DashboardLayout>
    );
  }

  if (completedProject) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-400">
                <CheckCircle className="w-6 h-6" />
                <span>Hoàn thành thành công!</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-green-700 dark:text-green-300">
                Nội dung social media đã được tạo và lưu thành công.
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Nền tảng đã tạo:</h4>
                  <div className="flex flex-wrap gap-2">
                    {completedProject.platforms.map(platform => (
                      <Badge key={platform} variant="secondary">
                        {platform === 'facebook' ? 'Facebook' :
                         platform === 'instagram' ? 'Instagram' :
                         platform === 'tiktok' ? 'TikTok' :
                         platform === 'linkedin' ? 'LinkedIn' :
                         platform === 'twitter' ? 'Twitter/X' : platform}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Hình ảnh:</h4>
                  <Badge variant="outline">
                    {completedProject.imageOption === 'none' ? 'Không có hình ảnh' :
                     completedProject.imageOption === 'generate' ? 'Đã tạo bằng AI' :
                     'Từ thư viện'}
                  </Badge>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button onClick={handleStartNew} className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Tạo nội dung mới</span>
                </Button>
                
                <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                  Về Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Tạo Content Social Media</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Tạo nội dung tối ưu cho nhiều nền tảng mạng xã hội với quy trình 5 bước đơn giản
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Trích xuất thông minh</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tự động trích xuất các ý chính từ bài viết hoặc URL tham khảo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Tạo đa nền tảng</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tạo nội dung tối ưu cho Facebook, Instagram, TikTok, LinkedIn, Twitter
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>Preview trực quan</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Xem trước giao diện thực tế trên từng nền tảng social media
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Process Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Quy trình tạo nội dung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { step: 1, title: 'Trích xuất nội dung', desc: 'Lấy ý chính từ bài viết hoặc mô tả' },
                { step: 2, title: 'Tạo nội dung', desc: 'AI tạo post tối ưu cho từng nền tảng' },
                { step: 3, title: 'Quản lý hình ảnh', desc: 'Tạo hoặc chọn hình ảnh phù hợp' },
                { step: 4, title: 'Xem trước', desc: 'Preview giao diện trên social media' },
                { step: 5, title: 'Lưu & Đăng', desc: 'Hoàn tất và lưu vào thư viện' }
              ].map((item, index) => (
                <div key={item.step} className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-medium">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</div>
                  </div>
                  {index < 4 && <ArrowRight className="w-4 h-4 text-gray-400" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Stats */}
        {user && (
          <Card>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Credits hiện tại: <span className="font-medium text-blue-600">{user.credits}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Chi phí: <span className="font-medium">5 credits</span>
                </div>
              </div>
              
              <Button 
                onClick={handleStartWizard}
                disabled={user.credits < 5}
                className="flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Bắt đầu tạo content</span>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}