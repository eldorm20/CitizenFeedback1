import { useState } from "react";
import { NavigationHeader } from "@/components/navigation-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, Bell, Shield, Globe, Moon, Sun, 
  Monitor, Smartphone, Mail, Lock, Eye, 
  Download, Trash2, AlertTriangle 
} from "lucide-react";

export default function SettingsPage() {
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [browserNotifications, setBrowserNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleSaveNotifications = () => {
    toast({
      title: "Настройки сохранены",
      description: "Ваши предпочтения уведомлений обновлены",
    });
  };

  const handleSaveSecurity = () => {
    toast({
      title: "Настройки безопасности обновлены",
      description: "Ваши настройки безопасности сохранены",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Экспорт данных",
      description: "Ваши данные будут отправлены на email в течение 24 часов",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Удаление аккаунта",
      description: "Функция будет доступна после подтверждения email",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <NavigationHeader showCreateButton={false} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2 flex items-center gap-2">
              <Settings className="w-8 h-8" />
              Настройки
            </h1>
            <p className="text-muted-foreground">
              Управляйте своим аккаунтом и предпочтениями платформы
            </p>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">Общие</TabsTrigger>
              <TabsTrigger value="notifications">Уведомления</TabsTrigger>
              <TabsTrigger value="privacy">Приватность</TabsTrigger>
              <TabsTrigger value="security">Безопасность</TabsTrigger>
              <TabsTrigger value="account">Аккаунт</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <div className="space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="w-5 h-5" />
                      Интерфейс
                    </CardTitle>
                    <CardDescription>
                      Настройте внешний вид платформы
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label>Тема оформления</Label>
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">
                            <div className="flex items-center gap-2">
                              <Sun className="w-4 h-4" />
                              Светлая
                            </div>
                          </SelectItem>
                          <SelectItem value="dark">
                            <div className="flex items-center gap-2">
                              <Moon className="w-4 h-4" />
                              Темная
                            </div>
                          </SelectItem>
                          <SelectItem value="system">
                            <div className="flex items-center gap-2">
                              <Monitor className="w-4 h-4" />
                              Системная
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>Язык интерфейса</Label>
                      <Select defaultValue="ru">
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ru">Русский</SelectItem>
                          <SelectItem value="uz">O'zbek</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>Часовой пояс</Label>
                      <Select defaultValue="asia/tashkent">
                        <SelectTrigger className="w-64">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asia/tashkent">Азия/Ташкент (UTC+5)</SelectItem>
                          <SelectItem value="asia/samarkand">Азия/Самарканд (UTC+5)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Региональные настройки
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Регион</Label>
                        <Select defaultValue="tashkent">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tashkent">Ташкент</SelectItem>
                            <SelectItem value="samarkand">Самарканд</SelectItem>
                            <SelectItem value="bukhara">Бухара</SelectItem>
                            <SelectItem value="andijan">Андижан</SelectItem>
                            <SelectItem value="namangan">Наманган</SelectItem>
                            <SelectItem value="fergana">Фергана</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Район</Label>
                        <Select defaultValue="yunusabad">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yunusabad">Юнусабадский</SelectItem>
                            <SelectItem value="sergeli">Сергелийский</SelectItem>
                            <SelectItem value="chilanzar">Чиланзарский</SelectItem>
                            <SelectItem value="yashnabad">Яшнабадский</SelectItem>
                            <SelectItem value="mirabad">Мирабадский</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Настройки уведомлений
                  </CardTitle>
                  <CardDescription>
                    Выберите, как вы хотите получать уведомления
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <Label>Email уведомления</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Получать уведомления об изменении статуса обращений на email
                        </p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          <Label>SMS уведомления</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Получать SMS о важных обновлениях и срочных уведомлениях
                        </p>
                      </div>
                      <Switch
                        checked={smsNotifications}
                        onCheckedChange={setSmsNotifications}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4" />
                          <Label>Браузерные уведомления</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Показывать push-уведомления в браузере
                        </p>
                      </div>
                      <Switch
                        checked={browserNotifications}
                        onCheckedChange={setBrowserNotifications}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleSaveNotifications} className="gradient-primary">
                      Сохранить настройки
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Настройки приватности
                  </CardTitle>
                  <CardDescription>
                    Управляйте видимостью вашего профиля и данных
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Публичный профиль</Label>
                        <p className="text-sm text-muted-foreground">
                          Показывать ваше имя в публичных обращениях
                        </p>
                      </div>
                      <Switch
                        checked={publicProfile}
                        onCheckedChange={setPublicProfile}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Показывать email</Label>
                        <p className="text-sm text-muted-foreground">
                          Разрешить другим пользователям видеть ваш email
                        </p>
                      </div>
                      <Switch
                        checked={showEmail}
                        onCheckedChange={setShowEmail}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleSaveSecurity} className="gradient-primary">
                      Сохранить настройки
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Безопасность
                  </CardTitle>
                  <CardDescription>
                    Настройки безопасности вашего аккаунта
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base">Изменить пароль</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Регулярно обновляйте пароль для безопасности
                      </p>
                      <Button variant="outline" className="w-full">
                        <Lock className="w-4 h-4 mr-2" />
                        Изменить пароль
                      </Button>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Двухфакторная аутентификация</Label>
                        <p className="text-sm text-muted-foreground">
                          Дополнительный уровень безопасности для вашего аккаунта
                        </p>
                      </div>
                      <Switch
                        checked={twoFactorEnabled}
                        onCheckedChange={setTwoFactorEnabled}
                      />
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-base">Активные сессии</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Просмотр и управление активными входами в аккаунт
                      </p>
                      <Button variant="outline" className="w-full">
                        Управлять сессиями
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleSaveSecurity} className="gradient-primary">
                      Сохранить настройки
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account">
              <div className="space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Экспорт данных</CardTitle>
                    <CardDescription>
                      Загрузите копию всех ваших данных с платформы
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={handleExportData} variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Экспортировать мои данные
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass-card border-destructive/20">
                  <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Опасная зона
                    </CardTitle>
                    <CardDescription>
                      Необратимые действия с вашим аккаунтом
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-base">Удаление аккаунта</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Удалить аккаунт и все связанные с ним данные безвозвратно.
                        Согласно законодательству РУз, некоторые данные могут быть сохранены для целей отчетности.
                      </p>
                      <Button 
                        onClick={handleDeleteAccount} 
                        variant="destructive" 
                        className="w-full"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Удалить аккаунт
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}