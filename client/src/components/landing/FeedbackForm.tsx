import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Send, Mail, MessageSquare } from "lucide-react";

const feedbackSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Vui lòng nhập email hợp lệ"),
  subject: z.string().min(5, "Chủ đề phải có ít nhất 5 ký tự"),
  message: z.string().min(10, "Tin nhắn phải có ít nhất 10 ký tự"),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export function FeedbackForm() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: user?.fullName || "",
      email: user?.email || "",
      subject: "",
      message: "",
    },
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: (data: FeedbackFormValues & { page: string }) =>
      apiRequest('/api/feedback', 'POST', data),
    onSuccess: () => {
      toast({
        title: "Cảm ơn bạn!",
        description: "Feedback của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất có thể.",
      });
      form.reset({
        name: user?.fullName || "",
        email: user?.email || "",
        subject: "",
        message: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi gửi feedback. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FeedbackFormValues) => {
    submitFeedbackMutation.mutate({
      ...data,
      page: 'homepage'
    });
  };

  return (
    <section className="py-16 bg-slate-900 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-600/5"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-3xl font-bold text-white">
                Góp ý & Phản hồi
              </h2>
            </div>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Ý kiến của bạn rất quan trọng với chúng tôi. Hãy chia sẻ trải nghiệm, 
              đề xuất cải tiến hoặc báo cáo lỗi để giúp chúng tôi phát triển tốt hơn.
            </p>
          </div>

          {/* Feedback Form */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200 flex items-center">
                          <span>Họ và tên</span>
                          <span className="text-red-400 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Nhập họ và tên của bạn"
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200 flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>Email</span>
                          <span className="text-red-400 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="your@email.com"
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200 flex items-center">
                        <span>Chủ đề</span>
                        <span className="text-red-400 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Tóm tắt nội dung bạn muốn chia sẻ"
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200 flex items-center">
                        <span>Nội dung chi tiết</span>
                        <span className="text-red-400 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Mô tả chi tiết ý kiến, đề xuất hoặc vấn đề bạn gặp phải..."
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-center pt-4">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-3 font-semibold button-hover-effect"
                    disabled={submitFeedbackMutation.isPending}
                  >
                    {submitFeedbackMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang gửi...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Send className="h-4 w-4 mr-2" />
                        Gửi phản hồi
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </Form>

            {/* Contact info */}
            <div className="mt-8 pt-6 border-t border-slate-700/50">
              <p className="text-slate-400 text-sm text-center">
                Bạn cũng có thể liên hệ trực tiếp qua email:{" "}
                <a 
                  href="mailto:support@seoaiwriter.com" 
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  support@seoaiwriter.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}