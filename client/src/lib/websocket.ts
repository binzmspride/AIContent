// WebSocket service cho việc nhận thông báo thời gian thực

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

// Callback xử lý thông báo WebSocket
type MessageHandler = (data: WebSocketMessage) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectInterval = 3000; // 3 giây
  private callbacks: Map<string, Set<MessageHandler>> = new Map();
  private userId: number | null = null;

  /**
   * Khởi tạo kết nối WebSocket
   * @param userId ID của người dùng hiện tại
   */
  connect(userId: number) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.userId = userId;

    // Xác định giao thức và địa chỉ WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    
    try {
      this.socket = new WebSocket(wsUrl);
      
      // Xử lý khi kết nối mở
      this.socket.addEventListener('open', () => {
        console.log('WebSocket connection established');
        this.isConnected = true;
        
        // Gửi tin nhắn xác thực với userId
        this.authenticate();
        
        // Hủy bỏ timer reconnect nếu có
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      });
      
      // Xử lý khi nhận được tin nhắn
      this.socket.addEventListener('message', (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          console.log('WebSocket message received:', message);
          
          // Gọi callback cho loại thông báo này
          this.notifyCallbacks(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });
      
      // Xử lý khi kết nối bị đóng
      this.socket.addEventListener('close', () => {
        console.log('WebSocket connection closed');
        this.isConnected = false;
        
        // Kết nối lại sau một khoảng thời gian
        this.scheduleReconnect();
      });
      
      // Xử lý lỗi
      this.socket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
        // Không cần đóng kết nối, event 'close' sẽ được gọi sau đó
      });
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.scheduleReconnect();
    }
  }
  
  /**
   * Đăng ký callback xử lý tin nhắn WebSocket
   * @param type Loại thông báo cần xử lý
   * @param callback Hàm callback xử lý thông báo
   */
  subscribe(type: string, callback: MessageHandler) {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, new Set());
    }
    
    this.callbacks.get(type)!.add(callback);
    
    return () => {
      const handlers = this.callbacks.get(type);
      if (handlers) {
        handlers.delete(callback);
        if (handlers.size === 0) {
          this.callbacks.delete(type);
        }
      }
    };
  }
  
  /**
   * Đóng kết nối WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.callbacks.clear();
  }
  
  /**
   * Xác thực kết nối WebSocket với userId
   */
  private authenticate() {
    if (this.isConnected && this.socket && this.userId) {
      const authMessage = {
        type: 'auth',
        userId: this.userId
      };
      
      this.socket.send(JSON.stringify(authMessage));
      console.log('Sent authentication message with userId:', this.userId);
    }
  }
  
  /**
   * Lên lịch kết nối lại sau khi mất kết nối
   */
  private scheduleReconnect() {
    if (!this.reconnectTimer && this.userId) {
      this.reconnectTimer = setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        this.connect(this.userId!);
        this.reconnectTimer = null;
      }, this.reconnectInterval);
    }
  }
  
  /**
   * Gọi các callback đăng ký cho một loại thông báo
   * @param message Thông báo WebSocket nhận được
   */
  private notifyCallbacks(message: WebSocketMessage) {
    const { type } = message;
    
    // Gọi callback cho loại thông báo cụ thể
    const typeHandlers = this.callbacks.get(type);
    if (typeHandlers) {
      typeHandlers.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error(`Error in WebSocket callback for type ${type}:`, error);
        }
      });
    }
    
    // Gọi callback cho tất cả các loại thông báo
    const allHandlers = this.callbacks.get('*');
    if (allHandlers) {
      allHandlers.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error('Error in WebSocket wildcard callback:', error);
        }
      });
    }
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();

export default webSocketService;