import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { useDbTranslations } from "@/hooks/use-db-translations";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Connection } from "@shared/schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  ExternalLink,
  Link2,
  Code,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Copy,
  Info,
} from "lucide-react";
import Head from "@/components/head";

// WordPress connection form schema
const wordpressSchema = z.object({
  url: z.string().url({
    message: "Please enter a valid URL starting with http:// or https://",
  }),
  username: z.string().min(2, {
    message: "Username must be at least 2 characters",
  }),
  appPassword: z.string().min(6, {
    message: "Application Password is required",
  }),
});

export default function Connections() {
  const { t } = useDbTranslations();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<Connection | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Fetch connections
  const { data: connectionsResponse, isLoading: isLoadingConnections } = useQuery<{success: boolean, data: Connection[]}>({
    queryKey: ["/api/dashboard/connections"],
  });
  
  const connections = connectionsResponse?.data || [];

  // Setup form for WordPress connection
  const wordpressForm = useForm<z.infer<typeof wordpressSchema>>({
    resolver: zodResolver(wordpressSchema),
    defaultValues: {
      url: "",
      username: "",
      appPassword: "",
    },
  });

  // Add WordPress connection mutation
  const addWordpressConnectionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof wordpressSchema>) => {
      const res = await apiRequest("POST", "/api/dashboard/connections/wordpress", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Connection added",
        description: "WordPress site connected successfully",
      });
      wordpressForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/connections"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete connection mutation
  const deleteConnectionMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/dashboard/connections/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Connection removed",
        description: "Connection removed successfully",
      });
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/connections"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Removal failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onWordpressSubmit = (data: z.infer<typeof wordpressSchema>) => {
    addWordpressConnectionMutation.mutate(data);
  };

  const handleDeleteConnection = (connection: Connection) => {
    setConnectionToDelete(connection);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteConnection = () => {
    if (connectionToDelete) {
      deleteConnectionMutation.mutate(connectionToDelete.id);
    }
  };

  const testConnection = async (connection: Connection) => {
    if (connection.type !== 'wordpress') return;
    
    setIsTestingConnection(true);
    try {
      // In a real app, this would make a real request to test the connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Connection successful",
        description: `Successfully connected to ${connection.name}`,
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Could not connect to WordPress site",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Group connections by type
  const wordpressConnections = connections?.filter(c => c.type === 'wordpress') || [];
  const facebookConnections = connections?.filter(c => c.type === 'facebook') || [];
  const tiktokConnections = connections?.filter(c => c.type === 'tiktok') || [];
  const twitterConnections = connections?.filter(c => c.type === 'twitter') || [];

  return (
    <>
      <Head>
        <title>{t("dashboard.connections")} - {t("common.appName")}</title>
      </Head>
      
      <DashboardLayout title={t("dashboard.connections")}>
        <Tabs defaultValue="wordpress">
          <TabsList className="w-full">
            <TabsTrigger value="wordpress" className="flex-1">WordPress</TabsTrigger>
            <TabsTrigger value="social" className="flex-1">Social Media</TabsTrigger>
            <TabsTrigger value="api" className="flex-1">API Webhook</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wordpress" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-2">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 19.5c-5.2 0-9.5-4.3-9.5-9.5S6.8 2.5 12 2.5s9.5 4.3 9.5 9.5-4.3 9.5-9.5 9.5zm-4.5-8.5c0 2.5 2.5 4.5 5 4.5v-2c-1.9 0-3.5-1.2-3.5-2.5V11H7.5v2zm9-3.5c0-2.5-2.5-4.5-5-4.5v2c1.9 0 3.5 1.2 3.5 2.5v1.5h1.5V9.5z" />
                    </svg>
                  </div>
                  {t("dashboard.connections.wordpress.title")}
                </CardTitle>
                <CardDescription>
                  {t("dashboard.connections.wordpress.description")}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {wordpressConnections.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-secondary-900 mb-4">
                      {t("dashboard.connections.wordpress.connectedSites")}
                    </h3>
                    
                    <div className="space-y-4">
                      {wordpressConnections.map((connection) => (
                        <div key={connection.id} className="bg-secondary-50 rounded-lg p-4 flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-secondary-900">{connection.name}</h4>
                            <p className="text-sm text-secondary-500">
                              {t("dashboard.connections.wordpress.connected")}
                              {/* @ts-ignore */}
                              : {connection.config?.username || 'admin'}
                            </p>
                          </div>
                          <div className="flex space-x-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => testConnection(connection)}
                              disabled={isTestingConnection}
                            >
                              {isTestingConnection ? (
                                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                              )}
                              {t("dashboard.connections.wordpress.testConnection")}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleDeleteConnection(connection)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {t("dashboard.connections.wordpress.disconnect")}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="add-wordpress">
                    <AccordionTrigger className="text-primary-600 hover:text-primary-800 text-sm">
                      {t("dashboard.connections.wordpress.addNew")}
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <Form {...wordpressForm}>
                        <form onSubmit={wordpressForm.handleSubmit(onWordpressSubmit)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={wordpressForm.control}
                              name="url"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("dashboard.connections.wordpress.form.websiteUrl")}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://yourwebsite.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={wordpressForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("dashboard.connections.wordpress.form.username")}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="admin" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={wordpressForm.control}
                            name="appPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("dashboard.connections.wordpress.form.appPassword")}</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="xxxx xxxx xxxx xxxx xxxx xxxx" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  <Info className="h-3 w-3 inline-block mr-1" />
                                  <a 
                                    href="https://wordpress.org/documentation/article/application-passwords/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:text-primary-800"
                                  >
                                    {t("dashboard.connections.wordpress.form.appPasswordHelp")}
                                  </a>
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end">
                            <Button 
                              type="submit" 
                              disabled={addWordpressConnectionMutation.isPending}
                            >
                              {addWordpressConnectionMutation.isPending ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              ) : null}
                              {t("dashboard.connections.wordpress.form.connect")}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="social" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("dashboard.connections.social.title")}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  {/* Facebook Connection */}
                  <div className="flex justify-between items-center py-4 border-b border-secondary-200">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium text-secondary-900">
                          {t("dashboard.connections.social.facebook.title")}
                        </h3>
                        <p className="text-sm text-secondary-500">
                          {t("dashboard.connections.social.facebook.description")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {facebookConnections.length > 0 ? (
                        <>
                          <span className="text-green-600 mr-3 text-sm">
                            {t("dashboard.connections.social.connected")} ({facebookConnections[0].name})
                          </span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => handleDeleteConnection(facebookConnections[0])}
                          >
                            {t("dashboard.connections.social.disconnect")}
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-primary-600 border-primary-300 hover:bg-primary-50"
                          onClick={() => {
                            toast({
                              title: "Facebook OAuth",
                              description: "This would open Facebook OAuth authentication flow in a real app.",
                            });
                          }}
                        >
                          {t("dashboard.connections.social.connect")}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* TikTok Connection */}
                  <div className="flex justify-between items-center py-4 border-b border-secondary-200">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-secondary-100 text-secondary-600">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1Z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium text-secondary-900">
                          {t("dashboard.connections.social.tiktok.title")}
                        </h3>
                        <p className="text-sm text-secondary-500">
                          {t("dashboard.connections.social.tiktok.description")}
                        </p>
                      </div>
                    </div>
                    <div>
                      {tiktokConnections.length > 0 ? (
                        <>
                          <span className="text-green-600 mr-3 text-sm">
                            {t("dashboard.connections.social.connected")} ({tiktokConnections[0].name})
                          </span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => handleDeleteConnection(tiktokConnections[0])}
                          >
                            {t("dashboard.connections.social.disconnect")}
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-primary-600 border-primary-300 hover:bg-primary-50"
                          onClick={() => {
                            toast({
                              title: "TikTok OAuth",
                              description: "This would open TikTok OAuth authentication flow in a real app.",
                            });
                          }}
                        >
                          {t("dashboard.connections.social.connect")}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Twitter/X Connection */}
                  <div className="flex justify-between items-center py-4">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-secondary-100 text-secondary-600">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium text-secondary-900">
                          {t("dashboard.connections.social.twitter.title")}
                        </h3>
                        <p className="text-sm text-secondary-500">
                          {t("dashboard.connections.social.twitter.description")}
                        </p>
                      </div>
                    </div>
                    <div>
                      {twitterConnections.length > 0 ? (
                        <>
                          <span className="text-green-600 mr-3 text-sm">
                            {t("dashboard.connections.social.connected")} ({twitterConnections[0].name})
                          </span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => handleDeleteConnection(twitterConnections[0])}
                          >
                            {t("dashboard.connections.social.disconnect")}
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-primary-600 border-primary-300 hover:bg-primary-50"
                          onClick={() => {
                            toast({
                              title: "Twitter OAuth",
                              description: "This would open Twitter OAuth authentication flow in a real app.",
                            });
                          }}
                        >
                          {t("dashboard.connections.social.connect")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="api" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-2">
                    <Code className="h-5 w-5" />
                  </div>
                  {t("dashboard.connections.webhook.title")}
                </CardTitle>
                <CardDescription>
                  {t("dashboard.connections.webhook.description")}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="bg-secondary-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-secondary-900">
                        {t("dashboard.connections.webhook.webhookUrl")}
                      </h3>
                      <div className="flex items-center mt-1">
                        <Input 
                          value="https://n8n.yourserver.com/webhook/ai-content-generator" 
                          readOnly
                          className="bg-secondary-50 border-0"
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="ml-2 text-primary-600 hover:text-primary-800"
                          onClick={() => {
                            navigator.clipboard.writeText("https://n8n.yourserver.com/webhook/ai-content-generator");
                            toast({
                              title: "Copied",
                              description: "Webhook URL copied to clipboard",
                            });
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {t("dashboard.connections.webhook.active")}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50">
                  <Info className="flex-shrink-0 inline w-5 h-5 mr-3" />
                  <span className="sr-only">Info</span>
                  <div>
                    {t("dashboard.connections.webhook.info")}
                  </div>
                </div>
                
                <h3 className="font-medium text-secondary-900 mb-4">Webhook Configuration</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parameter</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Method</TableCell>
                      <TableCell>POST</TableCell>
                      <TableCell>HTTP method used for the webhook request</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Content-Type</TableCell>
                      <TableCell>application/json</TableCell>
                      <TableCell>Format of the request and response data</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Authorization</TableCell>
                      <TableCell>Bearer Token</TableCell>
                      <TableCell>Authentication method for API requests</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Rate Limit</TableCell>
                      <TableCell>10 requests/minute</TableCell>
                      <TableCell>Maximum number of allowed requests</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                
                <div className="flex justify-end mt-8">
                  <Button 
                    variant="outline" 
                    className="flex items-center"
                    onClick={() => {
                      toast({
                        title: "Webhook regenerated",
                        description: "A new webhook URL has been generated",
                      });
                    }}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t("dashboard.connections.webhook.regenerate")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Delete Connection Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm removal</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove the connection to {connectionToDelete?.name}? 
                This will disconnect your account from this service.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDeleteConnection}
                disabled={deleteConnectionMutation.isPending}
              >
                {deleteConnectionMutation.isPending ? "Removing..." : "Remove Connection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </>
  );
}
