import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { useLanguage } from "@/hooks/use-language";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate, formatCurrency, formatFileSize } from "@/lib/utils";
import { Plan, UserPlan } from "@shared/schema";
import {
  Check,
  AlertCircle,
  Calendar,
  AreaChart,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import Head from "@/components/head";

export interface UserPlansResponse {
  userPlans: (UserPlan & { plan: Plan })[];
}

export default function Plans() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);

  // Fetch storage plans
  const { data: storagePlansResponse, isLoading: isLoadingStoragePlans } = useQuery<{ success: boolean, data: Plan[] }>({
    queryKey: ["/api/plans", { type: "storage" }],
  });
  const storagePlans = storagePlansResponse?.data;

  // Fetch user plans
  const { data: userPlansResponse, isLoading: isLoadingUserPlans } = useQuery<{ success: boolean, data: UserPlansResponse }>({
    queryKey: ["/api/dashboard/user-plans"],
  });
  const userPlans = userPlansResponse?.data;

  // Purchase plan mutation
  const purchasePlanMutation = useMutation({
    mutationFn: async (planId: number) => {
      const res = await apiRequest("POST", "/api/dashboard/plans/purchase", { planId });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Purchase successful",
        description: "You have successfully subscribed to the plan",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/user-plans"] });
      setIsPurchaseDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase failed",
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
      purchasePlanMutation.mutate(selectedPlan.id);
    }
  };

  // Get active storage plan
  const activeStoragePlan = userPlans?.userPlans.find(
    up => up.plan.type === 'storage' && up.isActive
  );

  return (
    <>
      <Head>
        <title>{t("dashboard.plans")} - {t("common.appName")}</title>
      </Head>
      
      <DashboardLayout title={t("dashboard.plans")}>
        {/* Active Plan Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t("dashboard.plans.currentPlan")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUserPlans ? (
              <div className="text-center py-4">Loading your plan details...</div>
            ) : activeStoragePlan ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-semibold">{activeStoragePlan.plan.name}</h3>
                  <p className="text-sm text-secondary-500">{activeStoragePlan.plan.description}</p>
                  
                  <div className="mt-4 flex items-center">
                    <Calendar className="h-5 w-5 text-secondary-500 mr-2" />
                    <span className="text-sm text-secondary-500">
                      {t("dashboard.plans.expiresOn")}: {formatDate(activeStoragePlan.endDate)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Storage Usage</p>
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-primary-200">
                        <div 
                          style={{ 
                            width: `${Math.min(
                              (activeStoragePlan.usedStorage / activeStoragePlan.plan.value) * 100, 
                              100
                            )}%` 
                          }} 
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                        ></div>
                      </div>
                      <p className="text-xs text-secondary-500 mt-1">
                        {formatFileSize(activeStoragePlan.usedStorage)} of {formatFileSize(activeStoragePlan.plan.value)} used
                        ({Math.round((activeStoragePlan.usedStorage / activeStoragePlan.plan.value) * 100)}%)
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col justify-center items-end">
                  <div className="text-2xl font-bold text-primary-600">
                    {formatCurrency(activeStoragePlan.plan.price)}
                    <span className="text-sm font-normal text-secondary-500">/month</span>
                  </div>
                  
                  <div className="mt-4 space-x-2">
                    <Button variant="outline">
                      {t("dashboard.plans.renew")}
                    </Button>
                    <Button>
                      {t("dashboard.plans.upgrade")}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <AlertCircle className="h-10 w-10 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">No active storage plan</h3>
                <p className="text-secondary-500 max-w-md mx-auto mb-6">
                  You don't have an active storage plan. Subscribe to a plan to store your articles.
                </p>
                <Button onClick={() => document.getElementById('storage-plans-tab')?.click()}>
                  View Storage Plans
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plans Section */}
        <Tabs defaultValue="storage">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="storage" id="storage-plans-tab">{t("dashboard.plans.storagePackages")}</TabsTrigger>
            <TabsTrigger value="credit">{t("dashboard.plans.creditPackages")}</TabsTrigger>
          </TabsList>

          <TabsContent value="storage">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoadingStoragePlans ? (
                <div className="col-span-3 text-center py-10">Loading plans...</div>
              ) : (
                storagePlans?.map((plan) => (
                  <Card key={plan.id}>
                    <CardHeader className="bg-secondary-700 text-white">
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription className="text-white/90">
                        {formatCurrency(plan.price)}<span className="text-sm">/month</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ul className="space-y-2">
                        {/* Features based on plan name */}
                        {plan.name.includes("Basic") && (
                          <>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span>50 {t("landing.pricing.features.maxArticles")}</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span>5GB {t("landing.pricing.features.storage")}</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span>{t("landing.pricing.features.backup")} (weekly)</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span>1 {t("landing.pricing.features.wpConnections")}</span>
                            </li>
                          </>
                        )}
                        
                        {plan.name.includes("Business") && (
                          <>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span>200 {t("landing.pricing.features.maxArticles")}</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span>20GB {t("landing.pricing.features.storage")}</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span>{t("landing.pricing.features.backup")} (daily)</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span>3 {t("landing.pricing.features.wpConnections")}</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span>{t("landing.pricing.features.socialConnect")}</span>
                            </li>
                          </>
                        )}
                        
                        {plan.name.includes("Enterprise") && (
                          <>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span>{t("landing.pricing.features.maxArticles")} (unlimited)</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span>50GB {t("landing.pricing.features.storage")}</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span>{t("landing.pricing.features.backup")} (realtime)</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span>{t("landing.pricing.features.wpConnections")} (unlimited)</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span>{t("landing.pricing.features.socialConnect")} (all)</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span>{t("landing.pricing.features.apiAccess")}</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-secondary-700 hover:bg-secondary-800"
                        onClick={() => handlePurchase(plan)}
                      >
                        {t("landing.pricing.subscribe")}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="credit">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium">Credit Packages</h3>
              <p className="text-secondary-500">
                To purchase credit packages, please visit the Credits page
              </p>
              <Button className="mt-4" asChild>
                <a href="/dashboard/credits">Go to Credits</a>
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Purchase Confirmation Dialog */}
        <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Subscription</DialogTitle>
              <DialogDescription>
                You are about to subscribe to the {selectedPlan?.name} for {formatCurrency(selectedPlan?.price || 0)}/month.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <AreaChart className="h-10 w-10 text-secondary-700" />
                <div>
                  <h3 className="font-medium">{selectedPlan?.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedPlan?.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <CreditCard className="h-10 w-10 text-secondary-600" />
                <div>
                  <h3 className="font-medium">Recurring Payment</h3>
                  <p className="text-sm text-muted-foreground">
                    Your card will be charged {formatCurrency(selectedPlan?.price || 0)} monthly
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <ShieldCheck className="h-10 w-10 text-green-600" />
                <div>
                  <h3 className="font-medium">Cancel Anytime</h3>
                  <p className="text-sm text-muted-foreground">
                    You can cancel your subscription at any time
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
                disabled={purchasePlanMutation.isPending}
              >
                {purchasePlanMutation.isPending ? "Processing..." : "Subscribe Now"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </>
  );
}
