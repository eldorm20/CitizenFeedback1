import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/navigation-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostWithAuthor, User } from "@shared/schema";
import { 
  BarChart3, TrendingUp, Users, FileText, Clock, 
  CheckCircle, AlertTriangle, MapPin 
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

export default function StatisticsPage() {
  const { data: posts = [] } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  // Calculate statistics from posts data
  const totalPosts = posts.length;
  const resolvedPosts = posts.filter(p => p.status === 'resolved').length;
  const newPosts = posts.filter(p => p.status === 'new').length;
  const inProgressPosts = posts.filter(p => p.status === 'in_progress').length;

  // Category statistics
  const categoryStats = posts.reduce((acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryStats).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / totalPosts) * 100).toFixed(1)
  }));

  // District statistics
  const districtStats = posts.reduce((acc, post) => {
    acc[post.district] = (acc[post.district] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const districtData = Object.entries(districtStats).map(([name, value]) => ({
    name,
    value
  }));

  // Status statistics
  const statusData = [
    { name: 'Новые', value: newPosts, color: '#ff7300' },
    { name: 'В работе', value: inProgressPosts, color: '#ffc658' },
    { name: 'Решенные', value: resolvedPosts, color: '#82ca9d' }
  ];

  // Monthly trend (simulated data based on creation dates)
  const monthlyData = posts.reduce((acc, post) => {
    if (post.createdAt) {
      const month = new Date(post.createdAt).toLocaleString('ru', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const trendData = Object.entries(monthlyData).map(([month, count]) => ({
    month,
    count
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <NavigationHeader showCreateButton={false} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2 flex items-center gap-2">
            <BarChart3 className="w-8 h-8" />
            Статистика платформы
          </h1>
          <p className="text-muted-foreground">
            Аналитика и статистика по обращениям граждан
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего обращений</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">{totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                +12% с прошлого месяца
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">В ожидании</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{newPosts}</div>
              <p className="text-xs text-muted-foreground">
                Требуют внимания
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">В работе</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{inProgressPosts}</div>
              <p className="text-xs text-muted-foreground">
                Активно обрабатываются
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Решено</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{resolvedPosts}</div>
              <p className="text-xs text-muted-foreground">
                {totalPosts > 0 ? Math.round((resolvedPosts / totalPosts) * 100) : 0}% от общего числа
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="categories">По категориям</TabsTrigger>
            <TabsTrigger value="districts">По районам</TabsTrigger>
            <TabsTrigger value="status">По статусам</TabsTrigger>
            <TabsTrigger value="trends">Тренды</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Распределение по категориям</CardTitle>
                <CardDescription>
                  Количество обращений в разрезе категорий
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="districts">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Распределение по районам</CardTitle>
                <CardDescription>
                  Количество обращений по районам города
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={districtData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Статусы обращений</CardTitle>
                <CardDescription>
                  Соотношение обращений по статусам
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percentage }) => `${name}: ${value}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Тренды обращений</CardTitle>
                <CardDescription>
                  Динамика поступления обращений по месяцам
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}