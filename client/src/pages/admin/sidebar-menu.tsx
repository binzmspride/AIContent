import { useState } from "react";
import { AdminLayout } from "@/components/admin/Layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SidebarMenuItem } from "@shared/schema";
import {
  Edit,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Head from "@/components/head";

const menuItemFormSchema = z.object({
  key: z.string().min(1, "Key is required").max(100),
  label: z.string().min(1, "Label is required").max(200),
  labelEn: z.string().max(200).optional(),
  icon: z.string().max(50).optional(),
  path: z.string().max(200).optional(),
  parentKey: z.string().max(100).optional(),
  sortOrder: z.number().min(0),
  isEnabled: z.boolean(),
  requiredRole: z.enum(['user', 'admin']),
});

type MenuItemFormValues = z.infer<typeof menuItemFormSchema>;

export default function SidebarMenuManagement() {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SidebarMenuItem | null>(null);

  // Fetch menu items
  const { data: menuItemsResponse, isLoading } = useQuery<{success: boolean, data: SidebarMenuItem[]}>({
    queryKey: ["/api/admin/sidebar-menu"],
  });

  const menuItems = menuItemsResponse?.data || [];

  // Form setup
  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      key: "",
      label: "",
      labelEn: "",
      icon: "",
      path: "",
      parentKey: "",
      sortOrder: 0,
      isEnabled: true,
      requiredRole: "user",
    },
  });

  // Create/Update mutation
  const saveMenuItemMutation = useMutation({
    mutationFn: async (data: MenuItemFormValues) => {
      const endpoint = selectedItem 
        ? `/api/admin/sidebar-menu/${selectedItem.id}`
        : "/api/admin/sidebar-menu";
      const method = selectedItem ? "PATCH" : "POST";
      const res = await apiRequest(method, endpoint, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: selectedItem ? "Menu item đã được cập nhật" : "Menu item đã được tạo",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sidebar-menu"] });
      setIsEditDialogOpen(false);
      setSelectedItem(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/sidebar-menu/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Menu item đã được xóa",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sidebar-menu"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle enabled state
  const toggleEnabledMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: number; isEnabled: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/sidebar-menu/${id}`, { isEnabled });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sidebar-menu"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update sort order
  const updateSortOrderMutation = useMutation({
    mutationFn: async ({ id, sortOrder }: { id: number; sortOrder: number }) => {
      const res = await apiRequest("PATCH", `/api/admin/sidebar-menu/${id}`, { sortOrder });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sidebar-menu"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (item: SidebarMenuItem) => {
    setSelectedItem(item);
    form.reset({
      key: item.key,
      label: item.label,
      labelEn: item.labelEn || "",
      icon: item.icon || "",
      path: item.path || "",
      parentKey: item.parentKey || "",
      sortOrder: item.sortOrder,
      isEnabled: item.isEnabled,
      requiredRole: item.requiredRole || "user",
    });
    setIsEditDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedItem(null);
    form.reset();
    setIsEditDialogOpen(true);
  };

  const onSubmit = (data: MenuItemFormValues) => {
    saveMenuItemMutation.mutate(data);
  };

  const handleToggleEnabled = (id: number, currentState: boolean) => {
    toggleEnabledMutation.mutate({ id, isEnabled: !currentState });
  };

  const handleMoveSortOrder = (id: number, currentOrder: number, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    updateSortOrderMutation.mutate({ id, sortOrder: newOrder });
  };

  return (
    <>
      <Head>
        <title>Quản lý Sidebar Menu - Admin</title>
      </Head>
      
      <AdminLayout title="Quản lý Sidebar Menu">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Sidebar Menu Items</CardTitle>
                <CardDescription>
                  Quản lý các menu item hiển thị trong sidebar của người dùng
                </CardDescription>
              </div>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm Menu Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-10">Đang tải...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thứ tự</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Nhãn</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead>Đường dẫn</TableHead>
                    <TableHead>Quyền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-mono">{item.sortOrder}</span>
                          <div className="flex flex-col">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={() => handleMoveSortOrder(item.id, item.sortOrder, 'up')}
                              disabled={item.sortOrder <= 1}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={() => handleMoveSortOrder(item.id, item.sortOrder, 'down')}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm px-2 py-1 rounded">
                          {item.key}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.label}</div>
                          {item.labelEn && (
                            <div className="text-sm text-gray-500">{item.labelEn}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.icon && (
                          <code className="text-sm px-2 py-1 rounded">
                            {item.icon}
                          </code>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.path && (
                          <code className="text-sm px-2 py-1 rounded">
                            {item.path}
                          </code>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.requiredRole === 'admin' ? 'destructive' : 'secondary'}>
                          {item.requiredRole}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleEnabled(item.id, item.isEnabled)}
                        >
                          {item.isEnabled ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMenuItemMutation.mutate(item.id)}
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
            )}
          </CardContent>
        </Card>

        {/* Edit/Create Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedItem ? "Chỉnh sửa Menu Item" : "Tạo Menu Item mới"}
              </DialogTitle>
              <DialogDescription>
                {selectedItem ? "Cập nhật thông tin menu item" : "Thêm menu item mới vào sidebar"}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key *</FormLabel>
                      <FormControl>
                        <Input placeholder="dashboard" {...field} />
                      </FormControl>
                      <FormDescription>
                        Mã định danh duy nhất cho menu item
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nhãn (Tiếng Việt) *</FormLabel>
                      <FormControl>
                        <Input placeholder="Bảng điều khiển" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="labelEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nhãn (Tiếng Anh)</FormLabel>
                      <FormControl>
                        <Input placeholder="Dashboard" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                      <FormControl>
                        <Input placeholder="LayoutDashboard" {...field} />
                      </FormControl>
                      <FormDescription>
                        Tên icon từ Lucide React
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đường dẫn</FormLabel>
                      <FormControl>
                        <Input placeholder="/dashboard" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thứ tự sắp xếp</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requiredRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quyền truy cập</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn quyền" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Hiển thị menu
                        </FormLabel>
                        <FormDescription>
                          Bật/tắt hiển thị menu item này
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

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saveMenuItemMutation.isPending}
                  >
                    {saveMenuItemMutation.isPending ? "Đang lưu..." : "Lưu"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}