import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, AlertTriangle, CheckCircle, Clock, BarChart3 } from "lucide-react";

interface AnalyticsProps {
  stats: {
    totalComplaints: number;
    newComplaints: number;
    inProgressComplaints: number;
    resolvedComplaints: number;
    avgResponseTime: number;
    myDistrict: string;
  };
}

// Sample data for charts
const monthlyData = [
  { month: "Jan", complaints: 45, resolved: 38, pending: 7 },
  { month: "Feb", complaints: 52, resolved: 41, pending: 11 },
  { month: "Mar", complaints: 61, resolved: 55, pending: 6 },
  { month: "Apr", complaints: 58, resolved: 52, pending: 6 },
  { month: "May", complaints: 67, resolved: 59, pending: 8 },
  { month: "Jun", complaints: 73, resolved: 68, pending: 5 }
];

const categoryDistribution = [
  { name: "Roads", value: 35, color: "#3B82F6" },
  { name: "Utilities", value: 25, color: "#10B981" },
  { name: "Healthcare", value: 20, color: "#F59E0B" },
  { name: "Education", value: 20, color: "#EF4444" }
];

const responseTimeData = [
  { day: "Mon", avgTime: 2.5, target: 3 },
  { day: "Tue", avgTime: 1.8, target: 3 },
  { day: "Wed", avgTime: 3.2, target: 3 },
  { day: "Thu", avgTime: 2.1, target: 3 },
  { day: "Fri", avgTime: 2.9, target: 3 },
  { day: "Sat", avgTime: 4.1, target: 3 },
  { day: "Sun", avgTime: 3.5, target: 3 }
];

export function GovernmentAnalytics({ stats }: AnalyticsProps) {
  const { t } = useLanguage();

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
              {t('newComplaints')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.newComplaints}</div>
            <p className="text-xs text-blue-600 mt-1">{t('requiresAttention')}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {t('dashboard.inProgress')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{stats.inProgressComplaints}</div>
            <p className="text-xs text-yellow-600 mt-1">{t('dashboard.beingProcessed')}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              {t('dashboard.resolved')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.resolvedComplaints}</div>
            <p className="text-xs text-green-600 mt-1">{resolutionRate}% {t('dashboard.resolutionRate')}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              {t('dashboard.avgResponseTime')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.avgResponseTime}h</div>
            <p className="text-xs text-purple-600 mt-1">{t('dashboard.withinTarget')}</p>
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
              {t('dashboard.monthlyTrends')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="complaints" fill="#3B82F6" name={t('dashboard.complaints')} />
                <Bar dataKey="resolved" fill="#10B981" name={t('dashboard.resolved')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.categoryDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 mt-4">
              {categoryDistribution.map((item, index) => (
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

      {/* Response Time Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.responseTimeAnalysis')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="avgTime" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', r: 4 }}
                name={t('dashboard.actualTime')}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#EF4444" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#EF4444', r: 4 }}
                name={t('dashboard.targetTime')}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}