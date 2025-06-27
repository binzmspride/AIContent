import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, Key, Eye, EyeOff, Plus, Trash2, Settings } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import { DashboardLayout } from '@/components/dashboard/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AIApiKey {
  id: number;
  name: string;
  provider: 'openai' | 'claude' | 'gemini';
  apiKey: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AI_PROVIDERS = [
  { value: 'openai', label: 'OpenAI (GPT-4, ChatGPT)', icon: '🤖' },
  { value: 'claude', label: 'Anthropic Claude', icon: '🧠' },
  { value: 'gemini', label: 'Google Gemini', icon: '💎' },
];

export default function AIApiKeysPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyProvider, setNewKeyProvider] = useState<string>('');
  const [newApiKey, setNewApiKey] = useState('');
  const [showKeys, setShowKeys] = useState<Record<number, boolean>>({});
  const [selectedProvider, setSelectedProvider] = useState<'all' | 'openai' | 'claude' | 'gemini'>('all');

  // Fetch AI API keys
  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['/api/ai-api-keys'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/ai-api-keys');
      const data = await res.json();
      return data.success ? (data.data as AIApiKey[]) : [];
    },
  });

  // Create AI API key
  const createKeyMutation = useMutation({
    mutationFn: async (keyData: { name: string; provider: string; apiKey: string }) => {
      const res = await apiRequest('POST', '/api/ai-api-keys', keyData);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Có lỗi xảy ra khi tạo API key');
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-api-keys'] });
      toast({
        title: 'Thành công',
        description: 'API key đã được thêm thành công',
      });
      resetForm();
      setCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể thêm API key',
        variant: 'destructive',
      });
    },
  });

  // Toggle API key status
  const toggleKeyMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest('PATCH', `/api/ai-api-keys/${id}`, { isActive });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Có lỗi xảy ra khi cập nhật trạng thái API key');
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-api-keys'] });
      toast({
        title: 'Thành công',
        description: 'Trạng thái API key đã được cập nhật',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật trạng thái API key',
        variant: 'destructive',
      });
    },
  });

  // Delete API key
  const deleteKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/ai-api-keys/${id}`);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Có lỗi xảy ra khi xóa API key');
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-api-keys'] });
      toast({
        title: 'Thành công',
        description: 'API key đã được xóa thành công',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể xóa API key',
        variant: 'destructive',
      });
    },
  });

  const handleCreateKey = async () => {
    if (!newKeyName.trim() || !newKeyProvider || !newApiKey.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive',
      });
      return;
    }

    await createKeyMutation.mutateAsync({
      name: newKeyName,
      provider: newKeyProvider,
      apiKey: newApiKey,
    });
  };

  const handleToggleKey = async (id: number, currentStatus: boolean) => {
    await toggleKeyMutation.mutateAsync({ id, isActive: !currentStatus });
  };

  const handleDeleteKey = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa API key này? Hành động này không thể hoàn tác.')) {
      await deleteKeyMutation.mutateAsync(id);
    }
  };

  const resetForm = () => {
    setNewKeyName('');
    setNewKeyProvider('');
    setNewApiKey('');
  };

  const toggleKeyVisibility = (id: number) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '***';
    return key.substring(0, 4) + '***' + key.substring(key.length - 4);
  };

  const getProviderInfo = (provider: string) => {
    return AI_PROVIDERS.find(p => p.value === provider);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter API keys based on selected provider
  const filteredApiKeys = selectedProvider === 'all' 
    ? apiKeys || []
    : (apiKeys || []).filter(key => key.provider === selectedProvider);

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Quản lý API Keys AI</h1>
            <p className="text-muted-foreground mt-2">
              Cấu hình và quản lý API keys cho các nhà cung cấp AI
            </p>
          </div>
        </div>

        <div className="flex h-full">
        {/* Left sidebar for AI providers */}
        <div className="w-64 bg-card dark:bg-card border-r border-border dark:border-border">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">API Keys AI</h2>
            <nav className="space-y-1">
              <button
                onClick={() => setSelectedProvider('all')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedProvider === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Tất cả API Keys
            </button>
            
            {AI_PROVIDERS.map((provider) => (
              <button
                key={provider.value}
                onClick={() => setSelectedProvider(provider.value as 'openai' | 'claude' | 'gemini')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                  selectedProvider === provider.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <span className="mr-2">{provider.icon}</span>
                {provider.value === 'openai' && 'OpenAI'}
                {provider.value === 'claude' && 'Anthropic Claude'}
                {provider.value === 'gemini' && 'Google Gemini'}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              {selectedProvider === 'all' ? 'API Keys AI' : 
               selectedProvider === 'openai' ? 'OpenAI API Keys' :
               selectedProvider === 'claude' ? 'Claude API Keys' :
               selectedProvider === 'gemini' ? 'Gemini API Keys' : 'API Keys AI'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {selectedProvider === 'all' 
                ? 'Quản lý API keys của các nhà cung cấp AI để sử dụng trong việc tạo nội dung'
                : `Quản lý API keys ${selectedProvider === 'openai' ? 'OpenAI' : selectedProvider === 'claude' ? 'Claude' : 'Gemini'} để sử dụng trong việc tạo nội dung`}
            </p>
          </div>
          <Dialog
            open={createDialogOpen}
            onOpenChange={(open) => {
              setCreateDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Thêm API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Thêm API Key AI</DialogTitle>
                <DialogDescription>
                  Thêm API key của nhà cung cấp AI để sử dụng trong việc tạo nội dung
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên hiển thị</Label>
                  <Input
                    id="name"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Ví dụ: OpenAI Production Key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider">Nhà cung cấp AI</Label>
                  <Select value={newKeyProvider} onValueChange={setNewKeyProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhà cung cấp AI" />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_PROVIDERS.map((provider) => (
                        <SelectItem key={provider.value} value={provider.value}>
                          <div className="flex items-center">
                            <span className="mr-2">{provider.icon}</span>
                            {provider.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    placeholder="Dán API key của bạn vào đây"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreateKey} disabled={createKeyMutation.isPending}>
                  {createKeyMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Thêm API Key
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Keys của bạn</CardTitle>
            <CardDescription>
              Quản lý các API key AI để sử dụng trong việc tạo nội dung
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !filteredApiKeys || filteredApiKeys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Chưa có API key nào</p>
                <p className="text-sm">Thêm API key đầu tiên để bắt đầu sử dụng AI tạo nội dung</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Nhà cung cấp</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="w-24">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApiKeys.map((key) => {
                    const providerInfo = getProviderInfo(key.provider);
                    return (
                      <TableRow key={key.id}>
                        <TableCell className="font-medium">{key.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="mr-2">{providerInfo?.icon}</span>
                            {providerInfo?.label}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                              {showKeys[key.id] ? key.apiKey : maskApiKey(key.apiKey)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleKeyVisibility(key.id)}
                            >
                              {showKeys[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={key.isActive ? 'default' : 'secondary'}>
                            {key.isActive ? 'Hoạt động' : 'Tạm dừng'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(key.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleKey(key.id, key.isActive)}
                              disabled={toggleKeyMutation.isPending}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteKey(key.id)}
                              disabled={deleteKeyMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {selectedProvider === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {AI_PROVIDERS.map((provider) => (
              <Card key={provider.value} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{provider.icon}</div>
                    <div>
                      <CardTitle className="text-lg">
                        {provider.value === 'openai' && 'OpenAI (GPT-4, ChatGPT)'}
                        {provider.value === 'claude' && 'Anthropic Claude'}
                        {provider.value === 'gemini' && 'Google Gemini'}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {provider.value === 'openai' && 'Sử dụng GPT-4, ChatGPT để tạo nội dung chất lượng cao'}
                    {provider.value === 'claude' && 'AI mạnh mẽ từ Anthropic với khả năng hiểu ngữ cảnh tốt'}
                    {provider.value === 'gemini' && 'AI đa phương tiện từ Google với khả năng xử lý văn bản và hình ảnh'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
        </div>
      </div>
    </DashboardLayout>
  );
}