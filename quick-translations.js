import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addQuickTranslations() {
  try {
    const translations = [
      ['nav.home', 'Trang chủ', 'Home', 'nav'],
      ['nav.features', 'Tính năng', 'Features', 'nav'],
      ['nav.pricing', 'Bảng giá', 'Pricing', 'nav'],
      ['nav.contact', 'Liên hệ', 'Contact', 'nav'],
      ['landing.hero.title', 'Tạo nội dung SEO chuyên nghiệp với AI', 'Create Professional SEO Content with AI', 'landing'],
      ['landing.features.ai_writing.title', 'Viết bài bằng AI', 'AI Writing', 'landing'],
      ['landing.features.seo_optimization.title', 'Tối ưu SEO', 'SEO Optimization', 'landing'],
      ['landing.features.multilingual.title', 'Đa ngôn ngữ', 'Multilingual', 'landing']
    ];
    
    for (const [key, vi, en, category] of translations) {
      await pool.query(
        `INSERT INTO translations (key, vi, en, category) VALUES ($1, $2, $3, $4) ON CONFLICT (key) DO NOTHING`,
        [key, vi, en, category]
      );
    }
    
    console.log('Quick translations added!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

addQuickTranslations();