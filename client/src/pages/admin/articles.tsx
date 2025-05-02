import { AdminLayout } from "@/components/admin/Layout";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Article } from "@shared/schema";
import { formatDate, truncateText } from "@/lib/utils";
import { Eye, Edit, Trash } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Head from "@/components/head";

export default function AdminArticles() {
  const { t } = useLanguage();

  // Fetch articles data
  const { data: articlesData, isLoading } = useQuery<{ articles: Article[], total: number }>({
    queryKey: ["/api/admin/articles"],
  });

  return (
    <>
      <Head>
        <title>{t("admin.articles.title")} - {t("common.appName")}</title>
      </Head>
      
      <AdminLayout title={t("admin.articles.title")}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("admin.articles.title")}</h1>
            <p className="text-muted-foreground">{t("admin.articles.description")}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("admin.articles.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.articles.allStatuses")}</SelectItem>
                <SelectItem value="draft">{t("admin.articles.draftStatus")}</SelectItem>
                <SelectItem value="published">{t("admin.articles.publishedStatus")}</SelectItem>
                <SelectItem value="deleted">{t("admin.articles.deletedStatus")}</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder={t("admin.articles.search")}
              className="max-w-sm"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.articles.allArticles")}</CardTitle>
            <CardDescription>
              {t("admin.articles.totalCount")} {articlesData?.total || 0}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t("admin.articles.title")}</TableHead>
                  <TableHead>{t("admin.articles.author")}</TableHead>
                  <TableHead>{t("admin.articles.status")}</TableHead>
                  <TableHead>{t("admin.articles.createdAt")}</TableHead>
                  <TableHead>{t("admin.articles.updatedAt")}</TableHead>
                  <TableHead className="text-right">{t("admin.common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      {t("common.loading")}
                    </TableCell>
                  </TableRow>
                ) : articlesData?.articles && articlesData.articles.length > 0 ? (
                  articlesData.articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">{article.id}</TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <div className="font-medium">{truncateText(article.title, 50)}</div>
                          <div className="text-sm text-muted-foreground">
                            {truncateText(article.content, 70)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{article.userId}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            article.status === "published" 
                              ? "default" 
                              : article.status === "draft" 
                                ? "outline" 
                                : "destructive"
                          }
                        >
                          {article.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(article.createdAt)}</TableCell>
                      <TableCell>{formatDate(article.updatedAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">{t("admin.common.openMenu")}</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="12" cy="5" r="1"></circle>
                                <circle cx="12" cy="19" r="1"></circle>
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t("admin.common.actions")}</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              {t("admin.common.view")}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              {t("admin.common.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <Trash className="mr-2 h-4 w-4" />
                              {t("admin.common.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      {t("admin.articles.noArticles")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </AdminLayout>
    </>
  );
}