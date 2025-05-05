import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BarChart3, Cpu, HardDrive } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";

interface PerformanceData {
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  totalRequests: number;
  requestsPerMinute: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  responseTimeHistory: Array<{
    timestamp: string;
    average: number;
    p95: number;
    p99: number;
  }>;
  requestsHistory: Array<{
    timestamp: string;
    total: number;
    errors: number;
  }>;
  timeRange: string;
}

export default function PerformanceMiniDashboard() {
  const { t } = useLanguage();
  
  // Fetch performance metrics with a fixed timeRange of 12h for the mini dashboard
  const { data: performance, isLoading: isLoadingPerformance } = useQuery<PerformanceData>({
    queryKey: ["/api/admin/performance", "12h"],
    queryFn: async () => {
      const response = await fetch(`/api/admin/performance?timeRange=12h`);
      const result = await response.json();
      return result.data;
    }
  });

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("admin.performanceMetrics.responseTime") || "Thời gian phản hồi"}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingPerformance ? "..." : `${performance?.averageResponseTime ?? 0}ms`}
            </div>
            <p className="text-xs text-muted-foreground">
              P95: {isLoadingPerformance ? "..." : `${performance?.p95ResponseTime ?? 0}ms`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("admin.performanceMetrics.requests") || "Lượt truy cập"}
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingPerformance ? "..." : (performance?.requestsPerMinute ?? 0).toLocaleString() + "/min"}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("admin.performanceMetrics.errorRate") || "Tỷ lệ lỗi"}: {isLoadingPerformance ? "..." : `${performance?.errorRate ?? 0}%`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("admin.performanceMetrics.cpuMemory") || "CPU & Bộ nhớ"}
            </CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingPerformance ? "..." : `${performance?.cpuUsage ?? 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("admin.performanceMetrics.memoryUsage") || "Sử dụng bộ nhớ"}: {isLoadingPerformance ? "..." : `${performance?.memoryUsage ?? 0}%`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("admin.performanceMetrics.diskUsage") || "Dung lượng ổ cứng"}
            </CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingPerformance ? "..." : `${performance?.diskUsage ?? 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("admin.performanceMetrics.storage") || "Bộ nhớ hệ thống"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Mini Response Time Chart */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">
            {t("admin.performanceMetrics.responseTimeHistory") || "Lịch sử thời gian phản hồi"}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-40 py-2">
          {isLoadingPerformance ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={performance?.responseTimeHistory.slice(-12) || []}
                margin={{
                  top: 5,
                  right: 5,
                  left: 0,
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
                  tick={{fontSize: 10}}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{fontSize: 10}} />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value)}
                  formatter={(value) => [`${value}ms`, ""]}
                />
                <Area type="monotone" dataKey="average" name="Avg" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}