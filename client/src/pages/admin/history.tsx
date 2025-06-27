import { useState } from "react";
import { AdminLayout } from "@/components/admin/Layout";
import { useDbTranslations } from "@/hooks/use-db-translations";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Download, FileText, Search, User } from "lucide-react";
import Head from "@/components/head";

// Activity type
type ActivityType = "all" | "user" | "article" | "payment" | "login" | "system";

// Activity log interface
interface ActivityLog {
  id: number;
  type: ActivityType;
  action: string;
  userId?: number;
  username?: string;
  resourceId?: number;
  resourceType?: string;
  details?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// Credit transaction interface
interface CreditTransaction {
  id: number;
  userId: number;
  username: string;
  amount: number;
  description: string;
  planId?: number;
  planName?: string;
  transactionType: "credit" | "debit";
  timestamp: string;
}

export default function AdminHistory() {
  const { t } = useDbTranslations();
  const [activeTab, setActiveTab] = useState<"activity" | "transactions">("activity");
  const [activityType, setActivityType] = useState<ActivityType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionType, setTransactionType] = useState<"all" | "credit" | "debit">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch activity logs
  const { data: activityLogsResponse, isLoading: isLoadingLogs } = useQuery<{ success: boolean, data: { logs: ActivityLog[], total: number } }>({
    queryKey: ["/api/admin/history/activity", activityType, searchQuery, currentPage, pageSize],
    queryFn: async () => {
      // Mock data until API is available
      const mockLogs: ActivityLog[] = [
        {
          id: 1,
          type: "user",
          action: "user.created",
          userId: 42,
          username: "johndoe@example.com",
          details: "New user registration",
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          timestamp: "2023-05-10T14:30:45Z",
        },
        {
          id: 2,
          type: "article",
          action: "article.created",
          userId: 42,
          username: "johndoe@example.com",
          resourceId: 123,
          resourceType: "article",
          details: "Created new article 'SEO Best Practices 2023'",
          timestamp: "2023-05-10T15:22:18Z",
        },
        {
          id: 3,
          type: "payment",
          action: "payment.successful",
          userId: 42,
          username: "johndoe@example.com",
          resourceId: 456,
          resourceType: "payment",
          details: "Payment for 'Pro Plan' successful",
          metadata: { amount: 500000, planId: 2 },
          timestamp: "2023-05-11T09:15:30Z",
        },
        {
          id: 4,
          type: "login",
          action: "user.login",
          userId: 42,
          username: "johndoe@example.com",
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          timestamp: "2023-05-11T10:05:22Z",
        },
        {
          id: 5,
          type: "system",
          action: "system.backup",
          details: "Automated system backup completed",
          timestamp: "2023-05-12T02:00:00Z",
        },
        {
          id: 6,
          type: "article",
          action: "article.published",
          userId: 42,
          username: "johndoe@example.com",
          resourceId: 123,
          resourceType: "article",
          details: "Published article 'SEO Best Practices 2023' to WordPress",
          timestamp: "2023-05-12T11:45:33Z",
        },
        {
          id: 7,
          type: "user",
          action: "user.updated",
          userId: 42,
          username: "johndoe@example.com",
          details: "User profile updated",
          timestamp: "2023-05-12T14:30:45Z",
        },
        {
          id: 8,
          type: "payment",
          action: "payment.refund",
          userId: 43,
          username: "janedoe@example.com",
          resourceId: 457,
          resourceType: "payment",
          details: "Refund for 'Basic Plan' processed",
          metadata: { amount: 300000, planId: 1 },
          timestamp: "2023-05-13T16:22:10Z",
        },
        {
          id: 9,
          type: "login",
          action: "user.login.failed",
          userId: 43,
          username: "janedoe@example.com",
          ipAddress: "192.168.1.2",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          details: "Failed login attempt - wrong password",
          timestamp: "2023-05-14T08:12:45Z",
        },
        {
          id: 10,
          type: "system",
          action: "system.error",
          details: "Database connection timeout error",
          timestamp: "2023-05-14T23:59:59Z",
        },
      ];
      
      return {
        success: true,
        data: { 
          logs: mockLogs.filter(log => {
            // Filter by type
            if (activityType !== "all" && log.type !== activityType) {
              return false;
            }
            
            // Filter by search query
            if (searchQuery) {
              const query = searchQuery.toLowerCase();
              return (
                log.username?.toLowerCase().includes(query) ||
                log.action.toLowerCase().includes(query) ||
                log.details?.toLowerCase().includes(query) ||
                String(log.resourceId).includes(query)
              );
            }
            
            return true;
          }),
          total: 100 // Mock total
        }
      };
    },
  });
  
  const activityLogs = activityLogsResponse?.data.logs || [];
  const totalLogs = activityLogsResponse?.data.total || 0;
  
  // Fetch credit transactions
  const { data: transactionsResponse, isLoading: isLoadingTransactions } = useQuery<{ success: boolean, data: { transactions: CreditTransaction[], total: number } }>({
    queryKey: ["/api/admin/history/transactions", transactionType, searchQuery, currentPage, pageSize],
    queryFn: async () => {
      // Mock data until API is available
      const mockTransactions: CreditTransaction[] = [
        {
          id: 1,
          userId: 42,
          username: "johndoe@example.com",
          amount: 500000,
          description: "Purchased Credit Pack",
          planId: 1,
          planName: "Basic Credit Pack",
          transactionType: "credit",
          timestamp: "2023-05-10T14:30:45Z",
        },
        {
          id: 2,
          userId: 42,
          username: "johndoe@example.com",
          amount: 20,
          description: "Generated article 'SEO Best Practices 2023'",
          transactionType: "debit",
          timestamp: "2023-05-10T15:22:18Z",
        },
        {
          id: 3,
          userId: 43,
          username: "janedoe@example.com",
          amount: 1000000,
          description: "Purchased Pro Credit Pack",
          planId: 2,
          planName: "Pro Credit Pack",
          transactionType: "credit",
          timestamp: "2023-05-11T09:15:30Z",
        },
        {
          id: 4,
          userId: 43,
          username: "janedoe@example.com",
          amount: 30,
          description: "Generated article 'How to Increase Website Traffic'",
          transactionType: "debit",
          timestamp: "2023-05-11T10:05:22Z",
        },
        {
          id: 5,
          userId: 44,
          username: "robertsmith@example.com",
          amount: 300000,
          description: "Purchased Basic Credit Pack",
          planId: 1,
          planName: "Basic Credit Pack",
          transactionType: "credit",
          timestamp: "2023-05-12T11:45:33Z",
        },
        {
          id: 6,
          userId: 44,
          username: "robertsmith@example.com",
          amount: 15,
          description: "Generated article 'Content Marketing Strategies'",
          transactionType: "debit",
          timestamp: "2023-05-12T14:30:45Z",
        },
        {
          id: 7,
          userId: 42,
          username: "johndoe@example.com",
          amount: 25,
          description: "Generated article 'Social Media Optimization Tips'",
          transactionType: "debit",
          timestamp: "2023-05-13T16:22:10Z",
        },
        {
          id: 8,
          userId: 45,
          username: "amandawhite@example.com",
          amount: 2000000,
          description: "Purchased Premium Credit Pack",
          planId: 3,
          planName: "Premium Credit Pack",
          transactionType: "credit",
          timestamp: "2023-05-14T08:12:45Z",
        },
        {
          id: 9,
          userId: 45,
          username: "amandawhite@example.com",
          amount: 40,
          description: "Generated article 'E-commerce SEO Best Practices'",
          transactionType: "debit",
          timestamp: "2023-05-14T09:30:15Z",
        },
        {
          id: 10,
          userId: 43,
          username: "janedoe@example.com",
          amount: 300000,
          description: "Refund for Basic Credit Pack",
          planId: 1,
          planName: "Basic Credit Pack",
          transactionType: "debit",
          timestamp: "2023-05-14T23:59:59Z",
        },
      ];
      
      return {
        success: true,
        data: { 
          transactions: mockTransactions.filter(transaction => {
            // Filter by type
            if (transactionType !== "all" && transaction.transactionType !== transactionType) {
              return false;
            }
            
            // Filter by search query
            if (searchQuery) {
              const query = searchQuery.toLowerCase();
              return (
                transaction.username.toLowerCase().includes(query) ||
                transaction.description.toLowerCase().includes(query) ||
                transaction.planName?.toLowerCase().includes(query) ||
                String(transaction.amount).includes(query)
              );
            }
            
            return true;
          }),
          total: 100 // Mock total
        }
      };
    },
  });
  
  const transactions = transactionsResponse?.data.transactions || [];
  const totalTransactions = transactionsResponse?.data.total || 0;

  // Get activity type badge
  const getActivityTypeBadge = (type: ActivityType) => {
    switch (type) {
      case "user":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">User</Badge>;
      case "article":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Article</Badge>;
      case "payment":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Payment</Badge>;
      case "login":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Login</Badge>;
      case "system":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">System</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get transaction type badge
  const getTransactionTypeBadge = (type: "credit" | "debit") => {
    switch (type) {
      case "credit":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Credit</Badge>;
      case "debit":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Debit</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate total pages
  const totalPages = Math.ceil((activeTab === "activity" ? totalLogs : totalTransactions) / pageSize);

  // Generate pagination array
  const getPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max to show
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Always include first page
      items.push(1);
      
      // Calculate middle range
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust range if we're at edges
      if (currentPage <= 2) {
        endPage = Math.min(totalPages - 1, 4);
      } else if (currentPage >= totalPages - 1) {
        startPage = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        items.push("...");
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        items.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        items.push("...");
      }
      
      // Always include last page
      if (totalPages > 1) {
        items.push(totalPages);
      }
    }
    
    return items;
  };

  return (
    <>
      <Head>
        <title>{t("admin.history")} - {t("common.appName")}</title>
      </Head>
      
      <AdminLayout title={t("admin.history")}>
        <Tabs defaultValue="activity" className="w-full" onValueChange={(value) => setActiveTab(value as "activity" | "transactions")}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="activity">Activity Logs</TabsTrigger>
              <TabsTrigger value="transactions">Credit Transactions</TabsTrigger>
            </TabsList>
            
            <Button variant="outline" className="flex items-center">
              <Download className="mr-2 h-4 w-4" />
              Export {activeTab === "activity" ? "Logs" : "Transactions"}
            </Button>
          </div>
          
          <TabsContent value="activity" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="flex items-center w-full">
                    <Input
                      placeholder="Search by username, action, or details..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mr-2"
                    />
                    <Button variant="ghost" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  <Select value={activityType} onValueChange={(value) => setActivityType(value as ActivityType)}>
                    <SelectTrigger className="w-[180px] ml-auto">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Activity</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Type</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead className="hidden md:table-cell">IP Address</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingLogs ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">Loading activity logs...</TableCell>
                        </TableRow>
                      ) : activityLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">No activity logs found</TableCell>
                        </TableRow>
                      ) : (
                        activityLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{getActivityTypeBadge(log.type)}</TableCell>
                            <TableCell>
                              <code className="text-xs bg-gray-100 p-1 rounded">{log.action}</code>
                            </TableCell>
                            <TableCell>
                              {log.username ? (
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-2 text-gray-500" />
                                  <span>{log.username}</span>
                                </div>
                              ) : (
                                <span className="text-gray-500">System</span>
                              )}
                            </TableCell>
                            <TableCell className="max-w-[300px] truncate">
                              {log.details || "—"}
                              {log.resourceType && log.resourceId && (
                                <span className="ml-1 text-gray-500">
                                  ({log.resourceType} #{log.resourceId})
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{log.ipAddress || "—"}</TableCell>
                            <TableCell>{formatDate(log.timestamp)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                {!isLoadingLogs && totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                      Showing {Math.min((currentPage - 1) * pageSize + 1, totalLogs)} to {Math.min(currentPage * pageSize, totalLogs)} of {totalLogs} logs
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      
                      {getPaginationItems().map((item, index) => (
                        typeof item === "number" ? (
                          <Button
                            key={index}
                            variant={item === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(item)}
                            className="w-9"
                          >
                            {item}
                          </Button>
                        ) : (
                          <span key={index} className="mx-1">...</span>
                        )
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Credit Transactions</CardTitle>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="flex items-center w-full">
                    <Input
                      placeholder="Search by username, description, or amount..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mr-2"
                    />
                    <Button variant="ghost" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  <Select value={transactionType} onValueChange={(value) => setTransactionType(value as "all" | "credit" | "debit")}>
                    <SelectTrigger className="w-[180px] ml-auto">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Transactions</SelectItem>
                      <SelectItem value="credit">Credits Added</SelectItem>
                      <SelectItem value="debit">Credits Used</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Type</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="hidden md:table-cell">Plan</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingTransactions ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">Loading transactions...</TableCell>
                        </TableRow>
                      ) : transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">No transactions found</TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>{getTransactionTypeBadge(transaction.transactionType)}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2 text-gray-500" />
                                <span>{transaction.username}</span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[300px] truncate">
                              {transaction.description}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {transaction.planName || "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {transaction.transactionType === "debit" ? (
                                transaction.amount > 100 ? (
                                  formatCurrency(transaction.amount)
                                ) : (
                                  <span>{transaction.amount} credits</span>
                                )
                              ) : (
                                <span className="text-green-600">+{formatCurrency(transaction.amount)}</span>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                {!isLoadingTransactions && totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                      Showing {Math.min((currentPage - 1) * pageSize + 1, totalTransactions)} to {Math.min(currentPage * pageSize, totalTransactions)} of {totalTransactions} transactions
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      
                      {getPaginationItems().map((item, index) => (
                        typeof item === "number" ? (
                          <Button
                            key={index}
                            variant={item === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(item)}
                            className="w-9"
                          >
                            {item}
                          </Button>
                        ) : (
                          <span key={index} className="mx-1">...</span>
                        )
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AdminLayout>
    </>
  );
}