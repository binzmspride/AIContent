// global.d.ts - Định nghĩa kiểu cho các biến toàn cục

interface Window {
  // Hàm lọc để quyết định xem có hiển thị lỗi hay không cho runtime error plugin
  __RUNTIME_ERROR_FILTER_FN?: (error: Error) => boolean;
}