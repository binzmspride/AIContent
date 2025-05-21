import { storage } from "./storage";

/**
 * Xử lý webhook trong background và cập nhật bài viết khi hoàn thành
 * @param webhookUrl URL của webhook cần gọi
 * @param requestData Dữ liệu gửi đến webhook
 * @param headers Headers cho request
 * @param articleId ID của bài viết cần cập nhật
 * @param userId ID của người dùng
 */
export async function processWebhookInBackground(
  webhookUrl: string,
  requestData: any,
  headers: HeadersInit,
  articleId: number,
  userId: number
) {
  console.log('Processing webhook in background:', webhookUrl);
  console.log('For article ID:', articleId);
  
  try {
    // Gửi request đến webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestData)
    });
    
    console.log('Webhook response status:', response.status);
    
    if (!response.ok) {
      console.error(`Webhook error status: ${response.status}`);
      
      // Cập nhật bài viết với thông báo lỗi
      await storage.updateArticle(articleId, {
        title: "Lỗi tạo nội dung",
        content: `<p>Đã xảy ra lỗi khi tạo nội dung. Mã lỗi: ${response.status}</p>`
      });
      
      return;
    }
    
    // Xử lý phản hồi từ webhook
    const responseText = await response.text();
    console.log('Webhook raw response:', responseText.substring(0, 200) + '...');
    
    // Kiểm tra nếu phản hồi chứa HTML thay vì JSON 
    // Bao gồm các trường hợp bắt đầu bằng <!DOCTYPE, <html hoặc chứa các ký tự HTML đặc trưng
    if (
      responseText.trim().startsWith('<!DOCTYPE') || 
      responseText.trim().startsWith('<html') ||
      responseText.includes('<head>') || 
      responseText.includes('<body>')
    ) {
      console.error('Webhook returned HTML instead of JSON');
      
      // Tạo bài viết thay thế với nội dung cơ bản về từ khóa
      const keywords = requestData.keywords || 'chủ đề mới';
      const title = `Bài viết về ${keywords}`;
      
      // Nội dung thay thế chi tiết hơn
      const fallbackContent = `
        <h1>${title}</h1>
        
        <p>Bài viết này được tạo tự động khi webhook gặp vấn đề kết nối.</p>
        
        <h2>Từ khóa chính: ${keywords}</h2>
        
        <p>Cây cảnh xanh đã trở thành một phần không thể thiếu trong không gian sống hiện đại. Không chỉ mang lại vẻ đẹp tự nhiên, cây xanh còn có nhiều lợi ích cho sức khỏe và tinh thần của con người.</p>
        
        <h2>Lợi ích của cây cảnh xanh trong không gian sống</h2>
        
        <p>Việc đặt cây xanh trong nhà không chỉ đơn thuần là để trang trí mà còn mang lại nhiều giá trị thiết thực:</p>
        
        <ul>
          <li><strong>Thanh lọc không khí</strong> - Nhiều loại cây có khả năng hấp thụ các chất độc hại và cung cấp oxy cho không gian sống</li>
          <li><strong>Giảm stress</strong> - Màu xanh của cây có tác dụng thư giãn, giúp giảm căng thẳng và mệt mỏi</li>
          <li><strong>Tăng độ ẩm</strong> - Cây xanh giúp điều hòa độ ẩm trong không khí, đặc biệt hữu ích trong mùa hanh khô</li>
          <li><strong>Tạo điểm nhấn thẩm mỹ</strong> - Cây cảnh là một phần quan trọng trong thiết kế nội thất hiện đại</li>
        </ul>
      `;
      
      // Cập nhật bài viết với nội dung thay thế
      await storage.updateArticle(articleId, {
        title: title,
        content: fallbackContent,
        updatedAt: new Date()
      });
      
      console.log('Article updated with fallback content due to HTML response from webhook');
      return;
    }
    
    // Xử lý phản hồi JSON như bình thường
    let webhookData;
    try {
      // Thử xử lý JSON và log chi tiết trước khi parse
      console.log('Attempting to parse JSON response');
      
      // Xử lý trường hợp string rỗng
      if (!responseText || responseText.trim() === '') {
        console.error('Empty response from webhook');
        throw new Error('Empty response');
      }
      
      webhookData = JSON.parse(responseText);
      console.log('Successfully parsed webhook response');
      
      // Log cấu trúc dữ liệu để debug
      console.log('Webhook data structure:', Object.keys(webhookData));
      if (Array.isArray(webhookData)) {
        console.log('Webhook data is an array with length:', webhookData.length);
        if (webhookData.length > 0) {
          console.log('First item keys:', Object.keys(webhookData[0] || {}));
        }
      }
    } catch (parseError) {
      console.error('Failed to parse webhook response as JSON:', parseError);
      console.error('Response starts with:', responseText.substring(0, 50));
      
      // Tạo bài viết thay thế với nội dung cơ bản về từ khóa
      const keywords = requestData.keywords || 'chủ đề mới';
      const title = `Bài viết về ${keywords}`;
      
      // Nội dung thay thế khi không thể xử lý JSON
      const fallbackContent = `
        <h1>${title}</h1>
        
        <p>Bài viết này được tạo tự động do không thể xử lý phản hồi JSON từ webhook.</p>
        
        <h2>Từ khóa chính: ${keywords}</h2>
        
        <p>Đây là bài viết mẫu về chủ đề ${keywords}. Nội dung này được tạo tự động khi hệ thống không thể parse dữ liệu JSON từ webhook.</p>
        
        <h2>Vấn đề có thể gặp phải</h2>
        
        <ul>
          <li><strong>Định dạng phản hồi không đúng</strong> - Webhook cần trả về dữ liệu dạng JSON</li>
          <li><strong>Cấu trúc JSON không hợp lệ</strong> - Kiểm tra cú pháp JSON trong phản hồi</li>
          <li><strong>Trả về HTML thay vì JSON</strong> - Webhook có thể đang trả về trang lỗi HTML</li>
        </ul>
      `;
      
      // Cập nhật bài viết với nội dung thay thế
      await storage.updateArticle(articleId, {
        title: title,
        content: fallbackContent,
        updatedAt: new Date()
      });
      
      console.log('Article updated with fallback content due to JSON parsing error');
      return;
    }
    
    // Cập nhật bài viết với nội dung từ webhook
    console.log('Preparing to extract content from webhook data');
    
    // Xử lý cấu trúc dữ liệu webhook đa dạng
    let title = "";
    let content = "";
    
    // Kiểm tra nếu là mảng (format [{ aiTitle, content }])
    if (Array.isArray(webhookData) && webhookData.length > 0) {
      console.log('Extracting content from array format');
      title = webhookData[0]?.aiTitle || webhookData[0]?.title || "";
      content = webhookData[0]?.content || webhookData[0]?.articleContent || "";
    } 
    // Kiểm tra nếu là object (format { aiTitle, content })
    else if (typeof webhookData === 'object' && webhookData !== null) {
      console.log('Extracting content from object format');
      title = webhookData.aiTitle || webhookData.title || "";
      content = webhookData.content || webhookData.articleContent || "";
    }
    
    // Log để debug
    console.log('Extracted title:', title ? title.substring(0, 30) + '...' : 'Empty title');
    console.log('Content extracted:', content ? 'Yes, length: ' + content.length : 'No content');
    
    // Sử dụng dữ liệu đã trích xuất hoặc dữ liệu mặc định
    const updatedArticle = {
      title: title || `Bài viết về ${requestData.keywords || "chủ đề mới"}`,
      content: content || "<p>Không có nội dung từ dịch vụ tạo nội dung</p>",
      updatedAt: new Date()
    };
    
    await storage.updateArticle(articleId, updatedArticle);
    console.log('Article updated with content from webhook, ID:', articleId);
    
  } catch (error) {
    console.error('Error processing webhook in background:', error);
    
    // Cập nhật bài viết với thông báo lỗi
    await storage.updateArticle(articleId, {
      title: "Lỗi xử lý",
      content: "<p>Đã xảy ra lỗi khi xử lý dữ liệu từ webhook</p>"
    }).catch(err => {
      console.error('Failed to update article with error status:', err);
    });
  }
}