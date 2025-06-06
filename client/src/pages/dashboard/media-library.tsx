import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Upload, Search, Grid, List, Filter, Download, Trash2, Eye } from 'lucide-react';

export default function MediaLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const mediaItems = [
    {
      id: 1,
      name: 'hero-banner.jpg',
      type: 'image',
      size: '2.4 MB',
      dimensions: '1920x1080',
      uploadDate: '2024-06-05',
      category: 'Banner',
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400'
    },
    {
      id: 2,
      name: 'product-showcase.png',
      type: 'image',
      size: '1.8 MB',
      dimensions: '1200x800',
      uploadDate: '2024-06-04',
      category: 'Product',
      url: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400'
    },
    {
      id: 3,
      name: 'team-photo.jpg',
      type: 'image',
      size: '3.2 MB',
      dimensions: '1600x1200',
      uploadDate: '2024-06-03',
      category: 'Team',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400'
    },
    {
      id: 4,
      name: 'infographic-data.png',
      type: 'image',
      size: '1.5 MB',
      dimensions: '800x600',
      uploadDate: '2024-06-02',
      category: 'Infographic',
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400'
    },
    {
      id: 5,
      name: 'blog-cover.jpg',
      type: 'image',
      size: '2.1 MB',
      dimensions: '1200x630',
      uploadDate: '2024-06-01',
      category: 'Blog',
      url: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400'
    },
    {
      id: 6,
      name: 'social-media-post.png',
      type: 'image',
      size: '890 KB',
      dimensions: '1080x1080',
      uploadDate: '2024-05-31',
      category: 'Social Media',
      url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400'
    }
  ];

  const categories = ['Tất cả', 'Banner', 'Product', 'Team', 'Infographic', 'Blog', 'Social Media'];

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Thư viện Media</h1>
            <p className="text-muted-foreground mt-2">
              Quản lý và tổ chức hình ảnh, video và tệp media cho nội dung
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Tải lên media
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="lg:w-64 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bộ lọc</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tìm kiếm</label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm theo tên file..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Loại file</label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="images" className="rounded" />
                      <label htmlFor="images" className="text-sm">Hình ảnh</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="videos" className="rounded" />
                      <label htmlFor="videos" className="text-sm">Video</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="documents" className="rounded" />
                      <label htmlFor="documents" className="text-sm">Tài liệu</label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Kích thước</label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="small" className="rounded" />
                      <label htmlFor="small" className="text-sm">Nhỏ (&lt; 1MB)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="medium" className="rounded" />
                      <label htmlFor="medium" className="text-sm">Trung bình (1-5MB)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="large" className="rounded" />
                      <label htmlFor="large" className="text-sm">Lớn (&gt; 5MB)</label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thống kê</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Tổng files:</span>
                    <span className="text-sm font-medium">{mediaItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Dung lượng:</span>
                    <span className="text-sm font-medium">12.8 MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tháng này:</span>
                    <span className="text-sm font-medium">+3 files</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Sắp xếp
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category.toLowerCase().replace(' ', '-')}>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mediaItems.map((item) => (
                      <Card key={item.id} className="group hover:shadow-md transition-shadow">
                        <div className="aspect-square relative overflow-hidden rounded-t-lg">
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex gap-2">
                              <Button size="sm" variant="secondary">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="secondary">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <h4 className="font-medium text-sm truncate">{item.name}</h4>
                          <div className="flex items-center justify-between mt-1">
                            <Badge variant="outline" className="text-xs">{item.category}</Badge>
                            <span className="text-xs text-muted-foreground">{item.size}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{item.dimensions}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {mediaItems.map((item) => (
                      <Card key={item.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded overflow-hidden bg-muted">
                              <img
                                src={item.url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <span>{item.dimensions}</span>
                                <span>{item.size}</span>
                                <span>{new Date(item.uploadDate).toLocaleDateString('vi-VN')}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{item.category}</Badge>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4" />
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
                )}
              </TabsContent>

              {categories.slice(1).map((category) => (
                <TabsContent key={category} value={category.toLowerCase().replace(' ', '-')}>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mediaItems
                      .filter(item => item.category === category)
                      .map((item) => (
                        <Card key={item.id} className="group hover:shadow-md transition-shadow">
                          <div className="aspect-square relative overflow-hidden rounded-t-lg">
                            <img
                              src={item.url}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <CardContent className="p-3">
                            <h4 className="font-medium text-sm truncate">{item.name}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <Badge variant="outline" className="text-xs">{item.category}</Badge>
                              <span className="text-xs text-muted-foreground">{item.size}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}