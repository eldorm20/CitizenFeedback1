import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Check if app is already installed
    checkIfInstalled();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      toast({
        title: "Приложение установлено!",
        description: "Muloqot Plus теперь доступно на вашем устройстве",
      });
    };

    // Listen for online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Соединение восстановлено",
        description: "Вы снова в сети",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Нет соединения",
        description: "Работаем в автономном режиме",
        variant: "destructive",
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Listen for service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              toast({
                title: "Обновление доступно",
                description: "Перезагрузите страницу для получения последней версии",
              });
            }
          });
        }
      });

      console.log('Service Worker registered successfully');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const checkIfInstalled = () => {
    // Check if running in standalone mode (PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');
    
    setIsInstalled(isStandalone);
  };

  const installApp = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        toast({
          title: "Установка начата",
          description: "Muloqot Plus устанавливается на ваше устройство",
        });
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Installation failed:', error);
      toast({
        title: "Ошибка установки",
        description: "Не удалось установить приложение",
        variant: "destructive",
      });
    }
  };

  const shareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Muloqot Plus',
          text: 'Платформа для обращений граждан',
          url: window.location.origin,
        });
      } catch (error) {
        // User cancelled or sharing failed
        console.log('Sharing cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.origin);
        toast({
          title: "Ссылка скопирована",
          description: "Ссылка на приложение скопирована в буфер обмена",
        });
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: "Уведомления включены",
          description: "Вы будете получать уведомления о статусе ваших обращений",
        });
      }
      return permission;
    }
    return 'denied';
  };

  return {
    isOnline,
    isInstallable,
    isInstalled,
    installApp,
    shareApp,
    requestNotificationPermission,
  };
}
