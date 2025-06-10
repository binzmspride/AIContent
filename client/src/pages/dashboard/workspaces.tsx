import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, Plus, Settings, Eye, UserPlus, Calendar, Activity } from 'lucide-react';
import { Link } from 'wouter';

// Types
interface Workspace {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  owner?: {
    username: string;
    fullName?: string;
  };
  status: 'active' | 'archived' | 'deleted';
  isPublic: boolean;
  maxMembers: number;
  memberCount?: number;
  inviteCode?: string;
  createdAt: string;
  updatedAt: string;
}

// Form schemas
const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Tên workspace là bắt buộc'),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
  maxMembers: z.number().min(1, 'Tối thiểu 1 thành viên').max(100, 'Tối đa 100 thành viên').default(10),
});

type CreateWorkspaceForm = z.infer<typeof createWorkspaceSchema>;

export default function WorkspacesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Form setup
  const form = useForm<CreateWorkspaceForm>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
      description: '',
      isPublic: false,
      maxMembers: 10,
    },
  });

  // Fetch workspaces
  const { data: workspacesData, isLoading: workspacesLoading } = useQuery({
    queryKey: ['/api/workspaces'],
  });

  // Create workspace mutation
  const createWorkspaceMutation = useMutation({
    mutationFn: async (data: CreateWorkspaceForm) => {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể tạo workspace');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workspaces'] });
      toast({
        title: "Thành công",
        description: "Workspace đã được tạo thành công!",
      });
      setShowCreateDialog(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo workspace",
        variant: "destructive",
      });
    },
  });

  const handleCreateWorkspace = (data: CreateWorkspaceForm) => {
    createWorkspaceMutation.mutate(data);
  };

  const workspaces = workspacesData?.workspaces || [];

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Workspace cộng tác</h1>
            <p className="text-muted-foreground mt-2">
              Quản lý không gian làm việc cộng tác để tạo hình ảnh với nhóm
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo Workspace
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tạo Workspace mới</DialogTitle>
                <DialogDescription>
                  Tạo không gian làm việc cộng tác để mời các thành viên cùng tạo hình ảnh
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateWorkspace)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên Workspace</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên workspace..." {...field} />
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
                          <Textarea placeholder="Mô tả về workspace..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="maxMembers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số thành viên tối đa</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1} 
                            max={100}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Workspace công khai</FormLabel>
                          <FormDescription className="text-sm">
                            Cho phép mọi người tìm thấy và tham gia workspace
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={createWorkspaceMutation.isPending} className="flex-1">
                      {createWorkspaceMutation.isPending ? 'Đang tạo...' : 'Tạo Workspace'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Hủy
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {workspacesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : workspaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace: Workspace) => (
              <Card key={workspace.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{workspace.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Bởi {workspace.owner?.fullName || workspace.owner?.username || 'Không xác định'}
                      </CardDescription>
                    </div>
                    <Badge variant={workspace.status === 'active' ? 'default' : 'secondary'}>
                      {workspace.status === 'active' ? 'Hoạt động' : 'Đã lưu trữ'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {workspace.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {workspace.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{workspace.memberCount || 0}/{workspace.maxMembers}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(workspace.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/dashboard/workspaces/${workspace.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Xem
                      </Link>
                    </Button>
                    
                    {workspace.ownerId === user?.id && (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/workspaces/${workspace.id}/settings`}>
                          <Settings className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có workspace nào</h3>
              <p className="text-muted-foreground mb-6">
                Tạo workspace đầu tiên để bắt đầu cộng tác với nhóm của bạn
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo Workspace đầu tiên
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}