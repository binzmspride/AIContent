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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Settings, Save, Plus, Eye, Check, X, AlertTriangle, FileText, Hash, Image, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BrandGuideline {
  id: string;
  title: string;
  description: string;
  category: 'tone_of_voice' | 'hashtag_usage' | 'image_quality' | 'content_length';
  isActive: boolean;
  requirements: string[];
}

interface CustomGuideline {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
}

export default function BrandGuidelinesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [newCustomGuideline, setNewCustomGuideline] = useState({
    title: '',
    content: ''
  });

  // Default brand guidelines
  const defaultGuidelines: BrandGuideline[] = [
    {
      id: 'tone_of_voice',
      title: 'Tone of Voice',
      description: 'Maintain professional yet friendly tone',
      category: 'tone_of_voice',
      isActive: true,
      requirements: [
        'Sử dụng ngôn ngữ thân thiện và chuyên nghiệp',
        'Tránh từ ngữ khó hiểu hoặc quá kỹ thuật',
        'Luôn tích cực và hỗ trợ người đọc'
      ]
    },
    {
      id: 'hashtag_usage',
      title: 'Hashtag Usage',
      description: 'Use relevant branded hashtags',
      category: 'hashtag_usage',
      isActive: true,
      requirements: [
        'Sử dụng tối đa 5-10 hashtags cho mỗi bài đăng',
        'Bao gồm hashtag thương hiệu chính',
        'Kết hợp hashtags trending và niche'
      ]
    },
    {
      id: 'image_quality',
      title: 'Image Quality',
      description: 'Ensure high quality images align with brand policy',
      category: 'image_quality',
      isActive: true,
      requirements: [
        'Sử dụng hình ảnh độ phân giải cao (tối thiểu 1080p)',
        'Tuân thủ bảng màu thương hiệu',
        'Đảm bảo hình ảnh rõ nét và chất lượng'
      ]
    },
    {
      id: 'content_length',
      title: 'Content Length',
      description: 'Optimize content length per platform',
      category: 'content_length',
      isActive: true,
      requirements: [
        'Facebook: 40-80 từ tối ưu',
        'Twitter: Tối đa 280 ký tự',
        'Instagram: 125-150 từ trong caption'
      ]
    }
  ];

  const [guidelines, setGuidelines] = useState<BrandGuideline[]>(defaultGuidelines);
  const [customGuidelines, setCustomGuidelines] = useState<CustomGuideline[]>([]);

  // Mock compliance data
  const complianceData = {
    compliant: 0,
    nonCompliant: 0,
    needsReview: 0
  };

  const toggleGuideline = (id: string) => {
    setGuidelines(prev => 
      prev.map(guideline => 
        guideline.id === id 
          ? { ...guideline, isActive: !guideline.isActive }
          : guideline
      )
    );
  };

  const saveCustomGuideline = () => {
    if (!newCustomGuideline.title || !newCustomGuideline.content) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    const customGuideline: CustomGuideline = {
      id: Date.now().toString(),
      title: newCustomGuideline.title,
      content: newCustomGuideline.content,
      isActive: true
    };

    setCustomGuidelines(prev => [...prev, customGuideline]);
    setNewCustomGuideline({ title: '', content: '' });
    setShowCustomDialog(false);
    
    toast({
      title: "Thành công",
      description: "Đã thêm guideline tùy chỉnh thành công!",
    });
  };

  const getGuidelineIcon = (category: string) => {
    switch (category) {
      case 'tone_of_voice':
        return <MessageSquare className="h-5 w-5" />;
      case 'hashtag_usage':
        return <Hash className="h-5 w-5" />;
      case 'image_quality':
        return <Image className="h-5 w-5" />;
      case 'content_length':
        return <FileText className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Brand Guidelines</h1>
            <p className="text-muted-foreground mt-2">
              Maintain consistency across your brand communications
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Brand Guidelines */}
          <div className="lg:col-span-2 space-y-6">
            {/* Brand Guidelines Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Brand Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {guidelines.map((guideline) => (
                  <div key={guideline.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-muted-foreground mt-1">
                        {getGuidelineIcon(guideline.category)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{guideline.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {guideline.description}
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {guideline.requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="text-xs mt-1">•</span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={guideline.isActive ? "default" : "secondary"}>
                        {guideline.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Switch
                        checked={guideline.isActive}
                        onCheckedChange={() => toggleGuideline(guideline.id)}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Custom Guidelines Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Custom Guidelines</CardTitle>
                  <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Custom
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Custom Guideline</DialogTitle>
                        <DialogDescription>
                          Add any other brand guidelines or requirements
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={newCustomGuideline.title}
                            onChange={(e) => setNewCustomGuideline(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter guideline title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="content">Content</Label>
                          <Textarea
                            id="content"
                            value={newCustomGuideline.content}
                            onChange={(e) => setNewCustomGuideline(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Describe the guideline requirements..."
                            rows={4}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowCustomDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={saveCustomGuideline}>
                            <Save className="mr-2 h-4 w-4" />
                            Save Guideline
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {customGuidelines.length > 0 ? (
                  <div className="space-y-3">
                    {customGuidelines.map((guideline) => (
                      <div key={guideline.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{guideline.title}</h3>
                          <Badge variant="outline">Custom</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{guideline.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No custom guidelines added yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add specific brand guidelines for your business
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Posts Review Section */}
            <Card>
              <CardHeader>
                <CardTitle>Posts Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No posts to review. Create some posts first.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Compliance Overview */}
          <div className="space-y-6">
            {/* Compliance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {complianceData.compliant}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Compliant
                    </div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {complianceData.nonCompliant}
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Non-Compliant
                    </div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {complianceData.needsReview}
                    </div>
                    <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      Needs Review
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <Button className="w-full" variant="outline">
                  Check All Posts
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  Review All Guidelines
                </Button>
                <Button className="w-full" variant="outline">
                  <Save className="mr-2 h-4 w-4" />
                  Export Guidelines
                </Button>
                <Button className="w-full" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Platform Settings
                </Button>
              </CardContent>
            </Card>

            {/* Brand Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Guidelines</span>
                    <Badge variant="outline">
                      {guidelines.filter(g => g.isActive).length + customGuidelines.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Compliance Rate</span>
                    <Badge variant="outline">100%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Posts Reviewed</span>
                    <Badge variant="outline">0</Badge>
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