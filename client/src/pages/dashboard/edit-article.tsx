import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { useLanguage } from "@/hooks/use-language";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation, useParams } from "wouter";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Eye,
  Image as ImageIcon,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Share2,
  Upload,
  X
} from "lucide-react";
import { Article } from "@shared/schema";

const EditArticle = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const articleId = params && params.id ? parseInt(params.id) : null;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [keywords, setKeywords] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isSocialContent, setIsSocialContent] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [imagePreviewDialog, setImagePreviewDialog] = useState(false);
  const [platformPreviewDialog, setPlatformPreviewDialog] = useState(false);
  const [selectedPlatformPreview, setSelectedPlatformPreview] = useState<string>("");

  // Fetch images for social content
  const { data: imagesData } = useQuery<{ success: boolean; data: { images: any[] } }>({
    queryKey: ["/api/dashboard/images"],
    enabled: isSocialContent,
  });

  // Fetch article data
  const { data: articleData, isLoading } = useQuery<{ success: boolean; data: Article }>({
    queryKey: [`/api/dashboard/articles/${articleId}`],
    enabled: !!articleId,
  });

  // Update form when article data is loaded
  useEffect(() => {
    if (articleData?.success && articleData.data) {
      setTitle(articleData.data.title);
      setContent(articleData.data.content);
      setKeywords(articleData.data.keywords || "");
      setStatus(articleData.data.status as "draft" | "published");
      
      // Check if it's social media content
      const isSocial = articleData.data.title?.includes("Social Media Content") || 
                      articleData.data.contentType === "social_media" ||
                      articleData.data.keywords?.includes("social") ||
                      articleData.data.keywords?.includes("facebook") ||
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
    }
  }, [articleData]);

  // Update article mutation
  const updateArticleMutation = useMutation({
    mutationFn: async (articleData: {
      title: string;
      content: string;
      keywords?: string;
      status: "draft" | "published";
    }) => {
      if (!articleId) {
        throw new Error("Article ID is missing");
      }
      const response = await apiRequest(
        "PATCH",
        `/api/dashboard/articles/${articleId}`,
        articleData
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cập nhật thành công",
        description: "Bài viết đã được cập nhật"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/articles"] });
      setLocation("/dashboard/my-articles");
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi cập nhật",
        description: error.message || "Có lỗi xảy ra khi cập nhật bài viết",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tiêu đề và nội dung bài viết",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    updateArticleMutation.mutate({
      title,
      content,
      keywords,
      status,
    });
  };

  // Quill editor modules and formats
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "align",
    "link",
    "image",
  ];

  // Social media platform preview components
  const PlatformPreview = ({ platform, content, selectedImages }: { platform: string; content: string; selectedImages: string[] }) => {
    const getFirstImage = () => selectedImages?.[0] || "";
    
    switch (platform) {
      case "facebook":
        return (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 max-w-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Facebook className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">Trang của bạn</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">2 phút trước</div>
              </div>
            </div>
            <div className="text-sm text-gray-800 dark:text-gray-200 mb-3" dangerouslySetInnerHTML={{ __html: content.replace(/<[^>]*>/g, '') }} />
            {getFirstImage() && (
              <img src={getFirstImage()} alt="Post" className="w-full rounded-lg object-cover h-48" />
            )}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-6">
                <span className="text-gray-500 text-sm">👍 Thích</span>
                <span className="text-gray-500 text-sm">💬 Bình luận</span>
                <span className="text-gray-500 text-sm">📤 Chia sẻ</span>
              </div>
            </div>
          </div>
        );
        
      case "instagram":
        return (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 max-w-md">
            <div className="flex items-center gap-3 p-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Instagram className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">your_page</div>
              </div>
            </div>
            {getFirstImage() && (
              <img src={getFirstImage()} alt="Post" className="w-full aspect-square object-cover" />
            )}
            <div className="p-3">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-gray-700 dark:text-gray-300">❤️</span>
                <span className="text-gray-700 dark:text-gray-300">💬</span>
                <span className="text-gray-700 dark:text-gray-300">📤</span>
              </div>
              <div className="text-sm text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: content.replace(/<[^>]*>/g, '') }} />
            </div>
          </div>
        );
        
      case "twitter":
        return (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 max-w-md">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
                <Twitter className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">Trang của bạn</span>
                  <span className="text-blue-500">✓</span>
                  <span className="text-gray-500 text-sm">@yourpage</span>
                  <span className="text-gray-500 text-sm">· 2m</span>
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-200 mt-1" dangerouslySetInnerHTML={{ __html: content.replace(/<[^>]*>/g, '') }} />
                {getFirstImage() && (
                  <img src={getFirstImage()} alt="Post" className="w-full rounded-lg object-cover h-48 mt-3" />
                )}
                <div className="flex items-center justify-between mt-3 max-w-md">
                  <span className="text-gray-500 text-sm">💬 12</span>
                  <span className="text-gray-500 text-sm">🔄 5</span>
                  <span className="text-gray-500 text-sm">❤️ 23</span>
                  <span className="text-gray-500 text-sm">📤</span>
                </div>
              </div>
            </div>
          </div>
        );
        
      case "linkedin":
        return (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 max-w-md">
            <div className="flex items-center gap-3 p-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Linkedin className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">Trang công ty của bạn</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">2 phút trước</div>
              </div>
            </div>
            <div className="px-4 pb-2">
              <div className="text-sm text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: content.replace(/<[^>]*>/g, '') }} />
            </div>
            {getFirstImage() && (
              <img src={getFirstImage()} alt="Post" className="w-full object-cover h-48" />
            )}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  👍 Thích
                </span>
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  💬 Bình luận
                </span>
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  📤 Chia sẻ
                </span>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-40 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-40" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-28" />
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!isLoading && !articleData?.success) {
    return (
      <DashboardLayout>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Bài viết không tồn tại</CardTitle>
            <CardDescription>Không tìm thấy bài viết hoặc bạn không có quyền truy cập</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation("/dashboard/my-articles")}>
              Quay lại danh sách
            </Button>
          </CardFooter>
        </Card>
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
                Preview trên {selectedPlatformPreview?.charAt(0).toUpperCase() + selectedPlatformPreview?.slice(1)}
              </DialogTitle>
            </DialogHeader>
            <div className="flex justify-center p-4">
              {selectedPlatformPreview && (
                <PlatformPreview 
                  platform={selectedPlatformPreview} 
                  content={content} 
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
              onClick={() => setLocation("/dashboard/my-articles")}
              type="button"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </DashboardLayout>
  );
};

export default EditArticle;