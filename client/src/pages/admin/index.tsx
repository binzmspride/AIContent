import { AdminLayout } from "@/components/admin/Layout";
import { useLanguage } from "@/hooks/use-language";
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";
import { User } from "lucide-react";
import Head from "@/components/head";
import PerformanceMiniDashboard from "@/components/admin/PerformanceMiniDashboard";

interface AdminStats {
  totalUsers: number;
  totalArticles: number;
  totalCredits: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const { t } = useLanguage();

  // Fetch admin dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  // Mock data for charts
  const userGrowthData = [
    { name: "Jan", users: 100 },
    { name: "Feb", users: 120 },
    { name: "Mar", users: 150 },
    { name: "Apr", users: 180 },
    { name: "May", users: 210 },
    { name: "Jun", users: 250 },
    { name: "Jul", users: 290 },
    { name: "Aug", users: 310 },
    { name: "Sep", users: 350 },
    { name: "Oct", users: 390 },
    { name: "Nov", users: 410 },
    { name: "Dec", users: 450 },
  ];

  const revenueData = [
    { name: "Jan", revenue: 5000000 },
    { name: "Feb", revenue: 6500000 },
    { name: "Mar", revenue: 7800000 },
    { name: "Apr", revenue: 8200000 },
    { name: "May", revenue: 9100000 },
    { name: "Jun", revenue: 10500000 },
    { name: "Jul", revenue: 11200000 },
    { name: "Aug", revenue: 10800000 },
    { name: "Sep", revenue: 12500000 },
    { name: "Oct", revenue: 14000000 },
    { name: "Nov", revenue: 15500000 },
    { name: "Dec", revenue: 18000000 },
  ];

  const creditDistributionData = [
    { name: "Basic", value: 35 },
    { name: "Advanced", value: 45 },
    { name: "Professional", value: 20 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

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
{/* Temporarily removed PerformanceMiniDashboard to fix errors */}
        
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={userGrowthData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, "Users"]} />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                  <Tooltip formatter={(value) => [formatCurrency(value as number), "Revenue"]} />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Credit Package Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={creditDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {creditDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                </PieChart>
              </ResponsiveContainer>
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
