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
import { User } from "@shared/schema";
import { formatDate } from "@/lib/utils";
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
import Head from "@/components/head";

export default function AdminUsers() {
  const { t } = useLanguage();

  // Fetch users data
  const { data: usersData, isLoading } = useQuery<{ users: User[], total: number }>({
    queryKey: ["/api/admin/users"],
  });

  return (
    <>
      <Head>
        <title>{t("admin.users.title")} - {t("common.appName")}</title>
      </Head>
      
      <AdminLayout title={t("admin.users.title")}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("admin.users.title")}</h1>
            <p className="text-muted-foreground">{t("admin.users.description")}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              placeholder={t("admin.users.search")}
              className="max-w-sm"
            />
            <Button>
              {t("admin.users.addUser")}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.users.allUsers")}</CardTitle>
            <CardDescription>
              {t("admin.users.totalCount")} {usersData?.total || 0}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t("admin.users.username")}</TableHead>
                  <TableHead>{t("admin.users.fullName")}</TableHead>
                  <TableHead>{t("admin.users.email")}</TableHead>
                  <TableHead>{t("admin.users.role")}</TableHead>
                  <TableHead>{t("admin.users.status")}</TableHead>
                  <TableHead>{t("admin.users.joinDate")}</TableHead>
                  <TableHead className="text-right">{t("admin.common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      {t("common.loading")}
                    </TableCell>
                  </TableRow>
                ) : usersData?.users && usersData.users.length > 0 ? (
                  usersData.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.fullName || "-"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "outline"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
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
                    <TableCell colSpan={8} className="text-center py-10">
                      {t("admin.users.noUsers")}
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