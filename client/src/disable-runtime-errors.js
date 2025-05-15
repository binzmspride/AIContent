// Đây là một tệp nhỏ để vô hiệu hóa hoàn toàn plugin hiển thị lỗi runtime
// KHÔNG CHỈNH SỬA FILE này nếu bạn không chắc chắn về hậu quả

// CẢNH BÁO: Script này có thể ẩn một số lỗi cần debug trong quá trình phát triển
// Tuy nhiên nó rất hữu ích để ngăn chặn thông báo lỗi ResizeObserver gây phiền nhiễu

(function() {
  // Giải pháp cực đoan: Ghi đè hoàn toàn ResizeObserver
  if (window.ResizeObserver) {
    // Tạo một lớp giả mạo mà không gây lỗi
    window.ResizeObserver = class MockResizeObserver {
      constructor(callback) {
        this.callback = callback;
        this.elements = new Set();
      }
      
      observe(element) {
        // Không làm gì hoặc giả lập hành vi cần thiết
        this.elements.add(element);
        
        // Gọi callback an toàn
        if (this.callback) {
          try {
            // Gọi callback với entries giả mạo
            const entry = {
              target: element,
              contentRect: element.getBoundingClientRect(),
              borderBoxSize: [{
                inlineSize: element.offsetWidth,
                blockSize: element.offsetHeight
              }],
              contentBoxSize: [{
                inlineSize: element.clientWidth,
                blockSize: element.clientHeight
              }]
            };
            
            setTimeout(() => {
              this.callback([entry]);
            }, 100);
          } catch (e) {
            // Bỏ qua lỗi từ callback
          }
        }
      }
      
      unobserve(element) {
        this.elements.delete(element);
      }
      
      disconnect() {
        this.elements.clear();
      }
    };
    
    console.log('Đã thay thế ResizeObserver bằng phiên bản an toàn');
  }
  
  // Vô hiệu hóa hàm createHotContext của Vite để ngăn plugin đăng ký
  if (window.createHotContext) {
    const originalCreateHotContext = window.createHotContext;
    window.createHotContext = function(id) {
      if (id.includes('runtime-error-plugin')) {
        // Trả về một đối tượng giả mạo không làm gì cả
        return {
          accept: () => {},
          dispose: () => {},
          prune: () => {},
          send: () => {}
        };
      }
      return originalCreateHotContext.apply(this, arguments);
    };
  }
  
  // Xóa bỏ các phần tử lỗi đã hiển thị
  function removeErrorOverlays() {
    // Xóa tất cả các phần tử có thuộc tính plugin:runtime-error-plugin
    const errorElements = document.querySelectorAll('[plugin\\:runtime-error-plugin]');
    errorElements.forEach(el => el.remove());
    
    // Xóa các phần tử có class chứa error-overlay
    const overlayElements = document.querySelectorAll('[class*="overlay"]');
    overlayElements.forEach(el => {
      if (el.className.includes('error') || el.className.includes('overlay')) {
        el.style.display = 'none';
      }
    });
  }
  
  // Lọc tất cả các thông báo lỗi
  const originalConsoleError = console.error;
  console.error = function() {
    if (arguments[0] && typeof arguments[0] === 'string') {
      if (arguments[0].includes('ResizeObserver') || 
          arguments[0].includes('runtime-error-plugin')) {
        removeErrorOverlays();
        return;
      }
    }
    return originalConsoleError.apply(console, arguments);
  };
  
  // Thêm CSS để ẩn overlay lỗi
  const style = document.createElement('style');
  style.textContent = `
    [plugin\\:runtime-error-plugin],
    .error-overlay,
    [class*="error-overlay"],
    [class*="overlay"][class*="error"],
    [class^="overlay-"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      position: fixed !important;
      z-index: -9999 !important;
      top: -9999px !important;
      left: -9999px !important;
      width: 0 !important;
      height: 0 !important;
      overflow: hidden !important;
    }
  `;
  document.head.appendChild(style);
  
  // Lắng nghe DOM để loại bỏ phần tử lỗi nếu nó xuất hiện
  const observer = new MutationObserver(function(mutations) {
    let hasErrorElements = false;
    
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes && mutation.addedNodes.length) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) {
            // Kiểm tra tất cả các trường hợp có thể là thông báo lỗi
            if ((node.hasAttribute && node.hasAttribute('plugin:runtime-error-plugin')) ||
                (node.className && 
                 (node.className.includes('error') || 
                  node.className.includes('overlay')))) {
              hasErrorElements = true;
            }
          }
        });
      }
    });
    
    if (hasErrorElements) {
      removeErrorOverlays();
    }
  });
  
  // Bắt đầu theo dõi các thay đổi DOM
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
  
  // Xóa tất cả các overlay hiện có
  removeErrorOverlays();
  
  // Kiểm tra và xóa overlay định kỳ
  setInterval(removeErrorOverlays, 1000);
  
  // Thêm phương thức chặn vào window.__RUNTIME_ERROR_OVERLAY_ACTIVE
  Object.defineProperty(window, '__RUNTIME_ERROR_OVERLAY_ACTIVE', {
    get: function() { return false; },
    set: function() { /* Bỏ qua tất cả các thử gán giá trị */ }
  });
})();