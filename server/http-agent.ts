import { Agent } from 'http';
import https from 'https';

// Tạo HTTP agent với timeout tăng lên
export const httpAgent = new Agent({
  keepAlive: true,
  timeout: 180000, // 3 phút
  maxSockets: 100
});

// Tạo HTTPS agent với timeout tăng lên
export const httpsAgent = new https.Agent({
  keepAlive: true,
  timeout: 180000, // 3 phút
  maxSockets: 100
});