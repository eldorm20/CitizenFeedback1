import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/post-card";
import { CreatePostModal } from "@/components/create-post-modal";
import { AdminPanel } from "@/components/admin-panel";
import { FilterSection } from "@/components/filter-section";
import { ModernChatbot } from "@/components/modern-chatbot";
import { NavigationHeader } from "@/components/navigation-header";
import { PostGridSkeleton, DashboardStatsSkeleton } from "@/components/loading-skeletons";
import { PostWithAuthor } from "@shared/schema";
import { 
  Plus, 
  MessageSquare,
  BarChart3,
  Lightbulb,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Award,
  Globe,
  Building,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EnhancedHomePage() {
  const { user, logoutMutation } = useAuth();
  const { t } = useLanguage();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    district: "",
    search: ""
  });

  const CATEGORIES = [
    t("roads"), t("housing"), t("transport"), t("environment"), 
    t("parks"), t("safety")
  ];

  const DISTRICTS = [
    "Чиланзарский", "Юнусабадский", "Мирзо-Улугбекский", 
    "Сергелийский", "Алмазарский", "Шайхантахурский"
  ];

  // Fetch posts with proper error handling
  const { data: posts = [], isLoading: postsLoading, error: postsError } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts", filters],
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
    enabled: !!user && user.role === 'admin',
  });

  // Real-time stats for dashboard
  const dashboardStats = stats || {
    totalPosts: posts.length || 0,
    resolvedPosts: posts.filter(p => p.status === 'resolved').length || 0,
    totalUsers: 0
  };

  // Quick action shortcuts based on user role
  const getQuickActions = () => {
    const actions = [
      {
        icon: Plus,
        label: t("createPost"),
        onClick: () => setIsCreateModalOpen(true),
        color: "bg-blue-600 hover:bg-blue-700",
        description: "Создать новую жалобу или инициативу"
      },
      {
        icon: MessageSquare,
        label: "MuxlisaAI",
        onClick: () => setIsChatbotOpen(true),
        color: "bg-purple-600 hover:bg-purple-700",
        description: "Умный помощник для решения проблем"
      }
    ];

    if (user?.role === 'admin') {
      actions.push({
        icon: BarChart3,
        label: t("adminDashboard"),
        onClick: () => setIsAdminPanelOpen(true),
        color: "bg-red-600 hover:bg-red-700",
        description: "Управление системой и аналитика"
      });
    }

    if (user?.role === 'government') {
      actions.push({
        icon: Building,
        label: t("governmentDashboard"),
        onClick: () => window.location.href = "/government",
        color: "bg-green-600 hover:bg-green-700",
        description: "Панель государственного служащего"
      });
    }

    return actions;
  };

  // Get trending topics from posts
  const getTrendingTopics = () => {
    const categoryCount = posts.reduce((acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4)
      .map(([category, count]) => ({ category, count }));
  };

  const trendingTopics = getTrendingTopics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <NavigationHeader 
        onCreatePost={() => setIsCreateModalOpen(true)}
        showCreateButton={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t("welcomeMessage")}, {user?.firstName || 'Гражданин'}! 👋
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            {t("platformDescription")}
          </p>
        </motion.div>

        {/* Quick Actions Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {getQuickActions().map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {index === 0 ? 'Основное' : index === 1 ? 'AI' : 'Pro'}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg mb-2">{action.label}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {action.description}
                </p>
                <Button 
                  onClick={action.onClick}
                  className={`w-full ${action.color} text-white`}
                  size="sm"
                >
                  {index === 0 ? 'Создать' : index === 1 ? 'Открыть' : 'Перейти'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Dashboard Stats for Admin */}
        {user?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            {statsLoading ? (
              <DashboardStatsSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      {t("totalPosts")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{dashboardStats.totalPosts}</div>
                    <p className="text-xs text-gray-500">всего обращений</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Решено
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{dashboardStats.resolvedPosts}</div>
                    <p className="text-xs text-gray-500">решенных жалоб</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {t("totalUsers")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">{dashboardStats.totalUsers}</div>
                    <p className="text-xs text-gray-500">активных пользователей</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Эффективность
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {dashboardStats.totalPosts > 0 ? Math.round((dashboardStats.resolvedPosts / dashboardStats.totalPosts) * 100) : 0}%
                    </div>
                    <p className="text-xs text-gray-500">решения проблем</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        )}

        {/* Trending Topics */}
        {trendingTopics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Актуальные темы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {trendingTopics.map(({ category, count }, index) => (
                    <div 
                      key={category}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setFilters(prev => ({ ...prev, category }))}
                    >
                      <span className="font-medium">{category}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <FilterSection
            filters={filters}
            onFiltersChange={setFilters}
            categories={CATEGORIES}
            districts={DISTRICTS}
          />
        </motion.div>

        {/* Posts Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {postsError ? (
            <Card className="text-center py-12">
              <CardContent>
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-semibold mb-2">{t("errorOccurred")}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Не удалось загрузить данные. Проверьте подключение к интернету.
                </p>
                <Button onClick={() => window.location.reload()}>
                  {t("tryAgain")}
                </Button>
              </CardContent>
            </Card>
          ) : postsLoading ? (
            <PostGridSkeleton count={6} />
          ) : posts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Globe className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-semibold mb-2">{t("noDataFound")}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Пока нет обращений по выбранным фильтрам.
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Создать первое обращение
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Floating Action Button for Chatbot */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Button
          onClick={() => setIsChatbotOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          size="lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Modals */}
      <CreatePostModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        categories={CATEGORIES}
        districts={DISTRICTS}
      />

      <AdminPanel
        open={isAdminPanelOpen}
        onOpenChange={setIsAdminPanelOpen}
      />

      <ModernChatbot
        open={isChatbotOpen}
        onOpenChange={setIsChatbotOpen}
      />
    </div>
  );
}