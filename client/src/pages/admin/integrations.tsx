import { useState } from "react";
import { AdminLayout } from "@/components/admin/Layout";
import { useDbTranslations } from "@/hooks/use-db-translations";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const { t } = useDbTranslations();
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
                <Tabs defaultValue="n8n" className="w-[400px]" onValueChange={(value) => setActiveTab(value as WebhookType)}>
                  <TabsList>
                    <TabsTrigger value="n8n">n8n</TabsTrigger>
                    <TabsTrigger value="zapier">Zapier</TabsTrigger>
                    <TabsTrigger value="make">Make.com</TabsTrigger>
                  </TabsList>
                </Tabs>
                
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
                                Used to verify webhook requests. Leave empty to auto-generate.
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
                                  placeholder="Brief description of the webhook's purpose" 
                                  {...field} 
                                  className="resize-none"
                                  rows={3}
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
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Active Status
                                </FormLabel>
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
                          <Button 
                            type="submit"
                            disabled={createWebhookMutation.isPending}
                          >
                            {createWebhookMutation.isPending ? "Creating..." : "Create Webhook"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <TabsContent value="n8n" className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead className="hidden md:table-cell">URL</TableHead>
                        <TableHead className="hidden md:table-cell">Created</TableHead>
                        <TableHead className="hidden md:table-cell">Last Triggered</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingWebhooks ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">Loading webhooks...</TableCell>
                        </TableRow>
                      ) : filteredWebhooks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">No webhooks found</TableCell>
                        </TableRow>
                      ) : (
                        filteredWebhooks.map((webhook) => (
                          <TableRow key={webhook.id}>
                            <TableCell>{getStatusBadge(webhook.status)}</TableCell>
                            <TableCell className="font-medium">{webhook.name}</TableCell>
                            <TableCell><code className="text-xs bg-gray-100 p-1 rounded">{webhook.event}</code></TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center">
                                <span className="truncate max-w-[250px]">{webhook.url}</span>
                                <a 
                                  href={webhook.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-2 text-gray-500 hover:text-gray-800"
                                >
                                  <ArrowUpRight className="h-3 w-3" />
                                </a>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{formatDate(webhook.createdAt)}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {webhook.lastTriggered ? formatDate(webhook.lastTriggered) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleTestWebhook(webhook.id)}
                                className="h-8 mr-1"
                                disabled={webhook.status !== "active"}
                              >
                                <TestTube className="h-4 w-4 mr-1" />
                                Test
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditClick(webhook)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteClick(webhook)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="zapier" className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead className="hidden md:table-cell">URL</TableHead>
                        <TableHead className="hidden md:table-cell">Created</TableHead>
                        <TableHead className="hidden md:table-cell">Last Triggered</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingWebhooks ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">Loading webhooks...</TableCell>
                        </TableRow>
                      ) : filteredWebhooks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">No webhooks found</TableCell>
                        </TableRow>
                      ) : (
                        filteredWebhooks.map((webhook) => (
                          <TableRow key={webhook.id}>
                            <TableCell>{getStatusBadge(webhook.status)}</TableCell>
                            <TableCell className="font-medium">{webhook.name}</TableCell>
                            <TableCell><code className="text-xs bg-gray-100 p-1 rounded">{webhook.event}</code></TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center">
                                <span className="truncate max-w-[250px]">{webhook.url}</span>
                                <a 
                                  href={webhook.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-2 text-gray-500 hover:text-gray-800"
                                >
                                  <ArrowUpRight className="h-3 w-3" />
                                </a>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{formatDate(webhook.createdAt)}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {webhook.lastTriggered ? formatDate(webhook.lastTriggered) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleTestWebhook(webhook.id)}
                                className="h-8 mr-1"
                                disabled={webhook.status !== "active"}
                              >
                                <TestTube className="h-4 w-4 mr-1" />
                                Test
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditClick(webhook)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteClick(webhook)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="make" className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead className="hidden md:table-cell">URL</TableHead>
                        <TableHead className="hidden md:table-cell">Created</TableHead>
                        <TableHead className="hidden md:table-cell">Last Triggered</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingWebhooks ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">Loading webhooks...</TableCell>
                        </TableRow>
                      ) : filteredWebhooks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">No webhooks found</TableCell>
                        </TableRow>
                      ) : (
                        filteredWebhooks.map((webhook) => (
                          <TableRow key={webhook.id}>
                            <TableCell>{getStatusBadge(webhook.status)}</TableCell>
                            <TableCell className="font-medium">{webhook.name}</TableCell>
                            <TableCell><code className="text-xs bg-gray-100 p-1 rounded">{webhook.event}</code></TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center">
                                <span className="truncate max-w-[250px]">{webhook.url}</span>
                                <a 
                                  href={webhook.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-2 text-gray-500 hover:text-gray-800"
                                >
                                  <ArrowUpRight className="h-3 w-3" />
                                </a>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{formatDate(webhook.createdAt)}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {webhook.lastTriggered ? formatDate(webhook.lastTriggered) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleTestWebhook(webhook.id)}
                                className="h-8 mr-1"
                                disabled={webhook.status !== "active"}
                              >
                                <TestTube className="h-4 w-4 mr-1" />
                                Test
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditClick(webhook)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteClick(webhook)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage API keys for accessing your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium">Live API Key</h3>
                    <div className="mt-1 flex items-center">
                      <code className="text-xs bg-gray-100 p-1 rounded">sk_live_•••••••••••••••••••••••••</code>
                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Show</Button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium">Test API Key</h3>
                    <div className="mt-1 flex items-center">
                      <code className="text-xs bg-gray-100 p-1 rounded">sk_test_•••••••••••••••••••••••••</code>
                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Show</Button>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <Button size="sm" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Rotate API Keys
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Webhook Events</CardTitle>
              <CardDescription>
                Available events that can trigger webhooks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">User Events</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-start p-2 border rounded-md">
                      <code className="text-xs bg-gray-100 p-1 rounded mr-2">user.registered</code>
                      <span className="text-xs text-gray-500">Triggered when a new user registers</span>
                    </div>
                    <div className="flex items-start p-2 border rounded-md">
                      <code className="text-xs bg-gray-100 p-1 rounded mr-2">user.updated</code>
                      <span className="text-xs text-gray-500">Triggered when user profile is updated</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Article Events</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-start p-2 border rounded-md">
                      <code className="text-xs bg-gray-100 p-1 rounded mr-2">article.created</code>
                      <span className="text-xs text-gray-500">Triggered when a new article is created</span>
                    </div>
                    <div className="flex items-start p-2 border rounded-md">
                      <code className="text-xs bg-gray-100 p-1 rounded mr-2">article.published</code>
                      <span className="text-xs text-gray-500">Triggered when an article is published</span>
                    </div>
                    <div className="flex items-start p-2 border rounded-md">
                      <code className="text-xs bg-gray-100 p-1 rounded mr-2">article.updated</code>
                      <span className="text-xs text-gray-500">Triggered when an article is updated</span>
                    </div>
                    <div className="flex items-start p-2 border rounded-md">
                      <code className="text-xs bg-gray-100 p-1 rounded mr-2">article.deleted</code>
                      <span className="text-xs text-gray-500">Triggered when an article is deleted</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Payment Events</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-start p-2 border rounded-md">
                      <code className="text-xs bg-gray-100 p-1 rounded mr-2">payment.created</code>
                      <span className="text-xs text-gray-500">Triggered when a payment is initiated</span>
                    </div>
                    <div className="flex items-start p-2 border rounded-md">
                      <code className="text-xs bg-gray-100 p-1 rounded mr-2">payment.processed</code>
                      <span className="text-xs text-gray-500">Triggered when a payment is processed</span>
                    </div>
                    <div className="flex items-start p-2 border rounded-md">
                      <code className="text-xs bg-gray-100 p-1 rounded mr-2">payment.failed</code>
                      <span className="text-xs text-gray-500">Triggered when a payment fails</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Edit Webhook Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Webhook</DialogTitle>
              <DialogDescription>
                Make changes to the webhook configuration. Click save when you're done.
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
                        <Input placeholder="e.g. Article Created Notification" {...field} />
                      </FormControl>
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
                  control={editForm.control}
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
                  control={editForm.control}
                  name="secretKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secret Key (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Secret key for webhook authentication" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>
                        Used to verify webhook requests. Leave empty to auto-generate.
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
                          placeholder="Brief description of the webhook's purpose" 
                          {...field} 
                          value={field.value || ""}
                          className="resize-none"
                          rows={3}
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Status
                        </FormLabel>
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
                  <Button 
                    type="submit"
                    disabled={updateWebhookMutation.isPending}
                  >
                    {updateWebhookMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this webhook? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            {selectedWebhook && (
              <div className="py-4">
                <p><strong>Name:</strong> {selectedWebhook.name}</p>
                <p><strong>Event:</strong> {selectedWebhook.event}</p>
                <p><strong>URL:</strong> {selectedWebhook.url}</p>
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
                disabled={deleteWebhookMutation.isPending}
              >
                {deleteWebhookMutation.isPending ? "Deleting..." : "Delete Webhook"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}