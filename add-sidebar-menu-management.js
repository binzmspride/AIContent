import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addSidebarMenuManagement() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Creating role enum if not exists...');
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE role AS ENUM ('admin', 'user');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log('Creating sidebar_menu_items table...');
    
    // Create the table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sidebar_menu_items (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) NOT NULL UNIQUE,
        label VARCHAR(200) NOT NULL,
        label_en VARCHAR(200),
        icon VARCHAR(50),
        path VARCHAR(200),
        parent_key VARCHAR(100),
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_enabled BOOLEAN NOT NULL DEFAULT true,
        required_role role DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    console.log('Inserting default menu items...');
    
    // Insert default menu items
    const defaultMenuItems = [
      { key: 'dashboard', label: 'Bảng điều khiển', labelEn: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard', sortOrder: 1 },
      { key: 'create-content', label: 'Tạo nội dung', labelEn: 'Create Content', icon: 'PenTool', path: '/dashboard/create-content', sortOrder: 2 },
      { key: 'create-seo-article', label: 'Tạo bài viết SEO', labelEn: 'Create SEO Article', icon: 'FileText', path: '/dashboard/create-seo-article', sortOrder: 3 },
      { key: 'create-social-content', label: 'Tạo nội dung mạng xã hội', labelEn: 'Create Social Content', icon: 'Share2', path: '/dashboard/create-social-content', sortOrder: 4 },
      { key: 'my-articles', label: 'Bài viết của tôi', labelEn: 'My Articles', icon: 'BookOpen', path: '/dashboard/my-articles', sortOrder: 5 },
      { key: 'image-library', label: 'Thư viện hình ảnh', labelEn: 'Image Library', icon: 'Image', path: '/dashboard/image-library', sortOrder: 6 },
      { key: 'create-image', label: 'Tạo hình ảnh', labelEn: 'Create Image', icon: 'ImagePlus', path: '/dashboard/create-image', sortOrder: 7 },
      { key: 'scheduled-posts', label: 'Bài viết đã lên lịch', labelEn: 'Scheduled Posts', icon: 'Calendar', path: '/dashboard/scheduled-posts', sortOrder: 8 },
      { key: 'social-connections', label: 'Kết nối mạng xã hội', labelEn: 'Social Connections', icon: 'Link', path: '/dashboard/social-connections', sortOrder: 9 },
      { key: 'api-keys', label: 'API Keys', labelEn: 'API Keys', icon: 'Key', path: '/dashboard/api-keys', sortOrder: 10 },
      { key: 'ai-api-keys', label: 'AI API Keys', labelEn: 'AI API Keys', icon: 'Bot', path: '/dashboard/ai-api-keys', sortOrder: 11 },
      { key: 'brand-guidelines', label: 'Hướng dẫn thương hiệu', labelEn: 'Brand Guidelines', icon: 'Palette', path: '/dashboard/brand-guidelines', sortOrder: 12 },
      { key: 'content-separation', label: 'Phân tách nội dung', labelEn: 'Content Separation', icon: 'Split', path: '/dashboard/content-separation', sortOrder: 13 },
      { key: 'credits', label: 'Tín dụng', labelEn: 'Credits', icon: 'Coins', path: '/dashboard/credits', sortOrder: 14 },
      { key: 'settings', label: 'Cài đặt', labelEn: 'Settings', icon: 'Settings', path: '/dashboard/settings', sortOrder: 15 }
    ];

    for (const item of defaultMenuItems) {
      await client.query(`
        INSERT INTO sidebar_menu_items (key, label, label_en, icon, path, sort_order, is_enabled, required_role)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (key) DO UPDATE SET
          label = EXCLUDED.label,
          label_en = EXCLUDED.label_en,
          icon = EXCLUDED.icon,
          path = EXCLUDED.path,
          sort_order = EXCLUDED.sort_order,
          updated_at = NOW()
      `, [item.key, item.label, item.labelEn, item.icon, item.path, item.sortOrder, true, 'user']);
    }

    await client.query('COMMIT');
    console.log('Sidebar menu management system created successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating sidebar menu management:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addSidebarMenuManagement().catch(console.error);