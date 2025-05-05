import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/hooks/use-language';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// Định nghĩa các loại biểu đồ
const CHART_TYPES = {
  TRAFFIC: 'traffic',
  PERFORMANCE: 'performance',
  ENGAGEMENT: 'engagement',
};

// Các khoảng thời gian dữ liệu
const TIME_RANGES = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
};

// Dữ liệu mẫu cho biểu đồ
const generateMockData = (timeRange: string) => {
  // Tạo số lượng dữ liệu phù hợp với khoảng thời gian
  const dataPoints = timeRange === TIME_RANGES.DAY ? 24 : 
                     timeRange === TIME_RANGES.WEEK ? 7 : 30;
  
  const baseValue = Math.floor(Math.random() * 100) + 50;
  
  return Array.from({ length: dataPoints }, (_, i) => {
    const timeLabel = timeRange === TIME_RANGES.DAY ? `${i}h` : 
                      timeRange === TIME_RANGES.WEEK ? `Day ${i+1}` : `Day ${i+1}`;
    
    return {
      name: timeLabel,
      // Tạo giá trị ngẫu nhiên có sự biến thiên nhẹ
      visitors: Math.max(10, baseValue + Math.floor(Math.random() * 40) - 20),
      pageViews: Math.max(20, baseValue * 2 + Math.floor(Math.random() * 60) - 30),
      responseTime: Math.max(50, 200 + Math.floor(Math.random() * 100) - 50),
      serverLoad: Math.max(5, 30 + Math.floor(Math.random() * 20) - 10),
      engagementRate: Math.min(100, Math.max(10, 45 + Math.floor(Math.random() * 20) - 10)),
      avgSessionTime: Math.max(30, 120 + Math.floor(Math.random() * 60) - 30),
    };
  });
};

export default function PerformanceInsights() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(CHART_TYPES.TRAFFIC);
  const [timeRange, setTimeRange] = useState(TIME_RANGES.WEEK);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập tải dữ liệu từ API
    setLoading(true);
    
    // Mô phỏng độ trễ API
    const timer = setTimeout(() => {
      setChartData(generateMockData(timeRange));
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeRange]);

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold">{t('admin.performanceMetrics.title')}</CardTitle>
            <CardDescription>{t('admin.performanceMetrics.description')}</CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('admin.performanceMetrics.selectTimeRange')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TIME_RANGES.DAY}>{t('time.day')}</SelectItem>
              <SelectItem value={TIME_RANGES.WEEK}>{t('time.week')}</SelectItem>
              <SelectItem value={TIME_RANGES.MONTH}>{t('time.month')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value={CHART_TYPES.TRAFFIC}>{t('admin.performanceMetrics.traffic')}</TabsTrigger>
            <TabsTrigger value={CHART_TYPES.PERFORMANCE}>{t('admin.performanceMetrics.performance')}</TabsTrigger>
            <TabsTrigger value={CHART_TYPES.ENGAGEMENT}>{t('admin.performanceMetrics.engagement')}</TabsTrigger>
          </TabsList>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <TabsContent value={CHART_TYPES.TRAFFIC} className="mt-0">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="visitors" fill="hsl(var(--primary))" name={t('admin.performanceMetrics.visitors')} />
                      <Bar dataKey="pageViews" fill="hsl(var(--primary) / 0.5)" name={t('admin.performanceMetrics.pageViews')} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-muted-foreground">{t('admin.performanceMetrics.visitors')}</div>
                      <div className="text-2xl font-bold">
                        {chartData.reduce((sum, item) => sum + item.visitors, 0)}
                      </div>
                      <div className="text-xs text-emerald-500">+5.2% {t('time.fromPrevious')} {timeRange}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-muted-foreground">{t('admin.performanceMetrics.pageViews')}</div>
                      <div className="text-2xl font-bold">
                        {chartData.reduce((sum, item) => sum + item.pageViews, 0)}
                      </div>
                      <div className="text-xs text-emerald-500">+8.1% {t('time.fromPrevious')} {timeRange}</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value={CHART_TYPES.PERFORMANCE} className="mt-0">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="responseTime" stroke="hsl(var(--primary))" name={t('admin.performanceMetrics.responseTime')} />
                      <Line type="monotone" dataKey="serverLoad" stroke="hsl(var(--primary) / 0.5)" name={t('admin.performanceMetrics.serverLoad')} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-muted-foreground">{t('admin.performanceMetrics.avgResponseTime')}</div>
                      <div className="text-2xl font-bold">
                        {Math.round(chartData.reduce((sum, item) => sum + item.responseTime, 0) / chartData.length)} ms
                      </div>
                      <div className="text-xs text-emerald-500">-12.3% {t('time.fromPrevious')} {timeRange}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-muted-foreground">{t('admin.performanceMetrics.avgServerLoad')}</div>
                      <div className="text-2xl font-bold">
                        {Math.round(chartData.reduce((sum, item) => sum + item.serverLoad, 0) / chartData.length)}%
                      </div>
                      <div className="text-xs text-red-500">+3.5% {t('time.fromPrevious')} {timeRange}</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value={CHART_TYPES.ENGAGEMENT} className="mt-0">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="engagementRate" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" name={t('admin.performanceMetrics.engagementRate')} />
                      <Area type="monotone" dataKey="avgSessionTime" stroke="hsl(var(--primary) / 0.8)" fill="hsl(var(--primary) / 0.1)" name={t('admin.performanceMetrics.avgSessionTime')} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-muted-foreground">{t('admin.performanceMetrics.engagementRate')}</div>
                      <div className="text-2xl font-bold">
                        {Math.round(chartData.reduce((sum, item) => sum + item.engagementRate, 0) / chartData.length)}%
                      </div>
                      <div className="text-xs text-emerald-500">+4.7% {t('time.fromPrevious')} {timeRange}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-muted-foreground">{t('admin.performanceMetrics.avgSessionTime')}</div>
                      <div className="text-2xl font-bold">
                        {Math.round(chartData.reduce((sum, item) => sum + item.avgSessionTime, 0) / chartData.length)} s
                      </div>
                      <div className="text-xs text-emerald-500">+6.2% {t('time.fromPrevious')} {timeRange}</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}