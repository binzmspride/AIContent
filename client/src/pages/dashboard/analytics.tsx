import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Eye, Users, FileText, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/analytics'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/dashboard/analytics');
      const data = await res.json();
      return data.success ? data.data : {};
    },
  });

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Phân tích & Báo cáo</h1>
          <p className="text-muted-foreground mt-2">
            Theo dõi hiệu suất và phân tích dữ liệu nội dung của bạn
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="content">Nội dung</TabsTrigger>
          <TabsTrigger value="traffic">Lưu lượng</TabsTrigger>
          <TabsTrigger value="engagement">Tương tác</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng bài viết</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalArticles || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +2 từ tháng trước
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lượt xem</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,543</div>
                <p className="text-xs text-muted-foreground">
                  +15% từ tháng trước
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Người đọc</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3,241</div>
                <p className="text-xs text-muted-foreground">
                  +8% từ tháng trước
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tỷ lệ tương tác</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68.2%</div>
                <p className="text-xs text-muted-foreground">
                  +12% từ tháng trước
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Biểu đồ lưu lượng truy cập</CardTitle>
                <CardDescription>
                  Lượt xem theo thời gian trong 30 ngày qua
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border rounded-md bg-muted">
                  <BarChart3 className="h-12 w-12 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Biểu đồ sẽ hiển thị ở đây</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top bài viết phổ biến</CardTitle>
                <CardDescription>
                  Những bài viết có lượt xem cao nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex-1">
                        <p className="font-medium text-sm">Bài viết mẫu #{item}</p>
                        <p className="text-xs text-muted-foreground">Danh mục: SEO</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{(1500 - item * 200).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">lượt xem</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Phân tích nội dung</CardTitle>
              <CardDescription>
                Thống kê về chất lượng và hiệu suất nội dung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>Tính năng phân tích nội dung sẽ được phát triển</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Phân tích lưu lượng</CardTitle>
              <CardDescription>
                Chi tiết về nguồn truy cập và hành vi người dùng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                <p>Tính năng phân tích lưu lượng sẽ được phát triển</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Phân tích tương tác</CardTitle>
              <CardDescription>
                Đo lường mức độ tương tác của người đọc
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4" />
                <p>Tính năng phân tích tương tác sẽ được phát triển</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}