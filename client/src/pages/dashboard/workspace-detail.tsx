import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardLayout } from '@/components/dashboard/Layout';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Users, 
  Plus, 
  Settings, 
  UserPlus, 
  Calendar, 
  Activity,
  Image,
  Play,
  CheckCircle,
  Clock,
  ArrowLeft,
  Crown,
  Shield,
  Edit,
  Eye
} from 'lucide-react';
import { Link } from 'wouter';

// Types
interface WorkspaceMember {
  id: number;
  userId: number;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  user: {
    id: number;
    username: string;
    fullName?: string;
    profileImageUrl?: string;
  };
  joinedAt: string;
  lastActiveAt?: string;
}

interface CollaborativeSession {
  id: number;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'cancelled';
  prompt?: string;
  imageStyle: string;
  targetImageCount: number;
  createdBy: number;
  creator: {
    username: string;
    fullName?: string;
  };
  imageCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface Workspace {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  status: 'active' | 'archived' | 'deleted';
  isPublic: boolean;
  maxMembers: number;
  inviteCode?: string;
  createdAt: string;
  updatedAt: string;
}

// Form schemas
const createSessionSchema = z.object({
  name: z.string().min(1, 'Tên phiên làm việc là bắt buộc'),
  description: z.string().optional(),
  prompt: z.string().optional(),
  imageStyle: z.string().default('realistic'),
  targetImageCount: z.number().min(1).max(10).default(1),
});

type CreateSessionForm = z.infer<typeof createSessionSchema>;

export default function WorkspaceDetailPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, params] = useRoute('/dashboard/workspaces/:id');
  const workspaceId = params?.id;
  const [showCreateSessionDialog, setShowCreateSessionDialog] = useState(false);

  // Form setup
  const form = useForm<CreateSessionForm>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      name: '',
      description: '',
      prompt: '',
      imageStyle: 'realistic',
      targetImageCount: 1,
    },
  });

  // Fetch workspace details
  const { data: workspaceData, isLoading: workspaceLoading } = useQuery({
    queryKey: [`/api/workspaces/${workspaceId}`],
    enabled: !!workspaceId,
  });

  // Fetch workspace members
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: [`/api/workspaces/${workspaceId}/members`],
    enabled: !!workspaceId,
  });

  // Fetch collaborative sessions
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: [`/api/workspaces/${workspaceId}/sessions`],
    enabled: !!workspaceId,
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: CreateSessionForm) => {
      const response = await fetch(`/api/workspaces/${workspaceId}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể tạo phiên làm việc');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workspaces/${workspaceId}/sessions`] });
      toast({
        title: "Thành công",
        description: "Phiên làm việc đã được tạo thành công!",
      });
      setShowCreateSessionDialog(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo phiên làm việc",
        variant: "destructive",
      });
    },
  });

  const handleCreateSession = (data: CreateSessionForm) => {
    createSessionMutation.mutate(data);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'editor':
        return <Edit className="h-4 w-4 text-green-500" />;
      default:
        return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Chủ sở hữu';
      case 'admin':
        return 'Quản trị viên';
      case 'editor':
        return 'Biên tập viên';
      default:
        return 'Người xem';
    }
  };

  const getStyleLabel = (style: string) => {
    const styleLabels: Record<string, string> = {
      realistic: 'Thực tế',
      cartoon: 'Hoạt hình',
      anime: 'Anime/Manga',
      watercolor: 'Màu nước',
      oil_painting: 'Sơn dầu',
      sketch: 'Phác thảo',
      minimalist: 'Tối giản',
      vintage: 'Cổ điển',
      futuristic: 'Tương lai',
      abstract: 'Trừu tượng',
      pop_art: 'Pop Art',
      cyberpunk: 'Cyberpunk'
    };
    return styleLabels[style] || style;
  };

  if (workspaceLoading) {
    return (
      <DashboardLayout>
        <div className="container py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-muted rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const workspace: Workspace = workspaceData?.data?.workspace || workspaceData?.workspace;
  const members: WorkspaceMember[] = membersData?.data?.members || membersData?.members || [];
  const sessions: CollaborativeSession[] = sessionsData?.data?.sessions || sessionsData?.sessions || [];

  if (!workspace) {
    return (
      <DashboardLayout>
        <div className="container py-6">
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy workspace</h3>
              <p className="text-muted-foreground mb-6">
                Workspace này không tồn tại hoặc bạn không có quyền truy cập
              </p>
              <Button asChild>
                <Link href="/dashboard/workspaces">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại danh sách
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const userMember = members.find(m => m.userId === user?.id);
  const canCreateSession = userMember && ['owner', 'admin', 'editor'].includes(userMember.role);

  return (
    <DashboardLayout>
      <div className="container py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/workspaces">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{workspace.name}</h1>
            {workspace.description && (
              <p className="text-muted-foreground mt-2">{workspace.description}</p>
            )}
          </div>
          <Badge variant={workspace.status === 'active' ? 'default' : 'secondary'}>
            {workspace.status === 'active' ? 'Hoạt động' : 'Đã lưu trữ'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sessions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Phiên làm việc cộng tác</CardTitle>
                    <CardDescription>
                      Các phiên tạo hình ảnh đang hoạt động và đã hoàn thành
                    </CardDescription>
                  </div>
                  {canCreateSession && (
                    <Dialog open={showCreateSessionDialog} onOpenChange={setShowCreateSessionDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Tạo phiên mới
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Tạo phiên làm việc mới</DialogTitle>
                          <DialogDescription>
                            Tạo phiên cộng tác để các thành viên cùng tạo hình ảnh
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(handleCreateSession)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tên phiên làm việc</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Nhập tên phiên làm việc..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Mô tả (Tùy chọn)</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Mô tả về phiên làm việc..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="imageStyle"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phong cách hình ảnh</FormLabel>
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Chọn phong cách..." />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="realistic">Thực tế</SelectItem>
                                      <SelectItem value="cartoon">Hoạt hình</SelectItem>
                                      <SelectItem value="anime">Anime/Manga</SelectItem>
                                      <SelectItem value="watercolor">Màu nước</SelectItem>
                                      <SelectItem value="oil_painting">Sơn dầu</SelectItem>
                                      <SelectItem value="sketch">Phác thảo</SelectItem>
                                      <SelectItem value="minimalist">Tối giản</SelectItem>
                                      <SelectItem value="vintage">Cổ điển</SelectItem>
                                      <SelectItem value="futuristic">Tương lai</SelectItem>
                                      <SelectItem value="abstract">Trừu tượng</SelectItem>
                                      <SelectItem value="pop_art">Pop Art</SelectItem>
                                      <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="targetImageCount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Số hình ảnh mục tiêu</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min={1} 
                                      max={10}
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="flex gap-2 pt-4">
                              <Button type="submit" disabled={createSessionMutation.isPending} className="flex-1">
                                {createSessionMutation.isPending ? 'Đang tạo...' : 'Tạo phiên'}
                              </Button>
                              <Button type="button" variant="outline" onClick={() => setShowCreateSessionDialog(false)}>
                                Hủy
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse p-4 border rounded-lg">
                        <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/3"></div>
                      </div>
                    ))}
                  </div>
                ) : sessions.length > 0 ? (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div key={session.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium">{session.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Bởi {session.creator.fullName || session.creator.username}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                              {session.status === 'active' ? (
                                <>
                                  <Play className="h-3 w-3 mr-1" />
                                  Đang hoạt động
                                </>
                              ) : session.status === 'completed' ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Hoàn thành
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  Đã hủy
                                </>
                              )}
                            </Badge>
                          </div>
                        </div>
                        
                        {session.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {session.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span>Phong cách: {getStyleLabel(session.imageStyle)}</span>
                          <span>Mục tiêu: {session.targetImageCount} hình</span>
                          <span>Đã tạo: {session.imageCount || 0} hình</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/dashboard/workspaces/${workspaceId}/sessions/${session.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Xem chi tiết
                            </Link>
                          </Button>
                          
                          {session.status === 'active' && (
                            <Button asChild size="sm">
                              <Link href={`/dashboard/workspaces/${workspaceId}/sessions/${session.id}/collaborate`}>
                                <Image className="h-4 w-4 mr-2" />
                                Tham gia
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Chưa có phiên làm việc nào</h3>
                    <p className="text-muted-foreground mb-6">
                      {canCreateSession ? 'Tạo phiên làm việc đầu tiên để bắt đầu cộng tác' : 'Chờ quản trị viên tạo phiên làm việc'}
                    </p>
                    {canCreateSession && (
                      <Button onClick={() => setShowCreateSessionDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo phiên đầu tiên
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Members */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Thành viên ({members.length}/{workspace.maxMembers})
                  </CardTitle>
                  {userMember && ['owner', 'admin'].includes(userMember.role) && (
                    <Button size="sm" variant="outline">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {membersLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="h-8 w-8 bg-muted rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-muted rounded w-2/3 mb-1"></div>
                          <div className="h-2 bg-muted rounded w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.user.profileImageUrl} />
                          <AvatarFallback>
                            {(member.user.fullName || member.user.username).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {member.user.fullName || member.user.username}
                            </p>
                            {getRoleIcon(member.role)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {getRoleLabel(member.role)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Workspace Info */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin workspace</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <Badge variant={workspace.status === 'active' ? 'default' : 'secondary'}>
                    {workspace.status === 'active' ? 'Hoạt động' : 'Đã lưu trữ'}
                  </Badge>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quyền truy cập:</span>
                  <span>{workspace.isPublic ? 'Công khai' : 'Riêng tư'}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ngày tạo:</span>
                  <span>{new Date(workspace.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                
                {workspace.inviteCode && userMember && ['owner', 'admin'].includes(userMember.role) && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Mã mời:</p>
                    <div className="flex gap-2">
                      <Input value={workspace.inviteCode} readOnly className="text-xs" />
                      <Button size="sm" variant="outline" onClick={() => {
                        navigator.clipboard.writeText(workspace.inviteCode!);
                        toast({ title: "Đã sao chép mã mời" });
                      }}>
                        Sao chép
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}