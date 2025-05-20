import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatabaseStatusProps {
  className?: string;
}

export function DatabaseStatus({ className }: DatabaseStatusProps) {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  useEffect(() => {
    const checkDatabaseStatus = async () => {
      try {
        const response = await fetch('/api/status/database');
        if (response.ok) {
          const data = await response.json();
          setStatus(data.online ? 'online' : 'offline');
        } else {
          setStatus('offline');
        }
      } catch (error) {
        console.error('Error checking database status:', error);
        setStatus('offline');
      }
    };
    
    // Kiểm tra ngay khi component mount
    checkDatabaseStatus();
    
    // Sau đó, kiểm tra mỗi 30 giây
    const interval = setInterval(checkDatabaseStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      {status === 'checking' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span>Cơ sở dữ liệu: Đang kiểm tra...</span>
        </>
      )}
      
      {status === 'online' && (
        <>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Cơ sở dữ liệu: <span className="text-green-500 font-medium">Online</span></span>
        </>
      )}
      
      {status === 'offline' && (
        <>
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span>Cơ sở dữ liệu: <span className="text-red-500 font-medium">Offline</span></span>
        </>
      )}
    </div>
  );
}