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
    let webhookData;
    
    try {
      webhookData = JSON.parse(responseText);
      console.log('Successfully parsed webhook response');
    } catch (parseError) {
      console.error('Failed to parse webhook response as JSON:', parseError);
      
      // Cập nhật bài viết với thông báo lỗi
      await storage.updateArticle(articleId, {
        title: "Lỗi định dạng dữ liệu",
        content: "<p>Không thể xử lý dữ liệu từ dịch vụ tạo nội dung</p>"
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