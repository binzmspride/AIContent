import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Plus, Search, Languages, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function TranslationsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const languages = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', status: 'active' },
    { code: 'en', name: 'English', flag: '🇺🇸', status: 'active' },
    { code: 'zh', name: '中文', flag: '🇨🇳', status: 'pending' },
    { code: 'ja', name: '日本語', flag: '🇯🇵', status: 'draft' },
    { code: 'ko', name: '한국어', flag: '🇰🇷', status: 'draft' },
    { code: 'th', name: 'ไทย', flag: '🇹🇭', status: 'pending' }
  ];

  const articles = [
    {
      id: 1,
      title: 'Hướng dẫn SEO cơ bản',
      originalLang: 'vi',
      translations: [
        { lang: 'en', status: 'completed', progress: 100 },
        { lang: 'zh', status: 'in-progress', progress: 75 },
        { lang: 'ja', status: 'pending', progress: 0 }
      ],
      createdAt: '2024-06-01'
    },
    {
      id: 2,
      title: 'Marketing Content Strategy',
      originalLang: 'en',
      translations: [
        { lang: 'vi', status: 'completed', progress: 100 },
        { lang: 'zh', status: 'pending', progress: 0 },
        { lang: 'ko', status: 'in-progress', progress: 60 }
      ],
      createdAt: '2024-05-28'
    },
    {
      id: 3,
      title: 'Cách viết content hiệu quả',
      originalLang: 'vi',
      translations: [
        { lang: 'en', status: 'in-progress', progress: 45 },
        { lang: 'th', status: 'pending', progress: 0 }
      ],
      createdAt: '2024-05-25'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'in-progress': return 'Đang dịch';
      case 'pending': return 'Chờ dịch';
      default: return 'Chưa bắt đầu';
    }
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Đa ngôn ngữ</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý và dịch nội dung sang nhiều ngôn ngữ khác nhau
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Thêm ngôn ngữ mới
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="articles">Bài viết</TabsTrigger>
          <TabsTrigger value="languages">Ngôn ngữ</TabsTrigger>
          <TabsTrigger value="translation-queue">Hàng đợi dịch</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ngôn ngữ hỗ trợ</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{languages.length}</div>
                <p className="text-xs text-muted-foreground">
                  +2 ngôn ngữ mới tuần này
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bài viết đã dịch</CardTitle>
                <Languages className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45</div>
                <p className="text-xs text-muted-foreground">
                  +12 bản dịch tuần này
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đang dịch</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  Dự kiến hoàn thành trong 3 ngày
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chờ dịch</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15</div>
                <p className="text-xs text-muted-foreground">
                  Ưu tiên cao: 5 bài viết
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tiến độ dịch thuật</CardTitle>
                <CardDescription>
                  Thống kê tiến độ dịch theo ngôn ngữ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {languages.map((lang) => {
                    const completedCount = Math.floor(Math.random() * 20) + 5;
                    const totalCount = completedCount + Math.floor(Math.random() * 10);
                    const percentage = Math.round((completedCount / totalCount) * 100);
                    
                    return (
                      <div key={lang.code} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{lang.flag}</span>
                            <span className="font-medium">{lang.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {completedCount}/{totalCount}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {percentage}% hoàn thành
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hoạt động gần đây</CardTitle>
                <CardDescription>
                  Các bản dịch được cập nhật mới nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { article: 'Hướng dẫn SEO cơ bản', lang: 'English', action: 'Hoàn thành', time: '2 giờ trước' },
                    { article: 'Marketing Strategy', lang: '中文', action: 'Cập nhật', time: '4 giờ trước' },
                    { article: 'Content Writing', lang: '한국어', action: 'Bắt đầu', time: '6 giờ trước' },
                    { article: 'AI Content Creation', lang: 'ไทย', action: 'Hoàn thành', time: '1 ngày trước' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.article}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.lang} • {activity.action}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="articles" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm bài viết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Lọc theo ngôn ngữ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả ngôn ngữ</SelectItem>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="in-progress">Đang dịch</SelectItem>
                  <SelectItem value="pending">Chờ dịch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {articles.map((article) => (
              <Card key={article.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <CardDescription>
                        Ngôn ngữ gốc: {languages.find(l => l.code === article.originalLang)?.name}
                        • Tạo: {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                      </CardDescription>
                    </div>
                    <Button size="sm" variant="outline">
                      Dịch thêm
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {article.translations.map((translation) => {
                      const lang = languages.find(l => l.code === translation.lang);
                      return (
                        <div key={translation.lang} className="p-4 border rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{lang?.flag}</span>
                              <span className="font-medium">{lang?.name}</span>
                            </div>
                            <Badge variant={getStatusColor(translation.status)}>
                              {getStatusIcon(translation.status)}
                              <span className="ml-1">{getStatusText(translation.status)}</span>
                            </Badge>
                          </div>
                          {translation.status === 'in-progress' && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Tiến độ</span>
                                <span>{translation.progress}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all" 
                                  style={{ width: `${translation.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                          <div className="flex gap-2 mt-3">
                            {translation.status === 'completed' && (
                              <Button size="sm" variant="outline" className="flex-1">
                                Xem
                              </Button>
                            )}
                            {translation.status === 'in-progress' && (
                              <Button size="sm" variant="outline" className="flex-1">
                                Tiếp tục
                              </Button>
                            )}
                            {translation.status === 'pending' && (
                              <Button size="sm" className="flex-1">
                                Bắt đầu
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="languages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ngôn ngữ được hỗ trợ</CardTitle>
              <CardDescription>
                Quản lý các ngôn ngữ có thể dịch trong hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {languages.map((lang) => (
                  <Card key={lang.code}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{lang.flag}</span>
                          <div>
                            <h4 className="font-medium">{lang.name}</h4>
                            <p className="text-sm text-muted-foreground">{lang.code.toUpperCase()}</p>
                          </div>
                        </div>
                        <Badge variant={lang.status === 'active' ? 'default' : 'secondary'}>
                          {lang.status === 'active' ? 'Hoạt động' : 'Đang phát triển'}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Bài viết đã dịch:</span>
                          <span className="font-medium">{Math.floor(Math.random() * 50) + 10}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Chất lượng dịch:</span>
                          <span className="font-medium">{Math.floor(Math.random() * 20) + 80}%</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4" variant="outline" size="sm">
                        Cài đặt
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translation-queue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hàng đợi dịch thuật</CardTitle>
              <CardDescription>
                Quản lý và ưu tiên các tác vụ dịch thuật
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4" />
                <p>Hàng đợi dịch thuật đang trống</p>
                <p className="text-sm">Tạo yêu cầu dịch mới để bắt đầu</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}