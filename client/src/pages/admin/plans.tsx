import { useState } from "react";
import { AdminLayout } from "@/components/admin/Layout";
import { useLanguage } from "@/hooks/use-language";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plan, planTypeEnum } from "@shared/schema";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Head from "@/components/head";

const planFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  type: z.enum(["credit", "storage"]),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  value: z.coerce.number().min(1, "Value must be at least 1"),
  duration: z.coerce.number().optional(),
});

type PlanFormValues = z.infer<typeof planFormSchema>;

// Trial Plan schema
const trialPlanSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
});

type TrialPlanFormValues = z.infer<typeof trialPlanSchema>;

export default function AdminPlans() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"credit" | "storage">("credit");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTrialPlanDialogOpen, setIsTrialPlanDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Fetch plans
  const { data: plansResponse, isLoading: isLoadingPlans } = useQuery<{success: boolean, data: Plan[]}>({
    queryKey: ["/api/plans"],
  });
  
  // Fetch trial plan info
  const { data: trialPlanResponse, isLoading: isLoadingTrialPlan } = useQuery<{ success: boolean, data: Plan }>({
    queryKey: ["/api/admin/trial-plan"],
    queryFn: async () => {
      const response = await fetch('/api/admin/trial-plan');
      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, data: null };
        }
        throw new Error(`Error fetching trial plan: ${response.statusText}`);
      }
      return await response.json();
    },
  });
  
  const plans = plansResponse?.data || [];
  
  // Filter plans by type
  const creditPlans = plans.filter(plan => plan.type === "credit");
  const storagePlans = plans.filter(plan => plan.type === "storage");

  // Form for adding new plan
  const addForm = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "credit",
      price: 0,
      value: 0,
      duration: undefined,
    },
  });

  // Form for editing plan
  const editForm = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "credit",
      price: 0,
      value: 0,
      duration: undefined,
    },
  });
  
  // Form for trial plan settings
  const trialPlanForm = useForm<TrialPlanFormValues>({
    resolver: zodResolver(trialPlanSchema),
    defaultValues: {
      planId: trialPlanResponse?.success && trialPlanResponse.data ? 
        String(trialPlanResponse.data.id) : "",
    },
  });

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async (data: PlanFormValues) => {
      const res = await apiRequest("POST", "/api/admin/plans", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Plan created",
        description: "The plan has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PlanFormValues }) => {
      const res = await apiRequest("PATCH", `/api/admin/plans/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Plan updated",
        description: "The plan has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/plans/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Plan deleted",
        description: "The plan has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      setIsDeleteDialogOpen(false);
      setSelectedPlan(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Trial plan mutation
  const updateTrialPlanMutation = useMutation({
    mutationFn: async (data: TrialPlanFormValues) => {
      const res = await apiRequest("PATCH", "/api/admin/trial-plan", {
        planId: data.planId
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Trial plan updated",
        description: "The trial plan has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trial-plan"] });
      setIsTrialPlanDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update trial plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onAddSubmit = (data: PlanFormValues) => {
    createPlanMutation.mutate(data);
  };

  const onEditSubmit = (data: PlanFormValues) => {
    if (selectedPlan) {
      updatePlanMutation.mutate({ id: selectedPlan.id, data });
    }
  };
  
  const onTrialPlanSubmit = (data: TrialPlanFormValues) => {
    updateTrialPlanMutation.mutate(data);
  };

  const handleEditClick = (plan: Plan) => {
    setSelectedPlan(plan);
    editForm.reset({
      name: plan.name,
      description: plan.description || "",
      type: plan.type,
      price: plan.price,
      value: plan.value,
      duration: plan.duration || undefined,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPlan) {
      deletePlanMutation.mutate(selectedPlan.id);
    }
  };

  return (
    <>
      <Head>
        <title>{t("admin.plans")} - {t("common.appName")}</title>
      </Head>
      
      <AdminLayout title={t("admin.plans")}>
        <div className="mb-6 flex justify-between items-center">
          <Tabs defaultValue="credit" className="w-[400px]" onValueChange={(value) => setActiveTab(value as "credit" | "storage")}>
            <TabsList>
              <TabsTrigger value="credit">Credit Plans</TabsTrigger>
              <TabsTrigger value="storage">Storage Plans</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsTrialPlanDialogOpen(true)}
            >
              Configure Trial Plan
            </Button>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Add New Plan</DialogTitle>
                  <DialogDescription>
                    Create a new plan for users to purchase. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                    <FormField
                      control={addForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plan Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Basic Plan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Brief description of the plan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a plan type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="credit">Credit</SelectItem>
                                <SelectItem value="storage">Storage</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (VND)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} min={0} step={1000} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addForm.control}
                        name="value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {addForm.watch("type") === "credit" ? "Credits" : "Storage (MB)"}
                            </FormLabel>
                            <FormControl>
                              <Input type="number" {...field} min={1} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addForm.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (days)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                min={1}
                                value={field.value || ""} 
                                onChange={(e) => {
                                  const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                                  field.onChange(value);
                                }}
                                placeholder="Leave empty for one-time"
                              />
                            </FormControl>
                            <FormDescription>
                              Leave empty for one-time purchase
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createPlanMutation.isPending}
                      >
                        {createPlanMutation.isPending ? "Creating..." : "Create Plan"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Trial Plan Dialog */}
        <Dialog open={isTrialPlanDialogOpen} onOpenChange={setIsTrialPlanDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Configure Trial Plan</DialogTitle>
              <DialogDescription>
                Set which plan should be given to new users as a trial plan
              </DialogDescription>
            </DialogHeader>
            
            <Form {...trialPlanForm}>
              <form onSubmit={trialPlanForm.handleSubmit(onTrialPlanSubmit)} className="space-y-4">
                <FormField
                  control={trialPlanForm.control}
                  name="planId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trial Plan</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {creditPlans.map((plan) => (
                            <SelectItem key={plan.id} value={String(plan.id)}>
                              {plan.name} ({plan.value} credits)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {trialPlanResponse?.success && trialPlanResponse.data ? (
                          <span>Current trial plan: <strong>{trialPlanResponse.data.name}</strong></span>
                        ) : (
                          <span>No trial plan is currently configured</span>
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsTrialPlanDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateTrialPlanMutation.isPending}
                  >
                    {updateTrialPlanMutation.isPending ? "Updating..." : "Update Trial Plan"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "credit" ? "Credit Plans" : "Storage Plans"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingPlans ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">Loading plans...</TableCell>
                  </TableRow>
                ) : activeTab === "credit" ? (
                  creditPlans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">No credit plans found</TableCell>
                    </TableRow>
                  ) : (
                    creditPlans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell>{plan.id}</TableCell>
                        <TableCell>{plan.name}</TableCell>
                        <TableCell>{plan.description || "-"}</TableCell>
                        <TableCell>{plan.value} credits</TableCell>
                        <TableCell>{formatCurrency(plan.price)}</TableCell>
                        <TableCell>{plan.duration ? `${plan.duration} days` : "One-time"}</TableCell>
                        <TableCell>{formatDate(new Date(plan.createdAt))}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditClick(plan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteClick(plan)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )
                ) : storagePlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">No storage plans found</TableCell>
                  </TableRow>
                ) : (
                  storagePlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>{plan.id}</TableCell>
                      <TableCell>{plan.name}</TableCell>
                      <TableCell>{plan.description || "-"}</TableCell>
                      <TableCell>{plan.value} MB</TableCell>
                      <TableCell>{formatCurrency(plan.price)}</TableCell>
                      <TableCell>{plan.duration ? `${plan.duration} days` : "One-time"}</TableCell>
                      <TableCell>{formatDate(new Date(plan.createdAt))}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditClick(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteClick(plan)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Edit Plan Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Plan</DialogTitle>
              <DialogDescription>
                Make changes to the plan details. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Basic Plan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of the plan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (VND)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} min={0} step={1000} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {editForm.watch("type") === "credit" ? "Credits" : "Storage (MB)"}
                        </FormLabel>
                        <FormControl>
                          <Input type="number" {...field} min={1} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={editForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (days)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          min={1}
                          value={field.value || ""} 
                          onChange={(e) => {
                            const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                            field.onChange(value);
                          }}
                          placeholder="Leave empty for one-time"
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty for one-time purchase
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={updatePlanMutation.isPending}
                  >
                    {updatePlanMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Delete Plan Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Plan</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this plan? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            {selectedPlan && (
              <div className="py-4">
                <p><strong>Name:</strong> {selectedPlan.name}</p>
                <p><strong>Type:</strong> {selectedPlan.type}</p>
                <p><strong>Value:</strong> {selectedPlan.value} {selectedPlan.type === "credit" ? "credits" : "MB"}</p>
                <p><strong>Price:</strong> {formatCurrency(selectedPlan.price)}</p>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                variant="destructive"
                onClick={confirmDelete}
                disabled={deletePlanMutation.isPending}
              >
                {deletePlanMutation.isPending ? "Deleting..." : "Delete Plan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}