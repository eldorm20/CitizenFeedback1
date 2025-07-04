import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PostWithAuthor } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BarChart3,
  Building
} from "lucide-react";

// Fix 1: Working Post Interactions
export function FixedPostCard({ post }: { post: PostWithAuthor }) {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Like functionality
  const likeMutation = useMutation({
    mutationFn: async (postId: number) => {
      return await apiRequest("POST", `/api/posts/${postId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const handleLike = async () => {
    if (!user) return;
    try {
      await likeMutation.mutateAsync(post.id);
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  // Share functionality  
  const handleShare = async () => {
    const shareText = `${post.title}\n${post.content}\n${window.location.href}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.content,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{post.title}</h3>
            <p className="text-sm text-gray-600">{post.author.username}</p>
          </div>
          <Badge variant="outline">
            {t(`status`)}: {post.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">{post.content}</p>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={!user || likeMutation.isPending}
            className="flex items-center space-x-2"
          >
            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{post.likes || 0}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.comments?.length || 0}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>{t('share')}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Fix 2 & 3: Multi-language Analytics for Government/Admin
export function ComprehensiveAnalytics({ userRole }: { userRole: string }) {
  const { t } = useLanguage();

  // Sample analytics data
  const stats = {
    totalComplaints: 156,
    newComplaints: 12,
    inProgressComplaints: 24,
    resolvedComplaints: 120,
    avgResponseTime: 2.5,
    totalUsers: 1234
  };

  const monthlyData = [
    { month: t('jan') || "Jan", complaints: 45, resolved: 38 },
    { month: t('feb') || "Feb", complaints: 52, resolved: 41 },
    { month: t('mar') || "Mar", complaints: 61, resolved: 55 },
    { month: t('apr') || "Apr", complaints: 58, resolved: 52 },
    { month: t('may') || "May", complaints: 67, resolved: 59 },
    { month: t('jun') || "Jun", complaints: 73, resolved: 68 }
  ];

  const categoryData = [
    { name: t('roads') || "Roads", value: 35, color: "#3B82F6" },
    { name: t('utilities') || "Utilities", value: 25, color: "#10B981" },
    { name: t('transport') || "Transport", value: 20, color: "#F59E0B" },
    { name: t('environment') || "Environment", value: 20, color: "#EF4444" }
  ];

  const resolutionRate = stats.totalComplaints > 0 
    ? Math.round((stats.resolvedComplaints / stats.totalComplaints) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {t('new') || "New"} {t('complaints') || "Complaints"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.newComplaints}</div>
            <p className="text-xs text-blue-600 mt-1">{t('requiresAttention') || "Requires attention"}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {t('inProgress') || "In Progress"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{stats.inProgressComplaints}</div>
            <p className="text-xs text-yellow-600 mt-1">{t('beingProcessed') || "Being processed"}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              {t('resolved') || "Resolved"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.resolvedComplaints}</div>
            <p className="text-xs text-green-600 mt-1">{resolutionRate}% {t('resolutionRate') || "success rate"}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              {t('avgResponseTime') || "Avg Response"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.avgResponseTime}h</div>
            <p className="text-xs text-purple-600 mt-1">{t('withinTarget') || "within target"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              {t('monthlyTrends') || "Monthly Trends"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Bar dataKey="complaints" fill="#3B82F6" name={t('complaints') || "Complaints"} />
                <Bar dataKey="resolved" fill="#10B981" name={t('resolved') || "Resolved"} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t('categoryDistribution') || "Category Distribution"}</CardTitle>
          </CardHeader>
          <CardContent>
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
                  <span className="text-sm text-gray-600">
                    {item.name} ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Role Specific Content */}
      {userRole === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              {t('userManagement') || "User Management"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-sm text-gray-600">{t('totalUsers') || "Total registered users"}</p>
          </CardContent>
        </Card>
      )}

      {userRole === 'government' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="w-5 h-5 mr-2" />
              {t('departmentOverview') || "Department Overview"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t('myComplaints') || "My Department"}:</span>
                <span className="font-semibold">{stats.inProgressComplaints + stats.newComplaints}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('avgResponseTime') || "Avg Response"}:</span>
                <span className="font-semibold">{stats.avgResponseTime}h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Complete dashboard integration component
export function EnhancedDashboard({ userRole }: { userRole: string }) {
  const { t } = useLanguage();
  const { user } = useAuth();

  const { data: posts = [] } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts"],
    enabled: !!user,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {userRole === 'admin' ? t('adminDashboard') || "Admin Dashboard" : 
           userRole === 'government' ? t('governmentDashboard') || "Government Dashboard" :
           t('dashboard') || "Dashboard"}
        </h1>
        <p className="text-gray-600 mt-2">
          {t('welcomeMessage') || `Welcome back, ${user?.username}`}
        </p>
      </div>

      {/* Analytics Section */}
      <ComprehensiveAnalytics userRole={userRole} />

      {/* Recent Posts Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">
          {t('recentComplaints') || "Recent Complaints"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.slice(0, 6).map((post) => (
            <FixedPostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}