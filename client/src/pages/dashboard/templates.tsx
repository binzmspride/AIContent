import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Plus, Search, Star, Clock, Download } from 'lucide-react';

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const templates = [
    {
      id: 1,
      name: 'Bài viết Blog SEO',
      description: 'Mẫu bài viết blog tối ưu SEO với cấu trúc chuẩn',
      category: 'Blog',
      rating: 4.8,
      downloads: 1250,
      tags: ['SEO', 'Blog', 'Content Marketing']
    },
    {
      id: 2,
      name: 'Bài viết Review Sản phẩm',
      description: 'Template đánh giá sản phẩm chi tiết và thuyết phục',
      category: 'Review',
      rating: 4.9,
      downloads: 890,
      tags: ['Review', 'Product', 'E-commerce']
    },
    {
      id: 3,
      name: 'Hướng dẫn How-to',
      description: 'Mẫu bài hướng dẫn từng bước dễ hiểu',
      category: 'Tutorial',
      rating: 4.7,
      downloads: 1120,
      tags: ['Tutorial', 'Guide', 'Education']
    },
    {
      id: 4,
      name: 'Tin tức & Sự kiện',
      description: 'Template báo cáo tin tức và sự kiện nóng hổi',
      category: 'News',
      rating: 4.6,
      downloads: 670,
      tags: ['News', 'Event', 'Current Affairs']
    },
    {
      id: 5,
      name: 'Bài viết So sánh',
      description: 'Mẫu so sánh sản phẩm/dịch vụ chi tiết',
      category: 'Comparison',
      rating: 4.8,
      downloads: 950,
      tags: ['Comparison', 'Analysis', 'Research']
    },
    {
      id: 6,
      name: 'Câu chuyện Khách hàng',
      description: 'Template chia sẻ câu chuyện thành công của khách hàng',
      category: 'Case Study',
      rating: 4.5,
      downloads: 430,
      tags: ['Case Study', 'Success Story', 'Testimonial']
    }
  ];

  const categories = ['Tất cả', 'Blog', 'Review', 'Tutorial', 'News', 'Comparison', 'Case Study'];

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mẫu nội dung</h1>
          <p className="text-muted-foreground mt-2">
            Thư viện template có sẵn để tạo nội dung nhanh chóng và chuyên nghiệp
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tạo template mới
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <TabsList>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category.toLowerCase().replace(' ', '-')}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        </div>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <FileText className="h-8 w-8 text-primary" />
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{template.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        <span>{template.downloads.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Xem trước
                      </Button>
                      <Button size="sm" className="flex-1">
                        Sử dụng
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {categories.slice(1).map((category) => (
          <TabsContent key={category} value={category.toLowerCase().replace(' ', '-')} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates
                .filter(template => template.category === category)
                .map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <FileText className="h-8 w-8 text-primary" />
                        <Badge variant="secondary">{template.category}</Badge>
                      </div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-1">
                          {template.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{template.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="h-4 w-4" />
                            <span>{template.downloads.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            Xem trước
                          </Button>
                          <Button size="sm" className="flex-1">
                            Sử dụng
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Template phổ biến nhất</CardTitle>
          <CardDescription>
            Những mẫu nội dung được sử dụng nhiều nhất trong tuần
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.slice(0, 3).map((template, index) => (
              <div key={template.id} className="flex items-center gap-4 p-4 border rounded-md">
                <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                  {index + 1}
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div className="flex-1">
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Download className="h-4 w-4" />
                    <span>{template.downloads}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{template.rating}</span>
                  </div>
                </div>
                <Button size="sm">Sử dụng</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}