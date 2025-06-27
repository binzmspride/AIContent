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