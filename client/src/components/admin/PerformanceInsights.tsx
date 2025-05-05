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
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar } from "recharts";
import { Badge } from "@/components/ui/badge";
import { MoveUp, MoveDown, AlertTriangle, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface PerformanceData {
  // Current stats
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  
  totalRequests: number;
  requestsPerMinute: number;
  errorRate: number;
  
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  
  // Historical data
  responseTimeHistory: {
    timestamp: string;
    average: number;
    p95: number;
    p99: number;
  }[];
  
  requestsHistory: {
    timestamp: string;
    total: number;
    errors: number;
  }[];
  
  resourceUsageHistory: {
    timestamp: string;
    cpu: number;
    memory: number;
    disk: number;
  }[];
  
  // Endpoint performance
  endpointPerformance: {
    endpoint: string;
    count: number;
    averageTime: number;
    errorRate: number;
  }[];
  
  // Time range used for this data
  timeRange: string;
}

export default function PerformanceInsights() {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState<string>("24h");
  
  // Fetch performance metrics
  const { data: performance, isLoading: isLoadingPerformance } = useQuery<PerformanceData>({
    queryKey: ["/api/admin/performance", timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/admin/performance?timeRange=${timeRange}`);
      const result = await response.json();
      return result.data;
    }
  });
  
  const timeRangeOptions = [
    { label: t("admin.performanceMetrics.last6h"), value: "6h" },
    { label: t("admin.performanceMetrics.last12h"), value: "12h" },
    { label: t("admin.performanceMetrics.last24h"), value: "24h" },
    { label: t("admin.performanceMetrics.last7d"), value: "7d" },
    { label: t("admin.performanceMetrics.last30d"), value: "30d" },
  ];
  
  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{t("admin.performanceMetrics.metrics")}</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">{t("admin.performanceMetrics.timeRange")}:</span>
          <Select 
            value={timeRange} 
            onValueChange={(value) => setTimeRange(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("admin.performanceMetrics.selectTimeRange")} />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("admin.performanceMetrics.responseTime")}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingPerformance ? "..." : `${performance?.averageResponseTime ?? 0}ms`}
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                P95: {isLoadingPerformance ? "..." : `${performance?.p95ResponseTime ?? 0}ms`}
              </p>
              <p className="text-xs text-muted-foreground">
                P99: {isLoadingPerformance ? "..." : `${performance?.p99ResponseTime ?? 0}ms`}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("admin.performanceMetrics.requests")}
            </CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingPerformance ? "..." : (performance?.totalRequests ?? 0).toLocaleString()}
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {isLoadingPerformance ? "..." : `${performance?.requestsPerMinute ?? 0}/min`}
              </p>
              <p className="text-xs text-muted-foreground">
                Error rate: {isLoadingPerformance ? "..." : `${performance?.errorRate ?? 0}%`}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("admin.performanceMetrics.cpuMemory")}
            </CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {isLoadingPerformance ? "..." : `${performance?.cpuUsage ?? 0}%`}
                </div>
                <p className="text-xs text-muted-foreground">CPU</p>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {isLoadingPerformance ? "..." : `${performance?.memoryUsage ?? 0}%`}
                </div>
                <p className="text-xs text-muted-foreground">Memory</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("admin.performanceMetrics.diskUsage")}
            </CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingPerformance ? "..." : `${performance?.diskUsage ?? 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              System storage
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Historical Charts */}
      <Tabs defaultValue="response" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="response">Response Time</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="response" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.performanceMetrics.responseTimeHistory")}</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {isLoadingPerformance ? (
                <div className="flex items-center justify-center h-full">
                  <p>Loading...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={performance?.responseTimeHistory || []}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => formatDate(value)}
                      formatter={(value) => [`${value}ms`, ""]}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="average" name="Average" stroke="#3b82f6" />
                    <Line type="monotone" dataKey="p95" name="P95" stroke="#f97316" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="p99" name="P99" stroke="#ef4444" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.performanceMetrics.requestsHistory")}</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {isLoadingPerformance ? (
                <div className="flex items-center justify-center h-full">
                  <p>Loading...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={performance?.requestsHistory || []}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => formatDate(value)}
                      formatter={(value) => [value, ""]}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="total" name="Total Requests" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="errors" name="Errors" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resources" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.performanceMetrics.resourceUsage")}</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {isLoadingPerformance ? (
                <div className="flex items-center justify-center h-full">
                  <p>Loading...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={performance?.resourceUsageHistory || []}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => formatDate(value)}
                      formatter={(value) => [`${value}%`, ""]}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="cpu" name="CPU" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="memory" name="Memory" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="disk" name="Disk" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Endpoint Performance */}
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.performanceMetrics.endpointPerformance")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.performanceMetrics.endpoint")}</TableHead>
                <TableHead>{t("admin.performanceMetrics.requestCount")}</TableHead>
                <TableHead>{t("admin.performanceMetrics.avgResponseTime")}</TableHead>
                <TableHead>{t("admin.performanceMetrics.errorRate")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingPerformance ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : (
                performance?.endpointPerformance.map((endpoint, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {endpoint.endpoint}
                    </TableCell>
                    <TableCell>{endpoint.count.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className={endpoint.averageTime > 500 ? "text-red-500" : endpoint.averageTime > 200 ? "text-amber-500" : "text-green-500"}>
                          {endpoint.averageTime}ms
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={endpoint.errorRate > 5 ? "destructive" : endpoint.errorRate > 2 ? "outline" : "secondary"}>
                        {endpoint.errorRate}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}