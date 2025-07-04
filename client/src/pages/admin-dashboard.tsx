import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminPanel } from "@/components/admin-panel";
import { NavigationHeader } from "@/components/navigation-header";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { PostWithAuthor, User } from "@shared/schema";
import { 
  Shield, Users, FileText, TrendingUp, AlertTriangle, 
  CheckCircle, Clock, BarChart3, Settings, MapPin 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) throw new Error("Ошибка загрузки статистики");
      return response.json();
    },
  });

  const { data: posts = [] } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts", "admin"],
    queryFn: async () => {
      const response = await fetch("/api/posts");
      if (!response.ok) throw new Error("Ошибка загрузки обращений");
      return response.json();
    },
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Ошибка загрузки пользователей");
      return response.json();
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Роль обновлена",
        description: "Роль пользователя успешно изменена",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusStats = () => {
    return {
      total: posts.length,
      new: posts.filter(p => p.status === "new").length,
      inProgress: posts.filter(p => p.status === "in_progress").length,
      resolved: posts.filter(p => p.status === "resolved").length,
      rejected: posts.filter(p => p.status === "rejected").length,
    };
  };

  const getCategoryStats = () => {
    const categories = ["Дороги", "Коммунальные услуги", "Транспорт", "Безопасность", "Экология", "Благоустройство"];
    return categories.map(category => ({
      name: category,
      count: posts.filter(p => p.category === category).length,
    }));
  };

  const getDistrictStats = () => {
    const districts = [
      "Юнусабадский", "Мирзо-Улугбекский", "Мирабадский", "Алмазарский",
      "Бектемирский", "Чиланзарский", "Хамзинский", "Сергелийский"
    ];
    return districts.map(district => ({
      name: district,
      count: posts.filter(p => p.district === district).length,
    }));
  };

  const statusStats = getStatusStats();
  const categoryStats = getCategoryStats();
  const districtStats = getDistrictStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <NavigationHeader showCreateButton={false} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2 flex items-center gap-2">
              <Shield className="w-8 h-8" />
              Административная панель
            </h1>
            <p className="text-muted-foreground">
              Полное управление платформой Muloqot Plus
            </p>
          </div>
          <Button
            onClick={() => setAdminPanelOpen(true)}
            className="gradient-primary hover-lift text-white mt-4 md:mt-0"
          >
            <Settings className="w-4 h-4 mr-2" />
            Управление обращениями
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                +{users.filter(u => u.createdAt && new Date(u.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length} за неделю
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего обращений</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">{statusStats.total}</div>
              <p className="text-xs text-muted-foreground">
                +{posts.filter(p => p.createdAt && new Date(p.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length} за неделю
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Требуют внимания</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{statusStats.new}</div>
              <p className="text-xs text-muted-foreground">новых обращений</p>
            </CardContent>
          </Card>

          <Card className="glass-effect hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Успешность</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statusStats.total > 0 ? Math.round((statusStats.resolved / statusStats.total) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">решенных обращений</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="glass-effect">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Статусы обращений
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Новые</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-amber-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 transition-all"
                          style={{ width: `${statusStats.total > 0 ? (statusStats.new / statusStats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{statusStats.new}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">В работе</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-blue-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${statusStats.total > 0 ? (statusStats.inProgress / statusStats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{statusStats.inProgress}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Решено</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-green-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${statusStats.total > 0 ? (statusStats.resolved / statusStats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{statusStats.resolved}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Отклонено</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-red-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 transition-all"
                          style={{ width: `${statusStats.total > 0 ? (statusStats.rejected / statusStats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{statusStats.rejected}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Categories */}
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Популярные категории</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryStats
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 6)
                      .map((category, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{category.name}</span>
                          <Badge variant="secondary">{category.count}</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* District Stats */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Статистика по районам
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {districtStats
                    .sort((a, b) => b.count - a.count)
                    .map((district, index) => (
                      <div key={index} className="p-4 border rounded-lg hover-lift">
                        <div className="text-lg font-semibold">{district.count}</div>
                        <div className="text-sm text-muted-foreground">{district.name}</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Управление пользователями</CardTitle>
                <CardDescription>
                  Просмотр и управление ролями пользователей платформы
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead>Район</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.role === "admin" ? "destructive" : user.role === "government" ? "default" : "secondary"}
                          >
                            {user.role === "admin" ? "Администратор" : 
                             user.role === "government" ? "Правительство" : "Пользователь"}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.district || "—"}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(role) => 
                              updateUserRoleMutation.mutate({ userId: user.id, role })
                            }
                            disabled={updateUserRoleMutation.isPending}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Пользователь</SelectItem>
                              <SelectItem value="government">Правительство</SelectItem>
                              <SelectItem value="admin">Администратор</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Активность по времени</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                    <p>Детальная аналитика будет доступна в следующем обновлении</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Эффективность решений</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Среднее время решения</span>
                      <span className="font-medium">5.2 дня</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Процент решенных</span>
                      <span className="font-medium text-green-600">
                        {statusStats.total > 0 ? Math.round((statusStats.resolved / statusStats.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Удовлетворенность граждан</span>
                      <span className="font-medium">4.7/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Системные настройки</CardTitle>
                <CardDescription>
                  Конфигурация платформы и администрирование
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Общие настройки</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Автоматическое одобрение</span>
                        <Badge variant="outline">Отключено</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Уведомления администраторов</span>
                        <Badge variant="outline">Включено</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Модерация комментариев</span>
                        <Badge variant="outline">Включено</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Интеграции</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Cloudinary (изображения)</span>
                        <Badge variant="secondary">Активно</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>База данных PostgreSQL</span>
                        <Badge variant="secondary">Активно</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AdminPanel
          open={adminPanelOpen}
          onOpenChange={setAdminPanelOpen}
        />
      </div>
    </div>
  );
}