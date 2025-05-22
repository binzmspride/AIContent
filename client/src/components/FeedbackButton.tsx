import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MessageSquare, Send, Mail } from "lucide-react";

const feedbackSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Vui lòng nhập email hợp lệ"),
  subject: z.string().min(5, "Chủ đề phải có ít nhất 5 ký tự"),
  message: z.string().min(10, "Tin nhắn phải có ít nhất 10 ký tự"),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

interface FeedbackButtonProps {
  page?: string;
  variant?: "floating" | "inline";
}

export function FeedbackButton({ page = "unknown", variant = "floating" }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
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
      setIsOpen(false);
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
      page
    });
  };

  const buttonClass = variant === "floating" 
    ? "fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full h-12 w-12 p-0"
    : "bg-transparent border border-slate-600 text-slate-300 hover:bg-slate-700/50 transition-colors";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={buttonClass}>
          {variant === "floating" ? (
            <MessageSquare className="h-5 w-5" />
          ) : (
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedback
            </div>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] bg-slate-800 border border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-primary" />
            Gửi phản hồi
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Chia sẻ ý kiến, đề xuất hoặc báo cáo lỗi để giúp chúng tôi cải thiện dịch vụ.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">
                      Họ và tên <span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nhập họ và tên"
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
                      <Mail className="h-4 w-4 mr-1" />
                      Email <span className="text-red-400">*</span>
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
                  <FormLabel className="text-slate-200">
                    Chủ đề <span className="text-red-400">*</span>
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
                  <FormLabel className="text-slate-200">
                    Nội dung <span className="text-red-400">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Mô tả chi tiết ý kiến hoặc vấn đề..."
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white"
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
                    Gửi
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}