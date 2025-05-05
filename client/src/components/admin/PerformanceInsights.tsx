import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, BarChart3, Clock, Server, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define the data structure for the performance metrics
interface PerformanceMetrics {
  // Response times
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  
  // Requests
  totalRequests: number;
  requestsPerMinute: number;
  errorRate: number;
  
  // Server metrics
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  
  // Historical data for charts
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
}

// Generate sample data for development purposes
const generateSampleData = (): PerformanceMetrics => {
  const now = new Date();
  const history = Array.from({ length: 24 }, (_, i) => {
    const timestamp = new Date(now.getTime() - (23 - i) * 3600000).toISOString();
    return {
      timestamp,
      average: 120 + Math.random() * 80,
      p95: 180 + Math.random() * 100,
      p99: 220 + Math.random() * 120,
      total: 1000 + Math.floor(Math.random() * 500),
      errors: Math.floor(Math.random() * 50),
      cpu: 30 + Math.random() * 30,
      memory: 40 + Math.random() * 25,
      disk: 60 + Math.random() * 15,
    };
  });
  
  return {
    averageResponseTime: 145,
    p95ResponseTime: 220,
    p99ResponseTime: 280,
    
    totalRequests: 24560,
    requestsPerMinute: 42,
    errorRate: 2.5,
    
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 72,
    
    responseTimeHistory: history.map(h => ({
      timestamp: h.timestamp,
      average: h.average,
      p95: h.p95,
      p99: h.p99,
    })),
    
    requestsHistory: history.map(h => ({
      timestamp: h.timestamp,
      total: h.total,
      errors: h.errors,
    })),
    
    resourceUsageHistory: history.map(h => ({
      timestamp: h.timestamp,
      cpu: h.cpu,
      memory: h.memory,
      disk: h.disk,
    })),
    
    endpointPerformance: [
      { endpoint: "/api/articles", count: 5230, averageTime: 132, errorRate: 1.2 },
      { endpoint: "/api/user", count: 8450, averageTime: 88, errorRate: 0.8 },
      { endpoint: "/api/generate-content", count: 1820, averageTime: 2350, errorRate: 5.2 },
      { endpoint: "/api/admin/stats", count: 645, averageTime: 165, errorRate: 3.1 },
      { endpoint: "/api/plans", count: 1230, averageTime: 112, errorRate: 1.5 },
    ],
  };
};

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return `${date.getHours()}:00`;
};

const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  return `${date.getDate()}/${date.getMonth() + 1}`;
};

export function PerformanceInsights() {
  const [timeRange, setTimeRange] = useState<string>("24h");
  
  // Use TanStack Query to fetch performance metrics
  const { data: metrics, isLoading } = useQuery<PerformanceMetrics>({
    queryKey: ["/api/admin/performance", { timeRange }],
    queryFn: async () => {
      // In a real application, this would fetch actual data from the server
      // For now, we'll use sample data
      return generateSampleData();
    },
    refetchInterval: 60000, // Refetch every minute
  });
  
  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Performance Insights</h2>
        
        <div className="flex items-center gap-4">
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageResponseTime.toFixed(0)} ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              P95: {metrics.p95ResponseTime.toFixed(0)} ms | P99: {metrics.p99ResponseTime.toFixed(0)} ms
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.requestsPerMinute.toFixed(0)} req/min | Error Rate: {metrics.errorRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cpuUsage.toFixed(1)}%</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${metrics.cpuUsage > 80 ? 'bg-destructive' : metrics.cpuUsage > 60 ? 'bg-warning' : 'bg-primary'}`}
                style={{ width: `${metrics.cpuUsage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.memoryUsage.toFixed(1)}%</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${metrics.memoryUsage > 80 ? 'bg-destructive' : metrics.memoryUsage > 60 ? 'bg-warning' : 'bg-primary'}`}
                style={{ width: `${metrics.memoryUsage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts section */}
      <Tabs defaultValue="response-time" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="response-time">Response Time</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="resources">Resource Usage</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoint Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="response-time">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Trends</CardTitle>
              <CardDescription>Average, P95, and P99 response times over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={metrics.responseTimeHistory}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={formatTime} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(0)} ms`, '']}
                      labelFormatter={(label) => new Date(label).toLocaleString()}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="average" name="Avg" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="p95" name="P95" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="p99" name="P99" stroke="#ff7300" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Request Volume</CardTitle>
              <CardDescription>Total requests and errors over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.requestsHistory}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={formatTime} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [value.toLocaleString(), '']}
                      labelFormatter={(label) => new Date(label).toLocaleString()}
                    />
                    <Legend />
                    <Bar dataKey="total" name="Total Requests" fill="#8884d8" />
                    <Bar dataKey="errors" name="Errors" fill="#ff0000" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage</CardTitle>
              <CardDescription>CPU, Memory, and Disk usage over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={metrics.resourceUsageHistory}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={formatTime} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                      labelFormatter={(label) => new Date(label).toLocaleString()}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="cpu" name="CPU" stroke="#8884d8" />
                    <Line type="monotone" dataKey="memory" name="Memory" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="disk" name="Disk" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>Endpoint Performance</CardTitle>
              <CardDescription>Response times and error rates by endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.endpointPerformance}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="endpoint" type="category" />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'Avg. Time') return [`${value.toFixed(0)} ms`, name];
                        if (name === 'Error Rate') return [`${value.toFixed(1)}%`, name];
                        return [value.toLocaleString(), name];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="averageTime" name="Avg. Time" fill="#8884d8" />
                    <Bar dataKey="errorRate" name="Error Rate" fill="#ff0000" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}