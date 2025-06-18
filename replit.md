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