import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, BarChart3, Menu, MessageSquare, Users, TrendingUp, CheckCircle, AlertCircle, Sun, Moon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "@/components/theme-provider";
import { useNotifications } from "@/hooks/use-notifications";
import { LanguageSelector } from "@/components/language-selector";
import { FilterSection } from "@/components/filter-section";
import { PostCard } from "@/components/post-card";
import { CreatePostModal } from "@/components/create-post-modal";

import { AdminPanel } from "@/components/admin-panel";
import { motion, AnimatePresence } from "framer-motion";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { PostWithAuthor } from "@shared/schema";

// Sample chart data for enhanced visuals
const monthlyData = [
  { month: "Jan", complaints: 45, resolved: 38 },
  { month: "Feb", complaints: 52, resolved: 41 },
  { month: "Mar", complaints: 61, resolved: 55 },
  { month: "Apr", complaints: 58, resolved: 52 },
  { month: "May", complaints: 67, resolved: 59 },
  { month: "Jun", complaints: 73, resolved: 68 }
];

const categoryData = [
  { name: "Infrastructure", value: 35, color: "#3B82F6" },
  { name: "Healthcare", value: 25, color: "#10B981" },
  { name: "Education", value: 20, color: "#F59E0B" },
  { name: "Transport", value: 20, color: "#EF4444" }
];

interface Stats {
  totalPosts: number;
  resolvedPosts: number;
  newPosts: number;
  inProgressPosts: number;
  totalUsers: number;
}

export default function EnhancedHomePage() {
  const { user, logoutMutation } = useAuth();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    category: "",
    district: "",
    search: "",
    type: ""
  });

  // Fetch posts with filters
  const { data: posts = [], isLoading: postsLoading } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts", filters],
    enabled: !!user,
  });

  // Fetch stats for dashboard
  const { data: stats = { totalPosts: 0, resolvedPosts: 0, newPosts: 0, inProgressPosts: 0, totalUsers: 0 } } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    enabled: !!user && user.role === "admin",
  });

  // Post interaction handlers
  const likeMutation = useMutation({
    mutationFn: async (postId: number) => {
      return await apiRequest("POST", `/api/posts/${postId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const handleLike = async (postId: number) => {
    if (!user) return;
    try {
      await likeMutation.mutateAsync(postId);
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleShare = async (post: PostWithAuthor) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `${post.title}\n${post.content}\n${window.location.href}`;
      await navigator.clipboard.writeText(shareText);
      // Could add a toast notification here
    }
  };

  const displayStats = {
    totalPosts: stats?.totalPosts || posts.length || 0,
    resolvedPosts: stats?.resolvedPosts || posts.filter(p => p.status === "resolved").length || 0,
    newPosts: stats?.newPosts || posts.filter(p => p.status === "new").length || 0,
    inProgressPosts: stats?.inProgressPosts || posts.filter(p => p.status === "in_progress").length || 0,
    totalUsers: stats?.totalUsers || 1250
  };

  // Enhanced categories and districts for better filtering
  const categories = [
    "Infrastructure", "Healthcare", "Education", "Transport", "Environment",
    "Social Services", "Housing", "Utilities", "Safety", "Economy"
  ];

  const districts = [
    "Chilanzar", "Yunusabad", "Mirabad", "Shaykhontohur", "Olmazar",
    "Mirobod", "Sergeli", "Yashnabad", "Uchtepa", "Hamza", "Zangiota"
  ];

  // Enhanced stats animation
  const [animatedStats, setAnimatedStats] = useState({
    totalPosts: 0,
    resolvedPosts: 0,
    totalUsers: 0,
    newPosts: 0
  });

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const timer = setInterval(() => {
      setAnimatedStats(prev => ({
        totalPosts: Math.min(prev.totalPosts + Math.ceil(displayStats.totalPosts / steps), displayStats.totalPosts),
        resolvedPosts: Math.min(prev.resolvedPosts + Math.ceil(displayStats.resolvedPosts / steps), displayStats.resolvedPosts),
        totalUsers: Math.min(prev.totalUsers + Math.ceil(displayStats.totalUsers / steps), displayStats.totalUsers),
        newPosts: Math.min(prev.newPosts + Math.ceil(displayStats.newPosts / steps), displayStats.newPosts)
      }));
    }, interval);

    if (animatedStats.totalPosts >= displayStats.totalPosts) {
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [displayStats]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Muloqot Plus</h2>
          <p className="text-gray-600 dark:text-gray-400">Please log in to access the platform</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Enhanced Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-header backdrop-blur-xl border-b border-white/20">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                Muloqot Plus
              </span>
            </motion.div>

            <div className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard">
                <Button variant="ghost" className="glass-input">
                  {t("home")}
                </Button>
              </Link>
              <Link href="/complaints">
                <Button variant="ghost" className="glass-input">
                  {t("complaints")}
                </Button>
              </Link>
              <Link href="/initiatives">
                <Button variant="ghost" className="glass-input">
                  {t("initiatives")}
                </Button>
              </Link>
              <Link href="/statistics">
                <Button variant="ghost" className="glass-input">
                  {t("statistics")}
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-3">
              <LanguageSelector />
              
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="glass-input"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="glass-input relative"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">Уведомления</h3>
                    {notifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Нет новых уведомлений</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {notifications.slice(0, 5).map((notification) => (
                          <div key={notification.id} className="p-2 rounded border bg-background">
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : 'Недавно'}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    {unreadCount > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={markAllAsRead}
                          className="w-full"
                        >
                          Отметить все как прочитанные
                        </Button>
                      </>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {user.role === "admin" && (
                <Button
                  variant="ghost"
                  onClick={() => setIsAdminPanelOpen(true)}
                  className="glass-input"
                >
                  {t("admin")}
                </Button>
              )}

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => logoutMutation.mutate()}
                className="glass-input"
              >
                {t("logout")}
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Enhanced Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
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
            
            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                onClick={() => setIsCreateModalOpen(true)}
                className="gradient-primary shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("submitComplaint")}
              </Button>
              <Link href="/statistics">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="glass-input shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  {t("statistics")}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Enhanced Stats Cards with Charts */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {animatedStats.totalPosts}
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="text-muted-foreground font-medium">{t("totalPosts")}</div>
              <div className="text-sm text-green-600 dark:text-green-400 mt-2">
                ↗ 12% {t("new")}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {animatedStats.resolvedPosts}
                </div>
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="text-muted-foreground font-medium">{t("resolved")}</div>
              <div className="text-sm text-green-600 dark:text-green-400 mt-2">
                ↗ 8% {t("resolved")}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {animatedStats.newPosts}
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="text-muted-foreground font-medium">{t("new")}</div>
              <div className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                ↗ 15% {t("new")}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {animatedStats.totalUsers}
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="text-muted-foreground font-medium">{t("totalUsers")}</div>
              <div className="text-sm text-green-600 dark:text-green-400 mt-2">
                ↗ 5% {t("new")}
              </div>
            </motion.div>
          </div>

          {/* Enhanced Analytics Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Monthly Trends
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="complaints" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resolved" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-4 mt-4">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.name} ({item.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Filter Section */}
      <FilterSection
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
        districts={districts}
      />

      {/* Enhanced Posts Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PostCard 
                    post={post} 
                    onLike={handleLike}
                    onShare={handleShare}
                    showComments={true}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      </section>

      {/* Modals */}
      <CreatePostModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        categories={categories}
        districts={districts}
      />



      {user.role === "admin" && (
        <AdminPanel
          open={isAdminPanelOpen}
          onOpenChange={setIsAdminPanelOpen}
        />
      )}
    </div>
  );
}