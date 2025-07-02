import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/post-card";
import { CreatePostModal } from "@/components/create-post-modal";
import { AdminPanel } from "@/components/admin-panel";
import { FilterSection } from "@/components/filter-section";
import { useTheme } from "@/components/theme-provider";
import { PostWithAuthor } from "@shared/schema";
import { 
  Plus, 
  Bell, 
  Sun, 
  Moon, 
  Menu,
  MessageSquare,
  BarChart3,
  Lightbulb,
  Users,
  TrendingUp
} from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const CATEGORIES = [
    t("roads"), t("housing"), t("transport"), t("environment"), 
    t("parks"), t("utilities")
  ];

  const DISTRICTS = [
    "Chilanzar", "Yunusabad", "Mirzo-Ulughbek", 
    "Sergeli", "Almazar", "Shaykhantakhur"
  ];
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    district: "",
    search: ""
  });

  const { data: posts = [], isLoading } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts", filters],
    enabled: !!user
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: user?.isAdmin
  });

  const displayStats = stats || {
    totalPosts: posts.length,
    resolvedPosts: posts.filter(p => p.status === "resolved").length,
    newPosts: posts.filter(p => p.status === "new").length,
    inProgressPosts: posts.filter(p => p.status === "in_progress").length,
    totalUsers: 0
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                  <MessageSquare className="text-white text-lg" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                  Muloqot Plus
                </h1>
              </div>
              
              <div className="hidden md:flex space-x-8">
                <Button variant="ghost" className="font-medium">Главная</Button>
                <Button variant="ghost" className="font-medium">Жалобы</Button>
                <Button variant="ghost" className="font-medium">Инициативы</Button>
                <Button variant="ghost" className="font-medium">Статистика</Button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleTheme}
                className="glass-input"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="glass-input relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>

              {/* User Menu */}
              <div className="flex items-center space-x-2 glass-input p-2 rounded-lg">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="gradient-primary text-white text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block font-medium text-foreground">
                  {user?.firstName}
                </span>
              </div>

              {/* Admin Panel Button */}
              {user?.isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAdminPanelOpen(true)}
                  className="glass-input"
                >
                  Админ
                </Button>
              )}

              {/* Logout */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                className="glass-input"
              >
{t("logout")}
              </Button>

              <Button variant="ghost" size="icon" className="md:hidden glass-input">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 dark:from-blue-400 dark:via-blue-500 dark:to-emerald-400 bg-clip-text text-transparent">
                {t("yourVoice")}
              </span>
              <br />
              <span className="text-gray-800 dark:text-gray-200">{t("matters")}</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t("platformDescription")}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                size="lg"
                onClick={() => setIsCreateModalOpen(true)}
                className="gradient-primary shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <Plus className="mr-2 h-4 w-4" />
{t("submitComplaint")}
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="glass-input shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                {t("statistics")}
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {displayStats.totalPosts}
                </div>
                <div className="text-muted-foreground font-medium">{t("totalPosts")}</div>
              </div>
              <div className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                  {displayStats.resolvedPosts}
                </div>
                <div className="text-muted-foreground font-medium">{t("resolved")}</div>
              </div>
              <div className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">
                  {displayStats.totalUsers || posts.length * 2}
                </div>
                <div className="text-muted-foreground font-medium">{t("totalUsers")}</div>
              </div>
              <div className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">24</div>
                <div className="text-muted-foreground font-medium">{t("districts")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <FilterSection 
        filters={filters}
        onFiltersChange={setFilters}
        categories={CATEGORIES}
        districts={DISTRICTS}
      />

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Quick Actions */}
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Быстрые действия</h3>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => setIsCreateModalOpen(true)}
                      className="w-full gradient-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Новая жалоба
                    </Button>
                    <Button variant="outline" className="w-full glass-input">
                      <Lightbulb className="mr-2 h-4 w-4 text-amber-500" />
                      Предложить идею
                    </Button>
                    <Button variant="outline" className="w-full glass-input">
                      <Users className="mr-2 h-4 w-4 text-emerald-500" />
                      Присоединиться к инициативе
                    </Button>
                  </div>
                </div>

                {/* Trending Topics */}
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Актуальные темы</h3>
                  <div className="space-y-3">
                    {["#РемонтДорог", "#ПаркиОтдыха", "#ОбщественныйТранспорт"].map((topic, index) => (
                      <div key={topic} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                        <span className="text-sm font-medium">{topic}</span>
                        <span className="text-xs text-muted-foreground">{42 - index * 7} обсуждений</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Posts Feed */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="glass-card rounded-2xl p-6">
                      <div className="flex items-start space-x-3 mb-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-full mb-3" />
                      <Skeleton className="h-32 w-full mb-4" />
                      <div className="flex space-x-4">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  ))
                ) : posts.length === 0 ? (
                  <div className="glass-card rounded-2xl p-12 text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold mb-2">Пока нет жалоб</h3>
                    <p className="text-muted-foreground mb-6">
                      Станьте первым, кто поделится проблемой в вашем районе
                    </p>
                    <Button 
                      onClick={() => setIsCreateModalOpen(true)}
                      className="gradient-primary"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Создать жалобу
                    </Button>
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                )}

                {/* Load More Button */}
                {posts.length > 0 && (
                  <div className="text-center py-8">
                    <Button variant="outline" className="glass-input shadow-lg hover:shadow-xl">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Загрузить еще
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          size="lg"
          onClick={() => setIsCreateModalOpen(true)}
          className="w-14 h-14 gradient-primary rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 floating-animation"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Modals */}
      <CreatePostModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
        categories={CATEGORIES}
        districts={DISTRICTS}
      />
      
      {user?.isAdmin && (
        <AdminPanel 
          open={isAdminPanelOpen} 
          onOpenChange={setIsAdminPanelOpen}
        />
      )}
    </div>
  );
}
