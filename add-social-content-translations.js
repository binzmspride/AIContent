import { db } from './db/index.js';
import { translations } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function addSocialContentTranslations() {

  const socialContentTranslations = [
    // Navigation Steps
    { key: 'social.steps.extract.title', vi: 'Trích xuất', en: 'Extract' },
    { key: 'social.steps.extract.desc', vi: 'Lấy ý chính từ bài viết', en: 'Extract key points from article' },
    { key: 'social.steps.generate.title', vi: 'Tạo nội dung', en: 'Generate' },
    { key: 'social.steps.generate.desc', vi: 'Tạo post cho từng nền tảng', en: 'Create posts for each platform' },
    { key: 'social.steps.complete.title', vi: 'Hoàn thành', en: 'Complete' },
    { key: 'social.steps.complete.desc', vi: 'Chọn hoặc tạo hình ảnh', en: 'Select or create images' },
    
    // Main Title
    { key: 'social.main.title', vi: 'Tạo Nội Dung Mạng Xã Hội', en: 'Create Social Media Content' },
    { key: 'social.step1.title', vi: 'Bước 1: Trích xuất nội dung', en: 'Step 1: Content Extraction' },
    
    // Form Fields
    { key: 'social.form.contentSource', vi: 'Nguồn nội dung', en: 'Content Source' },
    { key: 'social.form.contentSource.manual', vi: 'Tự nhập mô tả', en: 'Manual Input' },
    { key: 'social.form.contentSource.article', vi: 'Từ bài viết có sẵn', en: 'From Existing Article' },
    { key: 'social.form.description', vi: 'Mô tả nội dung', en: 'Content Description' },
    { key: 'social.form.description.placeholder', vi: 'Nhập mô tả ngắn gọn về nội dung bạn muốn tạo...', en: 'Enter a brief description of the content you want to create...' },
    { key: 'social.form.referenceLink', vi: 'URL tham khảo (tùy chọn)', en: 'Reference URL (optional)' },
    { key: 'social.form.referenceLink.placeholder', vi: 'https://example.com/article', en: 'https://example.com/article' },
    { key: 'social.form.platforms', vi: 'Nền tảng mục tiêu', en: 'Target Platforms' },
    
    // Action Buttons
    { key: 'social.action.extract', vi: 'Trích xuất ý chính', en: 'Extract Content' },
    { key: 'social.action.extracting', vi: 'Đang trích xuất...', en: 'Extracting...' },
    
    // Content Display
    { key: 'social.content.extracted', vi: 'Nội dung đã trích xuất', en: 'Extracted Content' },
    { key: 'social.content.article', vi: 'Nội dung bài viết', en: 'Article Content' },
    { key: 'social.content.none', vi: 'Không có nội dung', en: 'No content' },
    { key: 'social.content.generated', vi: 'Nội dung được tạo', en: 'Generated Content' },
    
    // Help Text
    { key: 'social.help.reference', vi: 'Thêm link tham khảo để cung cấp thêm context cho AI', en: 'Add reference link to provide additional context for AI' },
    { key: 'social.help.referenceStyle', vi: 'Nhập link bài viết để AI tham khảo phong cách và nội dung', en: 'Enter article link for AI to reference style and content' },
    
    // Debug
    { key: 'social.debug.viewResponse', vi: 'Xem response đầy đủ (Debug)', en: 'View Full Response (Debug)' },
    
    // Validation Messages
    { key: 'social.validation.descriptionRequired', vi: 'Vui lòng nhập mô tả nội dung', en: 'Please enter content description' },
    { key: 'social.validation.platformRequired', vi: 'Vui lòng chọn ít nhất một nền tảng', en: 'Please select at least one platform' },
    { key: 'social.validation.articleRequired', vi: 'Vui lòng chọn một bài viết', en: 'Please select an article' }
  ];

  try {
    for (const translation of socialContentTranslations) {
      // Check if translation already exists
      const existing = await db.select()
        .from(translations)
        .where(eq(translations.key, translation.key))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(translations).values({
          key: translation.key,
          vi: translation.vi,
          en: translation.en,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`Added translation: ${translation.key}`);
      } else {
        console.log(`Translation already exists: ${translation.key}`);
      }
    }

    console.log('Social content translations added successfully!');
  } catch (error) {
    console.error('Error adding translations:', error);
  }
}

addSocialContentTranslations().catch(console.error);