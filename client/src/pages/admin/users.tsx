import { useState } from "react";
import { AdminLayout } from "@/components/admin/Layout";
import { useLanguage } from "@/hooks/use-language";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { CreditCard, Eye, Edit, Trash, Search, Plus, Pencil, Ban, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Head from "@/components/head";

// Define form schema
const userFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  fullName: z.string().optional(),
  role: z.enum(["admin", "user"]),
  status: z.enum(["active", "inactive", "suspended"]),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function AdminUsers() {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const pageSize = 10;

  // Fetch users data
  const { data: usersResponse, isLoading } = useQuery<{ success: boolean, data: { users: User[], total: number } }>({
    queryKey: ["/api/admin/users", searchQuery, currentPage, pageSize],
    queryFn: async () => {
      // Mock data until API is available
      const mockUsers: User[] = [
        {
          id: 1,
          username: "admin",
          email: "admin@example.com",
          password: "hashed_password",
          role: "admin",
          fullName: "Administrator",
          createdAt: "2023-01-01T00:00:00Z",
          updatedAt: "2023-01-01T00:00:00Z",
        },
        {
          id: 2,
          username: "johndoe",
          email: "john.doe@example.com",
          password: "hashed_password",
          role: "user",
          fullName: "John Doe",
          createdAt: "2023-01-15T10:30:00Z",
          updatedAt: "2023-01-15T10:30:00Z",
        },
        {
          id: 3,
          username: "janedoe",
          email: "jane.doe@example.com",
          password: "hashed_password",
          role: "user",
          fullName: "Jane Doe",
          createdAt: "2023-02-10T14:22:00Z",
          updatedAt: "2023-02-10T14:22:00Z",
        },
        {
          id: 4,
          username: "robertsmith",
          email: "robert.smith@example.com",
          password: "hashed_password",
          role: "user",
          createdAt: "2023-03-05T09:15:00Z",
          updatedAt: "2023-03-05T09:15:00Z",
        },
        {
          id: 5,
          username: "maryjones",
          email: "mary.jones@example.com",
          password: "hashed_password",
          role: "user",
          fullName: "Mary Jones",
          createdAt: "2023-03-20T11:45:00Z",
          updatedAt: "2023-03-20T11:45:00Z",
        },
      ];
      
      // Filter users by search query
      const filteredUsers = searchQuery 
        ? mockUsers.filter(user => 
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.fullName && user.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        : mockUsers;
        
      // Paginate results
      const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      );
      
      return {
        success: true,
        data: {
          users: paginatedUsers,
          total: filteredUsers.length
        }
      };
    },
  });

  const usersData = usersResponse?.data;
  const totalPages = usersData ? Math.ceil(usersData.total / pageSize) : 0;

  // Form for adding new user
  const addForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      role: "user",
      status: "active",
      password: "",
    },
  });

  // Form for editing user
  const editForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      role: "user",
      status: "active",
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      const res = await apiRequest("POST", "/api/admin/users", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Người dùng đã được tạo thành công",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UserFormValues }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Thông tin người dùng đã được cập nhật",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Người dùng đã được xóa",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add credits mutation
  const addCreditsMutation = useMutation({
    mutationFn: async ({ userId, amount, description }: { userId: number; amount: number; description: string }) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/credits`, {
        amount,
        description
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Credits đã được thêm vào tài khoản người dùng",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onAddSubmit = (data: UserFormValues) => {
    createUserMutation.mutate(data);
  };

  const onEditSubmit = (data: UserFormValues) => {
    if (selectedUser) {
      updateUserMutation.mutate({ id: selectedUser.id, data });
    }
  };

  const handleViewClick = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    editForm.reset({
      username: user.username,
      email: user.email,
      fullName: user.fullName || "",
      role: user.role,
      status: "active", // Assuming all users are active for now
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Active</Badge>;
      case "inactive":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Inactive</Badge>;
      case "suspended":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Suspended</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <>
      <Head>
        <title>{t("admin.users.title") || "Quản lý người dùng"} - {t("common.appName") || "SEO AI Writer"}</title>
      </Head>
      
      <AdminLayout title={t("admin.users.title") || "Quản lý người dùng"}>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t("admin.users.title") || "Quản lý người dùng"}</h1>
            <p className="text-muted-foreground">{t("admin.users.description") || "Xem và quản lý tất cả người dùng trong hệ thống"}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("admin.users.search") || "Tìm kiếm người dùng..."}
                className="pl-8 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("admin.users.addUser") || "Thêm người dùng"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>{t("admin.users.addUser") || "Thêm người dùng mới"}</DialogTitle>
                  <DialogDescription>
                    {t("admin.users.addUserDescription") || "Tạo người dùng mới trong hệ thống. Điền các thông tin dưới đây."}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                    <FormField
                      control={addForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("admin.users.username") || "Tên đăng nhập"}</FormLabel>
                          <FormControl>
                            <Input placeholder="johndoe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("admin.users.email") || "Email"}</FormLabel>
                          <FormControl>
                            <Input placeholder="john.doe@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("admin.users.fullName") || "Họ và tên"}</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("admin.users.role") || "Vai trò"}</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("admin.users.selectRole") || "Chọn vai trò"} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="user">{t("admin.users.roleUser") || "Người dùng"}</SelectItem>
                                <SelectItem value="admin">{t("admin.users.roleAdmin") || "Quản trị viên"}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("admin.users.status") || "Trạng thái"}</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("admin.users.selectStatus") || "Chọn trạng thái"} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="active">{t("admin.users.statusActive") || "Đang hoạt động"}</SelectItem>
                                <SelectItem value="inactive">{t("admin.users.statusInactive") || "Không hoạt động"}</SelectItem>
                                <SelectItem value="suspended">{t("admin.users.statusSuspended") || "Đã bị khóa"}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={addForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("admin.users.password") || "Mật khẩu"}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormDescription>
                            {t("admin.users.passwordDescription") || "Mật khẩu phải có ít nhất 6 ký tự"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        {t("common.cancel") || "Hủy"}
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createUserMutation.isPending}
                      >
                        {createUserMutation.isPending 
                          ? (t("common.creating") || "Đang tạo...") 
                          : (t("common.create") || "Tạo mới")}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.users.allUsers") || "Tất cả người dùng"}</CardTitle>
            <CardDescription>
              {t("admin.users.totalCount") || "Tổng số:"} {usersData?.total || 0} {t("admin.users.users") || "người dùng"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t("admin.users.username") || "Tên đăng nhập"}</TableHead>
                  <TableHead>{t("admin.users.fullName") || "Họ và tên"}</TableHead>
                  <TableHead>{t("admin.users.email") || "Email"}</TableHead>
                  <TableHead>{t("admin.users.role") || "Vai trò"}</TableHead>
                  <TableHead>{t("admin.users.status") || "Trạng thái"}</TableHead>
                  <TableHead>{t("admin.users.joinDate") || "Ngày tham gia"}</TableHead>
                  <TableHead className="text-right">{t("admin.common.actions") || "Thao tác"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      {t("common.loading") || "Đang tải..."}
                    </TableCell>
                  </TableRow>
                ) : usersData?.users && usersData.users.length > 0 ? (
                  usersData.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.fullName || "-"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "outline"}>
                          {user.role === "admin" 
                            ? (t("admin.users.roleAdmin") || "Quản trị viên") 
                            : (t("admin.users.roleUser") || "Người dùng")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge("active")}
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">{t("admin.common.openMenu") || "Mở menu"}</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="12" cy="5" r="1"></circle>
                                <circle cx="12" cy="19" r="1"></circle>
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t("admin.common.actions") || "Thao tác"}</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewClick(user)}>
                              <Eye className="mr-2 h-4 w-4" />
                              {t("admin.common.view") || "Xem chi tiết"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t("admin.common.edit") || "Chỉnh sửa"}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CreditCard className="mr-2 h-4 w-4" />
                              {t("admin.users.addCredits") || "Thêm credits"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteClick(user)}>
                              <Trash className="mr-2 h-4 w-4" />
                              {t("admin.common.delete") || "Xóa"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      {t("admin.users.noUsers") || "Không tìm thấy người dùng nào"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          {totalPages > 1 && (
            <CardFooter className="flex justify-center border-t p-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(index + 1);
                        }}
                        isActive={currentPage === index + 1}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          )}
        </Card>

        {/* View User Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{t("admin.users.viewUser") || "Chi tiết người dùng"}</DialogTitle>
              <DialogDescription>
                {t("admin.users.viewUserDescription") || "Thông tin chi tiết của người dùng"}
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
                    {selectedUser.fullName 
                      ? selectedUser.fullName.charAt(0).toUpperCase() 
                      : selectedUser.username.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("admin.users.username") || "Tên đăng nhập"}</p>
                    <p className="text-base font-medium">{selectedUser.username}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("admin.users.email") || "Email"}</p>
                    <p className="text-base font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("admin.users.fullName") || "Họ và tên"}</p>
                    <p className="text-base font-medium">{selectedUser.fullName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("admin.users.role") || "Vai trò"}</p>
                    <Badge variant={selectedUser.role === "admin" ? "default" : "outline"} className="mt-1">
                      {selectedUser.role === "admin" 
                        ? (t("admin.users.roleAdmin") || "Quản trị viên") 
                        : (t("admin.users.roleUser") || "Người dùng")}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("admin.users.joinDate") || "Ngày tham gia"}</p>
                    <p className="text-base font-medium">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("admin.users.status") || "Trạng thái"}</p>
                    {getStatusBadge("active")}
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-base font-medium mb-2">{t("admin.users.activity") || "Hoạt động gần đây"}</h3>
                  <div className="text-sm text-muted-foreground">
                    <p>- Đăng nhập lúc {formatDate(new Date().toISOString())}</p>
                    <p>- Tạo bài viết lúc {formatDate(new Date().toISOString())}</p>
                    <p>- Cập nhật thông tin cá nhân lúc {formatDate(new Date().toISOString())}</p>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsViewDialogOpen(false)}
              >
                {t("common.close") || "Đóng"}
              </Button>
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedUser) handleEditClick(selectedUser);
              }}>
                <Pencil className="mr-2 h-4 w-4" />
                {t("admin.common.edit") || "Chỉnh sửa"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{t("admin.users.editUser") || "Chỉnh sửa người dùng"}</DialogTitle>
              <DialogDescription>
                {t("admin.users.editUserDescription") || "Cập nhật thông tin người dùng"}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.users.username") || "Tên đăng nhập"}</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.users.email") || "Email"}</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.users.fullName") || "Họ và tên"}</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("admin.users.role") || "Vai trò"}</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("admin.users.selectRole") || "Chọn vai trò"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">{t("admin.users.roleUser") || "Người dùng"}</SelectItem>
                            <SelectItem value="admin">{t("admin.users.roleAdmin") || "Quản trị viên"}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("admin.users.status") || "Trạng thái"}</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("admin.users.selectStatus") || "Chọn trạng thái"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">{t("admin.users.statusActive") || "Đang hoạt động"}</SelectItem>
                            <SelectItem value="inactive">{t("admin.users.statusInactive") || "Không hoạt động"}</SelectItem>
                            <SelectItem value="suspended">{t("admin.users.statusSuspended") || "Đã bị khóa"}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter className="gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      if (selectedUser?.role === "admin") {
                        toast({
                          title: "Cảnh báo",
                          description: "Không thể khóa tài khoản quản trị viên",
                          variant: "destructive",
                        });
                        return;
                      }
                      // Set user status to suspended (in real usage)
                      toast({
                        title: "Thành công",
                        description: "Đã khóa tài khoản người dùng",
                      });
                      setIsEditDialogOpen(false);
                    }}
                    className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    {t("admin.users.suspend") || "Khóa tài khoản"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    {t("common.cancel") || "Hủy"}
                  </Button>
                  <Button 
                    type="submit"
                    disabled={updateUserMutation.isPending}
                  >
                    {updateUserMutation.isPending 
                      ? (t("common.saving") || "Đang lưu...") 
                      : (t("common.save") || "Lưu thay đổi")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>{t("admin.users.deleteUser") || "Xóa người dùng"}</DialogTitle>
              <DialogDescription>
                {t("admin.users.deleteUserDescription") || "Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác."}
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="py-4">
                <p><strong>{t("admin.users.username") || "Tên đăng nhập"}:</strong> {selectedUser.username}</p>
                <p><strong>{t("admin.users.email") || "Email"}:</strong> {selectedUser.email}</p>
                {selectedUser.fullName && (
                  <p><strong>{t("admin.users.fullName") || "Họ và tên"}:</strong> {selectedUser.fullName}</p>
                )}
                <p><strong>{t("admin.users.role") || "Vai trò"}:</strong> {selectedUser.role === "admin" 
                  ? (t("admin.users.roleAdmin") || "Quản trị viên") 
                  : (t("admin.users.roleUser") || "Người dùng")}
                </p>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                {t("common.cancel") || "Hủy"}
              </Button>
              <Button 
                type="button"
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending 
                  ? (t("common.deleting") || "Đang xóa...") 
                  : (t("common.delete") || "Xóa")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}