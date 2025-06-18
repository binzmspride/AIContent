import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/providers/ThemeProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Bell,
  Search,
  Coins,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { AdaptiveThemeSwitcher } from "@/components/common/AdaptiveThemeSwitcher";

export function Header() {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === "vi" ? "en" : "vi");
  };

  return (
    <header className="bg-white dark:bg-card shadow-sm z-10 sticky top-0">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="md:hidden flex items-center">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-secondary-700 dark:text-secondary-300">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>

        {/* Search Bar */}
        <div className={`flex-1 max-w-lg mx-4 ${isSearchOpen ? 'flex' : 'hidden md:flex'}`}>
          <div className="w-full relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("dashboard.articles.search")}
              className="pl-10 pr-3 py-2 w-full bg-white dark:bg-card"
            />
          </div>
        </div>

        {/* Mobile search toggle */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`${isSearchOpen ? 'hidden' : ''} text-secondary-700 dark:text-secondary-300`}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSearchOpen(false)} 
            className={`${!isSearchOpen ? 'hidden' : ''} text-secondary-700 dark:text-secondary-300`}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Right Navigation */}
        <div className={`flex items-center space-x-4 ${isSearchOpen ? 'hidden' : 'flex'}`}>
          <Button variant="ghost" size="icon" className="text-secondary-500 dark:text-secondary-300 hover:text-secondary-600 dark:hover:text-secondary-200">
            <Bell className="h-5 w-5" />
          </Button>
          
          <AdaptiveThemeSwitcher 
            variant="icon" 
            showDropdown={true}
            playful={true}
            size="md"
            className="text-secondary-500 dark:text-secondary-300 hover:text-secondary-600 dark:hover:text-secondary-200" 
          />
          
          <button 
            onClick={toggleLanguage}
            className="text-secondary-500 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 p-1 rounded-md hidden sm:block"
          >
            {language === "vi" ? "EN" : "VN"}
          </button>
          
          <Link href="/dashboard/credits">
            <div className="text-secondary-500 dark:text-white bg-secondary-100 dark:bg-secondary-800 px-3 py-1 rounded-full text-sm font-medium flex items-center hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors cursor-pointer">
              <Coins className="h-4 w-4 mr-1 text-accent-500" />
              <span>{user?.credits || 0} tín dụng</span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
