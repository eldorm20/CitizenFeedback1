import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PostCard } from "@/components/post-card";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { PostWithAuthor } from "@shared/schema";
import { Building2, FileText, Clock, CheckCircle, AlertTriangle, Users, TrendingUp, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GovernmentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: posts = [], isLoading, refetch } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts", "government", user?.district],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (user?.district) params.set("district", user.district);
      
      const response = await fetch(`/api/posts?${params}`);
      if (!response.ok) throw new Error("Ошибка загрузки обращений");
      return response.json();
    },
    enabled: !!user?.district,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ postId, status }: { postId: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/posts/${postId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Статус обновлён",
        description: "Статус обращения успешно изменён",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredPosts = posts.filter(post => {
    if (statusFilter === "all") return true;
    return post.status === statusFilter;
  });

  const getStatusStats = () => {
    const stats = {
      total: posts.length,
      new: posts.filter(p => p.status === "new").length,
      inProgress: posts.filter(p => p.status === "in_progress").length,
      resolved: posts.filter(p => p.status === "resolved").length,
      rejected: posts.filter(p => p.status === "rejected").length,
    };
    return stats;
  };

  const stats = getStatusStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-amber-500";
      case "in_progress": return "bg-blue-500";
      case "resolved": return "bg-green-500";
      case "rejected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "new": return "Новая";
      case "in_progress": return "В работе";
      case "resolved": return "Решено";
      case "rejected": return "Отклонено";
      default: return status;
    }
  };

  const getPriorityLevel = (post: PostWithAuthor) => {
    const commentsCount = post.comments?.length || 0;
    const likes = post.isLiked ? 1 : 0; // Simplified
    
    if (commentsCount > 10 || likes > 50) return "high";
    if (commentsCount > 5 || likes > 20) return "medium";
    return "low";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Панель управления ({user?.department})
          </h1>
          <p className="text-muted-foreground">
            Район: {user?.district} • Управление обращениями граждан
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего обращений</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">{stats.total}</div>
              <p className="text-xs text-muted-foreground">в вашем районе</p>
            </CardContent>
          </Card>

          <Card className="glass-effect hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Требуют внимания</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.new}</div>
              <p className="text-xs text-muted-foreground">новых обращений</p>
            </CardContent>
          </Card>

          <Card className="glass-effect hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">В работе</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">обрабатываются</p>
            </CardContent>
          </Card>

          <Card className="glass-effect hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Решено</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <p className="text-xs text-muted-foreground">успешно решено</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <TabsList className="glass-effect">
              <TabsTrigger value="all">Все обращения</TabsTrigger>
              <TabsTrigger value="priority">Приоритетные</TabsTrigger>
              <TabsTrigger value="category">По категориям</TabsTrigger>
            </TabsList>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 glass-input">
                <SelectValue placeholder="Фильтр по статусу" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="new">Новые</SelectItem>
                <SelectItem value="in_progress">В работе</SelectItem>
                <SelectItem value="resolved">Решенные</SelectItem>
                <SelectItem value="rejected">Отклоненные</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="all" className="space-y-6">
            <div className="grid gap-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-4">Загрузка обращений...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <Card className="glass-effect">
                  <CardContent className="text-center py-12">
                    <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Обращений не найдено</h3>
                    <p className="text-muted-foreground">
                      В вашем районе пока нет обращений с выбранным статусом
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredPosts.map((post) => (
                  <Card key={post.id} className="glass-effect hover-lift">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge className={`${getStatusColor(post.status)} text-white`}>
                              {getStatusText(post.status)}
                            </Badge>
                            <Badge variant="outline">{post.category}</Badge>
                            {getPriorityLevel(post) === "high" && (
                              <Badge variant="destructive">Высокий приоритет</Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl">{post.title}</CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {post.author.firstName} {post.author.lastName}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {post.district}
                            </span>
                            <span>{new Date(post.createdAt).toLocaleDateString('ru-RU')}</span>
                          </div>
                        </div>
                        <Select
                          value={post.status}
                          onValueChange={(status) => 
                            updateStatusMutation.mutate({ postId: post.id, status })
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          <SelectTrigger className="w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Новая</SelectItem>
                            <SelectItem value="in_progress">В работе</SelectItem>
                            <SelectItem value="resolved">Решено</SelectItem>
                            <SelectItem value="rejected">Отклонено</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {post.description}
                      </p>
                      
                      {post.imageUrl && (
                        <div className="mb-4">
                          <img 
                            src={post.imageUrl} 
                            alt="Изображение обращения"
                            className="rounded-lg max-h-48 object-cover w-auto"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {post.views || 0} просмотров
                          </span>
                          <span>{post.comments?.length || 0} комментариев</span>
                        </div>
                        <div className="text-xs">
                          ID: #{post.id}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="priority" className="space-y-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Приоритетные обращения
                </CardTitle>
                <CardDescription>
                  Обращения, требующие незамедлительного внимания
                </CardDescription>
              </CardHeader>
            </Card>
            
            <div className="grid gap-6">
              {filteredPosts
                .filter(post => getPriorityLevel(post) === "high" || post.status === "new")
                .map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="category" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {["Дороги", "Коммунальные услуги", "Транспорт", "Безопасность", "Экология", "Благоустройство"].map((category) => {
                const categoryPosts = filteredPosts.filter(post => post.category === category);
                return (
                  <Card key={category} className="glass-effect hover-lift">
                    <CardHeader>
                      <CardTitle className="text-lg">{category}</CardTitle>
                      <CardDescription>
                        {categoryPosts.length} обращений
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Новые:</span>
                          <span className="font-medium">
                            {categoryPosts.filter(p => p.status === "new").length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>В работе:</span>
                          <span className="font-medium">
                            {categoryPosts.filter(p => p.status === "in_progress").length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Решено:</span>
                          <span className="font-medium text-green-600">
                            {categoryPosts.filter(p => p.status === "resolved").length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}