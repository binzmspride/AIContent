import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/providers/ThemeProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/common/ThemeSwitcher";
import { ScrollIcon } from "lucide-react";
import {
  LayoutDashboard,
  PenSquare,
  FileText,
  Coins,
  Package,
  Link2,
  Settings,
  LogOut,
  Key,
  ChevronDown,
  ChevronRight,
  Database,
  BarChart3,
  Users,
  Globe,
  Image,
  Images,
  MessageSquare,
  Bell,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function Sidebar() {
  const { t } = useLanguage();
  const { user, logoutMutation } = useAuth();
  const [aiKeysExpanded, setAiKeysExpanded] = useState(false);
  const [location] = useLocation();
  
  // Lấy thông tin người dùng từ user object
  // Phát hiện nếu user là một đối tượng có data trong nó (từ API response)
  const userData = user && typeof user === 'object' && 'data' in user ? user.data : user;
  
  // Debug để kiểm tra thông tin người dùng
  console.log("User info in Sidebar:", user);
  console.log("Extracted userData:", userData);

  const links: SidebarLink[] = [
    {
      href: "/dashboard",
      label: t("dashboard.title"),
      icon: <LayoutDashboard className="h-5 w-5 mr-3" />,
    },
    {
      href: "/dashboard/create-content",
      label: t("dashboard.navigationItems.createContent"),
      icon: <PenSquare className="h-5 w-5 mr-3" />,
    },
    {
      href: "/dashboard/create-image",
      label: "Tạo hình ảnh",
      icon: <Image className="h-5 w-5 mr-3" />,
    },
    {
      href: "/dashboard/image-library",
      label: "Thư viện hình ảnh",
      icon: <Gallery className="h-5 w-5 mr-3" />,
    },
    {
      href: "/dashboard/my-articles",
      label: t("dashboard.navigationItems.myArticles"),
      icon: <FileText className="h-5 w-5 mr-3" />,
    },
    {
      href: "/dashboard/credits",
      label: t("dashboard.navigationItems.credits"),
      icon: <Coins className="h-5 w-5 mr-3" />,
    },
    {
      href: "/dashboard/plans",
      label: t("dashboard.navigationItems.plans"),
      icon: <Package className="h-5 w-5 mr-3" />,
    },
    {
      href: "/dashboard/connections",
      label: t("dashboard.navigationItems.connections"),
      icon: <Link2 className="h-5 w-5 mr-3" />,
    },
    {
      href: "/dashboard/content-separation",
      label: "Tách riêng Content",
      icon: <Database className="h-5 w-5 mr-3" />,
    },
    {
      href: "/dashboard/analytics",
      label: "Phân tích & Báo cáo",
      icon: <BarChart3 className="h-5 w-5 mr-3" />,
    },
    {
      href: "/dashboard/seo-tools",
      label: "Công cụ SEO",
      icon: <TrendingUp className="h-5 w-5 mr-3" />,
    },
    {
      href: "/dashboard/templates",
      label: "Mẫu nội dung",
      icon: <FileText className="h-5 w-5 mr-3" />,
    },
    {
      href: "/dashboard/media-library",
      label: "Thư viện Media",
      icon: <Image className="h-5 w-5 mr-3" />,
    },
    {
      href: "/dashboard/translations",
      label: "Đa ngôn ngữ",
      icon: <Globe className="h-5 w-5 mr-3" />,
    },
    {
      href: "/dashboard/collaboration",
      label: "Cộng tác",
      icon: <Users className="h-5 w-5 mr-3" />,
    },
    {
      href: "/dashboard/notifications",
      label: "Thông báo",
      icon: <Bell className="h-5 w-5 mr-3" />,
    },
    {
      href: "/dashboard/scheduler",
      label: "Lập lịch đăng",
      icon: <Calendar className="h-5 w-5 mr-3" />,
    },
    {
      href: "/dashboard/feedback",
      label: "Phản hồi",
      icon: <MessageSquare className="h-5 w-5 mr-3" />,
    },

    {
      href: "/dashboard/settings",
      label: t("dashboard.navigationItems.settings"),
      icon: <Settings className="h-5 w-5 mr-3" />,
    },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="w-64 bg-sidebar dark:bg-card h-screen flex flex-col fixed">
      <div className="p-4 flex items-center border-b border-sidebar-border dark:border-border">
        <ScrollIcon className="h-8 w-auto text-white dark:text-secondary-100" />
        <span className="ml-2 text-xl font-bold text-white dark:text-secondary-100 font-heading">
          {t("common.appName")}
        </span>
      </div>
      
      <nav className="flex-1 overflow-y-auto pt-5 pb-20">
        <ul className="space-y-1 px-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link 
                href={link.href}
                className={cn(
                  "flex items-center py-3 px-4 rounded-md text-sm font-medium transition-colors",
                  location === link.href
                    ? "bg-sidebar-accent dark:bg-primary-800 text-white font-semibold dark:text-white"
                    : "text-white font-semibold dark:text-white hover:text-white dark:hover:text-white hover:bg-sidebar-accent/50 dark:hover:bg-primary-900/50"
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            </li>
          ))}
          
          {/* API Keys AI submenu */}
          <li>
            <button
              onClick={() => setAiKeysExpanded(!aiKeysExpanded)}
              className={cn(
                "flex items-center justify-between w-full py-3 px-4 rounded-md text-sm font-medium transition-colors",
                location.startsWith("/dashboard/ai-api-keys")
                  ? "bg-sidebar-accent dark:bg-primary-800 text-white font-semibold dark:text-white"
                  : "text-white font-semibold dark:text-white hover:text-white dark:hover:text-white hover:bg-sidebar-accent/50 dark:hover:bg-primary-900/50"
              )}
            >
              <div className="flex items-center">
                <Key className="h-5 w-5 mr-3" />
                API Keys AI
              </div>
              {aiKeysExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {aiKeysExpanded && (
              <ul className="ml-8 mt-2 space-y-1">
                <li>
                  <Link
                    href="/dashboard/ai-api-keys"
                    className={cn(
                      "flex items-center py-2 px-4 rounded-md text-sm transition-colors",
                      location === "/dashboard/ai-api-keys"
                        ? "bg-sidebar-accent dark:bg-primary-800 text-white font-semibold dark:text-white"
                        : "text-white/80 dark:text-white/80 hover:text-white dark:hover:text-white hover:bg-sidebar-accent/30 dark:hover:bg-primary-900/30"
                    )}
                  >
                    Tất cả API Keys
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/ai-api-keys?provider=openai"
                    className={cn(
                      "flex items-center py-2 px-4 rounded-md text-sm transition-colors",
                      location === "/dashboard/ai-api-keys" && location.includes("openai")
                        ? "bg-sidebar-accent dark:bg-primary-800 text-white font-semibold dark:text-white"
                        : "text-white/80 dark:text-white/80 hover:text-white dark:hover:text-white hover:bg-sidebar-accent/30 dark:hover:bg-primary-900/30"
                    )}
                  >
                    OpenAI Keys
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/ai-api-keys?provider=claude"
                    className={cn(
                      "flex items-center py-2 px-4 rounded-md text-sm transition-colors",
                      location === "/dashboard/ai-api-keys" && location.includes("claude")
                        ? "bg-sidebar-accent dark:bg-primary-800 text-white font-semibold dark:text-white"
                        : "text-white/80 dark:text-white/80 hover:text-white dark:hover:text-white hover:bg-sidebar-accent/30 dark:hover:bg-primary-900/30"
                    )}
                  >
                    Claude Keys
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/ai-api-keys?provider=gemini"
                    className={cn(
                      "flex items-center py-2 px-4 rounded-md text-sm transition-colors",
                      location === "/dashboard/ai-api-keys" && location.includes("gemini")
                        ? "bg-sidebar-accent dark:bg-primary-800 text-white font-semibold dark:text-white"
                        : "text-white/80 dark:text-white/80 hover:text-white dark:hover:text-white hover:bg-sidebar-accent/30 dark:hover:bg-primary-900/30"
                    )}
                  >
                    Gemini Keys
                  </Link>
                </li>
              </ul>
            )}
          </li>
          
          {/* Tạo thủ công một component Link đến trang Admin dựa vào role */}
          {(() => {
            // Kiểm tra nếu user có tồn tại và có role là admin
            const isAdmin = 
              userData && 
              typeof userData === 'object' && 
              'role' in userData && 
              userData.role === "admin";
            
            // Log thông tin để debug
            console.log("Is admin?", isAdmin, "User role:", userData?.role);
            
            // Chỉ hiện menu quản trị cho admin
            if (isAdmin) {
              return (
                <li>
                  <Link 
                    href="/admin"
                    className="flex items-center py-3 px-4 rounded-md text-sm font-semibold transition-colors text-white dark:text-white hover:text-white dark:hover:text-white hover:bg-sidebar-accent/50 dark:hover:bg-primary-900/50"
                  >
                    <LayoutDashboard className="h-5 w-5 mr-3" />
                    {t("admin.adminPanel")}
                  </Link>
                </li>
              );
            }
            
            // Không trả về gì nếu không phải admin
            return null;
          })()}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-sidebar-border dark:border-border mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.fullName || user?.username}&background=random`} />
              <AvatarFallback>
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-white dark:text-secondary-100">
                {user?.fullName || user?.username}
              </p>
              <button
                onClick={handleLogout}
                className="text-xs text-white font-semibold dark:text-white hover:text-white dark:hover:text-white flex items-center mt-1"
              >
                <LogOut className="h-3 w-3 mr-1" />
                {t("common.logout")}
              </button>
            </div>
          </div>
          <ThemeSwitcher variant="icon" className="text-white dark:text-white hover:text-white dark:hover:text-white" />
        </div>
      </div>
    </div>
  );
}
