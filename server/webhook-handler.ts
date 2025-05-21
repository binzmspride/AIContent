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
    // Kiểm tra URL webhook
    if (!webhookUrl || webhookUrl.trim() === '') {
      console.error('Webhook URL is empty');
      await storage.updateArticle(articleId, {
        title: "Lỗi cấu hình",
        content: "<p>URL webhook chưa được cấu hình. Vui lòng thiết lập URL webhook trong phần cài đặt.</p>",
        updatedAt: new Date()
      });
      return;
    }

    console.log('Sending request to webhook URL:', webhookUrl);
    
    // Gửi request đến webhook
    let response;
    try {
      response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData)
      });
      
      console.log('Webhook response status:', response.status);
    } catch (fetchError) {
      console.error('Error fetching webhook:', fetchError);
      await storage.updateArticle(articleId, {
        title: "Lỗi kết nối",
        content: "<p>Không thể kết nối đến webhook. Vui lòng kiểm tra URL và thử lại.</p>",
        updatedAt: new Date()
      });
      throw fetchError;
    }
    
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
      
      // Báo lỗi và cập nhật bài viết với thông báo lỗi
      await storage.updateArticle(articleId, {
        title: "Lỗi kết nối",
        content: "<p>Webhook trả về HTML thay vì JSON. Vui lòng kiểm tra lại cấu hình webhook.</p>",
        updatedAt: new Date()
      });
      
      console.log('Article updated with error message due to HTML response from webhook');
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
      
      // Cập nhật bài viết với thông báo lỗi
      await storage.updateArticle(articleId, {
        title: "Lỗi định dạng JSON",
        content: "<p>Webhook trả về dữ liệu không đúng định dạng JSON. Vui lòng kiểm tra lại cấu hình webhook.</p>",
        updatedAt: new Date()
      });
      
      console.log('Article updated with error message due to JSON parsing error');
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