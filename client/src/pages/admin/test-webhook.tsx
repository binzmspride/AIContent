import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/Layout";
import { useLanguage } from "@/hooks/use-language";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Save, Webhook } from "lucide-react";
import Head from "@/components/head";

// Định nghĩa schema cho form webhook
const webhookSchema = z.object({
  webhookUrl: z.string().url("Phải là URL hợp lệ").optional().or(z.literal("")),
  webhookSecret: z.string().optional().or(z.literal("")),
  notificationWebhookUrl: z.string().url("Phải là URL hợp lệ").optional().or(z.literal("")),
});

type WebhookFormValues = z.infer<typeof webhookSchema>;

export default function TestWebhookPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [webhookSettings, setWebhookSettings] = useState({
    webhookUrl: '',
    webhookSecret: '',
    notificationWebhookUrl: ''
  });

  // Form cho cài đặt webhook
  const webhookForm = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      webhookUrl: '',
      webhookSecret: '',
      notificationWebhookUrl: '',
    },
  });

  // Lấy cài đặt webhook từ server
  useEffect(() => {
    async function fetchWebhookSettings() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/settings');
        if (!response.ok) {
          throw new Error(`Error fetching settings: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Webhook settings from API:", data);
        
        if (data.success && data.data) {
          const settings = {
            webhookUrl: data.data.content_webhook_url || data.data.webhookUrl || '',
            webhookSecret: data.data.webhook_secret || data.data.webhookSecret || '',
            notificationWebhookUrl: data.data.notification_webhook_url || data.data.notificationWebhookUrl || ''
          };
          
          console.log("Extracted webhook settings:", settings);
          setWebhookSettings(settings);
          
          // Cập nhật giá trị form
          webhookForm.setValue('webhookUrl', settings.webhookUrl);
          webhookForm.setValue('webhookSecret', settings.webhookSecret);
          webhookForm.setValue('notificationWebhookUrl', settings.notificationWebhookUrl);
        }
      } catch (error) {
        console.error("Error fetching webhook settings:", error);
        toast({
          title: "Lỗi",
          description: "Không thể lấy cài đặt webhook.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchWebhookSettings();
  }, [toast, webhookForm]);

  // Xử lý khi submit form webhook
  const onWebhookSubmit = (values: WebhookFormValues) => {
    console.log("Submitting webhook settings:", values);
    updateWebhookSettingsMutation.mutate(values);
  };

  // Mutation để cập nhật cài đặt webhook
  const updateWebhookSettingsMutation = useMutation({
    mutationFn: async (values: WebhookFormValues) => {
      const response = await fetch("/api/admin/settings/webhook", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values),
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json().catch(() => ({ success: true }));
    },
    onSuccess: () => {
      toast({
        title: "Cập nhật thành công",
        description: "Cài đặt webhook đã được cập nhật.",
      });
      
      // Reload settings
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AdminLayout>
      <Head title="Test Webhook Settings" />
      <div className="container mx-auto py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Cài đặt Webhook
            </CardTitle>
            <CardDescription>
              Cấu hình webhooks để tích hợp với các dịch vụ bên ngoài
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...webhookForm}>
              <form onSubmit={webhookForm.handleSubmit(onWebhookSubmit)} className="space-y-4">
                <FormField
                  control={webhookForm.control}
                  name="webhookUrl"
                  render={({ field }) => {
                    console.log("Rendering webhookUrl field with value:", field.value);
                    return (
                      <FormItem>
                        <FormLabel>URL webhook tạo nội dung</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://workflows-in.matbao.com/webhook/..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          URL webhook dùng để tạo nội dung AI (debug - giá trị từ server: {webhookSettings.webhookUrl})
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={webhookForm.control}
                  name="webhookSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Khóa bí mật webhook</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="whsec_..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Khóa bí mật để xác thực các yêu cầu webhook
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={webhookForm.control}
                  name="notificationWebhookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL webhook thông báo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://hooks.slack.com/services/..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        URL webhook để gửi thông báo hệ thống
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={updateWebhookSettingsMutation.isPending}>
                  {updateWebhookSettingsMutation.isPending ? (
                    <>Đang lưu...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Lưu cài đặt
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-5">
            <div className="text-sm text-gray-500">
              Cài đặt webhook sẽ được sử dụng cho tất cả các chức năng tạo nội dung.
            </div>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Giá trị webhook hiện tại</CardTitle>
            <CardDescription>
              Hiển thị giá trị webhook lấy trực tiếp từ server
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Webhook URL</Label>
                <div className="mt-1 p-2 border rounded-md bg-gray-50">
                  {webhookSettings.webhookUrl || 'Chưa được cấu hình'}
                </div>
              </div>
              
              <div>
                <Label>Webhook Secret</Label>
                <div className="mt-1 p-2 border rounded-md bg-gray-50">
                  {webhookSettings.webhookSecret || 'Chưa được cấu hình'}
                </div>
              </div>
              
              <div>
                <Label>Notification Webhook URL</Label>
                <div className="mt-1 p-2 border rounded-md bg-gray-50">
                  {webhookSettings.notificationWebhookUrl || 'Chưa được cấu hình'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}