import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Plus, Search, UserPlus, Settings, MessageSquare, Eye, Edit } from 'lucide-react';

export default function CollaborationPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const teamMembers = [
    {
      id: 1,
      name: 'Nguyễn Văn An',
      email: 'an.nguyen@example.com',
      role: 'Editor',
      status: 'active',
      joinDate: '2024-05-01',
      articlesCount: 12,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
    },
    {
      id: 2,
      name: 'Trần Thị Bình',
      email: 'binh.tran@example.com',
      role: 'Writer',
      status: 'active',
      joinDate: '2024-04-15',
      articlesCount: 8,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100'
    },
    {
      id: 3,
      name: 'Lê Minh Cường',
      email: 'cuong.le@example.com',
      role: 'Reviewer',
      status: 'inactive',
      joinDate: '2024-03-20',
      articlesCount: 15,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    }
  ];

  const projects = [
    {
      id: 1,
      name: 'Chiến lược Content Q3 2024',
      description: 'Kế hoạch nội dung cho quý 3',
      members: 3,
      articles: 25,
      progress: 68,
      status: 'active',
      deadline: '2024-09-30'
    },
    {
      id: 2,
      name: 'Series Hướng dẫn SEO',
      description: 'Bộ bài viết hướng dẫn SEO từ cơ bản đến nâng cao',
      members: 2,
      articles: 12,
      progress: 45,
      status: 'active',
      deadline: '2024-08-15'
    },
    {
      id: 3,
      name: 'Content Marketing Guide',
      description: 'Hướng dẫn toàn diện về Content Marketing',
      members: 4,
      articles: 18,
      progress: 92,
      status: 'review',
      deadline: '2024-07-20'
    }
  ];

  const activities = [
    {
      id: 1,
      user: 'Nguyễn Văn An',
      action: 'đã hoàn thành bài viết',
      target: 'Hướng dẫn SEO On-page',
      time: '2 giờ trước',
      type: 'completed'
    },
    {
      id: 2,
      user: 'Trần Thị Bình',
      action: 'đã tạo bài viết mới',
      target: 'Content Marketing Strategy',
      time: '4 giờ trước',
      type: 'created'
    },
    {
      id: 3,
      user: 'Lê Minh Cường',
      action: 'đã review và phê duyệt',
      target: 'Social Media Marketing',
      time: '6 giờ trước',
      type: 'reviewed'
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Editor': return 'default';
      case 'Writer': return 'secondary';
      case 'Reviewer': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'review': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Cộng tác</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý team và cộng tác viết nội dung cùng nhau
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Mời thành viên
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="team">Thành viên</TabsTrigger>
          <TabsTrigger value="projects">Dự án</TabsTrigger>
          <TabsTrigger value="activities">Hoạt động</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Thành viên team</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamMembers.length}</div>
                <p className="text-xs text-muted-foreground">
                  +1 thành viên tuần này
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dự án đang chạy</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.filter(p => p.status === 'active').length}</div>
                <p className="text-xs text-muted-foreground">
                  {projects.length} tổng dự án
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bài viết cộng tác</CardTitle>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projects.reduce((sum, project) => sum + project.articles, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +8 bài viết tuần này
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiến độ trung bình</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% so với tháng trước
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dự án đang thực hiện</CardTitle>
                <CardDescription>
                  Các dự án nội dung đang được team thực hiện
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.filter(project => project.status === 'active').map((project) => (
                    <div key={project.id} className="p-4 border rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{project.name}</h4>
                        <Badge variant={getStatusColor(project.status)}>
                          {project.status === 'active' ? 'Đang thực hiện' : 'Hoàn thành'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Tiến độ</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{project.members} thành viên • {project.articles} bài viết</span>
                          <span>Deadline: {new Date(project.deadline).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hoạt động gần đây</CardTitle>
                <CardDescription>
                  Các hoạt động mới nhất của team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-md">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{activity.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span>{' '}
                          {activity.action}{' '}
                          <span className="font-medium">"{activity.target}"</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm thành viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Mời thành viên mới
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    <Badge variant={getRoleColor(member.role)}>
                      {member.role}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Trạng thái:</span>
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Tham gia:</span>
                      <span>{new Date(member.joinDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bài viết:</span>
                      <span className="font-medium">{member.articlesCount}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Nhắn tin
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Danh sách dự án</h3>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tạo dự án mới
            </Button>
          </div>

          <div className="space-y-4">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </div>
                    <Badge variant={getStatusColor(project.status)}>
                      {project.status === 'active' ? 'Đang thực hiện' : 
                       project.status === 'review' ? 'Đang review' : 'Hoàn thành'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 border rounded-md">
                      <div className="text-lg font-semibold">{project.members}</div>
                      <div className="text-sm text-muted-foreground">Thành viên</div>
                    </div>
                    <div className="text-center p-3 border rounded-md">
                      <div className="text-lg font-semibold">{project.articles}</div>
                      <div className="text-sm text-muted-foreground">Bài viết</div>
                    </div>
                    <div className="text-center p-3 border rounded-md">
                      <div className="text-lg font-semibold">{project.progress}%</div>
                      <div className="text-sm text-muted-foreground">Hoàn thành</div>
                    </div>
                    <div className="text-center p-3 border rounded-md">
                      <div className="text-lg font-semibold">
                        {Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                      </div>
                      <div className="text-sm text-muted-foreground">Ngày còn lại</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Tiến độ dự án</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Deadline: {new Date(project.deadline).toLocaleDateString('vi-VN')}
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Xem chi tiết
                      </Button>
                      <Button size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Chỉnh sửa
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử hoạt động</CardTitle>
              <CardDescription>
                Tất cả hoạt động của team trong thời gian gần đây
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.concat([
                  {
                    id: 4,
                    user: 'Nguyễn Văn An',
                    action: 'đã comment trên bài viết',
                    target: 'Digital Marketing Trends',
                    time: '1 ngày trước',
                    type: 'commented'
                  },
                  {
                    id: 5,
                    user: 'Trần Thị Bình',
                    action: 'đã upload hình ảnh cho',
                    target: 'Content Strategy Guide',
                    time: '1 ngày trước',
                    type: 'uploaded'
                  }
                ]).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-md">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{activity.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{' '}
                        {activity.action}{' '}
                        <span className="font-medium">"{activity.target}"</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.type === 'completed' ? 'Hoàn thành' :
                       activity.type === 'created' ? 'Tạo mới' :
                       activity.type === 'reviewed' ? 'Review' :
                       activity.type === 'commented' ? 'Comment' : 'Upload'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}