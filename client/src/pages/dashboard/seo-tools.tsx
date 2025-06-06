import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Search, Globe, Target, BarChart3, CheckCircle } from 'lucide-react';

export default function SEOToolsPage() {
  const [keyword, setKeyword] = useState('');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Công cụ SEO</h1>
          <p className="text-muted-foreground mt-2">
            Tối ưu hóa nội dung và phân tích từ khóa để cải thiện thứ hạng tìm kiếm
          </p>
        </div>
      </div>

      <Tabs defaultValue="keyword-analysis" className="space-y-6">
        <TabsList>
          <TabsTrigger value="keyword-analysis">Phân tích từ khóa</TabsTrigger>
          <TabsTrigger value="content-optimization">Tối ưu nội dung</TabsTrigger>
          <TabsTrigger value="site-audit">Kiểm tra SEO</TabsTrigger>
          <TabsTrigger value="competitor">Phân tích đối thủ</TabsTrigger>
        </TabsList>

        <TabsContent value="keyword-analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Nghiên cứu từ khóa
                </CardTitle>
                <CardDescription>
                  Tìm kiếm và phân tích từ khóa phù hợp cho nội dung
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="keyword">Từ khóa chính</Label>
                  <Input
                    id="keyword"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Nhập từ khóa muốn phân tích..."
                  />
                </div>
                <Button className="w-full">Phân tích từ khóa</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kết quả phân tích</CardTitle>
                <CardDescription>
                  Thông tin chi tiết về từ khóa được chọn
                </CardDescription>
              </CardHeader>
              <CardContent>
                {keyword ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border rounded-md">
                        <p className="text-sm text-muted-foreground">Lượt tìm kiếm/tháng</p>
                        <p className="text-lg font-semibold">8,500</p>
                      </div>
                      <div className="p-3 border rounded-md">
                        <p className="text-sm text-muted-foreground">Độ khó</p>
                        <Badge variant="secondary">Trung bình</Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Từ khóa liên quan:</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          `${keyword} 2024`,
                          `cách ${keyword}`,
                          `${keyword} hiệu quả`,
                          `${keyword} miễn phí`
                        ].map((related, index) => (
                          <Badge key={index} variant="outline">{related}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nhập từ khóa để xem kết quả phân tích
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gợi ý từ khóa</CardTitle>
              <CardDescription>
                Danh sách từ khóa được đề xuất dựa trên xu hướng tìm kiếm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { keyword: 'SEO nội dung', volume: '12K', difficulty: 'Dễ' },
                  { keyword: 'Marketing online', volume: '25K', difficulty: 'Khó' },
                  { keyword: 'Viết content', volume: '8K', difficulty: 'Trung bình' },
                  { keyword: 'AI content', volume: '15K', difficulty: 'Trung bình' },
                  { keyword: 'Blog cá nhân', volume: '6K', difficulty: 'Dễ' },
                  { keyword: 'Copywriting', volume: '18K', difficulty: 'Khó' }
                ].map((item, index) => (
                  <div key={index} className="p-4 border rounded-md hover:bg-muted transition-colors">
                    <h4 className="font-medium">{item.keyword}</h4>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-muted-foreground">{item.volume}/tháng</span>
                      <Badge variant={
                        item.difficulty === 'Dễ' ? 'default' :
                        item.difficulty === 'Trung bình' ? 'secondary' : 'destructive'
                      }>
                        {item.difficulty}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content-optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Tối ưu hóa nội dung
              </CardTitle>
              <CardDescription>
                Kiểm tra và cải thiện SEO cho nội dung của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="content">Nội dung cần tối ưu</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Dán nội dung bài viết vào đây để phân tích SEO..."
                  rows={6}
                />
              </div>
              <Button>Phân tích SEO</Button>
            </CardContent>
          </Card>

          {content && (
            <Card>
              <CardHeader>
                <CardTitle>Kết quả kiểm tra SEO</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-md">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Độ dài nội dung phù hợp</p>
                      <p className="text-sm text-muted-foreground">
                        {content.length} ký tự (Khuyến nghị: 1000-2000 ký tự)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-md">
                    <CheckCircle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">Mật độ từ khóa</p>
                      <p className="text-sm text-muted-foreground">
                        Cần thêm từ khóa chính vào nội dung
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-md">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Cấu trúc heading</p>
                      <p className="text-sm text-muted-foreground">
                        Sử dụng tốt các thẻ heading H1, H2, H3
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="site-audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Kiểm tra SEO website
              </CardTitle>
              <CardDescription>
                Phân tích toàn diện SEO cho website của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="url">URL website</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <Button className="w-full">Kiểm tra SEO</Button>
            </CardContent>
          </Card>

          {url && (
            <Card>
              <CardHeader>
                <CardTitle>Báo cáo SEO</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-md text-center">
                    <div className="text-2xl font-bold text-green-500">85</div>
                    <p className="text-sm text-muted-foreground">SEO Score</p>
                  </div>
                  <div className="p-4 border rounded-md text-center">
                    <div className="text-2xl font-bold text-blue-500">92</div>
                    <p className="text-sm text-muted-foreground">Performance</p>
                  </div>
                  <div className="p-4 border rounded-md text-center">
                    <div className="text-2xl font-bold text-yellow-500">78</div>
                    <p className="text-sm text-muted-foreground">Accessibility</p>
                  </div>
                  <div className="p-4 border rounded-md text-center">
                    <div className="text-2xl font-bold text-purple-500">95</div>
                    <p className="text-sm text-muted-foreground">Best Practices</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="competitor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Phân tích đối thủ
              </CardTitle>
              <CardDescription>
                So sánh hiệu suất SEO với các đối thủ cạnh tranh
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto mb-4" />
                <p>Tính năng phân tích đối thủ sẽ được phát triển</p>
                <p className="text-sm">Sẽ bao gồm so sánh từ khóa, backlink và thứ hạng</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}