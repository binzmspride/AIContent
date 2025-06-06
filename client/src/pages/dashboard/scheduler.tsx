import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Plus, Eye, Edit, Trash2, Play, Pause } from 'lucide-react';

export default function SchedulerPage() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const scheduledPosts = [
    {
      id: 1,
      title: 'Hướng dẫn SEO On-page 2024',
      platform: 'website',
      scheduledTime: '2024-06-07T09:00:00',
      status: 'scheduled',
      category: 'SEO',
      author: 'Nguyễn Văn An'
    },
    {
      id: 2,
      title: 'Content Marketing Strategy',
      platform: 'facebook',
      scheduledTime: '2024-06-07T14:30:00',
      status: 'published',
      category: 'Marketing',
      author: 'Trần Thị Bình'
    },
    {
      id: 3,
      title: 'AI trong Content Creation',
      platform: 'linkedin',
      scheduledTime: '2024-06-08T10:15:00',
      status: 'scheduled',
      category: 'Technology',
      author: 'Lê Minh Cường'
    },
    {
      id: 4,
      title: 'Digital Marketing Trends',
      platform: 'twitter',
      scheduledTime: '2024-06-08T16:45:00',
      status: 'draft',
      category: 'Marketing',
      author: 'Nguyễn Văn An'
    },
    {
      id: 5,
      title: 'Social Media Best Practices',
      platform: 'instagram',
      scheduledTime: '2024-06-09T11:00:00',
      status: 'failed',
      category: 'Social Media',
      author: 'Trần Thị Bình'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'published': return 'secondary';
      case 'draft': return 'outline';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Đã lên lịch';
      case 'published': return 'Đã đăng';
      case 'draft': return 'Bản nháp';
      case 'failed': return 'Thất bại';
      default: return 'Không xác định';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'website': return '🌐';
      case 'facebook': return '📘';
      case 'linkedin': return '💼';
      case 'twitter': return '🐦';
      case 'instagram': return '📷';
      default: return '📱';
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'website': return 'Website';
      case 'facebook': return 'Facebook';
      case 'linkedin': return 'LinkedIn';
      case 'twitter': return 'Twitter';
      case 'instagram': return 'Instagram';
      default: return 'Unknown';
    }
  };

  const todaysPosts = scheduledPosts.filter(post => 
    post.scheduledTime.startsWith(new Date().toISOString().split('T')[0])
  );

  const upcomingPosts = scheduledPosts.filter(post => 
    new Date(post.scheduledTime) > new Date()
  );

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Lập lịch đăng</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý và lên lịch đăng nội dung trên các nền tảng
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tạo lịch đăng mới
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="calendar">Lịch</TabsTrigger>
          <TabsTrigger value="scheduled">Đã lên lịch</TabsTrigger>
          <TabsTrigger value="published">Đã đăng</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hôm nay</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todaysPosts.length}</div>
                <p className="text-xs text-muted-foreground">
                  bài đăng được lên lịch
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sắp tới</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingPosts.length}</div>
                <p className="text-xs text-muted-foreground">
                  bài đăng trong tuần
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã đăng</CardTitle>
                <Play className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {scheduledPosts.filter(p => p.status === 'published').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  bài trong tháng này
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Thất bại</CardTitle>
                <Pause className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {scheduledPosts.filter(p => p.status === 'failed').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  cần xem lại
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lịch đăng hôm nay</CardTitle>
                <CardDescription>
                  Các bài đăng được lên lịch cho ngày hôm nay
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todaysPosts.length > 0 ? (
                  <div className="space-y-4">
                    {todaysPosts.map((post) => (
                      <div key={post.id} className="flex items-center gap-3 p-3 border rounded-md">
                        <div className="text-2xl">{getPlatformIcon(post.platform)}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{post.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {new Date(post.scheduledTime).toLocaleTimeString('vi-VN', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            <Badge variant={getStatusColor(post.status)} className="text-xs">
                              {getStatusText(post.status)}
                            </Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4" />
                    <p>Không có bài đăng nào được lên lịch cho hôm nay</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thống kê nền tảng</CardTitle>
                <CardDescription>
                  Phân bố bài đăng theo từng nền tảng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['website', 'facebook', 'linkedin', 'twitter', 'instagram'].map((platform) => {
                    const count = scheduledPosts.filter(p => p.platform === platform).length;
                    const percentage = scheduledPosts.length > 0 ? (count / scheduledPosts.length) * 100 : 0;
                    
                    return (
                      <div key={platform} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getPlatformIcon(platform)}</span>
                            <span className="font-medium">{getPlatformName(platform)}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{count} bài</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lịch đăng bài</CardTitle>
              <CardDescription>
                Xem lịch đăng theo ngày, tuần và tháng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <p>Tính năng lịch sẽ được phát triển</p>
                <p className="text-sm">Sẽ hiển thị lịch với khả năng kéo thả để sắp xếp bài đăng</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Nền tảng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Thêm lịch đăng
            </Button>
          </div>

          <div className="space-y-4">
            {scheduledPosts.filter(p => p.status === 'scheduled' || p.status === 'draft').map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{getPlatformIcon(post.platform)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{post.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span>👤 {post.author}</span>
                            <span>📂 {post.category}</span>
                            <span>📅 {new Date(post.scheduledTime).toLocaleString('vi-VN')}</span>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(post.status)}>
                          {getStatusText(post.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="published" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-2">
              <Input 
                placeholder="Tìm kiếm bài đăng..." 
                className="w-64"
              />
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Nền tảng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {scheduledPosts.filter(p => p.status === 'published').map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{getPlatformIcon(post.platform)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{post.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span>👤 {post.author}</span>
                            <span>📂 {post.category}</span>
                            <span>📅 Đã đăng: {new Date(post.scheduledTime).toLocaleString('vi-VN')}</span>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          ✅ Đã đăng
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-1">
                          <span>👁️ 245 lượt xem</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>❤️ 18 tương tác</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>💬 5 bình luận</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        Xem thống kê
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}