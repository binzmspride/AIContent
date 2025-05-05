import { AdminLayout } from "@/components/admin/Layout";
import { PerformanceInsights } from "@/components/admin/PerformanceInsights";
import Head from "@/components/head";
import { useLanguage } from "@/hooks/use-language";

export default function AdminPerformance() {
  const { t } = useLanguage();
  
  return (
    <>
      <Head>
        <title>{t("admin.performance")} - {t("common.appName")}</title>
      </Head>
      
      <AdminLayout title={t("admin.performance")}>
        <PerformanceInsights />
      </AdminLayout>
    </>
  );
}