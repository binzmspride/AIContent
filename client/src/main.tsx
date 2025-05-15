import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Chặn hiển thị lỗi ResizeObserver trong runtime error plugin
window.__RUNTIME_ERROR_FILTER_FN = (error: Error) => {
  // Trả về true nếu muốn lọc bỏ lỗi (không hiển thị)
  // Trả về false nếu muốn hiển thị lỗi
  if (!error || !error.message) return false;
  return error.message.includes('ResizeObserver loop') || 
         error.message.includes('ResizeObserver is not defined');
};

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
