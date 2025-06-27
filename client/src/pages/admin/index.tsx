import { AdminLayout } from "@/components/admin/Layout";
import { useDbTranslations } from "@/hooks/use-db-translations";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { User, BookText, CreditCard, DollarSign } from "lucide-react";
import Head from "@/components/head";

interface AdminStats {
  totalUsers: number;
  totalArticles: number;
  totalCredits: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const { t } = useDbTranslations();

  // Fetch admin dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  // Removed chart data

  const mockRecentUsers = [
    { id: 1, username: "johndoe@example.com", email: "johndoe@example.com", fullName: "John Doe", joinDate: "2023-11-15T10:30:00Z", credits: 25 },
    { id: 2, username: "janedoe@example.com", email: "janedoe@example.com", fullName: "Jane Doe", joinDate: "2023-11-14T14:20:00Z", credits: 50 },
    { id: 3, username: "bobsmith@example.com", email: "bobsmith@example.com", fullName: "Bob Smith", joinDate: "2023-11-13T09:15:00Z", credits: 10 },
    { id: 4, username: "alicejones@example.com", email: "alicejones@example.com", fullName: "Alice Jones", joinDate: "2023-11-12T16:45:00Z", credits: 100 },
    { id: 5, username: "davidlee@example.com", email: "davidlee@example.com", fullName: "David Lee", joinDate: "2023-11-11T11:25:00Z", credits: 75 },
  ];

  const mockRecentTransactions = [
    { id: 1, userId: 1, username: "johndoe@example.com", amount: 900000, type: "credit purchase", date: "2023-11-15T14:30:00Z" },
    { id: 2, userId: 3, username: "bobsmith@example.com", amount: 500000, type: "credit purchase", date: "2023-11-14T12:20:00Z" },
    { id: 3, userId: 2, username: "janedoe@example.com", amount: 1000000, type: "storage plan", date: "2023-11-14T10:15:00Z" },
    { id: 4, userId: 5, username: "davidlee@example.com", amount: 2000000, type: "credit purchase", date: "2023-11-13T16:45:00Z" },
    { id: 5, userId: 4, username: "alicejones@example.com", amount: 500000, type: "storage plan", date: "2023-11-12T09:25:00Z" },
  ];

  return (
    <>
      <Head>
        <title>{t("admin.dashboard")} - {t("common.appName")}</title>
      </Head>
      
      <AdminLayout title={t("admin.dashboard")}>
        {/* Performance Mini Dashboard */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {t("admin.performanceMetrics.title") || "Performance Insights"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium">{t("admin.performanceMetrics.responseTime") || "Thời gian phản hồi"}</h3>
                <p className="text-2xl font-bold">145ms</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium">{t("admin.performanceMetrics.requests") || "Lượt truy cập"}</h3>
                <p className="text-2xl font-bold">35/min</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium">{t("admin.performanceMetrics.cpuMemory") || "CPU & Bộ nhớ"}</h3>
                <p className="text-2xl font-bold">45%</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium">{t("admin.performanceMetrics.diskUsage") || "Dung lượng ổ cứng"}</h3>
                <p className="text-2xl font-bold">38%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("admin.stats.totalUsers")}
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? "..." : (stats?.totalUsers ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("admin.stats.totalArticles")}
              </CardTitle>
              <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? "..." : (stats?.totalArticles ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +25% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("admin.stats.totalCredits")}
              </CardTitle>
              <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? "..." : (stats?.totalCredits ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +18% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("admin.stats.totalRevenue")}
              </CardTitle>
              <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? "..." : formatCurrency(stats?.totalRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                +30% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Static Information Cards (replaced charts) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">Tổng số người dùng mới theo tháng</p>
                <div className="grid grid-cols-4 gap-2">
                  <div className="border rounded p-2 text-center">
                    <p className="font-semibold">Q1</p>
                    <p className="text-lg font-bold">370</p>
                  </div>
                  <div className="border rounded p-2 text-center">
                    <p className="font-semibold">Q2</p>
                    <p className="text-lg font-bold">640</p>
                  </div>
                  <div className="border rounded p-2 text-center">
                    <p className="font-semibold">Q3</p>
                    <p className="text-lg font-bold">950</p>
                  </div>
                  <div className="border rounded p-2 text-center">
                    <p className="font-semibold">Q4</p>
                    <p className="text-lg font-bold">1250</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Tăng trưởng: +12% so với quý trước</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">Tổng doanh thu theo quý</p>
                <div className="grid grid-cols-4 gap-2">
                  <div className="border rounded p-2 text-center">
                    <p className="font-semibold">Q1</p>
                    <p className="text-lg font-bold">{formatCurrency(19300000)}</p>
                  </div>
                  <div className="border rounded p-2 text-center">
                    <p className="font-semibold">Q2</p>
                    <p className="text-lg font-bold">{formatCurrency(27800000)}</p>
                  </div>
                  <div className="border rounded p-2 text-center">
                    <p className="font-semibold">Q3</p>
                    <p className="text-lg font-bold">{formatCurrency(34500000)}</p>
                  </div>
                  <div className="border rounded p-2 text-center">
                    <p className="font-semibold">Q4</p>
                    <p className="text-lg font-bold">{formatCurrency(48000000)}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Tăng trưởng: +30% so với quý trước</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Credit Package Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">Phân bổ gói tín dụng</p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="flex-1">Basic</span>
                    <span className="font-bold">35%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="flex-1">Advanced</span>
                    <span className="font-bold">45%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="flex-1">Professional</span>
                    <span className="font-bold">20%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>{t("admin.stats.recentUsers")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.user.username")}</TableHead>
                    <TableHead>{t("admin.user.fullName")}</TableHead>
                    <TableHead>{t("admin.user.joinDate")}</TableHead>
                    <TableHead className="text-right">{t("admin.user.credits")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRecentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{formatDate(user.joinDate)}</TableCell>
                      <TableCell className="text-right">{user.credits}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.stats.recentTransactions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t("admin.user.username")}</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRecentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>{transaction.username}</TableCell>
                    <TableCell className="capitalize">{transaction.type}</TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(transaction.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </AdminLayout>
    </>
  );
}
