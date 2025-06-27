import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, AlertCircle, Check, Copy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/hooks/use-language';

interface ApiKey {
  id: number;
  name: string;
  key: string;
  scopes: string[];
  isActive: boolean;
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

interface CreateApiKeyResponse {
  id: number;
  name: string;
  key: string;
  secret: string;
  scopes: string[];
  expiresAt: string | null;
}

function formatDate(date: string | null) {
  if (!date) return 'Never';
  return new Date(date).toLocaleString();
}

export default function ApiKeysPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<Record<string, boolean>>({
    'user:read': true,
    'articles:read': true,
    'credits:read': true,
  });
  const [newKeyData, setNewKeyData] = useState<CreateApiKeyResponse | null>(null);
  const [secretCopied, setSecretCopied] = useState(false);

  // Fetch API keys
  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['/api/keys'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/keys');
      const data = await res.json();
      return data.success ? (data.data as ApiKey[]) : [];
    },
  });

  // Create API key
  const createKeyMutation = useMutation({
    mutationFn: async () => {
      const scopes = Object.entries(selectedScopes)
        .filter(([_, value]) => value)
        .map(([scope]) => scope);

      const res = await apiRequest('POST', '/api/keys', {
        name: newKeyName,
        scopes,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create API key');
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setNewKeyData(data.data);
        queryClient.invalidateQueries({ queryKey: ['/api/keys'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create API key',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update API key
  const updateKeyMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest('PATCH', `/api/keys/${id}`, {
        isActive,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update API key');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/keys'] });
      toast({
        title: 'API key updated',
        description: 'The API key has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update API key',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete API key
  const deleteKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/keys/${id}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete API key');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/keys'] });
      toast({
        title: 'API key deleted',
        description: 'The API key has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete API key',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreateKey = async () => {
    if (!newKeyName) {
      toast({
        title: 'Name required',
        description: 'Please provide a name for the API key.',
        variant: 'destructive',
      });
      return;
    }
    
    await createKeyMutation.mutateAsync();
  };

  const handleToggleActivation = async (id: number, currentState: boolean) => {
    await updateKeyMutation.mutateAsync({ id, isActive: !currentState });
  };

  const handleDeleteKey = async (id: number) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      await deleteKeyMutation.mutateAsync(id);
    }
  };

  const copyToClipboard = (text: string, type: 'key' | 'secret') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'secret') {
        setSecretCopied(true);
        setTimeout(() => setSecretCopied(false), 3000);
      } else {
        toast({
          title: 'Copied to clipboard',
          description: `API ${type} has been copied to clipboard.`,
        });
      }
    });
  };

  const resetCreateDialog = () => {
    setNewKeyName('');
    setSelectedScopes({
      'user:read': true,
      'articles:read': true,
      'credits:read': true,
    });
    setNewKeyData(null);
    setSecretCopied(false);
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('apiKeys.title')}</h1>
        <Dialog
          open={createDialogOpen}
          onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (!open) resetCreateDialog();
          }}
        >
          <DialogTrigger asChild>
            <Button>{t('apiKeys.create')}</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            {!newKeyData ? (
              <>
                <DialogHeader>
                  <DialogTitle>{t('apiKeys.createTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('apiKeys.createDescription')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('apiKeys.nameLabel')}</Label>
                    <Input
                      id="name"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder={t('apiKeys.namePlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('apiKeys.scopesLabel')}</Label>
                    <div className="grid gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="user-read"
                          checked={selectedScopes['user:read']}
                          onCheckedChange={(checked) =>
                            setSelectedScopes({ ...selectedScopes, 'user:read': !!checked })
                          }
                        />
                        <Label htmlFor="user-read" className="font-normal">
                          user:read - {t('apiKeys.scopeUserRead')}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="articles-read"
                          checked={selectedScopes['articles:read']}
                          onCheckedChange={(checked) =>
                            setSelectedScopes({ ...selectedScopes, 'articles:read': !!checked })
                          }
                        />
                        <Label htmlFor="articles-read" className="font-normal">
                          articles:read - {t('apiKeys.scopeArticlesRead')}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="credits-read"
                          checked={selectedScopes['credits:read']}
                          onCheckedChange={(checked) =>
                            setSelectedScopes({ ...selectedScopes, 'credits:read': !!checked })
                          }
                        />
                        <Label htmlFor="credits-read" className="font-normal">
                          credits:read - {t('apiKeys.scopeCreditsRead')}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateKey}
                    disabled={createKeyMutation.isPending}
                  >
                    {createKeyMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t('apiKeys.createButton')}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>{t('apiKeys.keyCreatedTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('apiKeys.keyCreatedDescription')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t('apiKeys.securityWarningTitle')}</AlertTitle>
                    <AlertDescription>
                      {t('apiKeys.securityWarningDescription')}
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    <Label>{t('apiKeys.apiKeyLabel')}</Label>
                    <div className="flex">
                      <Input value={newKeyData.key} readOnly className="font-mono" />
                      <Button
                        variant="outline"
                        className="ml-2"
                        onClick={() => copyToClipboard(newKeyData.key, 'key')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('apiKeys.secretLabel')}</Label>
                    <div className="flex">
                      <Input
                        value={newKeyData.secret}
                        readOnly
                        className="font-mono"
                        type="password"
                      />
                      <Button
                        variant="outline"
                        className="ml-2"
                        onClick={() => copyToClipboard(newKeyData.secret, 'secret')}
                      >
                        {secretCopied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setCreateDialogOpen(false)}>
                    {t('apiKeys.closeButton')}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('apiKeys.listTitle')}</CardTitle>
          <CardDescription>
            {t('apiKeys.listDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !apiKeys || apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('apiKeys.noKeys')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('apiKeys.tableColumnName')}</TableHead>
                  <TableHead>{t('apiKeys.tableColumnKey')}</TableHead>
                  <TableHead>{t('apiKeys.tableColumnScopes')}</TableHead>
                  <TableHead>{t('apiKeys.tableColumnStatus')}</TableHead>
                  <TableHead>{t('apiKeys.tableColumnLastUsed')}</TableHead>
                  <TableHead>{t('apiKeys.tableColumnCreated')}</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell className="font-mono text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="truncate max-w-[120px]">{key.key}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(key.key, 'key')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {key.scopes.map((scope) => (
                          <Badge key={scope} variant="outline">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={key.isActive ? 'default' : 'secondary'}
                        className={key.isActive ? 'bg-green-500' : 'bg-gray-500'}
                      >
                        {key.isActive ? t('apiKeys.statusActive') : t('apiKeys.statusInactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(key.lastUsedAt)}</TableCell>
                    <TableCell>{formatDate(key.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t('apiKeys.actions')}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleActivation(key.id, key.isActive)}
                          >
                            {key.isActive ? t('apiKeys.deactivate') : t('apiKeys.activate')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteKey(key.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            {t('apiKeys.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="border-t bg-muted/50 p-4">
          <div className="text-sm text-muted-foreground">
            {t('apiKeys.docsLink')} <a href="/api/docs" target="_blank" className="text-primary hover:underline">{t('apiKeys.viewDocs')}</a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}