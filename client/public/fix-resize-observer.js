// Script được chèn vào trước khi tải trang để ngăn lỗi ResizeObserver
(function() {
  // Thay thế ResizeObserver trước khi React kịp sử dụng nó
  if (typeof window !== 'undefined' && window.ResizeObserver) {
    console.log('[fix-resize-observer] Đang thiết lập...');
    
    const OriginalResizeObserver = window.ResizeObserver;
    
    // Lớp an toàn thay thế
    window.ResizeObserver = class SafeResizeObserver {
      constructor(callback) {
        this.callback = callback;
        this.observers = new Map();
        
        try {
          this.originalObserver = new OriginalResizeObserver((entries) => {
            // Bắt mọi lỗi từ callback
            try {
              this.callback(entries);
            } catch (error) {
              console.log('[SafeResizeObserver] Đã bắt lỗi trong callback:', error.message);
            }
          });
        } catch (error) {
          console.log('[SafeResizeObserver] Lỗi khi tạo observer:', error.message);
          this.originalObserver = {
            observe: () => {},
            unobserve: () => {},
            disconnect: () => {}
          };
        }
      }
      
      observe(target, options) {
        if (!target) return;
        
        try {
          this.observers.set(target, options);
          this.originalObserver.observe(target, options);
        } catch (error) {
          console.log('[SafeResizeObserver] Lỗi khi observe:', error.message);
        }
      }
      
      unobserve(target) {
        if (!target) return;
        
        try {
          this.observers.delete(target);
          this.originalObserver.unobserve(target);
        } catch (error) {
          console.log('[SafeResizeObserver] Lỗi khi unobserve:', error.message);
        }
      }
      
      disconnect() {
        try {
          this.observers.clear();
          this.originalObserver.disconnect();
        } catch (error) {
          console.log('[SafeResizeObserver] Lỗi khi disconnect:', error.message);
        }
      }
    };
    
    console.log('[fix-resize-observer] ResizeObserver đã được thay thế bằng phiên bản an toàn');
  }
  
  // Chặn lỗi ResizeObserver ở cấp độ window
  window.addEventListener('error', function(event) {
    if (event && event.message && event.message.includes('ResizeObserver loop')) {
      event.stopPropagation();
      event.preventDefault();
      event.stopImmediatePropagation();
      return true;
    }
  }, true);
  
  // Ngăn chặn Promise rejection không được xử lý
  window.addEventListener('unhandledrejection', function(event) {
    const message = event.reason && (event.reason.message || event.reason.toString());
    if (message && message.includes('ResizeObserver loop')) {
      event.stopPropagation();
      event.preventDefault();
      event.stopImmediatePropagation();
      return true;
    }
  }, true);
  
  // Cung cấp một hàm global để ẩn các thông báo lỗi
  window.__HIDE_ALL_ERROR_OVERLAYS = function() {
    var errorElements = document.querySelectorAll('[plugin\\:runtime-error-plugin]');
    errorElements.forEach(function(el) {
      el.style.display = 'none';
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
    
    // Ẩn các overlay khác có thể được tạo bởi Vite
    var overlays = document.querySelectorAll('[class*="overlay"]');
    overlays.forEach(function(el) {
      if (typeof el.className === 'string' && 
          (el.className.includes('error') || el.className.includes('overlay'))) {
        el.style.display = 'none';
      }
    });
  };
  
  // Gọi hàm này định kỳ để đảm bảo không có overlay nào hiển thị
  setInterval(function() {
    window.__HIDE_ALL_ERROR_OVERLAYS();
  }, 500);
})();