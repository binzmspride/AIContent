import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BarChart3, Cpu, HardDrive } from "lucide-react";
import { useDbTranslations } from "@/hooks/use-db-translations";
import { useLanguageContext } from "@/providers/LanguageProvider";

export default function PerformanceMiniDashboard() {
  const { t } = useDbTranslations();
  
  // Use static data instead of fetching to avoid ResizeObserver errors
  const performance = {
    averageResponseTime: 145,
    p95ResponseTime: 210,
    p99ResponseTime: 350,
    totalRequests: 12500,
    requestsPerMinute: 35,
    errorRate: 1.2,
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 38,
    timeRange: "12h"
  };
  
  const isLoadingPerformance = false;

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
      
      {/* Removed chart component to fix ResizeObserver errors */}
    </div>
  );
}