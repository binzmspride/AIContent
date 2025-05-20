import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

// Lưu trữ kết nối WebSocket theo userId
const clients = new Map<number, Set<WebSocket>>();

/**
 * Thiết lập WebSocket server
 * @param httpServer HTTP server để gắn WebSocket server
 */
export function setupWebSocketServer(httpServer: Server) {
  // Thiết lập WebSocket server với đường dẫn /ws
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Xử lý kết nối WebSocket mới
  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');
    
    // Lưu userId của client
    let userId: number | null = null;
    
    // Xử lý tin nhắn từ client
    ws.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data.toString());
        
        // Nếu có tin nhắn xác thực với userId, lưu lại
        if (data.type === 'auth' && data.userId) {
          userId = data.userId;
          
          // Thêm vào danh sách kết nối theo userId
          if (!clients.has(userId)) {
            clients.set(userId, new Set<WebSocket>());
          }
          
          clients.get(userId)!.add(ws);
          console.log(`WebSocket authenticated for user ${userId}`);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Xử lý khi kết nối bị đóng
    ws.on('close', () => {
      if (userId !== null) {
        const userConnections = clients.get(userId);
        
        if (userConnections) {
          userConnections.delete(ws);
          
          // Nếu không còn kết nối nào, xóa userId khỏi map
          if (userConnections.size === 0) {
            clients.delete(userId);
          }
        }
        
        console.log(`WebSocket connection closed for user ${userId}`);
      }
    });
  });
  
  return wss;
}

/**
 * Gửi thông báo cho client qua WebSocket
 * @param userId ID của người dùng để xác định kết nối
 * @param data Dữ liệu để gửi
 */
export function notifyClient(userId: number, data: any) {
  if (!clients.has(userId)) {
    console.log(`No WebSocket connections for user ${userId}`);
    return;
  }
  
  const userConnections = clients.get(userId)!;
  console.log(`Sending notification to user ${userId} (${userConnections.size} connections)`);
  
  const payload = JSON.stringify(data);
  
  userConnections.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}