import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Bell, Settings, Check, X, Clock, AlertCircle, Info, CheckCircle } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Bài viết đã được phê duyệt',
      message: 'Bài viết "Hướng dẫn SEO cơ bản" đã được phê duyệt và xuất bản.',
      type: 'success',
      time: '2 giờ trước',
      read: false
    },
    {
      id: 2,
      title: 'Credit sắp hết',
      message: 'Bạn còn lại 10 credits. Hãy nạp thêm để tiếp tục sử dụng dịch vụ.',
      type: 'warning',
      time: '4 giờ trước',
      read: false
    },
    {
      id: 3,
      title: 'Cập nhật hệ thống',
      message: 'Hệ thống sẽ được bảo trì vào 2:00 AM ngày mai.',
      type: 'info',
      time: '6 giờ trước',
      read: true
    },
    {
      id: 4,
      title: 'Bài viết cần chỉnh sửa',
      message: 'Bài viết "Content Marketing Strategy" cần chỉnh sửa theo góp ý của reviewer.',
      type: 'error',
      time: '1 ngày trước',
      read: true
    },
    {
      id: 5,
      title: 'Thành viên mới tham gia',
      message: 'Nguyễn Văn An đã tham gia vào team của bạn.',
      type: 'info',
      time: '2 ngày trước',
      read: true
    }
  ]);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    articleApproval: true,
    creditAlerts: true,
    systemUpdates: false,
    teamActivity: true,
    weeklyReport: true
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <X className="h-5 w-5 text-red-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      case 'info': return 'outline';
      default: return 'outline';
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Thông báo</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý và theo dõi các thông báo quan trọng
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <Check className="h-4 w-4 mr-1" />
              Đánh dấu đã đọc tất cả
            </Button>
          )}
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-1" />
            Cài đặt
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            Tất cả
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">Chưa đọc</TabsTrigger>
          <TabsTrigger value="success">Thành công</TabsTrigger>
          <TabsTrigger value="warning">Cảnh báo</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={`${!notification.read ? 'border-primary/50 bg-primary/5' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{notification.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={getNotificationBadge(notification.type)}>
                          {notification.type === 'success' ? 'Thành công' :
                           notification.type === 'warning' ? 'Cảnh báo' :
                           notification.type === 'error' ? 'Lỗi' : 'Thông tin'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    {!notification.read && (
                      <div className="mt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Đánh dấu đã đọc
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {notifications.filter(n => !n.read).map((notification) => (
            <Card key={notification.id} className="border-primary/50 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{notification.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={getNotificationBadge(notification.type)}>
                          {notification.type === 'success' ? 'Thành công' :
                           notification.type === 'warning' ? 'Cảnh báo' :
                           notification.type === 'error' ? 'Lỗi' : 'Thông tin'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <div className="mt-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Đánh dấu đã đọc
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {notifications.filter(n => !n.read).length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="font-medium mb-2">Không có thông báo chưa đọc</h3>
                <p className="text-sm text-muted-foreground">Bạn đã đọc hết tất cả thông báo</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="success" className="space-y-4">
          {notifications.filter(n => n.type === 'success').map((notification) => (
            <Card key={notification.id} className={`${!notification.read ? 'border-primary/50 bg-primary/5' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{notification.title}</h4>
                      <span className="text-xs text-muted-foreground">{notification.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="warning" className="space-y-4">
          {notifications.filter(n => n.type === 'warning').map((notification) => (
            <Card key={notification.id} className={`${!notification.read ? 'border-primary/50 bg-primary/5' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{notification.title}</h4>
                      <span className="text-xs text-muted-foreground">{notification.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt thông báo</CardTitle>
              <CardDescription>
                Tùy chỉnh loại thông báo bạn muốn nhận
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Phương thức nhận thông báo</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">Nhận thông báo qua email</p>
                    </div>
                    <Switch 
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push notification</p>
                      <p className="text-sm text-muted-foreground">Nhận thông báo trên trình duyệt</p>
                    </div>
                    <Switch 
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, pushNotifications: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Loại thông báo</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Phê duyệt bài viết</p>
                      <p className="text-sm text-muted-foreground">Thông báo khi bài viết được phê duyệt</p>
                    </div>
                    <Switch 
                      checked={settings.articleApproval}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, articleApproval: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Cảnh báo credit</p>
                      <p className="text-sm text-muted-foreground">Thông báo khi credit sắp hết</p>
                    </div>
                    <Switch 
                      checked={settings.creditAlerts}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, creditAlerts: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Cập nhật hệ thống</p>
                      <p className="text-sm text-muted-foreground">Thông báo về bảo trì và cập nhật</p>
                    </div>
                    <Switch 
                      checked={settings.systemUpdates}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, systemUpdates: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Hoạt động team</p>
                      <p className="text-sm text-muted-foreground">Thông báo về hoạt động của team</p>
                    </div>
                    <Switch 
                      checked={settings.teamActivity}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, teamActivity: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Báo cáo hàng tuần</p>
                      <p className="text-sm text-muted-foreground">Tóm tắt hoạt động hàng tuần</p>
                    </div>
                    <Switch 
                      checked={settings.weeklyReport}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, weeklyReport: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Button>Lưu cài đặt</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}