import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function Navbar() {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === "vi" ? "en" : "vi");
  };

  const navItems = [
    { href: "#features", label: t("nav.features") },
    { href: "#pricing", label: t("nav.pricing") },
    { href: "#faq", label: t("nav.faq") },
    { href: "#contact", label: t("nav.contact") }
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
              <svg
                className="h-8 w-auto text-primary-600"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  fill="currentColor"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="ml-2 text-xl font-bold text-primary-600 font-heading">
                {t("common.appName")}
              </span>
            </Link>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="border-transparent text-secondary-500 hover:border-primary-500 hover:text-primary-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <button 
              onClick={toggleLanguage}
              className="text-secondary-500 hover:text-primary-600 p-1 rounded-md"
            >
              {language === "vi" ? "EN" : "VN"}
            </button>
            
            {user ? (
              <Link href="/dashboard">
                <Button variant="default">
                  {t("nav.dashboard")}
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth" className="text-secondary-600 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                  {t("nav.login")}
                </Link>
                <Link href="/auth">
                  <Button className="bg-primary-600 hover:bg-primary-700">
                    {t("nav.register")}
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <div className="sm:hidden flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-6">
                  {navItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="text-secondary-700 hover:text-primary-600 py-2 text-base font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                  
                  <div className="pt-4 border-t border-gray-200">
                    <button 
                      onClick={toggleLanguage}
                      className="inline-flex items-center text-secondary-500 hover:text-primary-600 py-2"
                    >
                      {language === "vi" ? "English" : "Tiếng Việt"}
                    </button>
                    
                    {user ? (
                      <Link href="/dashboard">
                        <Button className="w-full mt-4">
                          {t("nav.dashboard")}
                        </Button>
                      </Link>
                    ) : (
                      <div className="flex flex-col space-y-2 mt-4">
                        <Link href="/auth">
                          <Button variant="outline" className="w-full">
                            {t("nav.login")}
                          </Button>
                        </Link>
                        <Link href="/auth">
                          <Button className="w-full">
                            {t("nav.register")}
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
