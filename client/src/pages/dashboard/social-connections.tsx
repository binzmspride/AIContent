import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Plus, Edit, Trash2, ExternalLink, Settings, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Sidebar } from "@/components/dashboard/Sidebar";

interface SocialConnection {
  id: number;
  platform: string;
  accountName: string;
  accountId: string;
  isActive: boolean;
  settings: any;
  createdAt: string;
  updatedAt: string;
}

const platformLabels = {
  wordpress: "WordPress",
  facebook: "Facebook",
  twitter: "Twitter",
  linkedin: "LinkedIn",
  instagram: "Instagram"
};

const platformDescriptions = {
  wordpress: "Kết nối với website WordPress của bạn để tự động đăng bài viết",
  facebook: "Đăng bài viết lên trang Facebook Page",
  twitter: "Chia sẻ nội dung ngắn gọn lên Twitter",
  linkedin: "Đăng bài viết chuyên nghiệp lên LinkedIn",
  instagram: "Chia sẻ hình ảnh và nội dung lên Instagram"
};

export default function SocialConnections() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<SocialConnection | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [wordpressAuthType, setWordpressAuthType] = useState<string>('api-token');

  // Fetch social connections
  const { data: connectionsData, isLoading } = useQuery<{success: boolean, data: SocialConnection[]}>({
    queryKey: ['/api/social-connections'],
  });

  // Create connection mutation
  const createConnectionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/social-connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create connection');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-connections'] });
      setShowCreateDialog(false);
      setSelectedPlatform('');
      setWordpressAuthType('api-token');
      toast({
        title: "Thành công",
        description: `Kết nối ${data.data?.accountName || 'mới'} đã được tạo thành công!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo kết nối",
        variant: "destructive",
      });
    },
  });

  // Update connection mutation
  const updateConnectionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/social-connections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update connection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-connections'] });
      setShowEditDialog(false);
      setSelectedConnection(null);
      toast({
        title: "Thành công",
        description: "Kết nối đã được cập nhật!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật kết nối",
        variant: "destructive",
      });
    },
  });

  // Delete connection mutation
  const deleteConnectionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/social-connections/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete connection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-connections'] });
      toast({
        title: "Thành công",
        description: "Kết nối đã được xóa!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa kết nối",
        variant: "destructive",
      });
    },
  });

  // Toggle connection status
  const toggleConnectionStatus = async (connection: SocialConnection) => {
    updateConnectionMutation.mutate({
      id: connection.id,
      data: { isActive: !connection.isActive }
    });
  };

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/social-connections/${id}/test`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to test connection');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Kết quả test",
        description: data.message || "Kết nối thành công!",
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi test kết nối",
        description: error.message || "Không thể test kết nối",
        variant: "destructive",
      });
    },
  });

  const handleCreateConnection = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const platform = formData.get('platform') as string;
    const accountName = formData.get('accountName') as string;
    const accessToken = formData.get('accessToken') as string;

    // Validation based on platform
    if (!platform || !accountName) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    // Non-WordPress platforms need access token
    if (platform !== 'wordpress' && !accessToken) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập Access Token",
        variant: "destructive",
      });
      return;
    }

    // Platform specific settings
    const settings: any = {};
    
    if (platform === 'wordpress') {
      settings.websiteUrl = formData.get('siteUrl');
      settings.username = formData.get('wpUsername');
      settings.authType = wordpressAuthType;
      
      if (wordpressAuthType === 'api-token') {
        settings.apiToken = formData.get('apiToken');
      } else if (wordpressAuthType === 'application-password') {
        settings.applicationPassword = formData.get('appPassword');
      }
    }

    createConnectionMutation.mutate({
      platform,
      accountName,
      accountId: accountName, // Use accountName as accountId for all platforms
      accessToken: platform === 'wordpress' ? '' : accessToken, // Save actual token for social media
      refreshToken: '',
      settings
    });
  };

  const handleEditConnection = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedConnection) return;

    const formData = new FormData(event.currentTarget);
    
    const accountName = formData.get('accountName') as string;
    
    // Get access token for social media platforms
    const accessToken = selectedConnection.platform === 'wordpress' ? '' : (formData.get('accessToken') as string);

    const settings: any = { ...selectedConnection.settings };
    
    if (selectedConnection.platform === 'wordpress') {
      settings.websiteUrl = formData.get('siteUrl');
      settings.username = formData.get('wpUsername');
      settings.authType = formData.get('authType') || settings.authType || 'api-token';
      
      if (settings.authType === 'api-token') {
        settings.apiToken = formData.get('apiToken');
      } else if (settings.authType === 'app-password') {
        settings.appPassword = formData.get('appPassword');
      }
    }

    updateConnectionMutation.mutate({
      id: selectedConnection.id,
      data: {
        accountName,
        accessToken,
        refreshToken: '',
        settings
      }
    });
  };

  const connections = (connectionsData?.data && Array.isArray(connectionsData.data)) ? connectionsData.data : [];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="ml-64 min-h-screen">
        <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Kết nối mạng xã hội
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quản lý kết nối với các nền tảng mạng xã hội và WordPress
          </p>
        </div>
        
        <Dialog 
          open={showCreateDialog} 
          onOpenChange={(open) => {
            setShowCreateDialog(open);
            if (!open) {
              setSelectedPlatform('');
              setWordpressAuthType('api-token');
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Thêm kết nối
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo kết nối mới</DialogTitle>
              <DialogDescription>
                Thêm kết nối với nền tảng mạng xã hội hoặc WordPress
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateConnection} className="space-y-4">
              <div>
                <Label htmlFor="platform">Nền tảng</Label>
                <Select 
                  name="platform" 
                  required 
                  onValueChange={(value) => setSelectedPlatform(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nền tảng..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wordpress">WordPress</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedPlatform && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {platformDescriptions[selectedPlatform as keyof typeof platformDescriptions]}
                  </p>
                </div>
              )}
              
              {/* Account name field for non-WordPress platforms */}
              {selectedPlatform && selectedPlatform !== 'wordpress' && (
                <div>
                  <Label htmlFor="accountName">Tên kết nối</Label>
                  <Input
                    id="accountName"
                    name="accountName"
                    placeholder="Tên hiển thị cho kết nối này..."
                    required
                  />
                </div>
              )}

              {/* WordPress-specific account name */}
              {selectedPlatform === 'wordpress' && (
                <div>
                  <Label htmlFor="accountName">Tên kết nối</Label>
                  <Input
                    id="accountName"
                    name="accountName"
                    placeholder="Tên hiển thị cho kết nối WordPress này..."
                    required
                  />
                </div>
              )}

              {/* WordPress specific fields */}
              {selectedPlatform === 'wordpress' && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Cài đặt WordPress</h4>
                  
                  <div>
                    <Label htmlFor="siteUrl">URL Website (WordPress)</Label>
                    <Input
                      id="siteUrl"
                      name="siteUrl"
                      placeholder="https://yoursite.com"
                      type="url"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="wpUsername">Username WordPress</Label>
                    <Input
                      id="wpUsername"
                      name="wpUsername"
                      placeholder="WordPress username..."
                      required
                    />
                  </div>

                  {/* Authentication Type Selection */}
                  <div>
                    <Label htmlFor="authType">Loại xác thực</Label>
                    <Select 
                      name="authType" 
                      value={wordpressAuthType}
                      onValueChange={(value) => setWordpressAuthType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại xác thực..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="api-token">API Token</SelectItem>
                        <SelectItem value="app-password">Application Password</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Conditional fields based on auth type */}
                  {wordpressAuthType === 'api-token' && (
                    <div className="space-y-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h5 className="font-medium text-blue-900 dark:text-blue-100">Xác thực bằng API Token</h5>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Sử dụng token API từ WordPress REST API hoặc plugin JWT Auth
                      </p>
                      <div>
                        <Label htmlFor="apiToken">API Token</Label>
                        <Textarea
                          id="apiToken"
                          name="apiToken"
                          placeholder="Nhập API token từ WordPress..."
                          rows={3}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {wordpressAuthType === 'app-password' && (
                    <div className="space-y-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <h5 className="font-medium text-green-900 dark:text-green-100">Xác thực bằng Application Password</h5>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Sử dụng mật khẩu ứng dụng từ WordPress (Yêu cầu WordPress 5.6+)
                      </p>
                      <div>
                        <Label htmlFor="appPassword">Application Password</Label>
                        <Input
                          id="appPassword"
                          name="appPassword"
                          type="password"
                          placeholder="Nhập application password..."
                          required
                        />
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Tạo Application Password trong WordPress Admin → Users → Your Profile → Application Passwords
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Social Media Platform Access Token */}
              {selectedPlatform !== 'wordpress' && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    Cài đặt {platformLabels[selectedPlatform as keyof typeof platformLabels]}
                  </h4>
                  
                  <div>
                    <Label htmlFor="accessToken">Access Token</Label>
                    <Textarea
                      id="accessToken"
                      name="accessToken"
                      placeholder={`Nhập Access Token cho ${platformLabels[selectedPlatform as keyof typeof platformLabels]}...`}
                      rows={3}
                      required
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Token này sẽ được sử dụng để đăng bài lên {platformLabels[selectedPlatform as keyof typeof platformLabels]}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setSelectedPlatform('');
                  }}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={createConnectionMutation.isPending}
                >
                  {createConnectionMutation.isPending ? "Đang tạo..." : "Tạo kết nối"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Platform Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(platformLabels).map(([platform, label]) => {
          const connection = connections.find((conn: SocialConnection) => conn.platform === platform);
          const isConnected = !!connection;
          
          return (
            <Card key={platform} className="text-center">
              <CardContent className="pt-6">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  isConnected 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                }`}>
                  {isConnected ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                </div>
                <h3 className="font-medium text-sm">{label}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {isConnected ? 'Đã kết nối' : 'Chưa kết nối'}
                </p>
                {isConnected && (
                  <Badge 
                    variant={connection.isActive ? "default" : "secondary"} 
                    className="mt-2 text-xs"
                  >
                    {connection.isActive ? 'Hoạt động' : 'Tạm dừng'}
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Connections Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách kết nối</CardTitle>
          <CardDescription>
            {connections.length} kết nối được tìm thấy
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <div className="text-center py-8">
              <ExternalLink className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Chưa có kết nối nào
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Thêm kết nối đầu tiên để bắt đầu đăng bài tự động
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm kết nối
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nền tảng</TableHead>
                    <TableHead>Tài khoản</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {connections.map((connection: SocialConnection) => (
                    <TableRow key={connection.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {platformLabels[connection.platform as keyof typeof platformLabels] || connection.platform}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{connection.accountName}</div>
                          <div className="text-sm text-gray-500">{connection.accountId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={connection.isActive}
                            onCheckedChange={() => toggleConnectionStatus(connection)}
                            disabled={updateConnectionMutation.isPending}
                          />
                          <span className="text-sm">
                            {connection.isActive ? 'Hoạt động' : 'Tạm dừng'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(connection.createdAt), "dd/MM/yyyy", { locale: vi })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testConnectionMutation.mutate(connection.id)}
                            disabled={testConnectionMutation.isPending}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Settings className="h-4 w-4" />
                            Test
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedConnection(connection);
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteConnectionMutation.mutate(connection.id)}
                            disabled={deleteConnectionMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Connection Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa kết nối</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin kết nối {selectedConnection && platformLabels[selectedConnection.platform as keyof typeof platformLabels]}
            </DialogDescription>
          </DialogHeader>
          
          {selectedConnection && (
            <form onSubmit={handleEditConnection} className="space-y-4">
              <div>
                <Label htmlFor="edit-accountName">Tên tài khoản</Label>
                <Input
                  id="edit-accountName"
                  name="accountName"
                  defaultValue={selectedConnection.accountName}
                  required
                />
              </div>
              
              {/* Social Media Access Token */}
              {selectedConnection.platform !== 'wordpress' && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    Cài đặt {platformLabels[selectedConnection.platform as keyof typeof platformLabels]}
                  </h4>
                  
                  <div>
                    <Label htmlFor="edit-accessToken">Access Token</Label>
                    <Textarea
                      id="edit-accessToken"
                      name="accessToken"
                      placeholder="Cập nhật access token..."
                      rows={3}
                      required
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Token này sẽ được sử dụng để đăng bài lên {platformLabels[selectedConnection.platform as keyof typeof platformLabels]}
                    </p>
                  </div>
                </div>
              )}

              {/* Platform specific fields */}
              {selectedConnection.platform === 'wordpress' && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">Cài đặt WordPress</h4>
                  
                  <div>
                    <Label htmlFor="edit-siteUrl">URL Website</Label>
                    <Input
                      id="edit-siteUrl"
                      name="siteUrl"
                      defaultValue={selectedConnection.settings?.websiteUrl || ''}
                      placeholder="https://yoursite.com"
                      type="url"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-wpUsername">Username</Label>
                    <Input
                      id="edit-wpUsername"
                      name="wpUsername"
                      defaultValue={selectedConnection.settings?.username || ''}
                      placeholder="WordPress username..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-authType">Loại xác thực</Label>
                    <Select 
                      name="authType" 
                      defaultValue={selectedConnection.settings?.authType || 'api-token'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại xác thực..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="api-token">API Token</SelectItem>
                        <SelectItem value="app-password">Application Password</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* API Token Section */}
                  {(!selectedConnection.settings?.authType || selectedConnection.settings?.authType === 'api-token') && (
                    <div className="space-y-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h5 className="font-medium text-blue-900 dark:text-blue-100">Xác thực bằng API Token</h5>
                      <div>
                        <Label htmlFor="edit-apiToken">API Token</Label>
                        <Textarea
                          id="edit-apiToken"
                          name="apiToken"
                          defaultValue={selectedConnection.settings?.apiToken || ''}
                          placeholder="Cập nhật API token từ WordPress..."
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  {/* Application Password Section */}
                  {selectedConnection.settings?.authType === 'app-password' && (
                    <div className="space-y-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <h5 className="font-medium text-green-900 dark:text-green-100">Xác thực bằng Application Password</h5>
                      <div>
                        <Label htmlFor="edit-appPassword">Application Password</Label>
                        <Input
                          id="edit-appPassword"
                          name="appPassword"
                          type="password"
                          defaultValue={selectedConnection.settings?.appPassword || ''}
                          placeholder="Cập nhật application password..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedConnection.platform === 'facebook' && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">Cài đặt Facebook</h4>
                  
                  <div>
                    <Label htmlFor="edit-pageId">Page ID</Label>
                    <Input
                      id="edit-pageId"
                      name="pageId"
                      defaultValue={selectedConnection.settings?.pageId || ''}
                      placeholder="ID của Facebook Page..."
                    />
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false);
                    setSelectedConnection(null);
                  }}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={updateConnectionMutation.isPending}
                >
                  {updateConnectionMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </div>
  );
}