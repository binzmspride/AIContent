# Architecture Overview

## Overview

SEO AI Writer is a full-stack web application designed to help users create SEO-optimized content using AI. The application follows a modern client-server architecture with a React frontend, Express.js backend, and PostgreSQL database. This document outlines the high-level architectural decisions and components that make up the system.

## System Architecture

The application follows a typical three-tier architecture:

1. **Frontend Tier**: React-based single-page application (SPA)
2. **Backend Tier**: Node.js Express server 
3. **Data Tier**: PostgreSQL database accessed via Drizzle ORM

### Architecture Diagram

```
┌───────────────────┐      ┌────────────────────┐      ┌──────────────────┐
│                   │      │                    │      │                  │
│   Client (React)  │<─────│  Express Server    │<─────│  PostgreSQL DB   │
│                   │      │                    │      │                  │
└───────────────────┘      └────────────────────┘      └──────────────────┘
         │                          │                          │
         │                          │                          │
         ▼                          ▼                          ▼
┌───────────────────┐      ┌────────────────────┐      ┌──────────────────┐
│ UI Components     │      │ REST API Endpoints  │      │ Database Schema  │
│ State Management  │      │ Authentication      │      │ - users          │
│ Routing (wouter)  │      │ Email Services      │      │ - plans          │
│ API Integration   │      │ Content Generation  │      │ - articles       │
└───────────────────┘      └────────────────────┘      └──────────────────┘
```

## Key Components

### Frontend

1. **UI Framework**: React with TypeScript
2. **Component Library**: Custom components built with Radix UI primitives using the shadcn/ui approach
3. **Styling**: TailwindCSS for utility-first styling
4. **State Management**: React Query for server state, React Context for global app state
5. **Routing**: Wouter for lightweight client-side routing
6. **Form Handling**: React Hook Form with Zod validation
7. **API Communication**: Fetch API with custom wrapper functions
8. **Internationalization**: Custom i18n implementation using React Context
9. **Theming**: Light/dark mode support with theme provider

### Backend

1. **Web Server**: Express.js with TypeScript
2. **Authentication**: Passport.js with session-based authentication
3. **Database ORM**: Drizzle ORM for type-safe database access
4. **Email Service**: Configurable email service using Nodemailer
5. **Session Management**: express-session with PostgreSQL session store
6. **Security**: CSRF protection, secure cookies, and password hashing

### Database

1. **Database Engine**: PostgreSQL via Neon Serverless
2. **Schema Management**: Drizzle ORM with migrations
3. **Key Entities**:
   - Users (authentication, profile, credits)
   - Articles (content generation)
   - Plans (subscription/credit plans)
   - Connections (external service integrations)

## Data Flow

### Authentication Flow

1. User submits login credentials
2. Server validates credentials and creates a session
3. Session ID is stored in a cookie on the client
4. Subsequent requests include the session cookie
5. Server validates the session and retrieves user data

### Content Generation Flow

1. User inputs content requirements (title, keywords, tone, etc.)
2. Client sends generation request to the API
3. Server validates user credits and permissions
4. Server processes the content generation request
5. Generated content is returned to the client and stored in the database
6. User credits are deducted based on usage

### Integration Flow

1. User configures third-party connections (WordPress, social media)
2. Connection credentials are securely stored
3. User can select destination for generated content
4. On publish, content is formatted and sent to selected platforms

## External Dependencies

### Frontend Dependencies

- **@radix-ui/***: UI primitives for accessible component building
- **@tanstack/react-query**: Data fetching and caching
- **@hookform/resolvers**: Form validation utilities
- **wouter**: Lightweight routing library
- **zod**: Schema validation
- **recharts**: Data visualization

### Backend Dependencies

- **express**: Web server framework
- **passport**: Authentication middleware
- **nodemailer**: Email sending capabilities
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Modern TypeScript ORM
- **connect-pg-simple**: PostgreSQL session store

### API Integrations

- **Email Delivery**: Configurable SMTP or third-party services
- **WordPress**: Content management system integration
- **Social Media Platforms**: Facebook, Twitter, TikTok

## Deployment Strategy

The application is designed to be deployed in a modern cloud environment:

1. **Development Environment**: Local development with Vite dev server
2. **Build Process**: Vite for frontend, esbuild for backend
3. **Deployment Target**: Replit environment (configured in .replit)
4. **Database**: Neon PostgreSQL serverless database
5. **Static Assets**: Served from the Express server after production build

### Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Replit Environment                │
│                                                     │
│   ┌─────────────┐          ┌────────────────┐       │
│   │             │          │                │       │
│   │  Express    │◄─────────┤  Static Assets │       │
│   │  Server     │          │  (dist/public) │       │
│   │             │          │                │       │
│   └──────┬──────┘          └────────────────┘       │
│          │                                          │
└──────────┼──────────────────────────────────────────┘
           │
           ▼
┌─────────────────────┐
│                     │
│  Neon PostgreSQL    │
│  (External Service) │
│                     │
└─────────────────────┘
```

## Development Workflow

1. **Local Development**: `npm run dev` runs the development server with hot reloading
2. **Database Schema Changes**: `npm run db:push` updates the database schema
3. **Database Seeding**: `npm run db:seed` populates test data
4. **Production Build**: `npm run build` builds both frontend and backend
5. **Production Start**: `npm run start` runs the production server

## Security Considerations

1. **Authentication**: Secure password hashing with scrypt
2. **Session Management**: HttpOnly cookies with secure flag in production
3. **CSRF Protection**: Token-based CSRF protection
4. **Input Validation**: Client and server-side validation with Zod
5. **Sensitive Data**: Encrypted storage of third-party credentials

## Scalability Considerations

1. **Serverless Database**: Neon PostgreSQL provides auto-scaling
2. **Stateless Backend**: Facilitates horizontal scaling
3. **API Rate Limiting**: Prevents abuse of resources
4. **Resource Optimization**: Efficient credit usage tracking and management

## Internationalization Strategy

1. **Language Files**: Separate files for different languages (vi, en)
2. **Translation Context**: React context for language state management
3. **User Preference**: Stored in user profile and local storage
4. **Dynamic Content**: All UI text is loaded from translation files

## Future Architecture Considerations

1. **Microservices**: Potential split into content generation service and user management services
2. **Caching Layer**: Redis or similar for performance optimization
3. **CDN Integration**: For static asset delivery
4. **Serverless Functions**: For compute-intensive operations