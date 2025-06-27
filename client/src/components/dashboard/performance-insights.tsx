import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/hooks/use-language';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PerformanceMetrics, TimeRange } from '@shared/types';

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

export default function PerformanceInsights() {
  const { t } = useDbTranslations();
  const [activeTab, setActiveTab] = useState(CHART_TYPES.TRAFFIC);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  
  // Fetch performance data from API
  const { data, isLoading, error } = useQuery<{ success: boolean, data: PerformanceMetrics }>({
    queryKey: ['/api/admin/performance', timeRange],
    refetchOnWindowFocus: false,
  });

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold">{t('admin.performanceMetrics.title')}</CardTitle>
            <CardDescription>{t('admin.performanceMetrics.description')}</CardDescription>
          </div>
          <Select 
            value={timeRange} 
            onValueChange={(value: TimeRange) => setTimeRange(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('admin.performanceMetrics.selectTimeRange')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">{t('time.day')}</SelectItem>
              <SelectItem value="week">{t('time.week')}</SelectItem>
              <SelectItem value="month">{t('time.month')}</SelectItem>
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
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Alert variant="destructive" className="my-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t('common.errorLoading')}
              </AlertDescription>
            </Alert>
          ) : !data?.data ? (
            <Alert variant="destructive" className="my-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t('common.noDataAvailable')}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <TabsContent value={CHART_TYPES.TRAFFIC} className="mt-0">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.data.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                        {data.data.summary.totalVisitors}
                      </div>
                      <div className="text-xs text-emerald-500">
                        +{data.data.summary.trends.visitors}% {t('time.fromPrevious')} {timeRange}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-muted-foreground">{t('admin.performanceMetrics.pageViews')}</div>
                      <div className="text-2xl font-bold">
                        {data.data.summary.totalPageViews}
                      </div>
                      <div className="text-xs text-emerald-500">
                        +{data.data.summary.trends.pageViews}% {t('time.fromPrevious')} {timeRange}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value={CHART_TYPES.PERFORMANCE} className="mt-0">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.data.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                        {data.data.summary.avgResponseTime} ms
                      </div>
                      <div className={`text-xs ${data.data.summary.trends.responseTime < 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {data.data.summary.trends.responseTime}% {t('time.fromPrevious')} {timeRange}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-muted-foreground">{t('admin.performanceMetrics.avgServerLoad')}</div>
                      <div className="text-2xl font-bold">
                        {data.data.summary.avgServerLoad}%
                      </div>
                      <div className={`text-xs ${data.data.summary.trends.serverLoad < 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {data.data.summary.trends.serverLoad < 0 ? '' : '+'}
                        {data.data.summary.trends.serverLoad}% {t('time.fromPrevious')} {timeRange}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value={CHART_TYPES.ENGAGEMENT} className="mt-0">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.data.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                        {data.data.summary.avgEngagementRate}%
                      </div>
                      <div className="text-xs text-emerald-500">
                        +{data.data.summary.trends.engagementRate}% {t('time.fromPrevious')} {timeRange}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-muted-foreground">{t('admin.performanceMetrics.avgSessionTime')}</div>
                      <div className="text-2xl font-bold">
                        {data.data.summary.avgSessionTime} s
                      </div>
                      <div className="text-xs text-emerald-500">
                        +{data.data.summary.trends.sessionTime}% {t('time.fromPrevious')} {timeRange}
                      </div>
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