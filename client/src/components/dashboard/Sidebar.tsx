import { Link, useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  const [location] = useLocation();

  const links: SidebarLink[] = [
    {
      href: "/dashboard",
      label: t("dashboard.title"),
      icon: <LayoutDashboard className="h-5 w-5 mr-3" />,
    },
    {
      href: "/dashboard/create-content",
      label: t("dashboard.createContent"),
      icon: <PenSquare className="h-5 w-5 mr-3" />,
    },
    {
      href: "/dashboard/my-articles",
      label: t("dashboard.myArticles"),
      icon: <FileText className="h-5 w-5 mr-3" />,
    },
    {
      href: "/dashboard/credits",
      label: t("dashboard.credits"),
      icon: <Coins className="h-5 w-5 mr-3" />,
    },
    {
      href: "/dashboard/plans",
      label: t("dashboard.plans"),
      icon: <Package className="h-5 w-5 mr-3" />,
    },
    {
      href: "/dashboard/connections",
      label: t("dashboard.connections"),
      icon: <Link2 className="h-5 w-5 mr-3" />,
    },
    {
      href: "/dashboard/settings",
      label: t("dashboard.settings"),
      icon: <Settings className="h-5 w-5 mr-3" />,
    },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="w-64 bg-sidebar h-screen flex flex-col fixed">
      <div className="p-4 flex items-center border-b border-sidebar-border">
        <ScrollIcon className="h-8 w-auto text-white" />
        <span className="ml-2 text-xl font-bold text-white font-heading">
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
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            </li>
          ))}
          
          <li>
            <Link 
              href="/admin"
              className="flex items-center py-3 px-4 rounded-md text-sm font-medium transition-colors text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            >
              <LayoutDashboard className="h-5 w-5 mr-3" />
              {t("admin.adminPanel")}
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-sidebar-border mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.fullName || user?.username}&background=random`} />
              <AvatarFallback>
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">
                {user?.fullName || user?.username}
              </p>
              <button
                onClick={handleLogout}
                className="text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground flex items-center mt-1"
              >
                <LogOut className="h-3 w-3 mr-1" />
                {t("common.logout")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
