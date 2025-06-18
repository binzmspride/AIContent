import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Share2, Eye, ImageIcon, X, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import PlatformPreview from "@/components/social-content/PlatformPreview";

const EditArticle = () => {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [keywords, setKeywords] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Social Media Content specific states
  const [isSocialContent, setIsSocialContent] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [platformPreviewDialog, setPlatformPreviewDialog] = useState(false);
  const [selectedPlatformPreview, setSelectedPlatformPreview] = useState<string | null>(null);
  const [imagePreviewDialog, setImagePreviewDialog] = useState(false);

  // Handle missing ID
  if (!params.id) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Lỗi</h1>
            <p className="text-gray-600">ID bài viết không hợp lệ</p>
            <Button onClick={() => setLocation("/dashboard/my-articles")} className="mt-4">
              Quay lại danh sách bài viết
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Fetch article data
  const { data: articleData, isLoading } = useQuery<{ success: boolean; data: any }>({
    queryKey: ["/api/dashboard/articles", params.id],
    retry: false,
  });

  // Fetch images for social content
  const { data: imagesData } = useQuery<{ success: boolean; data: { images: any[] } }>({
    queryKey: ["/api/dashboard/images"],
    enabled: isSocialContent,
  });

  // ReactQuill modules and formats
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header", "bold", "italic", "underline", "strike", "blockquote",
    "list", "bullet", "indent", "link", "image"
  ];

  // Initialize form data when article is loaded
  useEffect(() => {
    if (articleData?.data) {
      setTitle(articleData.data.title || "");
      setContent(articleData.data.content || "");
      setKeywords(articleData.data.keywords || "");
      setStatus(articleData.data.status || "draft");
      
      // Check if this is social media content
      const isSocial = articleData.data.keywords?.includes("facebook") ||
                      articleData.data.keywords?.includes("instagram") ||
                      articleData.data.keywords?.includes("twitter") ||
                      articleData.data.keywords?.includes("linkedin");
      
      setIsSocialContent(!!isSocial);
      
      // Extract platforms from keywords if social content
      if (isSocial && articleData.data.keywords) {
        const platforms = [];
        if (articleData.data.keywords.includes("facebook")) platforms.push("facebook");
        if (articleData.data.keywords.includes("instagram")) platforms.push("instagram");
        if (articleData.data.keywords.includes("twitter")) platforms.push("twitter");
        if (articleData.data.keywords.includes("linkedin")) platforms.push("linkedin");
        setSelectedPlatforms(platforms);
      }

      // Load selected images if available
      if (articleData.data.imageUrls && Array.isArray(articleData.data.imageUrls)) {
        setSelectedImages(articleData.data.imageUrls);
      }
    }
  }, [articleData]);

  // Update article mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/dashboard/articles/${params.id}`, "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Bài viết đã được cập nhật",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/articles"] });
      setLocation("/dashboard/my-articles");
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi cập nhật bài viết",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updateData = {
        title: title.trim(),
        content,
        keywords,
        status,
        ...(isSocialContent && { imageUrls: selectedImages }),
      };

      await updateMutation.mutateAsync(updateData);
    } catch (error) {
      console.error("Error updating article:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Đang tải bài viết...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!articleData?.data) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Không tìm thấy bài viết
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Bài viết có thể đã bị xóa hoặc bạn không có quyền truy cập.
          </p>
          <Button
            className="mt-4"
            onClick={() => setLocation("/dashboard/my-articles")}
          >
            Quay lại danh sách bài viết
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Edit Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {isSocialContent && <Share2 className="h-5 w-5 text-blue-500" />}
                      {isSocialContent ? "Chỉnh sửa Social Media Content" : "Chỉnh sửa bài viết"}
                    </CardTitle>
                    <CardDescription>
                      {isSocialContent 
                        ? "Chỉnh sửa nội dung và hình ảnh cho mạng xã hội"
                        : "Cập nhật nội dung và thông tin bài viết của bạn"
                      }
                    </CardDescription>
                  </div>
                  {isSocialContent && selectedPlatforms.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Platforms: {selectedPlatforms.join(", ")}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề</Label>
                  <Input
                    id="title"
                    placeholder="Nhập tiêu đề bài viết"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Nội dung</Label>
                  <div className={`bg-white dark:bg-gray-950 transition-all ${isSubmitting ? 'opacity-50' : ''}`}>
                    <ReactQuill
                      theme="snow"
                      value={content}
                      onChange={setContent}
                      modules={modules}
                      formats={formats}
                      placeholder="Nhập nội dung bài viết"
                      className="h-72 mb-12 rounded-md border"
                    />
                  </div>
                </div>

                {isSocialContent && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Hình ảnh đã chọn</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {imagesData?.data?.images?.slice(0, 8).map((image: any) => (
                          <div 
                            key={image.id}
                            className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all hover:scale-105 ${
                              selectedImages.includes(image.url) 
                                ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                            onClick={() => {
                              if (selectedImages.includes(image.url)) {
                                setSelectedImages(prev => prev.filter(url => url !== image.url));
                              } else {
                                setSelectedImages(prev => [...prev, image.url]);
                              }
                            }}
                          >
                            <img 
                              src={image.url} 
                              alt={image.description || 'Image'} 
                              className="w-full h-20 object-cover"
                            />
                            {selectedImages.includes(image.url) && (
                              <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {selectedImages.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <ImageIcon className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedImages.length} hình ảnh đã chọn
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setImagePreviewDialog(true)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Xem trước
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="keywords">Từ khóa</Label>
                  <Input
                    id="keywords"
                    placeholder="Nhập từ khóa, phân cách bằng dấu phẩy"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select
                    value={status}
                    onValueChange={(value) => setStatus(value as "draft" | "published")}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Bản nháp</SelectItem>
                      <SelectItem value="published">Đã xuất bản</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/dashboard/my-articles")}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Đang cập nhật..." : "Cập nhật bài viết"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Preview Panel for Social Content */}
          {isSocialContent && (
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Preview trên các nền tảng
                  </CardTitle>
                  <CardDescription>
                    Xem trước nội dung trên từng nền tảng mạng xã hội
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedPlatforms.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {selectedPlatforms.map((platform) => (
                        <Button
                          key={platform}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 h-auto p-3"
                          onClick={() => {
                            setSelectedPlatformPreview(platform);
                            setPlatformPreviewDialog(true);
                          }}
                        >
                          {platform === "facebook" && <Facebook className="h-4 w-4 text-blue-600" />}
                          {platform === "instagram" && <Instagram className="h-4 w-4 text-pink-500" />}
                          {platform === "twitter" && <Twitter className="h-4 w-4 text-blue-400" />}
                          {platform === "linkedin" && <Linkedin className="h-4 w-4 text-blue-700" />}
                          <div className="text-left">
                            <div className="font-medium text-xs capitalize">{platform}</div>
                            <div className="text-xs text-muted-foreground">Xem preview</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground text-sm py-4">
                      Không tìm thấy thông tin nền tảng trong từ khóa bài viết
                    </div>
                  )}
                  
                  {selectedImages.length > 0 && (
                    <div className="border-t pt-4">
                      <Label className="text-sm font-medium">Hình ảnh được chọn</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {selectedImages.slice(0, 4).map((url, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={url} 
                              alt={`Selected ${index + 1}`}
                              className="w-full h-16 object-cover rounded border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setSelectedImages(prev => prev.filter(img => img !== url))}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      {selectedImages.length > 4 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          +{selectedImages.length - 4} hình ảnh khác
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Platform Preview Dialog */}
        <Dialog open={platformPreviewDialog} onOpenChange={setPlatformPreviewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedPlatformPreview === "facebook" && <Facebook className="h-5 w-5 text-blue-600" />}
                {selectedPlatformPreview === "instagram" && <Instagram className="h-5 w-5 text-pink-500" />}
                {selectedPlatformPreview === "twitter" && <Twitter className="h-5 w-5 text-blue-400" />}
                {selectedPlatformPreview === "linkedin" && <Linkedin className="h-5 w-5 text-blue-700" />}
                Preview trên {selectedPlatformPreview ? selectedPlatformPreview.charAt(0).toUpperCase() + selectedPlatformPreview.slice(1) : ""}
              </DialogTitle>
            </DialogHeader>
            <div className="flex justify-center p-4">
              {selectedPlatformPreview && (
                <PlatformPreview 
                  platform={selectedPlatformPreview} 
                  content={content || ""} 
                  selectedImages={selectedImages}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Image Preview Dialog */}
        <Dialog open={imagePreviewDialog} onOpenChange={setImagePreviewDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Hình ảnh đã chọn ({selectedImages.length})</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {selectedImages.map((url, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={url} 
                    alt={`Selected ${index + 1}`}
                    className="w-full h-32 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setSelectedImages(prev => prev.filter(img => img !== url))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </form>
    </DashboardLayout>
  );
};

export default EditArticle;