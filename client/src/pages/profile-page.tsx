import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/navigation-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, FileText, Settings, MapPin, Calendar, Phone, Mail, Building2 } from "lucide-react";
import { PostWithAuthor } from "@shared/schema";
import { PostCard } from "@/components/post-card";
import { apiRequest, queryClient } from "@/lib/queryClient";

const profileUpdateSchema = z.object({
  firstName: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  lastName: z.string().min(2, "Фамилия должна содержать минимум 2 символа"),
  email: z.string().email("Некорректный email"),
  district: z.string().optional(),
  department: z.string().optional(),
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      district: user?.district || "",
      department: user?.department || "",
    },
  });

  // Get user's posts
  const { data: userPosts = [] } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts", "user", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/posts?authorId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch user posts");
      return response.json();
    },
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const res = await apiRequest("PUT", "/api/user/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка обновления",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileUpdateData) => {
    updateProfileMutation.mutate(data);
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin": return "Администратор";
      case "government": return "Представитель власти";
      default: return "Гражданин";
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "government": return "default";
      default: return "secondary";
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <NavigationHeader showCreateButton={false} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="text-2xl">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold gradient-text">
                      {user.firstName} {user.lastName}
                    </h1>
                    <Badge variant={getRoleBadgeVariant(user.role) as any}>
                      {getRoleText(user.role)}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      @{user.username}
                    </div>
                    {user.createdAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        На платформе с {new Date(user.createdAt).toLocaleDateString('ru')}
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "outline" : "default"}
                  className="shrink-0"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {isEditing ? "Отменить" : "Редактировать"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="posts">Мои обращения</TabsTrigger>
              <TabsTrigger value="settings">Настройки</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Статистика
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Всего обращений:</span>
                      <span className="font-semibold">{userPosts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Решено:</span>
                      <span className="font-semibold text-green-600">
                        {userPosts.filter(p => p.status === 'resolved').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">В работе:</span>
                      <span className="font-semibold text-yellow-600">
                        {userPosts.filter(p => p.status === 'in_progress').length}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card md:col-span-2">
                  <CardHeader>
                    <CardTitle>Личная информация</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Имя</Label>
                            <Input {...form.register("firstName")} />
                            {form.formState.errors.firstName && (
                              <p className="text-sm text-destructive mt-1">
                                {form.formState.errors.firstName.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label>Фамилия</Label>
                            <Input {...form.register("lastName")} />
                            {form.formState.errors.lastName && (
                              <p className="text-sm text-destructive mt-1">
                                {form.formState.errors.lastName.message}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <Label>Email</Label>
                          <Input {...form.register("email")} />
                          {form.formState.errors.email && (
                            <p className="text-sm text-destructive mt-1">
                              {form.formState.errors.email.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label>Район</Label>
                          <Input {...form.register("district")} placeholder="Выберите район" />
                        </div>

                        <div>
                          <Label>Отдел/Ведомство</Label>
                          <Input {...form.register("department")} placeholder="Укажите ваш отдел или ведомство" />
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            type="submit" 
                            disabled={updateProfileMutation.isPending}
                            className="gradient-primary"
                          >
                            Сохранить изменения
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsEditing(false)}
                          >
                            Отменить
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{user.district || "Район не указан"}</span>
                        </div>
                        {user.department && (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <span>{user.department}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="posts">
              <div className="space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Мои обращения ({userPosts.length})</CardTitle>
                    <CardDescription>
                      История ваших обращений и их текущий статус
                    </CardDescription>
                  </CardHeader>
                </Card>
                
                {userPosts.length === 0 ? (
                  <Card className="glass-card">
                    <CardContent className="text-center py-12">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Нет обращений</h3>
                      <p className="text-muted-foreground">
                        Вы еще не создали ни одного обращения
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {userPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Настройки уведомлений</CardTitle>
                  <CardDescription>
                    Управляйте уведомлениями и настройками приватности
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Email уведомления</Label>
                        <p className="text-sm text-muted-foreground">
                          Получать уведомления об изменении статуса обращений
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Включено
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">SMS уведомления</Label>
                        <p className="text-sm text-muted-foreground">
                          Получать SMS о важных обновлениях
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Настроить
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Публичный профиль</Label>
                        <p className="text-sm text-muted-foreground">
                          Показывать ваше имя в публичных обращениях
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Видимый
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}