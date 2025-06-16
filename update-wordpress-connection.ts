import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { socialConnections } from './shared/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

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
    const wpConnections = await db.select().from(socialConnections).where(eq(socialConnections.platform, 'wordpress'));
    
    if (wpConnections.length > 0) {
      const wpConnection = wpConnections[0];
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
        
      console.log('Đã cập nhật kết nối WordPress thành công');
    } else {
      console.log('Không tìm thấy kết nối WordPress nào');
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật kết nối WordPress:', error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

updateWordPressConnection();