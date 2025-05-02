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
import { CreditTransaction } from "@shared/schema";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Eye, Download } from "lucide-react";
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

interface Transaction extends CreditTransaction {
  username: string;
}

export default function AdminPayments() {
  const { t } = useLanguage();

  // Fetch transactions data
  const { data: transactionsData, isLoading } = useQuery<{ transactions: Transaction[], total: number }>({
    queryKey: ["/api/admin/transactions"],
  });

  return (
    <>
      <Head>
        <title>{t("admin.payments.title")} - {t("common.appName")}</title>
      </Head>
      
      <AdminLayout title={t("admin.payments.title")}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("admin.payments.title")}</h1>
            <p className="text-muted-foreground">{t("admin.payments.description")}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("admin.payments.type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.payments.allTypes")}</SelectItem>
                <SelectItem value="credit">{t("admin.payments.creditPurchase")}</SelectItem>
                <SelectItem value="storage">{t("admin.payments.storagePlan")}</SelectItem>
                <SelectItem value="usage">{t("admin.payments.creditUsage")}</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder={t("admin.payments.search")}
              className="max-w-sm"
            />
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {t("admin.payments.export")}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.payments.allTransactions")}</CardTitle>
            <CardDescription>
              {t("admin.payments.totalCount", { count: transactionsData?.total || 0 })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t("admin.payments.user")}</TableHead>
                  <TableHead>{t("admin.payments.amount")}</TableHead>
                  <TableHead>{t("admin.payments.type")}</TableHead>
                  <TableHead>{t("admin.payments.description")}</TableHead>
                  <TableHead>{t("admin.payments.date")}</TableHead>
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
                ) : transactionsData?.transactions && transactionsData.transactions.length > 0 ? (
                  transactionsData.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{transaction.username}</TableCell>
                      <TableCell>
                        <span className={transaction.amount > 0 ? "text-green-600" : "text-red-600"}>
                          {transaction.amount > 0 ? "+" : ""}{formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {transaction.planId ? t("admin.payments.planPurchase") : t("admin.payments.creditTransaction")}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
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
                              <Download className="mr-2 h-4 w-4" />
                              {t("admin.common.download")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      {t("admin.payments.noTransactions")}
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