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
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  Eye, 
  Search, 
  Filter,
  ArrowUpDown,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Ban
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import Head from "@/components/head";

// Transaction Status
type TransactionStatus = "all" | "success" | "pending" | "failed" | "refunded";

// Plan Type
type PlanType = "all" | "credit" | "storage";

// Sort type
type SortField = "createdAt" | "amount" | "username";
type SortOrder = "asc" | "desc";

// Transaction interface
interface Transaction {
  id: number;
  userId: number;
  username: string;
  fullName?: string;
  amount: number;
  description: string;
  method: string;
  planId?: number;
  planName?: string;
  planType?: "credit" | "storage";
  status: "success" | "pending" | "failed" | "refunded";
  transactionDate: string;
  paymentId?: string;
}

export default function AdminPayments() {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus>("all");
  const [planTypeFilter, setPlanTypeFilter] = useState<PlanType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | null, to: Date | null }>({ from: null, to: null });
  const pageSize = 10;

  // Fetch transactions data
  const { data: transactionsResponse, isLoading } = useQuery<{ success: boolean, data: { transactions: Transaction[], total: number } }>({
    queryKey: ["/api/admin/payments", statusFilter, planTypeFilter, searchQuery, currentPage, pageSize, sortField, sortOrder],
    queryFn: async () => {
      // Mock data until API is available
      const mockTransactions: Transaction[] = [
        {
          id: 1,
          userId: 2,
          username: "johndoe",
          fullName: "John Doe",
          amount: 500000,
          description: "Mua gói Credits cơ bản",
          method: "vnpay",
          planId: 1,
          planName: "Gói Credits Cơ bản",
          planType: "credit",
          status: "success",
          transactionDate: "2023-05-10T14:30:45Z",
          paymentId: "VNP13456789"
        },
        {
          id: 2,
          userId: 3,
          username: "janedoe",
          fullName: "Jane Doe",
          amount: 1000000,
          description: "Mua gói Credits nâng cao",
          method: "momo",
          planId: 2,
          planName: "Gói Credits Nâng cao",
          planType: "credit",
          status: "success",
          transactionDate: "2023-05-12T10:15:20Z",
          paymentId: "MOMO98765432"
        },
        {
          id: 3,
          userId: 4,
          username: "robertsmith",
          amount: 2000000,
          description: "Mua gói Storage cao cấp",
          method: "bank_transfer",
          planId: 5,
          planName: "Gói Storage Cao cấp (1 năm)",
          planType: "storage",
          status: "pending",
          transactionDate: "2023-05-15T09:20:10Z"
        },
        {
          id: 4,
          userId: 2,
          username: "johndoe",
          fullName: "John Doe",
          amount: 300000,
          description: "Mua gói Storage cơ bản",
          method: "vnpay",
          planId: 4,
          planName: "Gói Storage Cơ bản (1 tháng)",
          planType: "storage",
          status: "success",
          transactionDate: "2023-05-18T13:45:30Z",
          paymentId: "VNP24681357"
        },
        {
          id: 5,
          userId: 5,
          username: "maryjones",
          fullName: "Mary Jones",
          amount: 500000,
          description: "Mua gói Credits cơ bản",
          method: "paypal",
          planId: 1,
          planName: "Gói Credits Cơ bản",
          planType: "credit",
          status: "failed",
          transactionDate: "2023-05-20T11:10:05Z",
          paymentId: "PAY123456789"
        },
        {
          id: 6,
          userId: 3,
          username: "janedoe",
          fullName: "Jane Doe",
          amount: 2000000,
          description: "Mua gói Credits chuyên nghiệp",
          method: "credit_card",
          planId: 3,
          planName: "Gói Credits Chuyên nghiệp",
          planType: "credit",
          status: "success",
          transactionDate: "2023-05-22T08:30:40Z",
          paymentId: "CC987654321"
        },
        {
          id: 7,
          userId: 4,
          username: "robertsmith",
          amount: 300000,
          description: "Mua gói Storage cơ bản",
          method: "momo",
          planId: 4,
          planName: "Gói Storage Cơ bản (1 tháng)",
          planType: "storage",
          status: "success",
          transactionDate: "2023-05-25T15:20:30Z",
          paymentId: "MOMO12345678"
        },
        {
          id: 8,
          userId: 5,
          username: "maryjones",
          fullName: "Mary Jones",
          amount: 2000000,
          description: "Mua gói Credits chuyên nghiệp",
          method: "vnpay",
          planId: 3,
          planName: "Gói Credits Chuyên nghiệp",
          planType: "credit",
          status: "refunded",
          transactionDate: "2023-05-28T12:15:10Z",
          paymentId: "VNP97531864"
        },
        {
          id: 9,
          userId: 2,
          username: "johndoe",
          fullName: "John Doe",
          amount: 1000000,
          description: "Mua gói Credits nâng cao",
          method: "bank_transfer",
          planId: 2,
          planName: "Gói Credits Nâng cao",
          planType: "credit",
          status: "pending",
          transactionDate: "2023-05-30T09:45:20Z"
        },
        {
          id: 10,
          userId: 3,
          username: "janedoe",
          fullName: "Jane Doe",
          amount: 1200000,
          description: "Mua gói Storage tiêu chuẩn",
          method: "credit_card",
          planId: 6,
          planName: "Gói Storage Tiêu chuẩn (6 tháng)",
          planType: "storage",
          status: "success",
          transactionDate: "2023-06-02T14:30:40Z",
          paymentId: "CC123987456"
        },
      ];
      
      // Filter transactions by status
      let filteredTransactions = mockTransactions;
      if (statusFilter !== "all") {
        filteredTransactions = mockTransactions.filter(transaction => transaction.status === statusFilter);
      }
      
      // Filter transactions by plan type
      if (planTypeFilter !== "all") {
        filteredTransactions = filteredTransactions.filter(transaction => transaction.planType === planTypeFilter);
      }
      
      // Filter transactions by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredTransactions = filteredTransactions.filter(transaction => 
          transaction.username.toLowerCase().includes(query) ||
          (transaction.fullName && transaction.fullName.toLowerCase().includes(query)) ||
          transaction.description.toLowerCase().includes(query) ||
          (transaction.planName && transaction.planName.toLowerCase().includes(query)) ||
          (transaction.paymentId && transaction.paymentId.toLowerCase().includes(query))
        );
      }
      
      // Sort transactions
      filteredTransactions.sort((a, b) => {
        let compareResult = 0;
        
        if (sortField === "username") {
          compareResult = a.username.localeCompare(b.username);
        } else if (sortField === "amount") {
          compareResult = a.amount - b.amount;
        } else if (sortField === "createdAt") {
          compareResult = new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime();
        }
        
        return sortOrder === "asc" ? compareResult : -compareResult;
      });
      
      // Paginate results
      const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      );
      
      return {
        success: true,
        data: {
          transactions: paginatedTransactions,
          total: filteredTransactions.length
        }
      };
    },
  });

  const transactionsData = transactionsResponse?.data;
  const totalPages = transactionsData ? Math.ceil(transactionsData.total / pageSize) : 0;

  // Update transaction status mutation
  const updateTransactionStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: TransactionStatus }) => {
      const res = await apiRequest("PATCH", `/api/admin/payments/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Trạng thái giao dịch đã được cập nhật",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      setIsViewDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleViewClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsViewDialogOpen(true);
  };

  const handleUpdateStatus = (id: number, status: TransactionStatus) => {
    if (status !== "all") {
      updateTransactionStatusMutation.mutate({ id, status });
    }
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as TransactionStatus);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle plan type filter change
  const handlePlanTypeFilterChange = (value: string) => {
    setPlanTypeFilter(value as PlanType);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // If already sorting by this field, toggle sort order
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // If sorting by a new field, default to descending order
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Thành công</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Đang xử lý</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Thất bại</Badge>;
      case "refunded":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Đã hoàn tiền</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "vnpay":
        return <div className="px-2 py-1 bg-blue-50 rounded text-xs font-medium text-blue-700">VNPay</div>;
      case "momo":
        return <div className="px-2 py-1 bg-pink-50 rounded text-xs font-medium text-pink-700">MoMo</div>;
      case "paypal":
        return <div className="px-2 py-1 bg-indigo-50 rounded text-xs font-medium text-indigo-700">PayPal</div>;
      case "credit_card":
        return <div className="px-2 py-1 bg-purple-50 rounded text-xs font-medium text-purple-700">Thẻ tín dụng</div>;
      case "bank_transfer":
        return <div className="px-2 py-1 bg-green-50 rounded text-xs font-medium text-green-700">Chuyển khoản</div>;
      default:
        return <div className="px-2 py-1 bg-gray-50 rounded text-xs font-medium text-gray-700">Khác</div>;
    }
  };

  return (
    <>
      <Head>
        <title>{t("admin.payments.title") || "Quản lý thanh toán"} - {t("common.appName") || "SEO AI Writer"}</title>
      </Head>
      
      <AdminLayout title={t("admin.payments.title") || "Quản lý thanh toán"}>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t("admin.payments.title") || "Quản lý thanh toán"}</h1>
            <p className="text-muted-foreground">{t("admin.payments.description") || "Xem và quản lý các giao dịch thanh toán"}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("admin.payments.search") || "Tìm kiếm giao dịch..."}
                className="pl-8 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder={t("admin.payments.status") || "Trạng thái"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.payments.allStatuses") || "Tất cả"}</SelectItem>
                <SelectItem value="success">{t("admin.payments.statusSuccess") || "Thành công"}</SelectItem>
                <SelectItem value="pending">{t("admin.payments.statusPending") || "Đang xử lý"}</SelectItem>
                <SelectItem value="failed">{t("admin.payments.statusFailed") || "Thất bại"}</SelectItem>
                <SelectItem value="refunded">{t("admin.payments.statusRefunded") || "Đã hoàn tiền"}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planTypeFilter} onValueChange={handlePlanTypeFilterChange}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder={t("admin.payments.planType") || "Loại gói"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.payments.allTypes") || "Tất cả"}</SelectItem>
                <SelectItem value="credit">{t("admin.payments.typeCredit") || "Credit"}</SelectItem>
                <SelectItem value="storage">{t("admin.payments.typeStorage") || "Storage"}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="hidden sm:flex">
              <Download className="mr-2 h-4 w-4" />
              {t("admin.payments.export") || "Xuất báo cáo"}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle>{t("admin.payments.transactions") || "Giao dịch thanh toán"}</CardTitle>
                <CardDescription>
                  {t("admin.payments.totalCount") || "Tổng số:"} {transactionsData?.total || 0} {t("admin.payments.transactions") || "giao dịch"}
                </CardDescription>
              </div>
              
              <Tabs defaultValue="all" className="w-fit">
                <TabsList>
                  <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>
                    {t("admin.payments.allTransactions") || "Tất cả"}
                  </TabsTrigger>
                  <TabsTrigger value="pending" onClick={() => setStatusFilter("pending")}>
                    {t("admin.payments.pending") || "Đang xử lý"}
                  </TabsTrigger>
                  <TabsTrigger value="today" onClick={() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    setDateRange({ from: today, to: new Date() });
                  }}>
                    {t("admin.payments.today") || "Hôm nay"}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("username")}>
                    <div className="flex items-center">
                      {t("admin.payments.user") || "Người dùng"}
                      {sortField === "username" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortOrder === "asc" ? "transform rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>{t("admin.payments.planName") || "Tên gói"}</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("amount")}>
                    <div className="flex items-center">
                      {t("admin.payments.amount") || "Số tiền"}
                      {sortField === "amount" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortOrder === "asc" ? "transform rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>{t("admin.payments.method") || "Phương thức"}</TableHead>
                  <TableHead>{t("admin.payments.status") || "Trạng thái"}</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                    <div className="flex items-center">
                      {t("admin.payments.date") || "Ngày giao dịch"}
                      {sortField === "createdAt" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortOrder === "asc" ? "transform rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
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
                ) : transactionsData?.transactions && transactionsData.transactions.length > 0 ? (
                  transactionsData.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{transaction.fullName || transaction.username}</div>
                        <div className="text-sm text-muted-foreground">{transaction.username}</div>
                      </TableCell>
                      <TableCell>
                        <div>{transaction.planName || "-"}</div>
                        {transaction.planType && (
                          <Badge variant="outline" className="mt-1">
                            {transaction.planType === "credit" ? "Credit" : "Storage"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>{getPaymentMethodIcon(transaction.method)}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewClick(transaction)}>
                          <Eye className="h-4 w-4 mr-2" />
                          {t("admin.common.view") || "Xem"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      {t("admin.payments.noTransactions") || "Không tìm thấy giao dịch nào"}
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

        {/* View Transaction Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{t("admin.payments.transactionDetails") || "Chi tiết giao dịch"}</DialogTitle>
              <DialogDescription>
                {t("admin.payments.transactionInfo") || "Thông tin chi tiết về giao dịch"}
              </DialogDescription>
            </DialogHeader>
            
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {formatCurrency(selectedTransaction.amount)}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {selectedTransaction.description}
                    </p>
                  </div>
                  {getStatusBadge(selectedTransaction.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">{t("admin.payments.transactionId") || "Mã giao dịch"}</h3>
                    <p className="font-medium">#{selectedTransaction.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">{t("admin.payments.paymentId") || "Mã thanh toán"}</h3>
                    <p className="font-medium">{selectedTransaction.paymentId || "-"}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">{t("admin.payments.userInfo") || "Thông tin người dùng"}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t("admin.users.fullName") || "Họ và tên"}</p>
                      <p className="font-medium">{selectedTransaction.fullName || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("admin.users.username") || "Tên đăng nhập"}</p>
                      <p className="font-medium">{selectedTransaction.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("admin.users.id") || "ID người dùng"}</p>
                      <p className="font-medium">{selectedTransaction.userId}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">{t("admin.payments.planInfo") || "Thông tin gói dịch vụ"}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t("admin.plans.name") || "Tên gói"}</p>
                      <p className="font-medium">{selectedTransaction.planName || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("admin.plans.id") || "ID gói"}</p>
                      <p className="font-medium">{selectedTransaction.planId || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("admin.plans.type") || "Loại gói"}</p>
                      <p className="font-medium">{selectedTransaction.planType === "credit" ? "Credit" : "Storage"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">{t("admin.payments.paymentInfo") || "Thông tin thanh toán"}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t("admin.payments.method") || "Phương thức"}</p>
                      <p className="font-medium">
                        {getPaymentMethodIcon(selectedTransaction.method)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("admin.payments.date") || "Ngày giao dịch"}</p>
                      <p className="font-medium">{formatDate(selectedTransaction.transactionDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("admin.payments.status") || "Trạng thái"}</p>
                      <p className="font-medium">{getStatusBadge(selectedTransaction.status)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              {selectedTransaction?.status === "pending" && (
                <>
                  <Button 
                    onClick={() => selectedTransaction && handleUpdateStatus(selectedTransaction.id, "success")}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {t("admin.payments.approvePayment") || "Xác nhận thanh toán"}
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => selectedTransaction && handleUpdateStatus(selectedTransaction.id, "failed")}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {t("admin.payments.rejectPayment") || "Từ chối thanh toán"}
                  </Button>
                </>
              )}
              
              {selectedTransaction?.status === "success" && (
                <Button 
                  variant="outline"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => selectedTransaction && handleUpdateStatus(selectedTransaction.id, "refunded")}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {t("admin.payments.issueRefund") || "Hoàn tiền"}
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => setIsViewDialogOpen(false)}
              >
                {t("common.close") || "Đóng"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}