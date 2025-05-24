import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addTranslations() {
  try {
    console.log('Adding translations...');
    
    const translations = [
      // Navigation
      ['nav.home', 'Trang chủ', 'Home', 'nav'],
      ['nav.features', 'Tính năng', 'Features', 'nav'],
      ['nav.pricing', 'Bảng giá', 'Pricing', 'nav'],
      ['nav.faq', 'Câu hỏi thường gặp', 'FAQ', 'nav'],
      ['nav.contact', 'Liên hệ', 'Contact', 'nav'],
      ['nav.login', 'Đăng nhập', 'Login', 'nav'],
      ['nav.register', 'Đăng ký', 'Register', 'nav'],
      ['nav.dashboard', 'Bảng điều khiển', 'Dashboard', 'nav'],
      
      // Hero Section
      ['landing.hero.title', 'Tạo nội dung SEO chuyên nghiệp với AI', 'Create Professional SEO Content with AI', 'landing'],
      ['landing.hero.subtitle', 'Nền tảng AI hàng đầu giúp bạn tạo ra các bài viết SEO chất lượng cao, tối ưu hóa cho tìm kiếm và thu hút người đọc', 'Leading AI platform to help you create high-quality SEO articles, optimized for search and engaging readers', 'landing'],
      ['landing.hero.cta_primary', 'Bắt đầu miễn phí', 'Start Free', 'landing'],
      ['landing.hero.cta_secondary', 'Xem demo', 'View Demo', 'landing'],
      
      // Features Section
      ['landing.features.title', 'Tính năng nổi bật', 'Outstanding Features', 'landing'],
      ['landing.features.subtitle', 'Khám phá những tính năng mạnh mẽ giúp bạn tạo nội dung SEO hiệu quả', 'Discover powerful features that help you create effective SEO content', 'landing'],
      
      ['landing.features.ai_writing.title', 'Viết bài bằng AI', 'AI Writing', 'landing'],
      ['landing.features.ai_writing.description', 'Sử dụng công nghệ AI tiên tiến để tạo ra nội dung chất lượng cao, phù hợp với từ khóa và tối ưu SEO', 'Use advanced AI technology to create high-quality content that fits keywords and optimizes SEO', 'landing'],
      
      ['landing.features.seo_optimization.title', 'Tối ưu SEO', 'SEO Optimization', 'landing'],
      ['landing.features.seo_optimization.description', 'Tự động phân tích và đề xuất cải thiện SEO cho từng bài viết, giúp tăng thứ hạng trên công cụ tìm kiếm', 'Automatically analyze and suggest SEO improvements for each article, helping increase search engine rankings', 'landing'],
      
      ['landing.features.multilingual.title', 'Đa ngôn ngữ', 'Multilingual Support', 'landing'],
      ['landing.features.multilingual.description', 'Hỗ trợ tạo nội dung bằng nhiều ngôn ngữ khác nhau, mở rộng tầm với của thương hiệu ra toàn cầu', 'Support content creation in multiple languages, expanding your brand reach globally', 'landing'],
      
      ['landing.features.analytics.title', 'Phân tích hiệu suất', 'Performance Analytics', 'landing'],
      ['landing.features.analytics.description', 'Theo dõi và phân tích hiệu suất của các bài viết, từ khóa và chiến lược SEO của bạn', 'Track and analyze the performance of your articles, keywords and SEO strategies', 'landing'],
      
      ['landing.features.templates.title', 'Mẫu có sẵn', 'Ready Templates', 'landing'],
      ['landing.features.templates.description', 'Thư viện mẫu phong phú cho nhiều loại nội dung: blog, landing page, email marketing, và nhiều hơn nữa', 'Rich template library for various content types: blogs, landing pages, email marketing, and more', 'landing'],
      
      ['landing.features.collaboration.title', 'Cộng tác nhóm', 'Team Collaboration', 'landing'],
      ['landing.features.collaboration.description', 'Làm việc cùng team một cách hiệu quả với tính năng chia sẻ, comment và quản lý phiên bản', 'Work efficiently with your team through sharing, commenting and version management features', 'landing'],
      
      // Additional Features from image
      ['landing.features.ai_content.title', 'Nội dung AI', 'AI Content', 'landing'],
      ['landing.features.ai_content.description', 'Tạo nội dung SEO tự động với AI tiên tiến', 'Create SEO content automatically with advanced AI', 'landing'],
      
      ['landing.features.integration.title', 'Tích hợp', 'Integration', 'landing'],
      ['landing.features.integration.description', 'Kết nối WordPress, Facebook, TikTok', 'Connect WordPress, Facebook, TikTok', 'landing'],
      
      ['landing.features.analytics_tracking.title', 'Phân tích', 'Analytics', 'landing'],
      ['landing.features.analytics_tracking.description', 'Theo dõi hiệu suất và tối ưu nội dung', 'Track performance and optimize content', 'landing'],
      
      // Pricing Section
      ['landing.pricing.title', 'Bảng giá linh hoạt', 'Flexible Pricing', 'landing'],
      ['landing.pricing.subtitle', 'Chọn gói phù hợp với nhu cầu của bạn', 'Choose a plan that fits your needs', 'landing'],
      
      // FAQ Section
      ['landing.faq.title', 'Câu hỏi thường gặp', 'Frequently Asked Questions', 'landing'],
      ['landing.faq.subtitle', 'Tìm câu trả lời cho những thắc mắc phổ biến', 'Find answers to common questions', 'landing'],
      
      // Stats Section
      ['landing.stats.articles', 'Bài viết đã tạo', 'Articles Created', 'landing'],
      ['landing.stats.users', 'Người dùng hài lòng', 'Happy Users', 'landing'],
      ['landing.stats.keywords', 'Từ khóa được tối ưu', 'Keywords Optimized', 'landing'],
      ['landing.stats.languages', 'Ngôn ngữ hỗ trợ', 'Languages Supported', 'landing'],
      
      // Feedback Section
      ['landing.feedback.title', 'Góp ý & Phản hồi', 'Feedback & Suggestions', 'landing'],
      ['landing.feedback.subtitle', 'Ý kiến của bạn rất quan trọng với chúng tôi. Hãy chia sẻ trải nghiệm, đề xuất cải tiến hoặc báo cáo lỗi để giúp chúng tôi phát triển tốt hơn.', 'Your feedback is very important to us. Share your experience, improvement suggestions or report bugs to help us develop better.', 'landing'],
      
      // Form Labels
      ['forms.name', 'Họ và tên', 'Full Name', 'forms'],
      ['forms.email', 'Email', 'Email', 'forms'],
      ['forms.subject', 'Chủ đề', 'Subject', 'forms'],
      ['forms.message', 'Tin nhắn', 'Message', 'forms'],
      ['forms.submit', 'Gửi', 'Submit', 'forms'],
      ['forms.required', 'Bắt buộc', 'Required', 'forms'],
      
      // Common
      ['common.loading', 'Đang tải...', 'Loading...', 'common'],
      ['common.save', 'Lưu', 'Save', 'common'],
      ['common.cancel', 'Hủy', 'Cancel', 'common'],
      ['common.delete', 'Xóa', 'Delete', 'common'],
      ['common.edit', 'Chỉnh sửa', 'Edit', 'common'],
      ['common.view', 'Xem', 'View', 'common'],
      ['common.close', 'Đóng', 'Close', 'common'],
      ['common.search', 'Tìm kiếm', 'Search', 'common'],
      ['common.filter', 'Lọc', 'Filter', 'common'],
      ['common.next', 'Tiếp theo', 'Next', 'common'],
      ['common.previous', 'Trước', 'Previous', 'common']
    ];
    
    for (const [key, vi, en, category] of translations) {
      await pool.query(
        `INSERT INTO translations (key, vi, en, category) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (key) DO UPDATE SET 
         vi = EXCLUDED.vi, 
         en = EXCLUDED.en, 
         category = EXCLUDED.category, 
         updated_at = NOW()`,
        [key, vi, en, category]
      );
    }
    
    console.log(`Added ${translations.length} translations successfully!`);
    
  } catch (error) {
    console.error('Error adding translations:', error);
  } finally {
    await pool.end();
  }
}

addTranslations();