import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function addSocialContentSimpleTranslations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const translations = [
      // Content source options
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
        key: 'dashboard.create.socialContent.contentSource.createNew'
        vi: 'Tạo bài SEO mới'
        en: 'Create new SEO article'
      }
      // Labels and headings
      {
        key: 'dashboard.create.socialContent.selectSeoArticle'
        vi: 'Chọn bài viết SEO'
        en: 'Select SEO Article'
      }
      {
        key: 'dashboard.create.socialContent.articlesFound'
        vi: 'Tìm thấy {count} bài viết SEO trong "Bài viết của tôi"'
        en: 'Found {count} SEO articles in "My Articles"'
      }
      {
        key: 'dashboard.create.socialContent.briefDescription'
        vi: 'Mô tả ngắn gọn'
        en: 'Brief Description'
      }
      {
        key: 'dashboard.create.socialContent.briefDescriptionPlaceholder'
        vi: 'Nhập mô tả ngắn gọn về nội dung bạn muốn tạo...'
        en: 'Enter a brief description of the content you want to create...'
      }
      {
        key: 'dashboard.create.socialContent.platforms'
        vi: 'Chọn nền tảng'
        en: 'Select Platforms'
      }
      {
        key: 'dashboard.create.socialContent.seoTopic'
        vi: 'Chủ đề SEO'
        en: 'SEO Topic'
      }
      {
        key: 'dashboard.create.socialContent.seoTopicPlaceholder'
        vi: 'Nhập chủ đề chính cho bài viết SEO...'
        en: 'Enter the main topic for the SEO article...'
      }
      {
        key: 'dashboard.create.socialContent.seoKeywords'
        vi: 'Từ khóa SEO'
        en: 'SEO Keywords'
      }
      {
        key: 'dashboard.create.socialContent.seoKeywordsPlaceholder'
        vi: 'Nhập từ khóa chính, cách nhau bằng dấu phẩy...'
        en: 'Enter main keywords, separated by commas...'
      }
      // Buttons
      {
        key: 'dashboard.create.socialContent.nextStep'
        vi: 'Bước tiếp theo'
        en: 'Next Step'
      }
      {
        key: 'dashboard.create.socialContent.backStep'
        vi: 'Quay lại'
        en: 'Back'
      }
      {
        key: 'dashboard.create.socialContent.generateContent'
        vi: 'Tạo nội dung'
        en: 'Generate Content'
      }
      // Step titles
      {
        key: 'dashboard.create.socialContent.step1.title'
        vi: 'Chọn nguồn nội dung'
        en: 'Select Content Source'
      }
      {
        key: 'dashboard.create.socialContent.step2.title'
        vi: 'Tạo nội dung'
        en: 'Generate Content'
      }
      {
        key: 'dashboard.create.socialContent.step3.title'
        vi: 'Xem trước và chỉnh sửa'
        en: 'Preview and Edit'
      }
      // Publishing
      {
        key: 'dashboard.create.socialContent.publish.title'
        vi: 'Đăng bài và Lên lịch'
        en: 'Publish and Schedule'
      }
      {
        key: 'dashboard.create.socialContent.publish.subtitle'
        vi: 'Chọn đăng ngay hoặc lên lịch cho từng nền tảng'
        en: 'Choose to publish now or schedule for each platform'
      }
      {
        key: 'dashboard.create.socialContent.status.connected'
        vi: 'Đã kết nối'
        en: 'Connected'
      }
      {
        key: 'dashboard.create.socialContent.status.notConnected'
        vi: 'Chưa kết nối'
        en: 'Not Connected'
      }
      {
        key: 'dashboard.create.socialContent.status.published'
        vi: 'Đã đăng'
        en: 'Published'
      }
      {
        key: 'dashboard.create.socialContent.status.scheduled'
        vi: 'Đã lên lịch'
        en: 'Scheduled'
      }
    ];

    for (const translation of translations) {
      await client.query(`
        INSERT INTO translations (key, vi, en, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT (key) DO UPDATE SET
          vi = EXCLUDED.vi
          en = EXCLUDED.en
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