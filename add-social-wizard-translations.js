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
      { key: 'social.nav.cancel', vi: 'Hủy', en: 'Cancel' },
      { key: 'social.nav.back', vi: 'Quay lại', en: 'Back' },
      { key: 'social.nav.next', vi: 'Tiếp theo', en: 'Next' },
      { key: 'social.nav.step', vi: 'Bước', en: 'Step' },
      
      // Action translations
      { key: 'social.action.preview', vi: 'Xem trước', en: 'Preview' },
      { key: 'social.action.previewDesc', vi: 'Preview giao diện social media', en: 'Preview social media interface' },
      { key: 'social.action.publish', vi: 'Lưu & Đăng', en: 'Save & Publish' },
      { key: 'social.action.publishDesc', vi: 'Hoàn tất và xuất bản', en: 'Complete and publish' },
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

    console.log('Social wizard translations added successfully!');
  } catch (error) {
    console.error('Error adding social wizard translations:', error);
  } finally {
    await pool.end();
  }
}

addSocialWizardTranslations();