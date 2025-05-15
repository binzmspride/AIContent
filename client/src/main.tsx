import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./disable-runtime-errors";

// Tệp disable-runtime-errors.js đã có đầy đủ các phương pháp
// xử lý lỗi ResizeObserver bằng một cách mạnh mẽ

// Ngăn chặn hiển thị lỗi ResizeObserver trong console
const originalError = window.console.error;
window.console.error = function(...args: any[]) {
  if (
    typeof args[0] === 'string' && args[0].includes('ResizeObserver loop') ||
    args[0]?.toString?.().includes('ResizeObserver loop') || 
    args[0]?.message?.includes?.('ResizeObserver loop')
  ) {
    // Không hiển thị lỗi ResizeObserver
    return;
  }
  originalError.apply(window.console, args);
};

// Chặn lỗi tại cấp độ window
window.addEventListener('error', (event) => {
  if (
    event.message?.includes('ResizeObserver loop') || 
    event.error?.message?.includes('ResizeObserver loop')
  ) {
    event.stopImmediatePropagation();
    event.preventDefault();
    event.stopPropagation();
    return true;
  }
}, true);

// Chặn unhandled rejection cho ResizeObserver
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason?.message?.includes('ResizeObserver loop') ||
    event.reason?.toString?.().includes('ResizeObserver loop')
  ) {
    event.stopImmediatePropagation();
    event.preventDefault();
    event.stopPropagation();
    return true;
  }
}, true);

createRoot(document.getElementById("root")!).render(<App />);
