import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function addRemainingSocialTranslations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Adding remaining social translations...');

    const translations = [
      // Step 1 - Content Extraction
      { key: 'social.step1.title', vi: 'Bước 1: Trích xuất nội dung', en: 'Step 1: Extract Content' },
      { key: 'social.step1.contentSource', vi: 'Nguồn nội dung', en: 'Content Source' },
      { key: 'social.step1.fromArticle', vi: 'Từ bài viết có sẵn', en: 'From Existing Article' },
      { key: 'social.step1.manual', vi: 'Nhập thủ công', en: 'Manual Input' },
      { key: 'social.step1.selectArticle', vi: 'Chọn bài viết', en: 'Select Article' },
      { key: 'social.step1.selectArticlePlaceholder', vi: 'Chọn bài viết để trích xuất nội dung', en: 'Select an article to extract content' },
      { key: 'social.step1.referenceLink', vi: 'URL tham khảo (tùy chọn)', en: 'Reference URL (optional)' },
      { key: 'social.step1.referencePlaceholder', vi: 'https://example.com/article', en: 'https://example.com/article' },
      { key: 'social.step1.briefDescription', vi: 'Mô tả ngắn', en: 'Brief Description' },
      { key: 'social.step1.briefPlaceholder', vi: 'Nhập mô tả ngắn về nội dung bạn muốn tạo...', en: 'Enter a brief description of the content you want to create...' },
      { key: 'social.step1.platforms', vi: 'Nền tảng mục tiêu', en: 'Target Platforms' },
      { key: 'social.step1.extractContent', vi: 'Trích xuất ý chính', en: 'Extract Key Points' },
      
      // Common translations
      { key: 'common.missingInfo', vi: 'Thiếu thông tin', en: 'Missing Information' },
      
      // Error messages
      { key: 'social.error.descriptionRequired', vi: 'Vui lòng nhập mô tả nội dung', en: 'Please enter content description' },
      { key: 'social.error.platformRequired', vi: 'Vui lòng chọn ít nhất một nền tảng', en: 'Please select at least one platform' },
      { key: 'social.error.articleRequired', vi: 'Vui lòng chọn bài viết để trích xuất', en: 'Please select an article to extract from' },
    ];

    for (const translation of translations) {
      // Check if translation already exists
      const existing = await pool.query(
        'SELECT id FROM translations WHERE key = $1',
        [translation.key]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          'INSERT INTO translations (key, vi, en) VALUES ($1, $2, $3)',
          [translation.key, translation.vi, translation.en]
        );
        console.log(`Added translation: ${translation.key}`);
      } else {
        console.log(`Translation already exists: ${translation.key}`);
      }
    }

    console.log('Remaining social translations added successfully!');
  } catch (error) {
    console.error('Error adding remaining social translations:', error);
  } finally {
    await pool.end();
  }
}

addRemainingSocialTranslations();