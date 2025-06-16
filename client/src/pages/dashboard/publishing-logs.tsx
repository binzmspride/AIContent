import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, CheckCircle, XCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface PublishingLog {
  id: number;
  scheduledPostId: number;
  platform: string;
  status: 'started' | 'success' | 'failed';
  message: string;
  details: any;
  timestamp: string;
}

export default function PublishingLogsPage() {
  const [location, navigate] = useLocation();
  const postId = new URLSearchParams(location.split('?')[1]).get('postId');

  const { data: logs, isLoading } = useQuery<{ success: boolean; data: PublishingLog[] }>({
    queryKey: [`/api/scheduled-posts/${postId}/logs`],
    enabled: !!postId
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'started':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'started':
        return <Badge variant="secondary">Đang xử lý</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">Thành công</Badge>;
      case 'failed':
        return <Badge variant="destructive">Thất bại</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" style={{ backgroundColor: '#132639', minHeight: '100vh' }}>
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard/scheduled-posts')}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <h1 className="text-2xl font-bold text-white">
          Logs Đăng Bài #{postId}
        </h1>
      </div>

      <div className="space-y-4">
        {logs?.data?.length === 0 ? (
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6 text-center text-white">
              <Info className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Chưa có logs nào cho bài đăng này</p>
            </CardContent>
          </Card>
        ) : (
          logs?.data?.map((log) => (
            <Card key={log.id} className="bg-white/10 border-white/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.status)}
                    <div>
                      <CardTitle className="text-white text-lg">
                        {log.platform.toUpperCase()}
                      </CardTitle>
                      <p className="text-sm text-gray-300">
                        {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(log.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-white mb-1">Thông điệp:</h4>
                    <p className="text-gray-300 text-sm">{log.message}</p>
                  </div>
                  
                  {log.details && (
                    <div>
                      <h4 className="font-medium text-white mb-2">Chi tiết:</h4>
                      <div className="bg-black/30 p-3 rounded-md">
                        <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {logs?.data && logs.data.length > 0 && (
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Tóm tắt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-400">
                  {logs.data.filter(l => l.status === 'started').length}
                </p>
                <p className="text-sm text-gray-300">Đã bắt đầu</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">
                  {logs.data.filter(l => l.status === 'success').length}
                </p>
                <p className="text-sm text-gray-300">Thành công</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">
                  {logs.data.filter(l => l.status === 'failed').length}
                </p>
                <p className="text-sm text-gray-300">Thất bại</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}