import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Globe, ChevronDown } from "lucide-react";

export function Navbar() {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Thêm hiệu ứng scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

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
    <nav 
      className={`backdrop-blur-md sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/90 dark:bg-gray-900/90 shadow-md" 
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="flex-shrink-0 flex items-center mr-4">
                <svg
                  className={`h-9 w-auto transition-all duration-300 ${
                    scrolled ? "text-primary" : "text-primary"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    fill="currentColor"
                    className="group-hover:fill-accent transition-colors duration-300"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="group-hover:stroke-accent transition-colors duration-300"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="group-hover:stroke-accent transition-colors duration-300"
                  />
                </svg>
                <span className={`ml-2 text-xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent group-hover:from-accent group-hover:to-primary transition-all duration-500 ${
                  scrolled ? "" : ""
                }`}>
                  {t("common.appName")}
                </span>
              </div>
            </Link>
            
            <div className="hidden md:flex md:space-x-1 ml-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary ${
                    scrolled
                      ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                      : "text-gray-700 dark:text-white hover:bg-white/10"
                  } group overflow-hidden`}
                >
                  <span className="relative z-10">{item.label}</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-bottom scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </a>
              ))}
            </div>
          </div>
          
          <div className="hidden md:flex md:items-center md:space-x-4">
            <button 
              onClick={toggleLanguage}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                scrolled
                  ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  : "text-gray-700 dark:text-white hover:bg-white/10"
              } border border-gray-200 dark:border-gray-700`}
            >
              <Globe className="w-4 h-4 mr-1" />
              <span className="font-semibold">{language === "vi" ? "VN" : "EN"}</span>
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            
            {user ? (
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300">
                  {t("nav.dashboard")}
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth" className={`px-4 py-2 text-sm font-medium transition-colors ${
                  scrolled
                    ? "text-gray-700 dark:text-gray-300 hover:text-primary"
                    : "text-gray-700 dark:text-white hover:text-primary"
                }`}>
                  {t("nav.login")}
                </Link>
                <Link href="/auth?tab=register">
                  <Button className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300">
                    {t("nav.register")}
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <div className="md:hidden flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className={`border-none ${
                  scrolled
                    ? "text-gray-700 dark:text-white"
                    : "text-gray-700 dark:text-white"
                }`}>
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="border-l border-gray-100 dark:border-gray-800">
                <div className="flex flex-col mt-8">
                  <Link href="/" className="flex items-center mb-8" onClick={() => setIsOpen(false)}>
                    <svg
                      className="h-9 w-auto text-primary"
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
                    <span className="ml-2 text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-heading">
                      {t("common.appName")}
                    </span>
                  </Link>
                
                  <div className="space-y-1">
                    {navItems.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="flex items-center py-3 px-4 rounded-md text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-primary/5 font-medium transition-colors duration-200"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                  
                  <div className="pt-6 border-t border-gray-100 dark:border-gray-800 mt-6">
                    <button 
                      onClick={() => {toggleLanguage(); setIsOpen(false);}}
                      className="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary py-3 px-4 rounded-md w-full"
                    >
                      <Globe className="w-5 h-5 mr-2" />
                      <span className="font-semibold">{language === "vi" ? "VN" : "EN"}</span>
                      <span className="ml-2 text-sm opacity-70">
                        {language === "vi" ? "- Chuyển sang English" : "- Switch to Tiếng Việt"}
                      </span>
                    </button>
                    
                    {user ? (
                      <Link href="/dashboard">
                        <Button className="w-full mt-4 bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white rounded-full shadow-md py-2.5">
                          {t("nav.dashboard")}
                        </Button>
                      </Link>
                    ) : (
                      <div className="flex flex-col space-y-3 mt-4">
                        <Link href="/auth">
                          <Button variant="outline" className="w-full border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:text-primary hover:border-primary/50 rounded-full py-2.5">
                            {t("nav.login")}
                          </Button>
                        </Link>
                        <Link href="/auth?tab=register">
                          <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white rounded-full shadow-md py-2.5">
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
