import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import CreateContent from "@/pages/dashboard/create-content";
import MyArticles from "@/pages/dashboard/my-articles";
import Credits from "@/pages/dashboard/credits";
import Plans from "@/pages/dashboard/plans";
import Connections from "@/pages/dashboard/connections";
import Settings from "@/pages/dashboard/settings";
import AdminDashboard from "@/pages/admin";
import AdminUsers from "@/pages/admin/users";
import AdminArticles from "@/pages/admin/articles";
import AdminPlans from "@/pages/admin/plans";
import AdminPayments from "@/pages/admin/payments";
import AdminIntegrations from "@/pages/admin/integrations-fixed";
import AdminHistory from "@/pages/admin/history";
import AdminSettings from "@/pages/admin/settings";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected Dashboard routes */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/dashboard/create-content" component={CreateContent} />
      <ProtectedRoute path="/dashboard/my-articles" component={MyArticles} />
      <ProtectedRoute path="/dashboard/credits" component={Credits} />
      <ProtectedRoute path="/dashboard/plans" component={Plans} />
      <ProtectedRoute path="/dashboard/connections" component={Connections} />
      <ProtectedRoute path="/dashboard/settings" component={Settings} />
      
      {/* Admin routes */}
      <ProtectedRoute path="/admin" component={AdminDashboard} adminOnly={true} />
      <ProtectedRoute path="/admin/users" component={AdminUsers} adminOnly={true} />
      <ProtectedRoute path="/admin/articles" component={AdminArticles} adminOnly={true} />
      <ProtectedRoute path="/admin/plans" component={AdminPlans} adminOnly={true} />
      <ProtectedRoute path="/admin/payments" component={AdminPayments} adminOnly={true} />
      <ProtectedRoute path="/admin/integrations" component={AdminIntegrations} adminOnly={true} />
      <ProtectedRoute path="/admin/history" component={AdminHistory} adminOnly={true} />
      <ProtectedRoute path="/admin/settings" component={AdminSettings} adminOnly={true} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <Router />
            <Toaster />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
