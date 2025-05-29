import { useState } from "react";
import { User, Plan } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form schema for adjusting credits
const adjustCreditsSchema = z.object({
  amount: z.number()
    .refine(val => val !== 0, "Số lượng tín dụng không thể bằng 0"),
  description: z.string().optional(),
});

type AdjustCreditsFormValues = z.infer<typeof adjustCreditsSchema>;

// Form schema for assigning a plan
const assignPlanSchema = z.object({
  planId: z.number({ required_error: "Vui lòng chọn gói dịch vụ" }),
  duration: z.number().optional(),
});

type AssignPlanFormValues = z.infer<typeof assignPlanSchema>;

interface AdjustCreditsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

interface AssignPlanDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function AdjustCreditsDialog({ isOpen, onOpenChange, user }: AdjustCreditsDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();

  const adjustCreditsForm = useForm<AdjustCreditsFormValues>({
    resolver: zodResolver(adjustCreditsSchema),
    defaultValues: {
      amount: 0,
      description: "",
    }
  });

  // Adjust credits mutation
  const adjustCreditsMutation = useMutation({
    mutationFn: async ({ userId, amount, description }: { userId: number, amount: number, description?: string }) => {
      console.log("API Request: POST /api/admin/users/" + userId + "/credits", { amount, description });
      const res = await apiRequest("POST", `/api/admin/users/${userId}/credits`, {
        amount,
        description
      });
      const result = await res.json();
      console.log("API Response:", result);
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Thành công",
        description: `Tín dụng đã được điều chỉnh. Số dư hiện tại: ${data.data.currentCredits}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      onOpenChange(false);
      adjustCreditsForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onAdjustCreditsSubmit = (data: AdjustCreditsFormValues) => {
    if (user) {
      adjustCreditsMutation.mutate({
        userId: user.id,
        amount: data.amount,
        description: data.description
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{t("admin.usersManagement.adjustCredits") || "Điều chỉnh tín dụng"}</DialogTitle>
          <DialogDescription>
            {user && (
              <span>
                {t("admin.usersManagement.adjustCreditsForUser") || "Điều chỉnh tín dụng cho người dùng"}: <strong>{user.username}</strong><br/>
                {t("admin.usersManagement.currentCredits") || "Số dư hiện tại"}: <strong>{user.credits}</strong>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...adjustCreditsForm}>
          <form onSubmit={adjustCreditsForm.handleSubmit(onAdjustCreditsSubmit)} className="space-y-4">
            <FormField
              control={adjustCreditsForm.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.usersManagement.adjustmentAmount") || "Số lượng điều chỉnh"}</FormLabel>
                  <FormDescription>
                    {t("admin.usersManagement.adjustmentAmountDescription") || "Nhập số dương để thêm tín dụng, số âm để trừ tín dụng."}
                  </FormDescription>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="100" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={adjustCreditsForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.usersManagement.adjustmentReason") || "Lý do điều chỉnh"}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t("admin.usersManagement.adjustmentReasonPlaceholder") || "Ví dụ: Khuyến mãi, hoàn tiền, điều chỉnh lỗi..."} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                {t("common.cancel") || "Hủy"}
              </Button>
              <Button 
                type="submit"
                disabled={adjustCreditsMutation.isPending}
              >
                {adjustCreditsMutation.isPending && (
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {t("common.confirm") || "Xác nhận"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function AssignPlanDialog({ isOpen, onOpenChange, user }: AssignPlanDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();

  const assignPlanForm = useForm<AssignPlanFormValues>({
    resolver: zodResolver(assignPlanSchema),
    defaultValues: {
      planId: undefined,
      duration: undefined,
    }
  });

  // Fetch plans for the assign plan dialog
  const { data: plansResponse } = useQuery<{ success: boolean, data: { plans: Array<Plan> } }>({
    queryKey: ["/api/admin/plans"],
    queryFn: async () => {
      const response = await fetch('/api/admin/plans');
      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }
      return await response.json();
    },
    enabled: isOpen, // Only fetch when dialog is open
  });

  // Assign plan mutation
  const assignPlanMutation = useMutation({
    mutationFn: async ({ userId, planId, duration }: { userId: number, planId: number, duration?: number }) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/plans`, {
        planId,
        duration
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Gói dịch vụ đã được gán cho người dùng",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      onOpenChange(false);
      assignPlanForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onAssignPlanSubmit = (data: AssignPlanFormValues) => {
    if (user) {
      assignPlanMutation.mutate({
        userId: user.id,
        planId: data.planId,
        duration: data.duration
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("admin.usersManagement.assignPlan") || "Gán gói dịch vụ"}</DialogTitle>
          <DialogDescription>
            {user && (
              <span>
                {t("admin.usersManagement.assignPlanForUser") || "Gán gói dịch vụ cho người dùng"}: <strong>{user.username}</strong>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...assignPlanForm}>
          <form onSubmit={assignPlanForm.handleSubmit(onAssignPlanSubmit)} className="space-y-4">
            <FormField
              control={assignPlanForm.control}
              name="planId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.usersManagement.selectPlan") || "Chọn gói dịch vụ"}</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("admin.usersManagement.selectPlanPlaceholder") || "Chọn một gói dịch vụ"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {plansResponse?.data?.plans?.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.name} {plan.type === 'credit' ? `(${plan.value} credits)` : `(${plan.value} ${plan.type})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={assignPlanForm.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.usersManagement.customDuration") || "Thời gian sử dụng tùy chỉnh (ngày)"}</FormLabel>
                  <FormDescription>
                    {t("admin.usersManagement.customDurationDescription") || "Để trống để sử dụng thời gian mặc định của gói dịch vụ."}
                  </FormDescription>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="30" 
                      {...field}
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      value={field.value === undefined ? "" : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                {t("common.cancel") || "Hủy"}
              </Button>
              <Button 
                type="submit"
                disabled={assignPlanMutation.isPending}
              >
                {assignPlanMutation.isPending && (
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {t("common.confirm") || "Xác nhận"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}