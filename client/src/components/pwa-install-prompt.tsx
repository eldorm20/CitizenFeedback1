import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/use-pwa';
import { 
  Download, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Bell, 
  Share2,
  X 
} from 'lucide-react';

export function PWAInstallPrompt() {
  const { isOnline, isInstallable, isInstalled, installApp, shareApp, requestNotificationPermission } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show install prompt after 30 seconds if installable and not dismissed
    const timer = setTimeout(() => {
      if (isInstallable && !isInstalled && !dismissed) {
        setShowPrompt(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled, dismissed]);

  const handleInstall = async () => {
    await installApp();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    // Remember dismissal for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleEnableNotifications = async () => {
    await requestNotificationPermission();
  };

  if (!showPrompt || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:w-96">
      <Card className="glass-effect border-primary/20 shadow-xl">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Установить приложение</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription>
            Установите Muloqot Plus для быстрого доступа и работы офлайн
          </CardDescription>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span>Онлайн</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <span>Офлайн</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-500" />
              <span>Быстрая установка</span>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-500" />
              <span>Уведомления</span>
            </div>
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-orange-500" />
              <span>Поделиться</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleInstall} 
              className="flex-1 gradient-primary text-white"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Установить
            </Button>
            <Button 
              variant="outline" 
              onClick={shareApp}
              size="sm"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
          
          {Notification.permission === 'default' && (
            <Button 
              variant="ghost" 
              onClick={handleEnableNotifications}
              className="w-full text-sm"
              size="sm"
            >
              <Bell className="w-4 h-4 mr-2" />
              Включить уведомления
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Online/Offline indicator
export function NetworkStatus() {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 text-center py-2 text-sm font-medium">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" />
        Работаем в автономном режиме
      </div>
    </div>
  );
}

// PWA features showcase for settings page
export function PWAFeatures() {
  const { isOnline, isInstalled, shareApp, requestNotificationPermission } = usePWA();

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Возможности приложения
        </CardTitle>
        <CardDescription>
          Muloqot Plus поддерживает современные веб-технологии
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">Состояние сети</p>
                <p className="text-sm text-muted-foreground">
                  {isOnline ? 'Подключено к интернету' : 'Работает автономно'}
                </p>
              </div>
            </div>
            <Badge variant={isOnline ? "default" : "secondary"}>
              {isOnline ? 'Онлайн' : 'Офлайн'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">Установка</p>
                <p className="text-sm text-muted-foreground">
                  {isInstalled ? 'Приложение установлено' : 'Можно установить как приложение'}
                </p>
              </div>
            </div>
            <Badge variant={isInstalled ? "default" : "outline"}>
              {isInstalled ? 'Установлено' : 'Доступно'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-purple-500" />
              <div>
                <p className="font-medium">Уведомления</p>
                <p className="text-sm text-muted-foreground">
                  {Notification.permission === 'granted' 
                    ? 'Уведомления включены' 
                    : 'Получайте уведомления о статусе'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant={Notification.permission === 'granted' ? "default" : "outline"}>
                {Notification.permission === 'granted' ? 'Включены' : 'Выключены'}
              </Badge>
              {Notification.permission !== 'granted' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestNotificationPermission}
                >
                  Включить
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium">Поделиться</p>
                <p className="text-sm text-muted-foreground">
                  Поделитесь приложением с друзьями
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={shareApp}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Поделиться
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
