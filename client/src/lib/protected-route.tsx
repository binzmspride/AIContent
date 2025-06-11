import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";
import { useEffect, useState } from "react";

export function ProtectedRoute({
  path,
  component: Component,
  adminOnly = false,
}: {
  path: string;
  component: () => React.JSX.Element;
  adminOnly?: boolean;
}) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Enhanced redirect logic for production builds
  useEffect(() => {
    // Wait for auth check to complete before any redirects
    if (!isLoading) {
      setHasCheckedAuth(true);
      
      if (!user && location.startsWith('/dashboard')) {
        console.log('Redirecting unauthenticated user to /auth from:', location);
        setLocation('/auth');
      }
      if (user && adminOnly && user.role !== 'admin') {
        console.log('Redirecting non-admin user to /dashboard from:', location);
        setLocation('/dashboard');
      }
      if (user && path.startsWith('/admin') && user.role !== 'admin') {
        console.log('Redirecting non-admin user from admin path to /dashboard');
        setLocation('/dashboard');
      }
    }
  }, [user, isLoading, location, setLocation, adminOnly, path]);

  return (
    <Route path={path}>
      {() => {
        // Show loading while authentication is being checked
        if (isLoading || !hasCheckedAuth) {
          return (
            <div className="flex items-center justify-center min-h-screen bg-background">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
              </div>
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/auth" />;
        }

        // Check admin permissions
        if (adminOnly && user.role !== 'admin') {
          return <Redirect to="/dashboard" />;
        }

        // Check admin paths
        if (path.startsWith('/admin') && user.role !== 'admin') {
          return <Redirect to="/dashboard" />;
        }

        return <Component />;
      }}
    </Route>
  );
}
