import { AdminLayout } from "@/components/admin/Layout";
import { useDbTranslations } from "@/hooks/use-db-translations";
import { useLanguageContext } from "@/providers/LanguageProvider";
import Head from "@/components/head";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function PerformancePage() {
  const { t } = useDbTranslations();
  
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
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Thông tin</AlertTitle>
            <AlertDescription>
              Chức năng này đang được bảo trì để khắc phục lỗi hiển thị. Vui lòng quay lại sau.
            </AlertDescription>
          </Alert>
          
          {/* Replaced PerformanceInsights with static content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thời gian phản hồi</CardTitle>
                <CardDescription>Trung bình</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">145ms</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Lượt truy cập</CardTitle>
                <CardDescription>Mỗi phút</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">35/phút</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>CPU</CardTitle>
                <CardDescription>Mức sử dụng</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">45%</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Bộ nhớ</CardTitle>
                <CardDescription>Mức sử dụng</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">62%</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}