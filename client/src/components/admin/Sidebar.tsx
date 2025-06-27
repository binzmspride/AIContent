import { Link, useLocation } from "wouter";
import { useDbTranslations } from "@/hooks/use-db-translations";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { 
  BarChart2, 
  Users, 
  FileText, 
  Package, 
  CreditCard, 
  History, 
  Cog, 
  Workflow,
  RefreshCcw,
} from "lucide-react";

export default function AdminSidebar() {
  const { t } = useDbTranslations();
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  const menuItems = [
    { 
      href: '/admin', 
      label: t('admin.sidebar.dashboard'), 
      icon: <BarChart2 className="w-5 h-5" /> 
    },
    { 
      href: '/admin/users', 
      label: t('admin.sidebar.users'), 
      icon: <Users className="w-5 h-5" /> 
    },
    { 
      href: '/admin/articles', 
      label: t('admin.sidebar.articles'), 
      icon: <FileText className="w-5 h-5" /> 
    },
    { 
      href: '/admin/plans', 
      label: t('admin.sidebar.plans'), 
      icon: <Package className="w-5 h-5" /> 
    },
    { 
      href: '/admin/payments', 
      label: t('admin.sidebar.payments'), 
      icon: <CreditCard className="w-5 h-5" /> 
    },
    { 
      href: '/admin/integrations', 
      label: t('admin.sidebar.integrations'), 
      icon: <Workflow className="w-5 h-5" /> 
    },
    { 
      href: '/admin/performance', 
      label: t('admin.sidebar.performance'), 
      icon: <RefreshCcw className="w-5 h-5" /> 
    },
    { 
      href: '/admin/history', 
      label: t('admin.sidebar.history'), 
      icon: <History className="w-5 h-5" /> 
    },
    { 
      href: '/admin/settings', 
      label: t('admin.sidebar.settings'), 
      icon: <Cog className="w-5 h-5" /> 
    },
  ];
  
  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-card border-r border-border shadow-sm z-20 pt-16 hidden lg:block">
      <div className="overflow-y-auto h-full pb-16">
        <nav className="px-2 py-4">
          <ul className="space-y-1">
            {menuItems.map((item, i) => (
              <li key={i}>
                <Link href={item.href}>
                  <a
                    className={`flex items-center px-4 py-2.5 rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}