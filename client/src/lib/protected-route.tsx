import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";
import { useEffect } from "react";

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

  // Enhanced redirect logic for production builds
  useEffect(() => {
    if (!isLoading && !user && location.startsWith('/dashboard')) {
      console.log('Redirecting unauthenticated user to /auth from:', location);
      setLocation('/auth');
    }
    if (!isLoading && user && adminOnly && user.role !== 'admin') {
      console.log('Redirecting non-admin user to /dashboard from:', location);
      setLocation('/dashboard');
    }
    if (!isLoading && user && path.startsWith('/admin') && user.role !== 'admin') {
      console.log('Redirecting non-admin user from admin path to /dashboard');
      setLocation('/dashboard');
    }
  }, [user, isLoading, location, setLocation, adminOnly, path]);

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (!user) {
          // Force immediate redirect for unauthenticated users
          if (typeof window !== 'undefined') {
            window.location.href = '/auth';
          }
          return <Redirect to="/auth" />;
        }

        // Check admin permissions
        if (adminOnly && user.role !== 'admin') {
          if (typeof window !== 'undefined') {
            window.location.href = '/dashboard';
          }
          return <Redirect to="/dashboard" />;
        }

        // Check admin paths
        if (path.startsWith('/admin') && user.role !== 'admin') {
          if (typeof window !== 'undefined') {
            window.location.href = '/dashboard';
          }
          return <Redirect to="/dashboard" />;
        }

        return <Component />;
      }}
    </Route>
  );
}
