import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";
import { 
  FacebookIcon, 
  TwitterIcon, 
  InstagramIcon, 
  LinkedinIcon,
  ScrollIcon
} from "lucide-react";

export function Footer() {
  const { t } = useLanguage();
  
  const productLinks = [
    { label: t("landing.footer.links.createSeoContent"), href: "#" },
    { label: t("landing.footer.links.wordpressConnect"), href: "#" },
    { label: t("landing.footer.links.socialShare"), href: "#" },
    { label: t("landing.footer.links.seoAnalysis"), href: "#" },
  ];
  
  const companyLinks = [
    { label: t("landing.footer.links.about"), href: "#" },
    { label: t("landing.footer.links.blog"), href: "#" },
    { label: t("landing.footer.links.partners"), href: "#" },
    { label: t("landing.footer.links.careers"), href: "#" },
  ];
  
  const supportLinks = [
    { label: t("landing.footer.links.helpCenter"), href: "#" },
    { label: t("landing.footer.links.terms"), href: "#" },
    { label: t("landing.footer.links.privacy"), href: "#" },
    { label: t("landing.footer.links.contact"), href: "#contact" },
  ];

  return (
    <footer className="bg-secondary-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center">
              <ScrollIcon className="h-8 w-auto text-white" />
              <span className="ml-2 text-xl font-bold text-white font-heading">
                {t("common.appName")}
              </span>
            </div>
            <p className="mt-4 text-slate-200">
              {t("landing.footer.description")}
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-slate-300 hover:text-white transition-colors">
                <FacebookIcon className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors">
                <TwitterIcon className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors">
                <InstagramIcon className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors">
                <LinkedinIcon className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white">{t("landing.footer.links.product")}</h3>
            <ul className="mt-4 space-y-2">
              {productLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white">{t("landing.footer.links.company")}</h3>
            <ul className="mt-4 space-y-2">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white">{t("landing.footer.links.support")}</h3>
            <ul className="mt-4 space-y-2">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-secondary-700 text-center text-slate-300">
          <p>{t("landing.footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
