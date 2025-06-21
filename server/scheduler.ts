import { storage } from './storage';
import { db } from '../db/index';
import { scheduledPosts } from '../shared/schema';
import * as schema from '../shared/schema';
import { eq, and, lte, desc } from 'drizzle-orm';

interface ScheduledPostJob {
  id: number;
  userId: number;
  title: string;
  content: string;
  platforms: any[];
  scheduledTime: Date;
  status: string;
  featuredImage?: string;
  imageUrls?: string[];
  articleId?: number;
}

export class PostScheduler {
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
        .select({
          id: scheduledPosts.id,
          userId: scheduledPosts.userId,
          title: scheduledPosts.title,
          content: scheduledPosts.content,
          featuredImage: scheduledPosts.featuredImage,
          platforms: scheduledPosts.platforms,
          scheduledTime: scheduledPosts.scheduledTime,
          status: scheduledPosts.status
        })
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

  async processPost(post: ScheduledPostJob) {
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
      case 'instagram':
        return await this.publishToInstagram(post, connection);
      default:
        throw new Error(`Platform không được hỗ trợ: ${platform}`);
    }
  }

  private async publishToWordPress(post: ScheduledPostJob, connection: any): Promise<any> {
    // Đối với WordPress, chúng ta cần gọi WordPress REST API
    try {
      // Kiểm tra connection settings chi tiết
      console.log('WordPress connection full data:', JSON.stringify(connection, null, 2));
      
      // Thử nhiều cách truy cập settings
      const settings = connection.settings || connection.connectionData || connection.config || {};
      console.log('Extracted settings:', JSON.stringify(settings, null, 2));
      
      const { websiteUrl, username, password, apiKey, appPassword } = settings;
      
      if (!websiteUrl) {
        throw new Error('WordPress URL chưa được cấu hình trong kết nối này');
      }
      
      // Kiểm tra xác thực: username + (password hoặc appPassword hoặc apiKey)
      if (!username || (!password && !appPassword && !apiKey)) {
        throw new Error('Thông tin xác thực WordPress chưa đầy đủ (cần username và password/app-password)');
      }

      const wpApiUrl = `${websiteUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts`;
      
      // Sử dụng app password nếu có, nếu không thì dùng password thường
      // Loại bỏ dấu cách trong app password vì WordPress thường format có dấu cách
      const cleanAppPassword = appPassword ? appPassword.replace(/\s+/g, '') : '';
      const authPassword = cleanAppPassword || password || 'demo_app_password_123';
      const auth = Buffer.from(`${username}:${authPassword}`).toString('base64');
      
      console.log(`WordPress API attempt: ${wpApiUrl}`);
      console.log(`Auth method: ${appPassword ? 'App Password' : 'Regular Password'}`);
      console.log(`Username: ${username}`);
      console.log(`App Password length: ${appPassword ? appPassword.length : 0}`);
      console.log(`Clean App Password length: ${cleanAppPassword ? cleanAppPassword.length : 0}`);

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
    try {
      const accessToken = connection.accessToken;
      if (!accessToken) {
        throw new Error('Facebook Access Token không được tìm thấy trong kết nối');
      }

      // Get Facebook user/page info first
      const meResponse = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}`);
      if (!meResponse.ok) {
        const errorData = await meResponse.json();
        throw new Error(`Facebook authentication failed: ${errorData.error?.message || 'Invalid token'}`);
      }

      const userData = await meResponse.json();
      console.log('Facebook user data:', userData);

      // Prepare post content
      let postContent = post.content;
      
      // If there are images, we need to handle them
      let images: string[] = [];
      
      // First check for images from the original article if articleId exists
      if (post.articleId) {
        try {
          console.log(`Tìm hình ảnh cho bài viết articleId: ${post.articleId}`);
          const article = await db.query.articles.findFirst({
            where: eq(schema.articles.id, post.articleId),
            with: {
              images: {
                orderBy: [desc(schema.images.createdAt)]
              }
            }
          });
          
          if (article) {
            console.log(`Tìm thấy bài viết: ${article.title}`);
            console.log(`Số lượng hình ảnh từ images relationship: ${article.images?.length || 0}`);
            
            // Get images from images relationship (for Social Media Content)
            if (article.images && article.images.length > 0) {
              images = article.images.map(img => img.imageUrl);
              console.log(`Hình ảnh từ images relationship:`, images);
            }
            
            // Fallback to imageUrls field if no related images
            if (images.length === 0 && Array.isArray(article.imageUrls)) {
              images = article.imageUrls as string[];
              console.log(`Hình ảnh từ imageUrls field:`, images);
            }
          } else {
            console.log(`Không tìm thấy bài viết với articleId: ${post.articleId}`);
          }
        } catch (error) {
          console.error('Error fetching article images:', error);
        }
      }
      
      // Fallback: Check for images in multiple places
      if (images.length === 0) {
        if (Array.isArray(post.imageUrls) && post.imageUrls.length > 0) {
          images = post.imageUrls;
        } else if (post.featuredImage) {
          images = [post.featuredImage];
        } else if (Array.isArray(post.platforms)) {
          // Check if images are stored in platform config
          for (const platform of post.platforms) {
            if (platform.imageUrls && Array.isArray(platform.imageUrls)) {
              images = platform.imageUrls;
              break;
            }
          }
        }
      }
      
      console.log(`Tổng số hình ảnh tìm được: ${images.length}`, images);
      
      if (images.length > 0) {
        // For posts with images, upload photo to Facebook first
        const imageUrl = images[0]; // Use first image for now
        console.log(`Sử dụng hình ảnh đầu tiên để upload lên Facebook: ${imageUrl}`);
        
        try {
          // First, upload the photo to Facebook
          const uploadData = new FormData();
          
          // Fetch the image and upload it
          console.log(`Đang tải hình ảnh từ URL: ${imageUrl}`);
          const imageResponse = await fetch(imageUrl);
          if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image from URL: ${imageResponse.status} ${imageResponse.statusText}`);
          }
          
          console.log(`Hình ảnh tải thành công, kích thước: ${imageResponse.headers.get('content-length')} bytes`);
          const imageBuffer = await imageResponse.arrayBuffer();
          const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' });
          
          uploadData.append('source', imageBlob);
          uploadData.append('message', postContent);
          uploadData.append('access_token', accessToken);

          console.log(`Đang upload hình ảnh lên Facebook cho user ID: ${userData.id}`);
          const photoResponse = await fetch(`https://graph.facebook.com/${userData.id}/photos`, {
            method: 'POST',
            body: uploadData
          });

          console.log(`Facebook photo upload response status: ${photoResponse.status}`);
          if (!photoResponse.ok) {
            const errorData = await photoResponse.json();
            console.error('Facebook photo upload error:', errorData);
            throw new Error(`Facebook photo upload failed: ${errorData.error?.message || 'Unknown error'}`);
          }

          const photoResult = await photoResponse.json();
          console.log('Facebook photo upload success:', photoResult);
          return {
            success: true,
            postId: photoResult.id,
            url: `https://facebook.com/${photoResult.post_id || photoResult.id}`,
            message: 'Đăng Facebook thành công với hình ảnh'
          };
          
        } catch (photoError: any) {
          console.error('Photo upload failed, trying link post:', photoError);
          
          // Fallback: post with image URL
          const postData = {
            message: postContent,
            link: imageUrl,
            access_token: accessToken
          };

          const response = await fetch(`https://graph.facebook.com/${userData.id}/feed`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Facebook post failed: ${errorData.error?.message || 'Unknown error'}`);
          }

          const result = await response.json();
          return {
            success: true,
            postId: result.id,
            url: `https://facebook.com/${result.id}`,
            message: 'Đăng Facebook thành công với link hình ảnh'
          };
        }
        
      } else {
        // Text-only post
        const postData = {
          message: postContent,
          access_token: accessToken
        };

        const response = await fetch(`https://graph.facebook.com/${userData.id}/feed`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Facebook post failed: ${errorData.error?.message || 'Unknown error'}`);
        }

        const result = await response.json();
        return {
          success: true,
          postId: result.id,
          url: `https://facebook.com/${result.id}`,
          message: 'Đăng Facebook thành công'
        };
      }

    } catch (error: any) {
      throw new Error(`Lỗi đăng Facebook: ${error.message}`);
    }
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

  private async publishToInstagram(post: ScheduledPostJob, connection: any): Promise<any> {
    try {
      console.log('Instagram publishing - Connection data:', JSON.stringify(connection, null, 2));
      
      const settings = connection.settings || connection.connectionData || connection.config || {};
      const accessToken = connection.accessToken || settings.accessToken;
      
      if (!accessToken) {
        throw new Error('Access Token không được tìm thấy cho Instagram');
      }

      // Instagram requires images for most posts via Instagram Basic Display API
      // For business accounts, we need Instagram Business API
      
      // First get Instagram account info
      const accountInfoUrl = `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${accessToken}`;
      const accountResponse = await fetch(accountInfoUrl);
      
      if (!accountResponse.ok) {
        const errorData = await accountResponse.json();
        throw new Error(`Instagram account verification failed: ${errorData.error?.message || 'Token không hợp lệ'}`);
      }
      
      const accountData = await accountResponse.json();
      console.log('Instagram account data:', accountData);
      
      // Check if we have images to post
      const imageUrls = Array.isArray(post.imageUrls) ? post.imageUrls : 
                       (post.imageUrls ? [post.imageUrls] : []);
      
      if (imageUrls.length === 0) {
        throw new Error('Instagram yêu cầu ít nhất một hình ảnh để đăng bài');
      }

      // For Instagram Basic Display API, we can only read user's media
      // For posting, we need Instagram Business API or Instagram Graph API
      // This requires a Facebook Page connected to Instagram Business account
      
      if (accountData.account_type === 'BUSINESS') {
        // Use Instagram Business API
        return await this.publishToInstagramBusiness(post, connection, accessToken, accountData);
      } else {
        // Personal accounts cannot post via API
        throw new Error('Instagram cá nhân không hỗ trợ đăng bài qua API. Vui lòng sử dụng Instagram Business account.');
      }
      
    } catch (error: any) {
      console.error('Instagram publishing error:', error);
      throw new Error(`Lỗi đăng Instagram: ${error.message}`);
    }
  }

  private async publishToInstagramBusiness(post: ScheduledPostJob, connection: any, accessToken: string, accountData: any): Promise<any> {
    try {
      const content = post.content || '';
      const imageUrls = Array.isArray(post.imageUrls) ? post.imageUrls : 
                       (post.imageUrls ? [post.imageUrls] : []);
      
      if (imageUrls.length === 0) {
        throw new Error('Instagram Business yêu cầu ít nhất một hình ảnh');
      }

      // Instagram Business API flow:
      // 1. Create media container
      // 2. Publish the container
      
      const imageUrl = imageUrls[0]; // Use first image
      
      // Step 1: Create media container
      const containerData = {
        image_url: imageUrl,
        caption: content,
        access_token: accessToken
      };
      
      const containerResponse = await fetch(`https://graph.facebook.com/v18.0/${accountData.id}/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(containerData)
      });
      
      if (!containerResponse.ok) {
        const errorData = await containerResponse.json();
        throw new Error(`Instagram container creation failed: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const containerResult = await containerResponse.json();
      const containerId = containerResult.id;
      
      // Step 2: Publish the container
      const publishData = {
        creation_id: containerId,
        access_token: accessToken
      };
      
      const publishResponse = await fetch(`https://graph.facebook.com/v18.0/${accountData.id}/media_publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(publishData)
      });
      
      if (!publishResponse.ok) {
        const errorData = await publishResponse.json();
        throw new Error(`Instagram publish failed: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const publishResult = await publishResponse.json();
      
      return {
        success: true,
        postId: publishResult.id,
        url: `https://instagram.com/p/${publishResult.id}`,
        message: 'Đăng Instagram thành công'
      };
      
    } catch (error: any) {
      throw new Error(`Instagram Business posting error: ${error.message}`);
    }
  }
}

export const postScheduler = new PostScheduler();