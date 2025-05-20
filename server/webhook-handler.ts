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
    
    // Kiểm tra nếu phản hồi chứa HTML thay vì JSON (bắt đầu bằng <!DOCTYPE hoặc <html)
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      console.error('Webhook returned HTML instead of JSON');
      
      // Tạo dữ liệu mẫu thay thế để tiếp tục quy trình
      const mockData = {
        aiTitle: `Bài viết về ${requestData.keywords || 'chủ đề mới'}`,
        content: `<p>Đã xảy ra lỗi với webhook, nhưng chúng tôi đã tạo một nội dung mẫu.</p>
                 <p>URL webhook có thể đang trả về HTML thay vì JSON. Vui lòng kiểm tra lại cấu hình webhook.</p>
                 <h2>Chủ đề: ${requestData.keywords || 'Không xác định'}</h2>
                 <p>Nội dung này được tạo tự động khi webhook gặp lỗi.</p>`,
      };
      
      // Cập nhật bài viết với thông báo và nội dung mẫu
      await storage.updateArticle(articleId, {
        title: mockData.aiTitle,
        content: mockData.content,
        updatedAt: new Date()
      });
      
      console.log('Article updated with fallback content due to HTML response from webhook');
      return;
    }
    
    // Xử lý phản hồi JSON như bình thường
    let webhookData;
    try {
      webhookData = JSON.parse(responseText);
      console.log('Successfully parsed webhook response');
    } catch (parseError) {
      console.error('Failed to parse webhook response as JSON:', parseError);
      
      // Cập nhật bài viết với thông báo lỗi
      await storage.updateArticle(articleId, {
        title: "Lỗi định dạng dữ liệu",
        content: "<p>Không thể xử lý dữ liệu từ dịch vụ tạo nội dung. Phản hồi từ webhook không phải là JSON hợp lệ.</p>"
      });
      
      return;
    }
    
    // Cập nhật bài viết với nội dung từ webhook
    const updatedArticle = {
      title: webhookData[0]?.aiTitle || webhookData?.aiTitle || "Bài viết mới",
      content: webhookData[0]?.content || webhookData?.content || "<p>Không có nội dung</p>",
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