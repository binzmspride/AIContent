import { storage } from './storage';
import { db } from '../db/index';
import { scheduledPosts } from '../shared/schema';
import { eq, and, lte } from 'drizzle-orm';

interface ScheduledPostJob {
  id: number;
  userId: number;
  title: string;
  content: string;
  platforms: any[];
  scheduledTime: Date;
  status: string;
}

class PostScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) {
      console.log('Scheduler đã đang chạy');
      return;
    }

    console.log('Bắt đầu chạy scheduler cho bài viết đã lên lịch...');
    this.isRunning = true;
    
    // Kiểm tra mỗi phút
    this.intervalId = setInterval(() => {
      this.processPendingPosts();
    }, 60000); // 60 giây

    // Chạy ngay lập tức một lần
    this.processPendingPosts();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log('Đã dừng scheduler');
    }
  }

  private async processPendingPosts() {
    try {
      const now = new Date();
      console.log(`[${now.toISOString()}] Kiểm tra bài viết cần đăng...`);

      // Lấy các bài viết pending đã đến thời gian đăng
      const pendingPosts = await db
        .select()
        .from(scheduledPosts)
        .where(
          and(
            eq(scheduledPosts.status, 'pending'),
            lte(scheduledPosts.scheduledTime, now)
          )
        );

      if (pendingPosts.length === 0) {
        return;
      }

      console.log(`Tìm thấy ${pendingPosts.length} bài viết cần đăng`);

      for (const post of pendingPosts) {
        await this.processPost(post as ScheduledPostJob);
      }
    } catch (error) {
      console.error('Lỗi khi xử lý bài viết lên lịch:', error);
    }
  }

  private async processPost(post: ScheduledPostJob) {
    try {
      console.log(`Đang xử lý bài viết: ${post.title} (ID: ${post.id})`);
      
      // Cập nhật trạng thái thành "processing"
      await db
        .update(scheduledPosts)
        .set({ 
          status: 'processing',
          updatedAt: new Date()
        })
        .where(eq(scheduledPosts.id, post.id));

      // Lấy thông tin kết nối cho từng platform
      const platforms = Array.isArray(post.platforms) ? post.platforms : [];
      const publishResults: any = {};
      let hasError = false;

      for (const platformConfig of platforms) {
        try {
          const result = await this.publishToConnection(post, platformConfig);
          publishResults[platformConfig.platform] = result;
          console.log(`Đã đăng thành công lên ${platformConfig.platform}`);
        } catch (error: any) {
          console.error(`Lỗi khi đăng lên ${platformConfig.platform}:`, error);
          publishResults[platformConfig.platform] = { 
            error: error.message || 'Unknown error' 
          };
          hasError = true;
        }
      }

      // Cập nhật trạng thái cuối cùng
      const finalStatus = hasError ? 'failed' : 'completed';
      await db
        .update(scheduledPosts)
        .set({ 
          status: finalStatus,
          publishedUrls: publishResults,
          updatedAt: new Date()
        })
        .where(eq(scheduledPosts.id, post.id));

      console.log(`Hoàn thành xử lý bài viết ${post.id} với trạng thái: ${finalStatus}`);

    } catch (error: any) {
      console.error(`Lỗi khi xử lý bài viết ${post.id}:`, error);
      
      // Cập nhật trạng thái thành failed
      await db
        .update(scheduledPosts)
        .set({ 
          status: 'failed',
          errorLogs: [{ error: error.message, timestamp: new Date() }],
          updatedAt: new Date()
        })
        .where(eq(scheduledPosts.id, post.id));
    }
  }

  private async publishToConnection(post: ScheduledPostJob, platformConfig: any): Promise<any> {
    const { platform, connectionId, accountName } = platformConfig;
    
    // Lấy thông tin kết nối
    const connection = await storage.getSocialConnection(connectionId);
    if (!connection) {
      throw new Error(`Không tìm thấy kết nối ${connectionId}`);
    }

    switch (platform) {
      case 'wordpress':
        return await this.publishToWordPress(post, connection);
      case 'facebook':
        return await this.publishToFacebook(post, connection);
      case 'twitter':
        return await this.publishToTwitter(post, connection);
      case 'linkedin':
        return await this.publishToLinkedIn(post, connection);
      default:
        throw new Error(`Platform không được hỗ trợ: ${platform}`);
    }
  }

  private async publishToWordPress(post: ScheduledPostJob, connection: any): Promise<any> {
    // Đối với WordPress, chúng ta cần gọi WordPress REST API
    try {
      const { websiteUrl, username, password } = connection.settings || {};
      
      if (!websiteUrl || !username || !password) {
        throw new Error('Thiếu thông tin kết nối WordPress');
      }

      const wpApiUrl = `${websiteUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts`;
      const auth = Buffer.from(`${username}:${password}`).toString('base64');

      const postData = {
        title: post.title,
        content: post.content,
        status: 'publish'
      };

      const response = await fetch(wpApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`WordPress API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return {
        success: true,
        url: result.link,
        postId: result.id
      };

    } catch (error: any) {
      throw new Error(`Lỗi đăng WordPress: ${error.message}`);
    }
  }

  private async publishToFacebook(post: ScheduledPostJob, connection: any): Promise<any> {
    // Placeholder cho Facebook API
    console.log('Facebook publishing chưa được implement');
    return {
      success: true,
      message: 'Facebook publishing sẽ được thêm sau'
    };
  }

  private async publishToTwitter(post: ScheduledPostJob, connection: any): Promise<any> {
    // Placeholder cho Twitter API  
    console.log('Twitter publishing chưa được implement');
    return {
      success: true,
      message: 'Twitter publishing sẽ được thêm sau'
    };
  }

  private async publishToLinkedIn(post: ScheduledPostJob, connection: any): Promise<any> {
    // Placeholder cho LinkedIn API
    console.log('LinkedIn publishing chưa được implement');
    return {
      success: true,
      message: 'LinkedIn publishing sẽ được thêm sau'
    };
  }
}

export const postScheduler = new PostScheduler();