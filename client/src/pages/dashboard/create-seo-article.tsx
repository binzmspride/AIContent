import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/dashboard/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { useLocation } from 'wouter';

interface FormData {
  keywords: string;
  topic: string;
}

export default function CreateSeoArticle() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState<FormData>({
    keywords: '',
    topic: ''
  });

  const createArticleMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/dashboard/articles/generate', {
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
        topic: formData.topic,
        type: 'blog',
        complexity: 'medium'
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      if (data?.success) {
        toast({
          title: "Thành công",
          description: "Đã tạo bài viết SEO thành công"
        });
        
        // Redirect to articles list
        setLocation('/dashboard/articles');
      } else {
        toast({
          title: "Lỗi",
          description: data?.error || "Không thể tạo bài viết",
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo bài viết",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.keywords.trim() || !formData.topic.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive"
      });
      return;
    }

    createArticleMutation.mutate();
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Tạo bài viết SEO mới
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="keywords">Từ khóa chính *</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="Ví dụ: cây xanh, chăm sóc cây"
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Nhập các từ khóa cách nhau bởi dấu phẩy
                </p>
              </div>

              <div>
                <Label htmlFor="topic">Chủ đề/Mô tả ngắn *</Label>
                <Textarea
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="Ví dụ: Hướng dẫn chăm sóc cây xanh trong nhà"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={createArticleMutation.isPending}
                  className="flex-1"
                >
                  {createArticleMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang tạo bài viết...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Tạo bài viết SEO
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation('/dashboard')}
                >
                  Hủy
                </Button>
              </div>
            </form>

            {user && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Credits hiện tại: <span className="font-medium">{user.credits}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tạo bài viết SEO sẽ tiêu tốn 1 credit
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}