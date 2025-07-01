import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/post-card";
import { CreatePostModal } from "@/components/create-post-modal";
import { FilterSection } from "@/components/filter-section";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { PostWithAuthor } from "@shared/schema";
import { Plus, MessageSquare, Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";

export default function UserDashboard() {
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    district: "",
    search: "",
  });

  const { data: posts = [], isLoading } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.set("category", filters.category);
      if (filters.district) params.set("district", filters.district);
      if (filters.search) params.set("search", filters.search);
      
      const response = await fetch(`/api/posts?${params}`);
      if (!response.ok) throw new Error("Ошибка загрузки постов");
      return response.json();
    },
  });

  const { data: userPosts = [] } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts", "user", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/posts?userId=${user?.id}`);
      if (!response.ok) throw new Error("Ошибка загрузки ваших постов");
      return response.json();
    },
    enabled: !!user?.id,
  });

  const categories = [
    "Дороги", "Коммунальные услуги", "Транспорт", "Безопасность", 
    "Экология", "Благоустройство", "Образование", "Здравоохранение"
  ];

  const districts = [
    "Юнусабадский", "Мирзо-Улугбекский", "Мирабадский", "Алмазарский",
    "Бектемирский", "Чиланзарский", "Хамзинский", "Сергелийский",
    "Сайрамский", "Янгихаётский", "Чартакский", "Уктепинский"
  ];

  const getStatusStats = () => {
    const stats = {
      total: userPosts.length,
      new: userPosts.filter(p => p.status === "new").length,
      inProgress: userPosts.filter(p => p.status === "in_progress").length,
      resolved: userPosts.filter(p => p.status === "resolved").length,
      rejected: userPosts.filter(p => p.status === "rejected").length,
    };
    return stats;
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Добро пожаловать, {user?.firstName}!
            </h1>
            <p className="text-muted-foreground">
              Управляйте своими обращениями и следите за проблемами города
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="gradient-primary hover-lift text-white mt-4 md:mt-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Создать обращение
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего обращений</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="glass-effect hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">В ожидании</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.new}</div>
            </CardContent>
          </Card>

          <Card className="glass-effect hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">В работе</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card className="glass-effect hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Решено</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="glass-effect">
            <TabsTrigger value="all">Все обращения</TabsTrigger>
            <TabsTrigger value="my">Мои обращения</TabsTrigger>
            <TabsTrigger value="trending">Популярные</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <FilterSection
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories}
              districts={districts}
            />
            
            <div className="grid gap-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-4">Загрузка обращений...</p>
                </div>
              ) : posts.length === 0 ? (
                <Card className="glass-effect">
                  <CardContent className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Обращений не найдено</h3>
                    <p className="text-muted-foreground mb-4">
                      Попробуйте изменить фильтры или создайте первое обращение
                    </p>
                    <Button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="gradient-primary text-white"
                    >
                      Создать обращение
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="my" className="space-y-6">
            <div className="grid gap-6">
              {userPosts.length === 0 ? (
                <Card className="glass-effect">
                  <CardContent className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">У вас пока нет обращений</h3>
                    <p className="text-muted-foreground mb-4">
                      Создайте своё первое обращение для решения проблем в городе
                    </p>
                    <Button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="gradient-primary text-white"
                    >
                      Создать обращение
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                userPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Популярные обращения
                </CardTitle>
                <CardDescription>
                  Обращения с наибольшим количеством голосов и комментариев
                </CardDescription>
              </CardHeader>
            </Card>
            
            <div className="grid gap-6">
              {posts
                .sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0))
                .slice(0, 10)
                .map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
            </div>
          </TabsContent>
        </Tabs>

        <CreatePostModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          categories={categories}
          districts={districts}
        />
      </div>
    </div>
  );
}