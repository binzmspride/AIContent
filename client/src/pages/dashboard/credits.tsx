import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { useDbTranslations } from "@/hooks/use-db-translations";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Plan, CreditTransaction } from "@shared/schema";
import {
  Check,
  Coins,
  CreditCard,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import Head from "@/components/head";

interface CreditHistoryResponse {
  transactions: CreditTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function Credits() {
  const { t } = useDbTranslations();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch credit plans
  const { data: plansResponse, isLoading: isLoadingPlans } = useQuery<{success: boolean, data: Plan[]}>({
    queryKey: ["/api/plans", { type: "credit" }],
  });
  
  // Extract plans from the response
  const plans = plansResponse?.data || [];

  // Fetch credit history
  const { data: creditHistoryResponse, isLoading: isLoadingHistory } = useQuery<{success: boolean, data: CreditHistoryResponse}>({
    queryKey: ["/api/dashboard/credits/history", { page: currentPage, limit: 10 }],
  });
  
  // Extract credit history from the response
  const creditHistory = creditHistoryResponse?.data;

  // Purchase credit mutation
  const purchaseCreditMutation = useMutation({
    mutationFn: async (planId: number) => {
      const res = await apiRequest("POST", "/api/dashboard/credits/purchase", { planId });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Mua thành công",
        description: `Bạn đã mua ${data.data.amount} tín dụng`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/credits/history"] });
      setIsPurchaseDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Mua không thành công",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePurchase = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsPurchaseDialogOpen(true);
  };

  const confirmPurchase = () => {
    if (selectedPlan) {
      purchaseCreditMutation.mutate(selectedPlan.id);
    }
  };

  return (
    <>
      <Head>
        <title>Tín dụng - {t("common.appName")}</title>
      </Head>
      
      <DashboardLayout title="Tín dụng">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                <Coins className="mr-2 h-5 w-5 text-primary-600" />
                Số dư hiện tại
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary-600">
                {user?.credits || 0}
                <span className="ml-2 text-lg text-gray-700 dark:text-gray-300">tín dụng</span>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Sử dụng tín dụng để tạo nội dung SEO. Mỗi lần tạo nội dung tốn 1-3 tín dụng tùy thuộc vào độ dài.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Khuyến mãi đặc biệt</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Ưu đãi có thời hạn</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 dark:text-gray-100 font-semibold">
                Nhận thêm 5 tín dụng khi mua bất kỳ gói nào!
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Có hiệu lực đến cuối tháng này
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full border-blue-300 dark:border-blue-700 text-gray-900 dark:text-gray-100 hover:bg-blue-100 dark:hover:bg-blue-800/50"
                onClick={() => {
                  toast({
                    title: "Đã sao chép mã khuyến mãi!",
                    description: "Sử dụng EXTRA5 khi thanh toán",
                  });
                }}
              >
                EXTRA5
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Tabs defaultValue="packages" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="packages">{t("dashboard.credits.buyCredits")}</TabsTrigger>
            <TabsTrigger value="history">{t("dashboard.credits.history")}</TabsTrigger>
          </TabsList>

          <TabsContent value="packages">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoadingPlans ? (
                <div className="col-span-3 text-center py-10">Đang tải gói dịch vụ...</div>
              ) : (
                plans?.map((plan) => (
                  <Card key={plan.id} className={plan.name.includes("Nâng Cao") ? "border-2 border-accent-500" : ""}>
                    <CardHeader className={plan.name.includes("Nâng Cao") ? "bg-accent-500 text-white" : "bg-primary-600 text-white"}>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription className="text-white/90 flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {formatCurrency(plan.price)}
                      </CardDescription>
                      {plan.name.includes("Nâng Cao") && (
                        <div className="absolute -top-3 right-0 left-0 mx-auto w-max bg-accent-600 text-white text-xs font-bold py-1 px-3 rounded-full">
                          {t("landing.pricing.popular")}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>{plan.value} tín dụng</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>
                            ~{plan.name.includes("Cơ Bản") ? "1000" : 
                               plan.name.includes("Nâng Cao") ? "1500" : "2000"} từ/tín dụng
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>
                            {t("landing.pricing.features.seoOptimization")}
                            {plan.name.includes("Nâng Cao") ? " +" : 
                             plan.name.includes("Chuyên Nghiệp") ? " ++" : ""}
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>
                            {t("landing.pricing.features.support")}
                            {plan.name.includes("Cơ Bản") ? " (email)" :
                             plan.name.includes("Nâng Cao") ? " (priority)" : " (24/7)"}
                          </span>
                        </li>
                        {(plan.name.includes("Nâng Cao") || plan.name.includes("Chuyên Nghiệp")) && (
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>
                              {plan.name.includes("Nâng Cao") ? "10%" : "20%"} {t("landing.pricing.features.saving")}
                            </span>
                          </li>
                        )}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className={`w-full ${plan.name.includes("Nâng Cao") ? "bg-accent-500 hover:bg-accent-600" : ""}`}
                        onClick={() => handlePurchase(plan)}
                      >
                        {t("landing.pricing.buyNow")}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.credits.history")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>
                    {isLoadingHistory ? t("dashboard.credits.loadingHistory") : t("dashboard.credits.creditHistory")}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("dashboard.credits.date")}</TableHead>
                      <TableHead>{t("dashboard.credits.description")}</TableHead>
                      <TableHead className="text-right">{t("dashboard.credits.amount")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingHistory ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">{t("dashboard.credits.loading")}</TableCell>
                      </TableRow>
                    ) : creditHistory?.transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">{t("dashboard.credits.noTransactions")}</TableCell>
                      </TableRow>
                    ) : (
                      creditHistory?.transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                          <TableCell>
                            {(() => {
                              const desc = transaction.description;
                              if (desc.includes('Content generation')) {
                                return t("dashboard.credits.transactions.contentGeneration");
                              } else if (desc.includes('Created article:')) {
                                return desc.replace('Created article:', t("dashboard.credits.transactions.createdArticle"));
                              } else if (desc.includes('Purchase')) {
                                return desc.replace('Purchase', t("dashboard.credits.transactions.purchase"));
                              } else if (desc.includes('Refund')) {
                                return desc.replace('Refund', t("dashboard.credits.transactions.refund"));
                              } else {
                                return desc;
                              }
                            })()}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount} tín dụng
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage <= 1 || isLoadingHistory}
                >
                  {t("dashboard.credits.previous")}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {t("dashboard.credits.page")} {currentPage} / {creditHistory?.pagination.totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={(currentPage >= (creditHistory?.pagination.totalPages || 1)) || isLoadingHistory}
                >
                  {t("dashboard.credits.next")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Purchase Confirmation Dialog */}
        <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Purchase</DialogTitle>
              <DialogDescription>
                You are about to purchase the {selectedPlan?.name} for {formatCurrency(selectedPlan?.price || 0)}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <Coins className="h-10 w-10 text-primary-600" />
                <div>
                  <h3 className="font-medium">{selectedPlan?.value} Credits</h3>
                  <p className="text-sm text-muted-foreground">Will be added to your account</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <CreditCard className="h-10 w-10 text-secondary-600" />
                <div>
                  <h3 className="font-medium">Payment</h3>
                  <p className="text-sm text-muted-foreground">
                    Secure payment via Stripe/MoMo/VNPAY
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <ShieldCheck className="h-10 w-10 text-green-600" />
                <div>
                  <h3 className="font-medium">Money Back Guarantee</h3>
                  <p className="text-sm text-muted-foreground">
                    7-day refund policy for unused credits
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsPurchaseDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmPurchase}
                disabled={purchaseCreditMutation.isPending}
              >
                {purchaseCreditMutation.isPending ? "Processing..." : "Confirm Purchase"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </>
  );
}
