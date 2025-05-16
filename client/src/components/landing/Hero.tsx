import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BoltIcon, ArrowRightIcon, SparklesIcon, CheckCircle2 } from "lucide-react";

export function Hero() {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-br from-primary via-primary/95 to-primary/80 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-accent/30 to-transparent rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-primary-foreground/10 to-transparent rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4"></div>
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="inline-block py-1.5 px-4 rounded-full bg-accent/20 text-white text-sm font-medium tracking-wide mb-6 backdrop-blur-sm border border-accent/30 shadow-lg shadow-accent/10">
              <SparklesIcon className="inline-block w-4 h-4 mr-2 align-text-bottom" />
              {t("landing.hero.badge")}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-primary-foreground/80">
              {t("landing.hero.title")}
            </h1>
            
            <p className="mt-6 text-lg md:text-xl text-white/90 leading-relaxed max-w-xl font-light">
              {t("landing.hero.subtitle")}
            </p>
            
            <div className="mt-6 space-y-3">
              {[
                { text: "Tạo nội dung chuẩn SEO tự động", icon: CheckCircle2 },
                { text: "Hỗ trợ tiếng Việt và nhiều ngôn ngữ khác", icon: CheckCircle2 },
                { text: "Tích hợp với WordPress và các mạng xã hội", icon: CheckCircle2 }
              ].map((item, i) => (
                <div key={i} className="flex items-start">
                  <item.icon className="h-5 w-5 text-accent mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-white/90">{item.text}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-10 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <Link href="/auth">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-8 font-medium text-base">
                  <BoltIcon className="w-5 h-5 mr-2" />
                  {t("landing.hero.tryFree")}
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all duration-300 rounded-full px-8 font-medium text-base"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t("landing.hero.viewDemo")}
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <div className="mt-12 flex items-center space-x-8">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="inline-block h-12 w-12 rounded-full border-2 border-white overflow-hidden bg-primary-foreground/20 shadow-lg">
                    <img 
                      src={`https://i.pravatar.cc/100?img=${20+i}`} 
                      alt="User" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-sm text-white/90">
                <span className="font-bold text-white text-base">1000+</span> khách hàng <br />đã tin dùng dịch vụ
              </div>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-white/20 backdrop-blur-sm bg-gradient-to-br from-white/10 to-white/5 transform perspective-1000 rotateY-[-5deg] hover:rotateY-0 transition-all duration-700">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl"></div>
              
              <div className="p-2">
                <img
                  src="https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80"
                  alt="AI Content Generation Dashboard"
                  className="w-full h-auto rounded-xl shadow-lg transform transition-all duration-500 hover:scale-[1.02] object-cover"
                />
              </div>
              
              {/* Feature badges */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-primary shadow-lg border border-white/50">
                ✨ AI Content Generation
              </div>
              <div className="absolute bottom-4 right-4 bg-accent/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-lg border border-accent/50">
                🔍 SEO Optimization
              </div>
              
              {/* New feature badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-lg border border-green-400/50">
                ✓ Hỗ trợ Tiếng Việt
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
