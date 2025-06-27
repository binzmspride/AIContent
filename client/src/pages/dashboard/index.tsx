import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { useDbTranslations } from "@/hooks/use-db-translations";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  Coins,
  FileText,
  Image,
  ExternalLink,
  Edit,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MascotHelper } from "@/components/dashboard/MascotHelper";
import { Mascot } from "@/components/ui/mascot";
import Head from "@/components/head";

interface DashboardStats {
  creditBalance: number;
  articlesCreated: {
    total: number;
    monthlyChange: number;
  };
  storageUsed: {
    current: number;
    total: number;
    percentage: number;
  };
  connections: {
    wordpress: boolean;
    facebook: boolean;
    tiktok: boolean;
    twitter: boolean;
  };
}

interface Article {
  id: number;
  title: string;
  createdAt: string;
  status: string;
  keywords: string;
}

export default function Dashboard() {
  const { t } = useDbTranslations();
  const { user } = useAuth();
  const [showMascot, setShowMascot] = useState(true);

  // Fetch dashboard stats
  const { data: statsResponse, isLoading: isLoadingStats } = useQuery<{success: boolean, data: DashboardStats}>({
    queryKey: ["/api/dashboard/stats"],
  });
  
  const stats = statsResponse?.data;

  // Fetch recent articles
  const { data: articlesResponse, isLoading: isLoadingArticles } = useQuery<{success: boolean, data: { articles: Article[], pagination: any }}>({
    queryKey: ["/api/dashboard/articles", { page: 1, limit: 5 }],
  });
  
  const articlesData = articlesResponse?.data;

  // Fetch recent images
  const { data: imagesResponse, isLoading: isLoadingImages } = useQuery<{success: boolean, data: { images: any[], total: number }}>({
    queryKey: ["/api/dashboard/images"],
  });
  
  const imagesData = imagesResponse?.data;

  // Define article columns
  const columns: ColumnDef<Article>[] = [
    {
      accessorKey: "title",
      header: t("dashboard.stats.articleTitle"),
    },
    {
      accessorKey: "createdAt",
      header: t("dashboard.stats.dateCreated"),
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: "status",
      header: t("dashboard.stats.status"),
      cell: ({ row }) => <StatusBadge status={row.original.status as any} />,
    },
    {
      accessorKey: "keywords",
      header: t("dashboard.stats.keywords"),
    },
    {
      id: "actions",
      header: t("dashboard.stats.actions"),
      cell: ({ row }) => {
        return (
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-primary-600">
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View article</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-secondary-600">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit article</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];

  // Format storage
  const formatStorage = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <Head>
        <title>{t("dashboard.overview")} - {t("common.appName")}</title>
      </Head>
      
      <DashboardLayout title={t("dashboard.overview")}>
        {/* Mascot Helper */}
        {showMascot && (
          <MascotHelper 
            page="dashboard" 
            className="mb-6" 
            onDismiss={() => setShowMascot(false)}
          />
        )}
        
        {/* Loading State */}
        {isLoadingStats ? (
          <div className="min-h-[200px] flex items-center justify-center">
            <Mascot expression="loading" size="md" />
            <p className="ml-4 text-white">{t("common.loadingData")}</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Credit Stats */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-primary-100 text-primary-600">
                      <Coins className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-sm font-medium text-white">{t("dashboard.stats.creditsLeft")}</h2>
                      <p className="text-2xl font-semibold text-white">
                        {stats?.creditBalance ?? 0} {t("dashboard.stats.credits")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href="/dashboard/credits" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                      {t("dashboard.stats.buyMoreCredits")}
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              {/* Articles Stats */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/dashboard/my-articles'}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-sm font-medium text-white">{t("dashboard.stats.articlesCreated")}</h2>
                      <p className="text-2xl font-semibold text-white">
                        {stats?.articlesCreated?.total || 0}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href="/dashboard/my-articles" className="text-sm text-green-600 hover:text-green-700 flex items-center">
                      {t("dashboard.stats.viewMyArticles")}
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              {/* Images Stats */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/dashboard/image-library'}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                      <Image className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-sm font-medium text-white">{t("dashboard.stats.imagesCreated")}</h2>
                      <p className="text-2xl font-semibold text-white">
                        {imagesData?.total || imagesData?.images?.length || 0}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href="/dashboard/image-library" className="text-sm text-purple-600 hover:text-purple-700 flex items-center">
                      {t("dashboard.stats.viewImageLibrary")}
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Articles */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">{t("dashboard.stats.recentArticles")}</h2>
                <Link href="/dashboard/my-articles">
                  <Button variant="outline" size="sm">
                    {t("common.viewAll")}
                  </Button>
                </Link>
              </div>
              
              <DataTable 
                columns={columns} 
                data={articlesData?.articles || []} 
                showPagination={false}
                showSearch={false}
              />
            </div>
            
            {/* Connection Status */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">{t("dashboard.stats.connectionsSection")}</h2>
                <Link href="/dashboard/connections">
                  <Button variant="outline" size="sm">
                    {t("dashboard.stats.manageConnections")}
                  </Button>
                </Link>
              </div>
              
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* WordPress Connection */}
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 19.5c-5.2 0-9.5-4.3-9.5-9.5S6.8 2.5 12 2.5s9.5 4.3 9.5 9.5-4.3 9.5-9.5 9.5zm-4.5-8.5c0 2.5 2.5 4.5 5 4.5v-2c-1.9 0-3.5-1.2-3.5-2.5V11H7.5v2zm9-3.5c0-2.5-2.5-4.5-5-4.5v2c1.9 0 3.5 1.2 3.5 2.5v1.5h1.5V9.5z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-white">WordPress</h3>
                        <div className="mt-1 flex items-center">
                          <div className={`h-2 w-2 rounded-full ${stats?.connections?.wordpress ? 'bg-green-500' : 'bg-secondary-300'} mr-2`}></div>
                          <p className="text-xs text-white">
                            {stats?.connections?.wordpress 
                              ? t("dashboard.connectionTypes.wordpress.connected") 
                              : t("common.notConnected")
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Facebook Connection */}
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-white">Facebook</h3>
                        <div className="mt-1 flex items-center">
                          <div className={`h-2 w-2 rounded-full ${stats?.connections?.facebook ? 'bg-green-500' : 'bg-secondary-300'} mr-2`}></div>
                          <p className="text-xs text-white">
                            {stats?.connections?.facebook
                              ? t("dashboard.connectionTypes.social.connected")
                              : t("common.notConnected")
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* TikTok Connection */}
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-secondary-100 text-secondary-600">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1Z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-white">TikTok</h3>
                        <div className="mt-1 flex items-center">
                          <div className={`h-2 w-2 rounded-full ${stats?.connections?.tiktok ? 'bg-green-500' : 'bg-secondary-300'} mr-2`}></div>
                          <p className="text-xs text-white">
                            {stats?.connections?.tiktok
                              ? t("dashboard.connectionTypes.social.connected")
                              : t("common.notConnected")
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </DashboardLayout>
    </>
  );
}