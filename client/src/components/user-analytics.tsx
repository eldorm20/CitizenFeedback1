import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PostWithAuthor } from "@shared/schema";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  MessageSquare, 
  ThumbsUp,
  Eye,
  FileText
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface UserAnalyticsProps {
  userPosts: PostWithAuthor[];
  allPosts: PostWithAuthor[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function UserAnalytics({ userPosts, allPosts }: UserAnalyticsProps) {
  const { t } = useLanguage();

  const analytics = useMemo(() => {
    // Basic stats
    const totalPosts = userPosts.length;
    const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const totalViews = userPosts.reduce((sum, post) => sum + (post.views || 0), 0);
    const totalComments = userPosts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);

    // Status distribution
    const statusStats = {
      new: userPosts.filter(p => p.status === "new").length,
      in_progress: userPosts.filter(p => p.status === "in_progress").length,
      resolved: userPosts.filter(p => p.status === "resolved").length,
      rejected: userPosts.filter(p => p.status === "rejected").length,
    };

    // Category distribution
    const categoryStats = userPosts.reduce((acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly activity (last 6 months)
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleString('ru', { month: 'short' });
      
      const postsInMonth = userPosts.filter(post => {
        if (!post.createdAt) return false;
        const postDate = new Date(post.createdAt);
        return postDate.getMonth() === date.getMonth() && 
               postDate.getFullYear() === date.getFullYear();
      }).length;

      return {
        month: monthKey,
        posts: postsInMonth,
        resolved: userPosts.filter(post => {
          if (!post.createdAt || post.status !== 'resolved') return false;
          const postDate = new Date(post.createdAt);
          return postDate.getMonth() === date.getMonth() && 
                 postDate.getFullYear() === date.getFullYear();
        }).length
      };
    }).reverse();

    // Resolution rate
    const resolutionRate = totalPosts > 0 ? (statusStats.resolved / totalPosts) * 100 : 0;

    // Average response time (mock data - would need real timestamps)
    const avgResponseTime = userPosts
      .filter(p => p.status === 'resolved')
      .length > 0 ? 5.2 : 0; // Mock: 5.2 days average

    // Engagement score
    const engagementScore = totalPosts > 0 ? 
      Math.round(((totalLikes + totalComments) / totalPosts) * 10) / 10 : 0;

    return {
      totalPosts,
      totalLikes,
      totalViews,
      totalComments,
      statusStats,
      categoryStats,
      monthlyData,
      resolutionRate,
      avgResponseTime,
      engagementScore
    };
  }, [userPosts]);

  const statusPieData = [
    { name: 'Новые', value: analytics.statusStats.new, color: '#FFBB28' },
    { name: 'В работе', value: analytics.statusStats.in_progress, color: '#0088FE' },
    { name: 'Решено', value: analytics.statusStats.resolved, color: '#00C49F' },
    { name: 'Отклонено', value: analytics.statusStats.rejected, color: '#FF8042' },
  ].filter(item => item.value > 0);

  const categoryBarData = Object.entries(analytics.categoryStats).map(([category, count]) => ({
    category: category.length > 10 ? category.substring(0, 10) + '...' : category,
    count,
    fullCategory: category
  }));

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего обращений</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              За всё время
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Лайки</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalLikes}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalPosts > 0 ? (analytics.totalLikes / analytics.totalPosts).toFixed(1) : 0} в среднем
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Просмотры</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalPosts > 0 ? Math.round(analytics.totalViews / analytics.totalPosts) : 0} в среднем
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Комментарии</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalComments}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalPosts > 0 ? (analytics.totalComments / analytics.totalPosts).toFixed(1) : 0} в среднем
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Процент решений
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{analytics.resolutionRate.toFixed(1)}%</span>
                <Badge variant={analytics.resolutionRate > 70 ? "default" : "secondary"}>
                  {analytics.resolutionRate > 70 ? "Отлично" : "Хорошо"}
                </Badge>
              </div>
              <Progress value={analytics.resolutionRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {analytics.statusStats.resolved} из {analytics.totalPosts} решены
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Среднее время ответа
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold">{analytics.avgResponseTime} дней</div>
              <Progress value={Math.max(0, 100 - (analytics.avgResponseTime * 10))} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Среднее время решения обращений
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Оценка вовлеченности
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold">{analytics.engagementScore}</div>
              <Progress value={Math.min(100, analytics.engagementScore * 10)} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Среднее количество лайков и комментариев
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Активность по месяцам</CardTitle>
            <CardDescription>Ваши обращения за последние 6 месяцев</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="posts" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Обращения"
                />
                <Line 
                  type="monotone" 
                  dataKey="resolved" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Решены"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Распределение по статусам</CardTitle>
            <CardDescription>Текущее состояние ваших обращений</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      {categoryBarData.length > 0 && (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Распределение по категориям</CardTitle>
            <CardDescription>Ваши обращения по типам проблем</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label, payload) => {
                    const item = categoryBarData.find(d => d.category === label);
                    return item ? item.fullCategory : label;
                  }}
                />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
