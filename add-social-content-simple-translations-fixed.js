import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function addSocialContentSimpleTranslations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const translations = [
      {
        key: 'dashboard.create.socialContent.contentSource.existingArticle',
        vi: 'Từ bài viết có sẵn',
        en: 'From existing article'
      },
      {
        key: 'dashboard.create.socialContent.contentSource.manual',
        vi: 'Tự nhập mô tả',
        en: 'Manual description'
      },
      {
        key: 'dashboard.create.socialContent.contentSource.createNew',
        vi: 'Tạo bài SEO mới',
        en: 'Create new SEO article'
      },
      {
        key: 'dashboard.create.socialContent.step1.title',
        vi: 'Bước 1: Trích xuất nội dung',
        en: 'Step 1: Content Extraction'
      },
      {
        key: 'dashboard.create.socialContent.contentSourceLabel',
        vi: 'Nguồn nội dung',
        en: 'Content Source'
      },
      {
        key: 'dashboard.create.socialContent.briefDescription',
        vi: 'Mô tả nội dung',
        en: 'Content Description'
      },
      {
        key: 'dashboard.create.socialContent.briefDescriptionPlaceholder',
        vi: 'Nhập mô tả ngắn gọn về nội dung bạn muốn tạo...',
        en: 'Enter a brief description of the content you want to create...'
      },
      {
        key: 'dashboard.create.socialContent.referenceUrl',
        vi: 'URL tham khảo (tùy chọn)',
        en: 'Reference URL (optional)'
      },
      {
        key: 'dashboard.create.socialContent.targetPlatforms',
        vi: 'Nền tảng mục tiêu',
        en: 'Target Platforms'
      },
      {
        key: 'dashboard.create.socialContent.extractAndContinue',
        vi: 'Trích xuất & Tiếp tục',
        en: 'Extract & Continue'
      },
      {
        key: 'dashboard.create.socialContent.briefDescriptionRequired',
        vi: 'Mô tả nội dung *',
        en: 'Content Description *'
      },
      {
        key: 'dashboard.create.socialContent.referenceUrlOptional',
        vi: 'URL tham khảo (tùy chọn)',
        en: 'Reference URL (optional)'
      },
      {
        key: 'dashboard.create.socialContent.targetPlatformsRequired',
        vi: 'Nền tảng mục tiêu *',
        en: 'Target Platforms *'
      },
      {
        key: 'dashboard.create.socialContent.urlPlaceholder',
        vi: 'https://example.com/article',
        en: 'https://example.com/article'
      }
    ];

    for (const translation of translations) {
      await client.query(`
        INSERT INTO translations (key, vi, en, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT (key) DO UPDATE SET
          vi = EXCLUDED.vi,
          en = EXCLUDED.en,
          updated_at = NOW()
      `, [translation.key, translation.vi, translation.en]);
    }

    console.log(`Added ${translations.length} translation keys for social content simple page`);
  } catch (error) {
    console.error('Error adding translations:', error);
  } finally {
    await client.end();
  }
}

addSocialContentSimpleTranslations();