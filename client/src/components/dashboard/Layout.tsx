import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useLanguage } from "@/hooks/use-language";
import { useMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { t } = useLanguage();
  const isMobile = useMobile();

  return (
    <div className="flex h-screen bg-secondary-50">
      {/* Sidebar - hidden on mobile */}
      {!isMobile && <Sidebar />}

      {/* Main content area */}
      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        <Header />
        
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {title && (
            <h1 className="text-2xl font-bold text-secondary-900 mb-6">
              {title}
            </h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
