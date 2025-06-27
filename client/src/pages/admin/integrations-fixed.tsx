import { useState } from "react";
import { AdminLayout } from "@/components/admin/Layout";
import { useLanguage } from "@/hooks/use-language";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Edit, Plus, RefreshCw, TestTube, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDate } from "@/lib/utils";
import Head from "@/components/head";
import { Textarea } from "@/components/ui/textarea";

// Define webhook types
type WebhookType = "n8n" | "zapier" | "make";

// Define webhook status
type WebhookStatus = "active" | "inactive" | "error";

// Define webhook interface
interface Webhook {
  id: number;
  name: string;
  url: string;
  type: WebhookType;
  event: string;
  status: WebhookStatus;
  description?: string;
  secretKey?: string;
  createdAt: string;
  lastTriggered?: string;
}

// Define webhook form schema
const webhookFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  url: z.string().url("Please enter a valid URL"),
  type: z.enum(["n8n", "zapier", "make"], {
    required_error: "You need to select a webhook type",
  }),
  event: z.string().min(1, "Event is required"),
  description: z.string().optional(),
  secretKey: z.string().optional(),
  isActive: z.boolean().default(true),
});

type WebhookFormValues = z.infer<typeof webhookFormSchema>;

export default function AdminIntegrations() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<WebhookType>("n8n");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);

  // Fetch webhooks
  const { data: webhooksResponse, isLoading: isLoadingWebhooks } = useQuery<{success: boolean, data: Webhook[]}>({
    queryKey: ["/api/admin/webhooks"],
    queryFn: async () => {
      // Mock data until API is available
      const mockWebhooks: Webhook[] = [
        {
          id: 1,
          name: "Article Created Notification",
          url: "https://n8n.example.com/webhook/article-created",
          type: "n8n",
          event: "article.created",
          status: "active",
          description: "Triggers when a new article is created in the system",
          secretKey: "wh_sec_123456",
          createdAt: "2023-04-12T10:30:00Z",
          lastTriggered: "2023-05-01T14:23:45Z",
        },
        {
          id: 2,
          name: "User Registration",
          url: "https://n8n.example.com/webhook/user-registered",
          type: "n8n",
          event: "user.registered",
          status: "active",
          description: "Triggers when a new user registers on the platform",
          secretKey: "wh_sec_abcdef",
          createdAt: "2023-03-20T08:15:30Z",
          lastTriggered: "2023-05-02T09:45:12Z",
        },
        {
          id: 3,
          name: "Payment Processing",
          url: "https://make.com/webhook/payment-processed",
          type: "make",
          event: "payment.processed",
          status: "inactive",
          description: "Triggers when a payment is successfully processed",
          createdAt: "2023-02-15T11:20:45Z",
        },
      ];
      
      return {
        success: true,
        data: mockWebhooks
      };
    },
  });
  
  const webhooks = webhooksResponse?.data || [];
  
  // Filter webhooks by type
  const filteredWebhooks = webhooks.filter(webhook => webhook.type === activeTab);

  // Form for adding new webhook
  const addForm = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      name: "",
      url: "",
      type: "n8n",
      event: "",
      description: "",
      secretKey: "",
      isActive: true,
    },
  });

  // Form for editing webhook
  const editForm = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      name: "",
      url: "",
      type: "n8n",
      event: "",
      description: "",
      secretKey: "",
      isActive: true,
    },
  });

  // Create webhook mutation
  const createWebhookMutation = useMutation({
    mutationFn: async (data: WebhookFormValues) => {
      // Mock API call
      console.log("Creating webhook:", data);
      return { success: true, data: { id: Date.now(), ...data, createdAt: new Date().toISOString() } };
    },
    onSuccess: () => {
      toast({
        title: "Webhook created",
        description: "The webhook has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/webhooks"] });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create webhook",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update webhook mutation
  const updateWebhookMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: WebhookFormValues }) => {
      // Mock API call
      console.log("Updating webhook:", id, data);
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Webhook updated",
        description: "The webhook has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/webhooks"] });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update webhook",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete webhook mutation
  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: number) => {
      // Mock API call
      console.log("Deleting webhook:", id);
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Webhook deleted",
        description: "The webhook has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/webhooks"] });
      setIsDeleteDialogOpen(false);
      setSelectedWebhook(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete webhook",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Test webhook mutation
  const testWebhookMutation = useMutation({
    mutationFn: async (id: number) => {
      // Mock API call
      console.log("Testing webhook:", id);
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Webhook tested",
        description: "The webhook test was successful",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Webhook test failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onAddSubmit = (data: WebhookFormValues) => {
    createWebhookMutation.mutate(data);
  };

  const onEditSubmit = (data: WebhookFormValues) => {
    if (selectedWebhook) {
      updateWebhookMutation.mutate({ id: selectedWebhook.id, data });
    }
  };

  const handleEditClick = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    editForm.reset({
      name: webhook.name,
      url: webhook.url,
      type: webhook.type,
      event: webhook.event,
      description: webhook.description || "",
      secretKey: webhook.secretKey || "",
      isActive: webhook.status === "active",
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setIsDeleteDialogOpen(true);
  };

  const handleTestWebhook = (id: number) => {
    testWebhookMutation.mutate(id);
  };

  const confirmDelete = () => {
    if (selectedWebhook) {
      deleteWebhookMutation.mutate(selectedWebhook.id);
    }
  };

  // Get status badge color
  const getStatusBadge = (status: WebhookStatus) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case "inactive":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>;
      case "error":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <>
      <Head>
        <title>{t("admin.integrations")} - {t("common.appName")}</title>
      </Head>
      
      <AdminLayout title={t("admin.integrations")}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
              <CardTitle>Webhooks & Integrations</CardTitle>
              <CardDescription>
                Manage webhook integrations to connect your application with external services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <button 
                    className={`px-4 py-2 ${activeTab === 'n8n' ? 'bg-primary text-white' : 'bg-muted'} rounded-md text-sm font-medium`}
                    onClick={() => setActiveTab('n8n')}
                  >
                    n8n
                  </button>
                  <button 
                    className={`px-4 py-2 ${activeTab === 'zapier' ? 'bg-primary text-white' : 'bg-muted'} rounded-md text-sm font-medium`}
                    onClick={() => setActiveTab('zapier')}
                  >
                    Zapier
                  </button>
                  <button 
                    className={`px-4 py-2 ${activeTab === 'make' ? 'bg-primary text-white' : 'bg-muted'} rounded-md text-sm font-medium`}
                    onClick={() => setActiveTab('make')}
                  >
                    Make.com
                  </button>
                </div>
                
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Webhook
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>Add New Webhook</DialogTitle>
                      <DialogDescription>
                        Create a new webhook to integrate with external services. Click save when you're done.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...addForm}>
                      <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                        <FormField
                          control={addForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Webhook Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Article Created Notification" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={addForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Integration Type</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <select
                                    className="w-full bg-background flex h-10 rounded-md border border-input py-2 px-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                    {...field}
                                  >
                                    <option value="n8n">n8n</option>
                                    <option value="zapier">Zapier</option>
                                    <option value="make">Make.com</option>
                                  </select>
                                </FormControl>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                                    <path d="M7 7l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={addForm.control}
                          name="event"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Type</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. article.created" {...field} />
                              </FormControl>
                              <FormDescription>
                                The event that will trigger this webhook (e.g., article.created, user.registered)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={addForm.control}
                          name="url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Webhook URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://n8n.example.com/webhook/..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={addForm.control}
                          name="secretKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Secret Key (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Secret key for webhook authentication" {...field} />
                              </FormControl>
                              <FormDescription>
                                Used to verify webhook requests come from our system
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={addForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe the purpose of this webhook" 
                                  className="min-h-[80px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={addForm.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Active</FormLabel>
                                <FormDescription>
                                  Enable or disable this webhook
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsAddDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createWebhookMutation.isPending}>
                            {createWebhookMutation.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                            Save Webhook
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
              
              {activeTab === 'n8n' && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Triggered</TableHead>
                        <TableHead className="w-[150px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWebhooks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                            No webhooks found. Create your first webhook to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredWebhooks.map(webhook => (
                          <TableRow key={webhook.id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{webhook.name}</span>
                                <span className="text-xs text-muted-foreground truncate max-w-[240px]">{webhook.url}</span>
                              </div>
                            </TableCell>
                            <TableCell>{webhook.event}</TableCell>
                            <TableCell>{getStatusBadge(webhook.status)}</TableCell>
                            <TableCell>{formatDate(new Date(webhook.createdAt))}</TableCell>
                            <TableCell>
                              {webhook.lastTriggered ? formatDate(new Date(webhook.lastTriggered)) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleTestWebhook(webhook.id)}
                                title="Test Webhook"
                              >
                                <TestTube className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(webhook)}
                                title="Edit Webhook"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(webhook)}
                                title="Delete Webhook"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {activeTab === 'zapier' && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Triggered</TableHead>
                        <TableHead className="w-[150px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWebhooks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                            No Zapier integrations found. Create your first integration to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredWebhooks.map(webhook => (
                          <TableRow key={webhook.id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{webhook.name}</span>
                                <span className="text-xs text-muted-foreground truncate max-w-[240px]">{webhook.url}</span>
                              </div>
                            </TableCell>
                            <TableCell>{webhook.event}</TableCell>
                            <TableCell>{getStatusBadge(webhook.status)}</TableCell>
                            <TableCell>{formatDate(new Date(webhook.createdAt))}</TableCell>
                            <TableCell>
                              {webhook.lastTriggered ? formatDate(new Date(webhook.lastTriggered)) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleTestWebhook(webhook.id)}
                                title="Test Webhook"
                              >
                                <TestTube className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(webhook)}
                                title="Edit Webhook"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(webhook)}
                                title="Delete Webhook"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {activeTab === 'make' && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Triggered</TableHead>
                        <TableHead className="w-[150px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWebhooks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                            No Make.com integrations found. Create your first integration to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredWebhooks.map(webhook => (
                          <TableRow key={webhook.id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{webhook.name}</span>
                                <span className="text-xs text-muted-foreground truncate max-w-[240px]">{webhook.url}</span>
                              </div>
                            </TableCell>
                            <TableCell>{webhook.event}</TableCell>
                            <TableCell>{getStatusBadge(webhook.status)}</TableCell>
                            <TableCell>{formatDate(new Date(webhook.createdAt))}</TableCell>
                            <TableCell>
                              {webhook.lastTriggered ? formatDate(new Date(webhook.lastTriggered)) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleTestWebhook(webhook.id)}
                                title="Test Webhook"
                              >
                                <TestTube className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(webhook)}
                                title="Edit Webhook"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(webhook)}
                                title="Delete Webhook"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {/* Edit Webhook Dialog */}
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Edit Webhook</DialogTitle>
                    <DialogDescription>
                      Update your webhook settings. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...editForm}>
                    <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                      <FormField
                        control={editForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Webhook Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Integration Type</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <select
                                  className="w-full bg-background flex h-10 rounded-md border border-input py-2 px-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                  {...field}
                                >
                                  <option value="n8n">n8n</option>
                                  <option value="zapier">Zapier</option>
                                  <option value="make">Make.com</option>
                                </select>
                              </FormControl>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                                  <path d="M7 7l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="event"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Type</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              The event that will trigger this webhook
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Webhook URL</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="secretKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secret Key (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Used to verify webhook requests come from our system
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                className="min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Active</FormLabel>
                              <FormDescription>
                                Enable or disable this webhook
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
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
                        <Button type="submit" disabled={updateWebhookMutation.isPending}>
                          {updateWebhookMutation.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              {/* Delete Confirmation Dialog */}
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Webhook</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this webhook? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="bg-muted/50 rounded-md p-3 my-2">
                    {selectedWebhook && (
                      <div>
                        <p className="font-medium">{selectedWebhook.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{selectedWebhook.url}</p>
                      </div>
                    )}
                  </div>
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
                      disabled={deleteWebhookMutation.isPending}
                    >
                      {deleteWebhookMutation.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                      Delete Webhook
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
              <CardTitle>Integration Documentation</CardTitle>
              <CardDescription>
                Developer resources for integrating with our webhook system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <h3 className="text-lg font-medium">Webhook Documentation</h3>
                  <p className="text-muted-foreground mt-1">
                    Learn how to integrate with our webhook system using the guides below
                  </p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a href="#" className="flex items-center p-3 rounded-md border hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium">n8n Integration Guide</p>
                        <p className="text-sm text-muted-foreground">Set up automation workflows with n8n</p>
                      </div>
                      <ArrowUpRight className="ml-auto h-4 w-4" />
                    </a>
                    <a href="#" className="flex items-center p-3 rounded-md border hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium">Zapier Integration Guide</p>
                        <p className="text-sm text-muted-foreground">Connect with 5,000+ apps on Zapier</p>
                      </div>
                      <ArrowUpRight className="ml-auto h-4 w-4" />
                    </a>
                    <a href="#" className="flex items-center p-3 rounded-md border hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium">Make.com Integration Guide</p>
                        <p className="text-sm text-muted-foreground">Create advanced integrations visually</p>
                      </div>
                      <ArrowUpRight className="ml-auto h-4 w-4" />
                    </a>
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <h3 className="text-lg font-medium">API Reference</h3>
                  <p className="text-muted-foreground mt-1">
                    Explore our API documentation for webhook integrations
                  </p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-md border">
                      <h4 className="font-medium">Webhook Event Structure</h4>
                      <pre className="mt-2 p-2 rounded-md bg-muted overflow-auto text-xs">
{`{
  "event": "article.created",
  "payload": {
    "id": 123,
    "title": "Example Article",
    "content": "Article content...",
    "authorId": 456,
    "createdAt": "2023-05-01T14:23:45Z"
  }
}`}
                      </pre>
                    </div>
                    <div className="p-3 rounded-md border">
                      <h4 className="font-medium">Security &amp; Authentication</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        All webhook requests include a signature header for verification:
                      </p>
                      <pre className="mt-2 p-2 rounded-md bg-muted overflow-auto text-xs">
{`X-Webhook-Signature: sha256=...

# Verify signature with:
HMAC-SHA256(webhook_secret, request_body)`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
}