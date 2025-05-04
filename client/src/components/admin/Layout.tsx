import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Settings,
  ChevronLeft,
  Menu,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { t, language, setLanguage } = useLanguage();
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const sidebarLinks = [
    {
      href: "/admin",
      label: t("admin.dashboard"),
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      href: "/admin/users",
      label: t("admin.users"),
      icon: <Users className="h-5 w-5" />,
    },
    {
      href: "/admin/articles",
      label: t("admin.articles"),
      icon: <FileText className="h-5 w-5" />,
    },
    {
      href: "/admin/payments",
      label: t("admin.payments"),
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      href: "/admin/settings",
      label: t("admin.settings"),
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex h-screen bg-secondary-100">
      {/* Sidebar for desktop */}
      <aside
        className={cn(
          "bg-secondary-900 text-white h-screen transition-all duration-300 ease-in-out hidden md:block",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-4 flex items-center justify-between border-b border-secondary-700">
          <div className={cn("flex items-center", !isSidebarOpen && "justify-center w-full")}>
            <img 
              src="/logo.svg" 
              alt="SEO AI Writer" 
              className="h-8 w-8"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/32";
              }}
            />
            {isSidebarOpen && (
              <span className="ml-2 text-xl font-bold">Admin</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white hover:bg-secondary-800"
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", !isSidebarOpen && "rotate-180")} />
          </Button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {sidebarLinks.map((link) => (
              <li key={link.href}>
                <Link 
                  href={link.href}
                  className={cn(
                    "flex items-center py-2 px-4 rounded-md text-sm font-medium transition-colors",
                    isSidebarOpen ? "" : "justify-center",
                    location === link.href
                      ? "bg-primary-600 text-white"
                      : "text-secondary-300 hover:text-white hover:bg-secondary-800"
                  )}
                >
                  {link.icon}
                  {isSidebarOpen && <span className="ml-3">{link.label}</span>}
                </Link>
              </li>
            ))}
            
            <li>
              <Link 
                href="/dashboard"
                className={cn(
                  "flex items-center py-2 px-4 rounded-md text-sm font-medium transition-colors",
                  isSidebarOpen ? "" : "justify-center",
                  "text-secondary-300 hover:text-white hover:bg-secondary-800"
                )}
              >
                <LayoutDashboard className="h-5 w-5" />
                {isSidebarOpen && <span className="ml-3">User Dashboard</span>}
              </Link>
            </li>
          </ul>
        </nav>

        <div className={cn(
          "absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-700",
          !isSidebarOpen && "flex justify-center"
        )}>
          {isSidebarOpen ? (
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.fullName || user?.username}&background=random`} />
                <AvatarFallback>
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.fullName || user?.username}</p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-secondary-400 hover:text-secondary-300 flex items-center mt-1"
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  {t("nav.logout")}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="text-secondary-400 hover:text-secondary-300"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile sidebar */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-50">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="bg-secondary-900 text-white h-full flex flex-col">
              <div className="p-4 border-b border-secondary-700">
                <div className="flex items-center">
                  <img 
                    src="/logo.svg" 
                    alt="SEO AI Writer" 
                    className="h-8 w-8"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/32";
                    }}
                  />
                  <span className="ml-2 text-xl font-bold">Admin</span>
                </div>
              </div>

              <nav className="p-4 flex-1">
                <ul className="space-y-2">
                  {sidebarLinks.map((link) => (
                    <li key={link.href}>
                      <Link 
                        href={link.href}
                        className={cn(
                          "flex items-center py-2 px-4 rounded-md text-sm font-medium transition-colors",
                          location === link.href
                            ? "bg-primary-600 text-white"
                            : "text-secondary-300 hover:text-white hover:bg-secondary-800"
                        )}
                      >
                        {link.icon}
                        <span className="ml-3">{link.label}</span>
                      </Link>
                    </li>
                  ))}
                  
                  <li>
                    <Link 
                      href="/dashboard"
                      className="flex items-center py-2 px-4 rounded-md text-sm font-medium transition-colors text-secondary-300 hover:text-white hover:bg-secondary-800"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="ml-3">User Dashboard</span>
                    </Link>
                  </li>
                </ul>
              </nav>

              <div className="p-4 border-t border-secondary-700">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.fullName || user?.username}&background=random`} />
                    <AvatarFallback>
                      {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{user?.fullName || user?.username}</p>
                    <button
                      onClick={handleLogout}
                      className="text-xs text-secondary-400 hover:text-secondary-300 flex items-center mt-1"
                    >
                      <LogOut className="h-3 w-3 mr-1" />
                      {t("nav.logout")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="h-16 px-4 md:px-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-secondary-900">
              {title || t("admin.dashboard")}
            </h1>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
                className="text-secondary-500 hover:text-primary-600 p-1 rounded-md hidden md:block"
              >
                {language === "vi" ? "EN" : "VN"}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 bg-secondary-50">
          {children}
        </main>
      </div>
    </div>
  );
}
