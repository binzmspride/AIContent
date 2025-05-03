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
    <nav className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
              <svg
                className="h-8 w-auto text-primary"
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
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-heading">
                {t("common.appName")}
              </span>
            </Link>
            </div>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="border-transparent text-secondary-foreground/70 hover:text-primary hover:bg-primary/5 inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <button 
              onClick={toggleLanguage}
              className="text-secondary-foreground/70 hover:text-primary p-1 rounded-md transition-colors"
            >
              {language === "vi" ? "EN" : "VN"}
            </button>
            
            {user ? (
              <Link href="/dashboard">
                <Button className="bg-primary hover:bg-primary/90 text-white px-5 rounded-full">
                  {t("nav.dashboard")}
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth" className="text-secondary-foreground hover:text-primary px-4 py-2 text-sm font-medium transition-colors">
                  {t("nav.login")}
                </Link>
                <Link href="/auth">
                  <Button className="bg-primary hover:bg-primary/90 text-white px-5 rounded-full shadow-sm">
                    {t("nav.register")}
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <div className="sm:hidden flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="border-none text-primary">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="border-l border-slate-200/50">
                <div className="flex flex-col mt-8">
                  <Link href="/" className="flex items-center mb-6" onClick={() => setIsOpen(false)}>
                    <svg
                      className="h-8 w-auto text-primary"
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
                    <span className="ml-2 text-xl font-bold text-primary font-heading">
                      {t("common.appName")}
                    </span>
                  </Link>
                
                  <div className="space-y-1">
                    {navItems.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="block text-secondary-foreground hover:text-primary hover:bg-primary/5 py-2.5 px-3 rounded-md text-base font-medium transition-colors duration-200"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                  
                  <div className="pt-6 border-t border-slate-100 mt-6">
                    <button 
                      onClick={() => {toggleLanguage(); setIsOpen(false);}}
                      className="inline-flex items-center text-secondary-foreground/70 hover:text-primary py-2.5 px-3 rounded-md"
                    >
                      {language === "vi" ? "English" : "Tiếng Việt"}
                    </button>
                    
                    {user ? (
                      <Link href="/dashboard">
                        <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-white rounded-full">
                          {t("nav.dashboard")}
                        </Button>
                      </Link>
                    ) : (
                      <div className="flex flex-col space-y-3 mt-4">
                        <Link href="/auth">
                          <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/5 hover:text-primary rounded-full">
                            {t("nav.login")}
                          </Button>
                        </Link>
                        <Link href="/auth">
                          <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-full">
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
