import { db } from './db/index.js';
import { sql } from 'drizzle-orm';

async function addContentSeparation() {
  try {
    console.log('Adding text_content and image_urls columns to articles table...');
    
    // Add new columns to articles table
    await db.execute(sql`
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS text_content TEXT,
      ADD COLUMN IF NOT EXISTS image_urls JSONB
    `);
    
    console.log('✅ Successfully added new columns to articles table');
    
    // Update existing articles to populate the new fields
    console.log('Updating existing articles to separate content and images...');
    
    const articles = await db.execute(sql`SELECT id, content FROM articles`);
    
    for (const article of articles) {
      // Extract images from content
      const content = article.content || '';
      const imageRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
      const images = [];
      let match;
      
      while ((match = imageRegex.exec(content)) !== null) {
        images.push(match[1]);
      }
      
      // Remove img tags from content to get text content
      const textContent = content.replace(/<img[^>]*>/g, '').trim();
      
      // Update the article with separated content
      await db.execute(sql`
        UPDATE articles 
        SET text_content = ${textContent}, 
            image_urls = ${JSON.stringify(images)}
        WHERE id = ${article.id}
      `);
    }
    
    console.log(`✅ Updated ${articles.length} articles with separated content and images`);
    
  } catch (error) {
    console.error('❌ Error adding content separation:', error);
  } finally {
    process.exit(0);
  }
}

addContentSeparation();