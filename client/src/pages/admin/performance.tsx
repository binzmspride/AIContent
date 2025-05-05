import { AdminLayout } from "@/components/admin/Layout";
import { useLanguage } from "@/hooks/use-language";
import PerformanceInsights from "@/components/admin/PerformanceInsights";
import Head from "@/components/head";

export default function PerformancePage() {
  const { t } = useLanguage();
  
  return (
    <>
      <Head>
        <title>{t("admin.performanceMetrics.title")} - {t("common.appName")}</title>
      </Head>
      
      <AdminLayout title={t("admin.performanceMetrics.title")}>
        <div className="space-y-6">
          <p className="text-muted-foreground">
            {t("admin.performanceMetrics.description")}
          </p>
          
          <PerformanceInsights />
        </div>
      </AdminLayout>
    </>
  );
}