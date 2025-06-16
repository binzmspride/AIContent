import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { socialConnections } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function updateWordPressConnection() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not found');
    return;
  }

  const sql = postgres(connectionString);
  const db = drizzle(sql);

  try {
    // Tìm kết nối WordPress đầu tiên
    const [wpConnection] = await db.select().from(socialConnections).where(eq(socialConnections.platform, 'wordpress'));
    
    if (wpConnection) {
      console.log('Tìm thấy kết nối WordPress:', wpConnection.id);
      
      // Cập nhật thông tin kết nối với cấu hình mẫu
      const [updated] = await db.update(socialConnections)
        .set({
          settings: {
            websiteUrl: 'https://demo.wordpress.com',
            username: 'demo_user',
            password: 'demo_password_123'
          },
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(socialConnections.id, wpConnection.id))
        .returning();
        
      console.log('Đã cập nhật kết nối WordPress:', updated);
    } else {
      console.log('Không tìm thấy kết nối WordPress nào');
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật kết nối WordPress:', error);
  } finally {
    await sql.end();
  }
}

updateWordPressConnection();