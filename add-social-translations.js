import { db } from './db/index.js';
import { translations } from './shared/schema.js';

const socialTranslations = [
  // Main title
  { key: 'social.main.title', vi: 'Tạo Nội Dung Mạng Xã Hội', en: 'Create Social Media Content' },
  
  // Steps
  { key: 'social.steps.extract.title', vi: 'Trích xuất', en: 'Extract' },
  { key: 'social.steps.extract.desc', vi: 'Lấy ý chính từ bài viết', en: 'Extract key content from article' },
  { key: 'social.steps.generate.title', vi: 'Tạo nội dung', en: 'Generate Content' },
  { key: 'social.steps.generate.desc', vi: 'Tạo post cho từng nền tảng', en: 'Create posts for each platform' },
  { key: 'social.steps.complete.title', vi: 'Hoàn thành', en: 'Complete' },
  { key: 'social.steps.complete.desc', vi: 'Chọn hoặc tạo hình ảnh', en: 'Select or create images' },
  
  // Step 1 - Content Extraction
  { key: 'social.step1.title', vi: 'Bước 1: Trích xuất nội dung', en: 'Step 1: Extract Content' },
  { key: 'social.step1.contentSource', vi: 'Nguồn nội dung', en: 'Content Source' },
  { key: 'social.step1.fromArticle', vi: 'Từ bài viết có sẵn', en: 'From existing article' },
  { key: 'social.step1.manual', vi: 'Nhập thủ công', en: 'Manual input' },
  { key: 'social.step1.selectArticle', vi: 'Chọn bài viết', en: 'Select Article' },
  { key: 'social.step1.selectArticlePlaceholder', vi: 'Chọn bài viết để trích xuất nội dung', en: 'Choose an article to extract content' },
  { key: 'social.step1.referenceLink', vi: 'Liên kết tham khảo', en: 'Reference Link' },
  { key: 'social.step1.referencePlaceholder', vi: 'https://example.com/bai-viet-tham-khao', en: 'https://example.com/reference-article' },
  { key: 'social.step1.description', vi: 'Mô tả ngắn gọn', en: 'Brief Description' },
  { key: 'social.step1.descriptionPlaceholder', vi: 'Mô tả ngắn gọn về nội dung muốn tạo...', en: 'Brief description of the content you want to create...' },
  { key: 'social.step1.platforms', vi: 'Chọn nền tảng', en: 'Select Platforms' },
  { key: 'social.step1.extracting', vi: 'Đang trích xuất...', en: 'Extracting...' },
  { key: 'social.step1.extractAndContinue', vi: 'Trích xuất & Tiếp tục', en: 'Extract & Continue' },
  { key: 'social.step1.extractedContent', vi: 'Nội dung đã trích xuất', en: 'Extracted Content' },
  
  // Navigation buttons
  { key: 'social.nav.back', vi: 'Quay lại', en: 'Back' },
  { key: 'social.nav.next', vi: 'Tiếp theo', en: 'Next' },
  { key: 'social.nav.continue', vi: 'Tiếp tục', en: 'Continue' },
  { key: 'social.nav.finish', vi: 'Hoàn thành', en: 'Finish' },
  
  // Common actions
  { key: 'social.action.regenerate', vi: 'Tạo lại nội dung', en: 'Regenerate Content' },
  { key: 'social.action.preview', vi: 'Xem trước', en: 'Preview' },
  { key: 'social.action.save', vi: 'Lưu', en: 'Save' },
  { key: 'social.action.publish', vi: 'Đăng ngay', en: 'Publish Now' }
];

async function addSocialTranslations() {
  try {
    console.log('Adding social media content translations...');
    
    for (const translation of socialTranslations) {
      await db.insert(translations).values({
        key: translation.key,
        vi: translation.vi,
        en: translation.en,
        category: 'social_content'
      }).onConflictDoUpdate({
        target: translations.key,
        set: {
          vi: translation.vi,
          en: translation.en,
          category: 'social_content'
        }
      });
      
      console.log(`✓ Added translation: ${translation.key}`);
    }
    
    console.log(`\n✅ Successfully added ${socialTranslations.length} social content translations`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding translations:', error);
    process.exit(1);
  }
}

addSocialTranslations();