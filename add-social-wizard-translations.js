import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function addSocialWizardTranslations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Adding social wizard translations...');

    const translations = [
      // Navigation translations
      { key: 'social.nav.cancel', vi: 'Hủy', en: 'Cancel', page: 'social' },
      { key: 'social.nav.back', vi: 'Quay lại', en: 'Back', page: 'social' },
      { key: 'social.nav.next', vi: 'Tiếp theo', en: 'Next', page: 'social' },
      { key: 'social.nav.step', vi: 'Bước', en: 'Step', page: 'social' },
      
      // Action translations
      { key: 'social.action.preview', vi: 'Xem trước', en: 'Preview', page: 'social' },
      { key: 'social.action.previewDesc', vi: 'Preview giao diện social media', en: 'Preview social media interface', page: 'social' },
      { key: 'social.action.publish', vi: 'Lưu & Đăng', en: 'Save & Publish', page: 'social' },
      { key: 'social.action.publishDesc', vi: 'Hoàn tất và xuất bản', en: 'Complete and publish', page: 'social' },
    ];

    for (const translation of translations) {
      // Check if translation already exists
      const existing = await pool.query(
        'SELECT id FROM translations WHERE key = $1',
        [translation.key]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          'INSERT INTO translations (key, vi, en, page) VALUES ($1, $2, $3, $4)',
          [translation.key, translation.vi, translation.en, translation.page]
        );
        console.log(`Added translation: ${translation.key}`);
      } else {
        console.log(`Translation already exists: ${translation.key}`);
      }
    }

    console.log('Social wizard translations added successfully!');
  } catch (error) {
    console.error('Error adding social wizard translations:', error);
  } finally {
    await pool.end();
  }
}

addSocialWizardTranslations();