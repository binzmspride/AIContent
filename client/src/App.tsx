import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { FloatingThemeIndicator } from "@/components/common/FloatingThemeIndicator";
import { FeedbackButton } from "@/components/FeedbackButton";
import { useEffect } from "react";
import { useLocation } from "wouter";

import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import CreateContent from "@/pages/dashboard/create-content";
import CreateImage from "@/pages/dashboard/create-image";
import ImageLibrary from "@/pages/dashboard/image-library";
import CreateSocialContent from "@/pages/dashboard/create-social-content";
import BrandGuidelines from "@/pages/dashboard/brand-guidelines";
import MyArticles from "@/pages/dashboard/my-articles";
import Credits from "@/pages/dashboard/credits";
import Plans from "@/pages/dashboard/plans";
import Connections from "@/pages/dashboard/connections";
import Settings from "@/pages/dashboard/settings";
import ApiKeys from "@/pages/dashboard/api-keys";
import AIApiKeys from "@/pages/dashboard/ai-api-keys";
import ContentSeparation from "@/pages/dashboard/content-separation";
import Analytics from "@/pages/dashboard/analytics";
import SEOTools from "@/pages/dashboard/seo-tools";
import Templates from "@/pages/dashboard/templates";

import Translations from "@/pages/dashboard/translations";
import Notifications from "@/pages/dashboard/notifications";
import Scheduler from "@/pages/dashboard/scheduler";
import Feedback from "@/pages/dashboard/feedback";
import EditArticle from "@/pages/dashboard/edit-article";
import ScheduledPosts from "@/pages/dashboard/scheduled-posts";
import SocialConnections from "@/pages/dashboard/social-connections";
import Article from "@/pages/article";
import VerifyEmail from "@/pages/verify-email";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import ApiDocs from "@/pages/api-docs";
import AdminDashboard from "@/pages/admin";
import AdminUsers from "@/pages/admin/users";
import AdminArticles from "@/pages/admin/articles";
import AdminPlans from "@/pages/admin/plans";
import AdminPayments from "@/pages/admin/payments";
import AdminIntegrations from "@/pages/admin/integrations-fixed";
import AdminHistory from "@/pages/admin/history";
import AdminSettings from "@/pages/admin/settings";
import AdminPerformance from "@/pages/admin/performance";
import AdminFeedback from "@/pages/admin/feedback";
import AdminTranslations from "@/pages/admin/translations";

function Router() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Global authentication guard with improved state management
  useEffect(() => {
    if (!isLoading && !user) {
      const protectedPaths = ['/dashboard', '/admin'];
      const isProtectedPath = protectedPaths.some(path => location.startsWith(path));
      
      if (isProtectedPath) {
        console.log('Global auth guard: Redirecting to /auth from', location);
        setLocation('/auth');
      }
    }
  }, [user, isLoading, location, setLocation]);

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/api/docs" component={ApiDocs} />
      
      {/* Protected Dashboard routes */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/dashboard/create-content" component={CreateContent} />
      <ProtectedRoute path="/dashboard/create-image" component={CreateImage} />
      <ProtectedRoute path="/dashboard/image-library" component={ImageLibrary} />
      <ProtectedRoute path="/dashboard/create-social-content" component={CreateSocialContent} />
      <ProtectedRoute path="/dashboard/brand-guidelines" component={BrandGuidelines} />
      <ProtectedRoute path="/dashboard/my-articles" component={MyArticles} />
      <ProtectedRoute path="/dashboard/edit-article/:id" component={EditArticle} />
      <ProtectedRoute path="/dashboard/credits" component={Credits} />
      <ProtectedRoute path="/dashboard/plans" component={Plans} />
      <ProtectedRoute path="/dashboard/connections" component={Connections} />
      <ProtectedRoute path="/dashboard/api-keys" component={ApiKeys} />
      <ProtectedRoute path="/dashboard/ai-api-keys" component={AIApiKeys} />
      <ProtectedRoute path="/dashboard/content-separation" component={ContentSeparation} />
      <ProtectedRoute path="/dashboard/analytics" component={Analytics} />
      <ProtectedRoute path="/dashboard/seo-tools" component={SEOTools} />
      <ProtectedRoute path="/dashboard/templates" component={Templates} />
      <ProtectedRoute path="/dashboard/translations" component={Translations} />
      <ProtectedRoute path="/dashboard/notifications" component={Notifications} />
      <ProtectedRoute path="/dashboard/scheduler" component={Scheduler} />
      <ProtectedRoute path="/dashboard/feedback" component={Feedback} />
      <ProtectedRoute path="/dashboard/scheduled-posts" component={ScheduledPosts} />
      <ProtectedRoute path="/dashboard/social-connections" component={SocialConnections} />
      <ProtectedRoute path="/dashboard/settings" component={Settings} />
      <Route path="/article/:id" component={Article} />
      
      {/* Admin routes */}
      <ProtectedRoute path="/admin" component={AdminDashboard} adminOnly={true} />
      <ProtectedRoute path="/admin/users" component={AdminUsers} adminOnly={true} />
      <ProtectedRoute path="/admin/articles" component={AdminArticles} adminOnly={true} />
      <ProtectedRoute path="/admin/plans" component={AdminPlans} adminOnly={true} />
      <ProtectedRoute path="/admin/payments" component={AdminPayments} adminOnly={true} />
      <ProtectedRoute path="/admin/integrations" component={AdminIntegrations} adminOnly={true} />
      <ProtectedRoute path="/admin/feedback" component={AdminFeedback} adminOnly={true} />
      <ProtectedRoute path="/admin/translations" component={AdminTranslations} adminOnly={true} />
      <ProtectedRoute path="/admin/history" component={AdminHistory} adminOnly={true} />
      <ProtectedRoute path="/admin/settings" component={AdminSettings} adminOnly={true} />
      <ProtectedRoute path="/admin/performance" component={AdminPerformance} adminOnly={true} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <Router />
            <Toaster />
            <FloatingThemeIndicator position="bottom-right" />
            <FeedbackButton page={location} variant="floating" />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
