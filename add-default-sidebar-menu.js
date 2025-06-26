import { Client } from 'pg';

async function addDefaultSidebarMenuItems() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check if sidebar menu items already exist
    const existingItems = await client.query('SELECT COUNT(*) FROM sidebar_menu_items');
    const count = parseInt(existingItems.rows[0].count);

    if (count > 0) {
      console.log(`Sidebar menu items already exist (${count} items). Skipping...`);
      return;
    }

    // Default sidebar menu items
    const defaultItems = [
      {
        key: 'dashboard',
        label: 'Dashboard',
        labelEn: 'Dashboard',
        path: '/dashboard',
        icon: 'LayoutDashboard',
        requiredRole: 'user',
        isEnabled: true,
        sortOrder: 1
      },
      {
        key: 'create-content',
        label: 'Tạo nội dung',
        labelEn: 'Create Content',
        path: '/dashboard/create-content',
        icon: 'PenSquare',
        requiredRole: 'user',
        isEnabled: true,
        sortOrder: 2
      },
      {
        key: 'create-social-content',
        label: 'Tạo Content Social',
        labelEn: 'Create Social Content',
        path: '/dashboard/create-social-content',
        icon: 'Share2',
        requiredRole: 'user',
        isEnabled: true,
        sortOrder: 3
      },
      {
        key: 'my-articles',
        label: 'Bài viết của tôi',
        labelEn: 'My Articles',
        path: '/dashboard/my-articles',
        icon: 'FileText',
        requiredRole: 'user',
        isEnabled: true,
        sortOrder: 4
      },
      {
        key: 'create-image',
        label: 'Tạo hình ảnh',
        labelEn: 'Create Image',
        path: '/dashboard/create-image',
        icon: 'Image',
        requiredRole: 'user',
        isEnabled: true,
        sortOrder: 5
      },
      {
        key: 'image-library',
        label: 'Thư viện hình ảnh',
        labelEn: 'Image Library',
        path: '/dashboard/image-library',
        icon: 'ImagePlus',
        requiredRole: 'user',
        isEnabled: true,
        sortOrder: 6
      },
      {
        key: 'scheduled-posts',
        label: 'Bài viết đã lên lịch',
        labelEn: 'Scheduled Posts',
        path: '/dashboard/scheduled-posts',
        icon: 'Calendar',
        requiredRole: 'user',
        isEnabled: true,
        sortOrder: 7
      },
      {
        key: 'connections',
        label: 'Kết nối',
        labelEn: 'Connections',
        path: '/dashboard/connections',
        icon: 'Link',
        requiredRole: 'user',
        isEnabled: true,
        sortOrder: 8
      },
      {
        key: 'ai-api-keys',
        label: 'AI API Keys',
        labelEn: 'AI API Keys',
        path: '/dashboard/ai-api-keys',
        icon: 'Key',
        requiredRole: 'user',
        isEnabled: true,
        sortOrder: 9
      },
      {
        key: 'brand-guidelines',
        label: 'Brand Guidelines',
        labelEn: 'Brand Guidelines',
        path: '/dashboard/brand-guidelines',
        icon: 'Palette',
        requiredRole: 'user',
        isEnabled: true,
        sortOrder: 10
      },
      {
        key: 'content-separation',
        label: 'Tách riêng Content',
        labelEn: 'Content Separation',
        path: '/dashboard/content-separation',
        icon: 'Split',
        requiredRole: 'user',
        isEnabled: true,
        sortOrder: 11
      },
      {
        key: 'credits',
        label: 'Tín dụng',
        labelEn: 'Credits',
        path: '/dashboard/credits',
        icon: 'Coins',
        requiredRole: 'user',
        isEnabled: true,
        sortOrder: 12
      },
      {
        key: 'settings',
        label: 'Cài đặt',
        labelEn: 'Settings',
        path: '/dashboard/settings',
        icon: 'Settings',
        requiredRole: 'user',
        isEnabled: true,
        sortOrder: 13
      }
    ];

    // Insert default sidebar menu items
    const insertQuery = `
      INSERT INTO sidebar_menu_items (key, label, label_en, path, icon, required_role, is_enabled, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    for (const item of defaultItems) {
      await client.query(insertQuery, [
        item.key,
        item.label,
        item.labelEn,
        item.path,
        item.icon,
        item.requiredRole,
        item.isEnabled,
        item.sortOrder
      ]);
    }

    console.log(`✓ Successfully added ${defaultItems.length} default sidebar menu items`);

  } catch (error) {
    console.error('Error adding default sidebar menu items:', error);
    throw error;
  } finally {
    await client.end();
  }
}

addDefaultSidebarMenuItems()
  .then(() => {
    console.log('Default sidebar menu items setup completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to setup default sidebar menu items:', error);
    process.exit(1);
  });