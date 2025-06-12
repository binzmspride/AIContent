import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, ExternalLink, Share2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Sidebar } from '@/components/dashboard/Sidebar';

const platformLabels = {
  wordpress: "WordPress",
  facebook: "Facebook", 
  twitter: "Twitter",
  linkedin: "LinkedIn",
  instagram: "Instagram"
};

const statusLabels = {
  pending: "Đang chờ",
  processing: "Đang xử lý", 
  completed: "Hoàn thành",
  failed: "Thất bại",
  cancelled: "Đã hủy"
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", 
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
};

export default function SchedulerPage() {
  // Fetch scheduled posts
  const { data: postsData } = useQuery({
    queryKey: ['/api/scheduled-posts'],
  });

  // Fetch social connections  
  const { data: connectionsData } = useQuery({
    queryKey: ['/api/social-connections'],
  });

  const posts = postsData?.data?.posts || [];
  const connections = connectionsData?.data || [];

  // Stats calculations
  const activeConnections = connections.filter((conn: any) => conn.isActive).length;
  const pendingPosts = posts.filter((post: any) => post.status === 'pending').length;
  const completedPosts = posts.filter((post: any) => post.status === 'completed').length;
  const upcomingPosts = posts.filter((post: any) => {
    const scheduledTime = new Date(post.scheduledTime);
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return scheduledTime > now && scheduledTime <= nextWeek && post.status === 'pending';
  }).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="ml-64 min-h-screen">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Lập lịch đăng bài
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Tổng quan hệ thống đăng bài tự động
              </p>
            </div>
          </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Kết nối hoạt động
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {activeConnections}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Share2 className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Bài viết đang chờ
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {pendingPosts}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Đã hoàn thành
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {completedPosts}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Sắp đăng (7 ngày)
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {upcomingPosts}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
          <CardDescription>
            Các chức năng chính để quản lý hệ thống đăng bài
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/dashboard/scheduled-posts">
              <Button className="w-full justify-start h-auto p-4" variant="outline">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">Quản lý bài viết đã lên lịch</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Tạo, chỉnh sửa và theo dõi các bài đăng tự động
                    </p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto" />
              </Button>
            </Link>

            <Link href="/dashboard/social-connections">
              <Button className="w-full justify-start h-auto p-4" variant="outline">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Share2 className="h-5 w-5 text-green-600 dark:text-green-300" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">Kết nối mạng xã hội</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Quản lý kết nối với WordPress, Facebook, Twitter, LinkedIn
                    </p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <CardDescription>
            Các bài viết đã lên lịch mới nhất
          </CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Chưa có bài viết nào
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Bắt đầu bằng cách tạo bài viết đầu tiên
              </p>
              <Link href="/dashboard/scheduled-posts">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo bài đăng mới
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.slice(0, 5).map((post: any) => (
                <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {post.title}
                    </h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(post.scheduledTime), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </span>
                      <div className="flex space-x-1">
                        {post.platforms.map((platform: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {platformLabels[platform.platform as keyof typeof platformLabels] || platform.platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Badge className={statusColors[post.status as keyof typeof statusColors]}>
                    {statusLabels[post.status as keyof typeof statusLabels]}
                  </Badge>
                </div>
              ))}
              
              {posts.length > 5 && (
                <div className="text-center pt-4">
                  <Link href="/dashboard/scheduled-posts">
                    <Button variant="outline">
                      Xem tất cả ({posts.length} bài viết)
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Status */}
      <Card>
        <CardHeader>
          <CardTitle>Trạng thái kết nối</CardTitle>
          <CardDescription>
            Tình trạng kết nối với các nền tảng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(platformLabels).map(([platform, label]) => {
              const connection = connections.find((conn: any) => conn.platform === platform);
              const isConnected = !!connection;
              
              return (
                <div key={platform} className="text-center p-4 border rounded-lg">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                    isConnected 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                  }`}>
                    {isConnected ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                  </div>
                  <h3 className="font-medium text-sm">{label}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {isConnected ? 
                      (connection.isActive ? 'Hoạt động' : 'Tạm dừng') : 
                      'Chưa kết nối'
                    }
                  </p>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 text-center">
            <Link href="/dashboard/social-connections">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Thêm kết nối mới
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}