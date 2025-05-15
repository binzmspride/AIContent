// Đây là một tệp nhỏ để vô hiệu hóa hoàn toàn plugin hiển thị lỗi runtime
// KHÔNG CHỈNH SỬA FILE này nếu bạn không chắc chắn về hậu quả

// CẢNH BÁO: Script này có thể ẩn một số lỗi cần debug trong quá trình phát triển
// Tuy nhiên nó rất hữu ích để ngăn chặn thông báo lỗi ResizeObserver gây phiền nhiễu

(function() {
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
  
  // Thêm CSS để ẩn overlay lỗi
  const style = document.createElement('style');
  style.textContent = `
    [plugin\\:runtime-error-plugin] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `;
  document.head.appendChild(style);
  
  // Lọc tất cả các thông báo lỗi
  const originalConsoleError = console.error;
  console.error = function() {
    if (arguments[0] && typeof arguments[0] === 'string' && arguments[0].includes('runtime-error-plugin')) {
      return;
    }
    return originalConsoleError.apply(console, arguments);
  };
  
  // Lắng nghe DOM để loại bỏ phần tử lỗi nếu nó xuất hiện
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1 && node.hasAttribute && node.hasAttribute('plugin:runtime-error-plugin')) {
            node.style.display = 'none';
            node.remove();
          }
        });
      }
    });
  });
  
  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
  });
})();