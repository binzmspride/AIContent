import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Plus, Search, Star, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function FeedbackPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [newFeedback, setNewFeedback] = useState({
    type: '',
    subject: '',
    message: '',
    priority: 'medium'
  });

  const feedbackItems = [
    {
      id: 1,
      type: 'bug',
      subject: 'Lỗi khi tạo bài viết có hình ảnh',
      message: 'Khi upload hình ảnh vào bài viết, hệ thống báo lỗi và không thể lưu.',
      priority: 'high',
      status: 'open',
      createdAt: '2024-06-06T10:30:00',
      author: 'Nguyễn Văn An',
      responses: 2
    },
    {
      id: 2,
      type: 'feature',
      subject: 'Thêm tính năng export PDF',
      message: 'Đề xuất thêm tính năng xuất bài viết ra file PDF để dễ chia sẻ.',
      priority: 'medium',
      status: 'in-progress',
      createdAt: '2024-06-05T14:15:00',
      author: 'Trần Thị Bình',
      responses: 5
    },
    {
      id: 3,
      type: 'improvement',
      subject: 'Cải thiện giao diện editor',
      message: 'Editor hiện tại hơi chậm khi viết bài dài. Đề xuất tối ưu hiệu suất.',
      priority: 'medium',
      status: 'resolved',
      createdAt: '2024-06-04T09:20:00',
      author: 'Lê Minh Cường',
      responses: 8
    },
    {
      id: 4,
      type: 'question',
      subject: 'Cách sử dụng AI API Keys',
      message: 'Tôi không hiểu cách cấu hình AI API Keys để sử dụng các provider khác nhau.',
      priority: 'low',
      status: 'resolved',
      createdAt: '2024-06-03T16:45:00',
      author: 'Phạm Thị Dung',
      responses: 3
    },
    {
      id: 5,
      type: 'bug',
      subject: 'Lỗi đăng nhập trên mobile',
      message: 'Không thể đăng nhập trên thiết bị di động, trang web không responsive.',
      priority: 'high',
      status: 'open',
      createdAt: '2024-06-02T11:10:00',
      author: 'Hoàng Văn Tùng',
      responses: 1
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug': return 'destructive';
      case 'feature': return 'default';
      case 'improvement': return 'secondary';
      case 'question': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'bug': return 'Lỗi';
      case 'feature': return 'Tính năng';
      case 'improvement': return 'Cải thiện';
      case 'question': return 'Câu hỏi';
      default: return 'Khác';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in-progress': return 'secondary';
      case 'resolved': return 'default';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Mở';
      case 'in-progress': return 'Đang xử lý';
      case 'resolved': return 'Đã giải quyết';
      default: return 'Không xác định';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const handleSubmitFeedback = () => {
    console.log('Submitting feedback:', newFeedback);
    // Reset form
    setNewFeedback({
      type: '',
      subject: '',
      message: '',
      priority: 'medium'
    });
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Phản hồi</h1>
          <p className="text-muted-foreground mt-2">
            Gửi phản hồi, báo lỗi và đề xuất cải thiện hệ thống
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Gửi phản hồi mới
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="my-feedback">Của tôi</TabsTrigger>
          <TabsTrigger value="bugs">Lỗi</TabsTrigger>
          <TabsTrigger value="features">Tính năng</TabsTrigger>
          <TabsTrigger value="create">Tạo mới</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm phản hồi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="bug">Lỗi</SelectItem>
                  <SelectItem value="feature">Tính năng</SelectItem>
                  <SelectItem value="improvement">Cải thiện</SelectItem>
                  <SelectItem value="question">Câu hỏi</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="open">Mở</SelectItem>
                  <SelectItem value="in-progress">Đang xử lý</SelectItem>
                  <SelectItem value="resolved">Đã giải quyết</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {feedbackItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getTypeColor(item.type)}>
                          {getTypeText(item.type)}
                        </Badge>
                        <Badge variant={getPriorityColor(item.priority)}>
                          {item.priority === 'high' ? 'Cao' : 
                           item.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                        </Badge>
                        <Badge variant={getStatusColor(item.status)}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1">{getStatusText(item.status)}</span>
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{item.subject}</CardTitle>
                      <CardDescription className="mt-1">
                        Bởi {item.author} • {new Date(item.createdAt).toLocaleDateString('vi-VN')} • {item.responses} phản hồi
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{item.message}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {item.responses} phản hồi
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <Button size="sm" variant="outline">
                      Xem chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Phản hồi của tôi</CardTitle>
              <CardDescription>
                Tất cả phản hồi bạn đã gửi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbackItems.slice(0, 2).map((item) => (
                  <div key={item.id} className="p-4 border rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{item.subject}</h4>
                      <Badge variant={getStatusColor(item.status)}>
                        {getStatusText(item.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{item.message}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                      <span>{item.responses} phản hồi</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bugs" className="space-y-6">
          <div className="space-y-4">
            {feedbackItems.filter(item => item.type === 'bug').map((item) => (
              <Card key={item.id} className="border-red-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="destructive">Lỗi</Badge>
                        <Badge variant={getPriorityColor(item.priority)}>
                          {item.priority === 'high' ? 'Ưu tiên cao' : 'Ưu tiên thấp'}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{item.subject}</CardTitle>
                      <CardDescription>
                        Báo cáo bởi {item.author} • {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(item.status)}>
                      {getStatusText(item.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{item.message}</p>
                  <Button size="sm" variant="outline">
                    Xem chi tiết lỗi
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="space-y-4">
            {feedbackItems.filter(item => item.type === 'feature').map((item) => (
              <Card key={item.id} className="border-blue-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default">Tính năng</Badge>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map((star) => (
                            <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">(4.5)</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{item.subject}</CardTitle>
                      <CardDescription>
                        Đề xuất bởi {item.author} • {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(item.status)}>
                      {getStatusText(item.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{item.message}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      👍 Ủng hộ (12)
                    </Button>
                    <Button size="sm" variant="outline">
                      Xem chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gửi phản hồi mới</CardTitle>
              <CardDescription>
                Chia sẻ ý kiến, báo lỗi hoặc đề xuất tính năng mới
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Loại phản hồi</label>
                  <Select value={newFeedback.type} onValueChange={(value) => 
                    setNewFeedback(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại phản hồi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">🐛 Báo lỗi</SelectItem>
                      <SelectItem value="feature">✨ Đề xuất tính năng</SelectItem>
                      <SelectItem value="improvement">🔧 Cải thiện</SelectItem>
                      <SelectItem value="question">❓ Câu hỏi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Mức độ ưu tiên</label>
                  <Select value={newFeedback.priority} onValueChange={(value) => 
                    setNewFeedback(prev => ({ ...prev, priority: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Thấp</SelectItem>
                      <SelectItem value="medium">🟡 Trung bình</SelectItem>
                      <SelectItem value="high">🔴 Cao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Tiêu đề</label>
                <Input
                  value={newFeedback.subject}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Mô tả ngắn gọn vấn đề hoặc đề xuất..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Nội dung chi tiết</label>
                <Textarea
                  value={newFeedback.message}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Mô tả chi tiết vấn đề, cách tái hiện lỗi, hoặc ý tưởng của bạn..."
                  rows={6}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmitFeedback} className="flex-1">
                  Gửi phản hồi
                </Button>
                <Button variant="outline" onClick={() => setNewFeedback({
                  type: '',
                  subject: '',
                  message: '',
                  priority: 'medium'
                })}>
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hướng dẫn gửi phản hồi hiệu quả</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">🐛 Khi báo lỗi</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Mô tả các bước để tái hiện lỗi</li>
                    <li>• Kết quả mong đợi vs thực tế</li>
                    <li>• Trình duyệt và thiết bị sử dụng</li>
                    <li>• Screenshot nếu có thể</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">✨ Khi đề xuất tính năng</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Mô tả rõ tính năng muốn có</li>
                    <li>• Lý do tại sao cần tính năng này</li>
                    <li>• Cách tính năng sẽ cải thiện trải nghiệm</li>
                    <li>• Ví dụ cụ thể nếu có</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}