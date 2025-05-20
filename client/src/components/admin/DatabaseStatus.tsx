import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Database, Check, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

interface DatabaseStatusResponse {
  success: boolean;
  data: {
    connected: boolean;
    querySuccess: boolean;
    status: 'online' | 'offline';
    userCount: number | null;
    timestamp: string;
  };
}

export function DatabaseStatus() {
  const { data, isLoading, isError, refetch } = useQuery<DatabaseStatusResponse>({
    queryKey: ['/api/status/database'],
    refetchInterval: 60000, // Tự động kiểm tra lại mỗi phút
  });

  // Sử dụng useState để theo dõi lần kiểm tra gần nhất
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  // Cập nhật lastCheck khi nhận được dữ liệu mới
  useEffect(() => {
    if (data?.data?.timestamp) {
      setLastCheck(new Date(data.data.timestamp));
    }
  }, [data]);

  const handleRefresh = () => {
    refetch();
    setLastCheck(new Date());
  };

  // Tính thời gian từ lần kiểm tra gần nhất
  const getTimeAgo = (): string => {
    const now = new Date();
    const diffMs = now.getTime() - lastCheck.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) {
      return `${diffSec} giây trước`;
    } else {
      const diffMin = Math.floor(diffSec / 60);
      return `${diffMin} phút trước`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <span>Cơ sở dữ liệu:</span>
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2">
        <span>Cơ sở dữ liệu:</span>
        <span className="font-medium text-red-500 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          Lỗi kiểm tra
        </span>
        <button 
          onClick={handleRefresh}
          className="text-xs text-blue-500 hover:underline ml-2"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const status = data?.data?.status || 'offline';
  const isOnline = status === 'online';

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <span>Cơ sở dữ liệu:</span>
        <span className={`font-medium flex items-center ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
          <Database className="h-4 w-4 mr-1" />
          {isOnline ? 'Online' : 'Offline'}
        </span>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={handleRefresh}
              className="text-xs text-blue-500 hover:underline ml-2"
            >
              Kiểm tra lại
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Kiểm tra lần cuối: {getTimeAgo()}</p>
            {data?.data?.userCount !== null && (
              <p>Số lượng người dùng: {data.data.userCount}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}