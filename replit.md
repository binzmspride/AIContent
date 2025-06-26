# SEO AI Writer - Replit Configuration

## Overview

SEO AI Writer is a full-stack web application designed to help users create SEO-optimized content using artificial intelligence. The platform provides AI-powered content generation, SEO optimization tools, multi-language support, and collaborative features for teams and individuals.

## System Architecture

The application follows a modern three-tier architecture:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Components**: Custom components built with Radix UI primitives using shadcn/ui approach
- **Styling**: TailwindCSS for utility-first styling with dark/light theme support
- **State Management**: React Query for server state, React Context for global app state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Internationalization**: Custom i18n implementation supporting Vietnamese and English

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript
- **Authentication**: Passport.js with local strategy and session management
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Email Service**: Nodemailer with SMTP configuration
- **File Processing**: Built-in content generation and image handling

### Database Architecture
- **Database**: PostgreSQL 16
- **Connection**: Connection pooling with pg driver
- **Migrations**: Drizzle Kit for schema management
- **Session Store**: PostgreSQL-based session storage

## Key Components

### User Management System
- User registration and authentication with email verification
- Role-based access control (admin/user)
- Password reset functionality
- Credit-based usage system
- Multi-language user preferences

### Content Generation Engine
- AI-powered article generation with multiple providers (OpenAI, Claude, Gemini)
- SEO optimization with keyword analysis
- Multiple content types (blog, product, news, social)
- Customizable tone and complexity levels
- Image generation integration via webhook API

### Article Management
- CRUD operations for articles
- Content separation (text content vs. images)
- Draft and published states
- User-specific article libraries
- SEO metadata management

### Plan and Credit System
- Multiple subscription plans (free, basic, professional, enterprise)
- Credit-based usage tracking
- Plan assignment and management
- Transaction history

### Integration System
- Social media connections (WordPress, Facebook, Twitter, LinkedIn)
- Scheduled posting functionality
- API key management for third-party integrations
- Webhook support for external services

### Admin Panel
- User management with role assignment
- Plan and pricing management
- System settings configuration
- Analytics and reporting

## Data Flow

1. **User Authentication Flow**:
   - User registers → Email verification → Account activation → Dashboard access
   - Login → Session creation → Protected route access

2. **Content Generation Flow**:
   - User submits content request → Credit validation → AI processing → Content generation → Article creation

3. **Image Generation Flow**:
   - User requests image → Webhook call to external service → Image URL return → Database storage

4. **Publishing Flow**:
   - User creates content → SEO optimization → Social connection → Scheduled posting

## External Dependencies

### Required Environment Variables
- **Database**: PostgreSQL connection string
- **Email**: SMTP configuration for notifications
- **Webhooks**: External image generation service
- **Security**: JWT secrets and session keys

### Third-Party Integrations
- **AI Providers**: OpenAI, Claude, Gemini APIs
- **Social Platforms**: Facebook, Twitter, LinkedIn APIs
- **Email Service**: SendGrid or SMTP providers
- **Content Management**: WordPress API integration

### NPM Dependencies
- **Core**: React, Express, TypeScript, Drizzle ORM
- **UI**: Radix UI, TailwindCSS, Lucide icons
- **Utilities**: Date-fns, Zod validation, React Query
- **Authentication**: Passport.js, bcrypt
- **Development**: Vite, ESBuild

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20
- **Database**: PostgreSQL 16 module
- **Development Server**: Vite with HMR
- **Port Configuration**: 5000 (backend), auto-assigned (frontend)

### Production Deployment
- **Target**: Replit Autoscale deployment
- **Build Process**: Vite build + ESBuild server bundling
- **Database**: PostgreSQL with SSL in production
- **Environment**: Production environment variables

### Database Management
- **Schema**: Managed via Drizzle migrations
- **Seeding**: Admin user and default plans creation
- **Backup**: Handled by deployment platform

## Changelog

- June 26, 2025: Completed comprehensive translation implementation for Format, Links, and Media tabs in content creation page - systematically replaced all remaining hardcoded Vietnamese text with proper translation keys. Format tab now includes "In đậm" (Bold), "In nghiêng" (Italic), "Liệt kê" (Bullet Points), and "Add Section Headings" with proper descriptions. Links tab includes "Danh sách liên kết" (Link List), "Từ khóa" (Keyword), "Liên kết" (Link), and "Thêm liên kết" (Add Link). Media tab includes "Hình ảnh cho bài viết" (Images for Article), "Kích thước hình ảnh" (Image Size), size options (Small/Medium/Large), and "Tạo hình ảnh tự động" (Auto Generate Images). Content creation interface now has complete bilingual support across all tabs.
- June 26, 2025: Completed Knowledge tab translation implementation in content creation page - replaced all hardcoded Vietnamese text with proper translation keys including "Kiến thức chuyên môn" (Professional Knowledge), "Sử dụng nghiên cứu web" (Use Web Research), "Nguồn tham khảo" (Reference Sources), and "Mô hình AI" (AI Model) with their descriptions and placeholders. Added comprehensive translation keys to LanguageProvider for both Vietnamese and English. All content creation interface elements now properly switch between languages including the Knowledge tab content.
- June 26, 2025: Completed comprehensive translation system implementation - fixed all remaining hardcoded Vietnamese text throughout dashboard interface, including header credits display, dashboard stats, and mascot helper messages. Replaced "tín dụng" in header with proper translation key, updated dashboard stats to use dynamic translations for credits/images created/navigation links, and added complete bilingual support for mascot welcome messages and tips. Dashboard now properly switches between Vietnamese and English for all interface elements including the top-right credits counter.
- June 26, 2025: Implemented dynamic sidebar menu management system - created comprehensive admin interface at /admin/sidebar-menu for controlling user dashboard navigation. Added sidebar_menu_items database table with role-based visibility controls, multi-language support (Vietnamese/English labels), and sorting functionality. Updated user sidebar to dynamically fetch enabled menu items from admin configuration instead of hardcoded array. Includes complete CRUD operations, icon mapping system, and 13 default menu items covering all major dashboard features. Refined UI by removing background colors from Key, Icon, and Path columns for cleaner appearance.
- June 26, 2025: Fixed language switcher display logic - changed from showing opposite language to showing current language (VN when Vietnamese active, EN when English active) for better user clarity.
- June 26, 2025: Fixed credits page localization and balance display - changed page title from "credits" to "Tín dụng", corrected balance showing actual 745 credits instead of 0, updated auth hook to handle nested API response structure properly.
- June 26, 2025: Enhanced dashboard interface with improved navigation - replaced "Dung lượng sử dụng" section with "Hình ảnh đã tạo" showing total images count, added clickable cards that navigate to "Bài viết của tôi" and "Thư viện hình ảnh" pages, improved user experience with hover effects and direct navigation links.
- June 26, 2025: Fixed dashboard stats display issue - corrected React Query data access pattern for nested API responses. Dashboard now properly shows user credits (745) and articles count (58) instead of displaying zeros. Updated both stats and articles queries to handle {success, data} response structure correctly.
- June 21, 2025: Fixed content creation JSON payload structure - updated GenerateContentRequest interface and form submission to match expected webhook format with proper field mapping (keywords, mainKeyword, secondaryKeywords, length, tone, prompt, addHeadings, useBold, useItalic, useBullets, relatedKeywords, language, country, perspective, complexity, useWebResearch, refSources, aiModel, linkItems, imageSize, generateImages, image_size, userId, username, timestamp).
- June 21, 2025: Implemented complete Instagram posting functionality for both scheduled posts and immediate publishing - added Instagram Business API integration supporting two-step publishing process (container creation + publish). System now validates Business account requirements, checks image availability (required for Instagram), and provides proper error messages for personal accounts. Supports both scheduler workflow and immediate publish-now endpoints with comprehensive error handling.
- June 20, 2025: Enhanced scheduled posts interface with article image preview for both create and edit dialogs - added image gallery display showing up to 4 images in 2x2 grid with #132639 background theme consistency. Images shown from both imageUrls field and images table relationships. Improved Facebook publishing with direct image upload functionality instead of URL sharing, supporting both featuredImage and imageUrls fields with proper fallback mechanisms.
- June 20, 2025: Implemented complete Facebook publishing functionality for scheduled posts - replaced placeholder code with real Facebook Graph API integration in both scheduler and publish-now endpoints. Users can now schedule posts to Facebook using configured Access Tokens, supporting both text-only and image posts. Publishing system validates tokens, handles errors properly, and returns actual Facebook post URLs.
- June 20, 2025: Enhanced social media connection system with comprehensive test functionality and user guidance - implemented Facebook, LinkedIn, Twitter, and Instagram API testing using proper authentication methods. Added detailed Facebook Access Token guidance in both create and edit forms with step-by-step instructions and expiration warnings. Fixed TypeScript interface to include accessToken property. Form now saves actual Access Tokens for posting functionality while maintaining simplified UI.
- June 20, 2025: Converted social media connection forms to exact n8n workflow interface - implemented complete n8n-style UI with Credential dropdown, Host URL, HTTP Request Method, Graph API Version, Node/Edge fields, SSL/Binary switches, and orange "Test step" button. Removed Account ID and Refresh Token fields to match n8n exactly. WordPress connections unchanged.
- June 19, 2025: Added refresh icon button in Social Media Content step 2 editing area - small refresh button appears next to each platform tab for easy content regeneration
- June 19, 2025: Added "Tạo lại nội dung" (Regenerate content) button to Social Media Content step 2 - allows users to regenerate content if not satisfied with current results
- June 19, 2025: Fixed genSEO logic for existing articles - when contentSource is 'existing-article', genSEO is always forced to false in both frontend (step 2 generation) and backend webhook payload
- June 19, 2025: Consolidated dual-payload system into single payload for social media content generation - combined frontend data (extractedContent, platforms, contentSource, selectedArticleId) with webhook flags (post_to_*) into one unified request to external webhook
- June 18, 2025: Simplified "Create new SEO article" form to only require keywords and topic fields - removed title and content type fields based on user feedback for streamlined workflow
- June 18, 2025: Enhanced content formatting in Social Media Content workflow - implemented markdown to HTML conversion for ReactQuill editor, ensuring proper line breaks, bold/italic text, and bullet point lists display correctly instead of plain text
- June 18, 2025: Fixed content extraction display formatting in Social Media Content creation - added proper markdown rendering with line breaks, bold/italic formatting, and bullet points preservation instead of plain text display
- June 18, 2025: Added back "Hình ảnh được chọn" section with improved single-column layout - displays selected images in vertical stack with click-to-preview functionality and hover-to-delete button for better user experience
- June 18, 2025: Optimized image section in social media content editing - merged two separate "Hình ảnh được chọn" sections into one unified interface with preview button, improved layout consistency and reduced interface complexity
- June 18, 2025: Completed specialized social media content editing functionality - fixed route parameter handling with useParams hook, added robust error handling for data loading, implemented retry logic for database timeouts, created specialized editing interface with ReactQuill rich text editor, integrated platform-specific preview dialogs for Facebook/Instagram/Twitter/LinkedIn, and ensured proper content and image loading from creation workflow
- June 18, 2025: Completed adaptive UI theme switcher with playful animations - implemented AdaptiveThemeSwitcher and FloatingThemeOrb components with smooth transitions, multiple variants (default, icon, outline), size options (sm, md, lg), and interactive animations (sparkle, pulse, float). Added comprehensive theme demo page at /dashboard/theme-demo showcasing all features
- June 18, 2025: Enhanced Social Media Content completion flow - changed "Về Dashboard" button to "Xem bài viết" that navigates directly to the created article in "Bài viết của tôi", providing seamless content viewing experience after wizard completion
- June 18, 2025: Integrated image generation webhook and enhanced save functionality - connected Step 3 image generation to official `/api/dashboard/images/generate` endpoint, updated save process to include selected images with proper database associations, ensuring complete content and image preservation
- June 18, 2025: Removed TikTok option and redesigned platform selection layout - removed TikTok from platform options, improved 2x2 grid layout with enhanced visual effects, hover animations, and selection indicators for Facebook, Instagram, LinkedIn, and Twitter/X
- June 18, 2025: Fixed social media preview button color issue - applied inline styles to override shadcn/ui CSS selector conflicts, ensuring all preview buttons display with transparent backgrounds instead of blue (#3182ce) in both light and dark modes
- June 18, 2025: Fixed dark mode UI issues - changed preview button backgrounds from blue to transparent with proper hover states for better dark mode compatibility  
- June 18, 2025: UI refinement for Social Media Content wizard - removed "Nội dung đã trích xuất" section from step 2 and cleaned up step titles by removing "(tùy chọn)" text for cleaner interface
- June 18, 2025: Enhanced Social Media Content platform previews with improved dark mode support - fixed text and border colors for Instagram, Facebook, LinkedIn, and Twitter/X previews to ensure proper contrast and readability
- June 18, 2025: Completed bidirectional navigation for Social Media Content wizard - added both "Quay lại" (Back) and "Tiếp theo" (Next) buttons for seamless navigation between steps, plus 5 sample images added to image library
- June 18, 2025: Enhanced Social Media Content creation with advanced image management - added React Quill rich text editor, "Re-extract" button, and comprehensive image options (library selection, AI generation, file upload) with preview functionality
- June 17, 2025: Fixed URL Website field not saving in WordPress connection edit form - corrected field name mapping between form input and data storage
- June 17, 2025: Enhanced "Test Connection" feature with debug logging and improved Application Password handling - better error diagnostics for WordPress connections
- June 17, 2025: Fixed social connections list not updating after creating new connections - corrected data structure handling and TypeScript typing
- June 16, 2025: Completed scheduled posts feature with article selection, social media integration, and proper sidebar navigation  
- June 16, 2025: Removed Access Token and Refresh Token fields from WordPress connection forms - simplified authentication to use only Username and Application Password
- June 15, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.