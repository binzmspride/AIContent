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
      },
      {
        key: 'dashboard.create.socialContent.stepExtract',
        vi: 'Trích xuất',
        en: 'Extract'
      },
      {
        key: 'dashboard.create.socialContent.stepGenerate',
        vi: 'Tạo nội dung',
        en: 'Generate Content'
      },
      {
        key: 'dashboard.create.socialContent.stepComplete',
        vi: 'Hoàn thành',
        en: 'Complete'
      },
      {
        key: 'dashboard.create.socialContent.selectSeoArticle',
        vi: 'Chọn bài viết SEO',
        en: 'Select SEO Article'
      },
      {
        key: 'dashboard.create.socialContent.foundArticles',
        vi: 'Tìm thấy {{count}} bài viết SEO trong "Bài viết của tôi"',
        en: 'Found {{count}} SEO articles in "My Articles"'
      },
      {
        key: 'dashboard.create.socialContent.selectSeoPlaceholder',
        vi: 'Chọn bài viết SEO...',
        en: 'Select SEO article...'
      },
      {
        key: 'dashboard.create.socialContent.searchArticlePlaceholder',
        vi: 'Tìm kiếm bài viết theo tiêu đề hoặc từ khóa...',
        en: 'Search articles by title or keywords...'
      },
      {
        key: 'dashboard.create.socialContent.noSeoArticles',
        vi: 'Chưa có bài viết SEO nào',
        en: 'No SEO articles yet'
      },
      {
        key: 'dashboard.create.socialContent.createSeoFirst',
        vi: 'Hãy tạo bài viết SEO trước trong mục "Tạo nội dung"',
        en: 'Please create SEO articles first in "Create Content" section'
      },
      {
        key: 'dashboard.create.socialContent.mainTopicRequired',
        vi: 'Chủ đề chính *',
        en: 'Main Topic *'
      },
      {
        key: 'dashboard.create.socialContent.topicPlaceholder',
        vi: 'Ví dụ: Cây cảnh xanh trong nhà',
        en: 'Example: Indoor green plants'
      },
      {
        key: 'dashboard.create.socialContent.keywordsRequired',
        vi: 'Từ khóa *',
        en: 'Keywords *'
      },
      {
        key: 'dashboard.create.socialContent.keywordsPlaceholder',
        vi: 'Ví dụ: cây cảnh xanh, chăm sóc cây, không gian xanh',
        en: 'Example: green plants, plant care, green space'
      },
      {
        key: 'dashboard.create.socialContent.targetPlatformsRequired',
        vi: 'Nền tảng mục tiêu *',
        en: 'Target Platforms *'
      },
      {
        key: 'dashboard.create.socialContent.createArticleAndExtract',
        vi: 'Tạo bài viết & Trích xuất',
        en: 'Create Article & Extract'
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