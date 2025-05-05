export const en = {
  // Common
  common: {
    appName: "SEO AI Writer",
    loading: "Loading...",
    error: "An error occurred. Please try again.",
    success: "Success!",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    back: "Back",
    next: "Next",
    submit: "Submit",
    language: "EN",
  },

  // Navigation
  nav: {
    features: "Features",
    pricing: "Pricing",
    faq: "FAQ",
    contact: "Contact",
    login: "Login",
    register: "Register",
    dashboard: "Dashboard",
    logout: "Logout",
  },

  // Landing page
  landing: {
    hero: {
      title: "Create SEO-optimized content automatically with AI",
      subtitle: "High-quality content service, SEO optimized for your website and social media in just minutes.",
      tryFree: "Try for free",
      viewDemo: "View demo",
    },
    features: {
      title: "Key Features",
      subtitle: "All the tools you need to create and manage high-quality SEO content",
      items: [
        {
          title: "Create Articles with AI",
          description: "Use advanced AI technology to create high-quality content that meets your SEO requirements."
        },
        {
          title: "SEO Optimization",
          description: "Content is automatically optimized with keywords, meta tags, and structure that meets modern SEO standards."
        },
        {
          title: "Automatic WordPress Publishing",
          description: "Connect and automatically post to your WordPress website, saving processing time."
        },
        {
          title: "Share to Social Media",
          description: "Post articles directly to Facebook, TikTok and other social media platforms."
        },
        {
          title: "Multilingual Support",
          description: "Create content in Vietnamese or English, with fully localized interface."
        },
        {
          title: "Performance Analysis",
          description: "Track content performance with detailed reports and improvement suggestions."
        }
      ]
    },
    pricing: {
      title: "Service Pricing",
      subtitle: "Choose a plan that fits your needs",
      creditPlans: "Content Creation Credit Packages",
      storagePlans: "Content Storage Packages",
      buyNow: "Buy Now",
      subscribe: "Subscribe",
      popular: "MOST POPULAR",
      features: {
        credits: "content creation credits",
        wordsPerCredit: "words per article",
        seoOptimization: "SEO optimization",
        support: "technical support",
        saving: "saving compared to Basic",
        maxArticles: "maximum articles",
        storage: "storage capacity",
        backup: "data backup",
        wpConnections: "WordPress account connections",
        socialConnect: "social media connections",
        apiAccess: "system integration API"
      }
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Information you need to know about our service",
      questions: [
        {
          question: "Is the generated content SEO optimized?",
          answer: "Yes, all generated content is optimized for SEO. Our AI system is trained to create SEO-standard content with proper structure, relevant keywords, meta tags, and other on-page SEO elements."
        },
        {
          question: "How do I connect with my WordPress site?",
          answer: "To connect with WordPress, you need to provide your website URL, username, and Application Password from WordPress. After connecting, you can post articles directly from our platform to your WordPress site with just one click."
        },
        {
          question: "Do credits have an expiration date?",
          answer: "Credits do not have an expiration date and will be stored in your account until you use them up. You can purchase additional credits anytime when needed."
        },
        {
          question: "Can I request a refund?",
          answer: "We have a 7-day refund policy if you are not satisfied with the service. However, refunds only apply to unused credits."
        },
        {
          question: "Is the generated content duplicate?",
          answer: "No, our AI system creates unique content for each request. We also apply plagiarism checking technology to ensure content is not duplicated with other sources on the internet."
        }
      ]
    },
    contact: {
      title: "Contact Us",
      subtitle: "Have questions or need support? Get in touch with us!",
      form: {
        name: "Full Name",
        email: "Email",
        subject: "Subject",
        message: "Message",
        send: "Send Message"
      }
    },
    footer: {
      description: "Vietnam's leading AI SEO content generation service.",
      copyright: "© 2023 SEO AI Writer. All rights reserved.",
      links: {
        product: "Product",
        company: "Company",
        support: "Support",
        createSeoContent: "Create SEO content",
        wordpressConnect: "WordPress connection",
        socialShare: "Social media sharing",
        seoAnalysis: "SEO analysis",
        about: "About us",
        blog: "Blog",
        partners: "Partners",
        careers: "Careers",
        helpCenter: "Help center",
        terms: "Terms of service",
        privacy: "Privacy policy",
        contact: "Contact"
      }
    }
  },

  // Auth page
  auth: {
    login: {
      title: "Log in to your account",
      switchToRegister: "create a new account",
      email: "Email",
      password: "Password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      submit: "Login",
      orContinueWith: "Or continue with"
    },
    register: {
      title: "Create a new account",
      switchToLogin: "log in",
      name: "Full Name",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      termsAgree: "I agree to the",
      terms: "Terms",
      and: "and",
      privacy: "Privacy Policy",
      submit: "Register",
      orContinueWith: "Or continue with"
    }
  },

  // Dashboard
  dashboard: {
    overview: "Overview",
    createContent: "Create Content",
    myArticles: "My Articles",
    creditsMenu: "Credits",
    plansMenu: "Subscription Plans",
    connectionsMenu: "Account Connections",
    settingsMenu: "Settings",
    stats: {
      creditsLeft: "Credits left",
      buyMoreCredits: "Buy more credits",
      articlesCreated: "Articles created",
      storageUsed: "Storage used",
      recentArticles: "Recent Articles",
      connections: "Account Connections",
      manageConnections: "Manage connections",
      articleTitle: "Title",
      dateCreated: "Date created",
      status: "Status",
      keywords: "Keywords",
      actions: "Actions"
    },
    create: {
      title: "Create New Content",
      form: {
        articleTitle: "Article Title",
        contentType: "Content Type",
        keywords: "Main Keywords (separated by commas)",
        length: "Article Length",
        tone: "Tone",
        prompt: "Detailed Content Description",
        addHeadings: "Automatically add appropriate headings (H2, H3)",
        saveDraft: "Save Draft",
        generate: "Generate Content",
        lengthOptions: {
          short: "Short (~500 words - 1 credit)",
          medium: "Medium (~1000 words - 1 credit)",
          long: "Long (~1500 words - 2 credits)",
          extraLong: "Very Long (~2000 words - 3 credits)"
        },
        toneOptions: {
          professional: "Professional",
          conversational: "Conversational",
          informative: "Informative",
          persuasive: "Persuasive",
          humorous: "Humorous"
        },
        contentTypeOptions: {
          blog: "Blog Post",
          product: "Product Description",
          news: "News Article",
          social: "Social Media Post"
        }
      },
      result: {
        title: "Result",
        copy: "Copy",
        download: "Download",
        publishTo: "Publish to platform",
        editArticle: "Edit article",
        notConnected: "Not connected"
      }
    },
    connections: {
      title: "Account Connections",
      wordpress: {
        title: "WordPress",
        description: "Connect to your WordPress website to post articles automatically",
        connected: "Connected",
        connect: "Connect",
        connectedSites: "Connected websites",
        addNew: "Add new website",
        testConnection: "Test connection",
        disconnect: "Disconnect",
        form: {
          websiteUrl: "Website URL",
          username: "Username",
          appPassword: "Application Password",
          appPasswordHelp: "Guide to creating Application Password in WordPress",
          connect: "Connect WordPress"
        }
      },
      social: {
        title: "Social Media Connections",
        facebook: {
          title: "Facebook",
          description: "Post articles to personal profile or Fanpage"
        },
        tiktok: {
          title: "TikTok",
          description: "Post articles to TikTok account"
        },
        twitter: {
          title: "X (Twitter)",
          description: "Post articles to X/Twitter account"
        },
        connected: "Connected",
        connect: "Connect",
        disconnect: "Disconnect"
      },
      webhook: {
        title: "API Webhook",
        description: "Set up n8n webhook for AI content generation",
        webhookUrl: "Webhook URL",
        active: "Active",
        info: "This webhook is used to connect to n8n workflow for AI content generation. Make sure you have configured the n8n workflow correctly and keep this URL secure.",
        regenerate: "Regenerate webhook"
      }
    },
    credits: {
      title: "Credits",
      currentBalance: "Current balance",
      history: "Purchase history",
      buyMore: "Buy more credits",
      date: "Date",
      description: "Description",
      amount: "Amount",
      packages: {
        title: "Credit Packages",
        basic: "Basic Package",
        advanced: "Advanced Package",
        professional: "Professional Package"
      }
    },
    articles: {
      title: "My Articles",
      search: "Search articles...",
      filter: "Filter",
      sort: "Sort",
      newArticle: "New Article",
      columns: {
        title: "Title",
        createdAt: "Created At",
        status: "Status",
        keywords: "Keywords",
        actions: "Actions"
      },
      statuses: {
        all: "All",
        draft: "Draft",
        published: "Published",
        wordpress: "Published to WordPress",
        facebook: "Published to Facebook",
        tiktok: "Published to TikTok",
        twitter: "Published to Twitter"
      }
    },
    plans: {
      title: "Subscription Plans",
      currentPlan: "Current Plan",
      expiresOn: "Expires on",
      upgrade: "Upgrade",
      renew: "Renew",
      creditPackages: "Credit Packages",
      storagePackages: "Storage Packages",
      features: "Features",
      pricing: "Pricing",
      buy: "Buy",
      subscribe: "Subscribe"
    },
    settings: {
      title: "Settings",
      profile: {
        title: "Profile Information",
        fullName: "Full Name",
        email: "Email",
        save: "Save Changes"
      },
      password: {
        title: "Change Password",
        current: "Current Password",
        new: "New Password",
        confirm: "Confirm New Password",
        update: "Update Password"
      },
      preferences: {
        title: "Preferences",
        language: "Language",
        languages: {
          vietnamese: "Vietnamese",
          english: "English"
        },
        theme: "Theme",
        themes: {
          light: "Light",
          dark: "Dark",
          system: "System"
        },
        save: "Save Preferences"
      }
    }
  },

  // Admin
  admin: {
    dashboard: "Dashboard",
    users: "Users",
    articles: "Articles",
    plans: "Plans",
    payments: "Payments",
    performance: "Performance",
    integrations: "Integrations",
    history: "History",
    settings: {
      title: "System Settings",
      general: "General Settings",
      generalDescription: "Configure basic application information",
      ai: "AI Settings",
      email: "Email Settings",
      api: "API Settings", 
      webhook: "Webhook Settings",
      system: "System Information",
      systemStatus: "System Status",
      webhookDescription: "Configure webhooks for n8n and other services",
      apiDescription: "Configure connections to external API services",
      emailDescription: "Configure email server and settings",
      aiDescription: "Configure AI models and settings",
      siteName: "Site Name",
      siteDescription: "Site Description",
      contactEmail: "Contact Email",
      supportEmail: "Support Email",
      enableNewUsers: "Enable New Registrations",
      enableNewUsersDescription: "Allow new users to register accounts",
      enableArticleCreation: "Enable Article Creation",
      enableArticleCreationDescription: "Allow users to create new articles",
      enableAutoPublish: "Enable Auto-Publishing",
      enableAutoPublishDescription: "Allow automatic publishing to platforms",
      maintenanceMode: "Maintenance Mode",
      maintenanceModeDescription: "Only administrators can access the website",
      version: "Version",
      database: "Database",
      lastBackup: "Last Backup",
      backupNow: "Backup Now",
      backingUp: "Backing up...",
      testEmailTitle: "Test Email Settings",
      testEmailPlaceholder: "Enter email to test",
      testEmailButton: "Send Test Email",
      sendingTest: "Sending...",
      emailTestSuccess: "Success",
      emailTestSuccessDesc: "Test email has been sent successfully",
      emailTestFailed: "Failed",
      emailTestFailedDesc: "Could not send test email. Please check your settings.",
      emailRequired: "Please enter an email address for testing",
      webhookSecret: "Webhook Secret",
      notificationWebhook: "Notification Webhook (n8n)",
      webhookSecretDescription: "Secret key to authenticate webhooks, starting with 'whsec_'",
      notificationWebhookDescription: "Webhook URL to receive system event notifications",
      availableWebhookEvents: "Available Webhook Events",
      aiApiKeys: "AI API Keys",
      openaiApiKey: "OpenAI API Key",
      openaiApiKeyDescription: "API Key for OpenAI GPT (starts with 'sk-')",
      claudeApiKey: "Claude API Key (Anthropic)",
      claudeApiKeyDescription: "API Key for Anthropic Claude (optional)",
      wordpressSettings: "WordPress Settings",
      wordpressApiUrl: "WordPress API URL",
      wordpressApiUrlDescription: "Your WordPress REST API base URL",
      wordpressApiUser: "WordPress Username",
      wordpressApiKey: "WordPress Application Password",
    },
    stats: {
      totalUsers: "Total Users",
      totalArticles: "Total Articles",
      totalCredits: "Total Credits Sold",
      totalRevenue: "Total Revenue",
      recentUsers: "Recent Users",
      recentTransactions: "Recent Transactions"
    },
    performanceMetrics: {
      title: "System Performance",
      description: "Monitor system performance and optimize application responsiveness.",
      metrics: "Performance Metrics",
      timeRange: "Time Range",
      selectTimeRange: "Select time range",
      responseTime: "Response Time",
      requests: "Requests",
      cpuMemory: "CPU & Memory",
      diskUsage: "Disk Usage",
      responseTimeHistory: "Response Time History",
      requestsHistory: "Requests History",
      resourceUsage: "Resource Usage",
      endpointPerformance: "API Performance",
      endpoint: "Endpoint",
      requestCount: "Request Count",
      avgResponseTime: "Avg Response Time",
      errorRate: "Error Rate",
      last6h: "Last 6 hours",
      last12h: "Last 12 hours",
      last24h: "Last 24 hours",
      last7d: "Last 7 days",
      last30d: "Last 30 days",
    },
    user: {
      id: "ID",
      username: "Username",
      email: "Email",
      fullName: "Full Name",
      role: "Role",
      credits: "Credits",
      joinDate: "Join Date",
      actions: "Actions",
      addCredits: "Add Credits",
      createUser: "Create User",
      editUser: "Edit User"
    }
  }
};
