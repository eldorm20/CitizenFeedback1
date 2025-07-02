import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { PostWithAuthor } from "@shared/schema";
import { 
  Building, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Send, 
  Phone, 
  Mail, 
  MapPin,
  User,
  Calendar,
  TrendingUp,
  Settings,
  BarChart3
} from "lucide-react";

interface GovernmentStats {
  totalComplaints: number;
  newComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  avgResponseTime: number;
  myDistrict: string;
}

interface Agency {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  workingHours: string;
  responsibilities: string[];
  currentLoad: number;
  maxCapacity: number;
  averageResponseTime: number;
  successRate: number;
}

export default function EnhancedGovernmentDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedComplaint, setSelectedComplaint] = useState<PostWithAuthor | null>(null);
  const [responseText, setResponseText] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [estimatedDate, setEstimatedDate] = useState("");

  // Fetch government dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/government/dashboard"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Fetch agency data
  const { data: agencies } = useQuery<Agency[]>({
    queryKey: ["/api/government/agencies"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Fetch top performing agencies
  const { data: topAgencies } = useQuery<Agency[]>({
    queryKey: ["/api/government/top-agencies"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Submit official response mutation
  const responseSubmissionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("POST", `/api/posts/${id}/official-response`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/government/dashboard"] });
      setSelectedComplaint(null);
      setResponseText("");
      setNewStatus("");
      setEstimatedDate("");
    },
  });

  const handleSubmitResponse = () => {
    if (!selectedComplaint || !responseText.trim()) return;

    responseSubmissionMutation.mutate({
      id: selectedComplaint.id,
      data: {
        officialResponse: responseText,
        status: newStatus || 'in_progress',
        estimatedResolution: estimatedDate || null
      }
    });
  };

  const stats: GovernmentStats = dashboardData?.stats || {
    totalComplaints: 0,
    newComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    avgResponseTime: 0,
    myDistrict: user?.district || 'Все районы'
  };

  const recentComplaints: PostWithAuthor[] = dashboardData?.recentComplaints || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <TrendingUp className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Новая';
      case 'in_progress': return 'В работе';
      case 'resolved': return 'Решена';
      case 'rejected': return 'Отклонена';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Building className="h-8 w-8 text-blue-600" />
              Панель управления госслужащего
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {user?.firstName} {user?.lastName} • {stats.myDistrict} • {user?.department || 'Общий отдел'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
              Активен
            </Badge>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Настройки
            </Button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Требуют внимания
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.newComplaints}</div>
              <p className="text-xs text-gray-500">новых жалоб</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                В обработке
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgressComplaints}</div>
              <p className="text-xs text-gray-500">в работе</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Решено
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolvedComplaints}</div>
              <p className="text-xs text-gray-500">выполнено</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Всего
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalComplaints}</div>
              <p className="text-xs text-gray-500">обращений</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Complaints */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Последние обращения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {recentComplaints.map((complaint) => (
                    <Card key={complaint.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getPriorityIcon(complaint.priority || 'medium')}
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {complaint.title}
                              </h3>
                              {complaint.internalId && (
                                <Badge variant="outline" className="text-xs">
                                  #{complaint.internalId}
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                              {complaint.content}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {complaint.author.firstName} {complaint.author.lastName}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {complaint.district}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(complaint.createdAt || '').toLocaleDateString()}
                              </span>
                            </div>
                            
                            {complaint.assignedAgency && (
                              <div className="mt-2 text-xs text-blue-600 font-medium">
                                📋 Назначено: {complaint.assignedAgency}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={getStatusColor(complaint.status || 'new')}>
                              {getStatusLabel(complaint.status || 'new')}
                            </Badge>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setSelectedComplaint(complaint)}
                                  className="gap-1"
                                >
                                  <Send className="h-3 w-3" />
                                  Ответить
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Официальный ответ на жалобу
                                  </DialogTitle>
                                </DialogHeader>
                                
                                {selectedComplaint && (
                                  <div className="space-y-4">
                                    {/* Complaint Details */}
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                      <h3 className="font-semibold mb-2">{selectedComplaint.title}</h3>
                                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                        {selectedComplaint.content}
                                      </p>
                                      <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>Категория: {selectedComplaint.category}</span>
                                        <span>Район: {selectedComplaint.district}</span>
                                        {selectedComplaint.internalId && (
                                          <span>Номер: {selectedComplaint.internalId}</span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Response Form */}
                                    <div className="space-y-4">
                                      <div>
                                        <label className="text-sm font-medium mb-2 block">
                                          Официальный ответ *
                                        </label>
                                        <Textarea
                                          value={responseText}
                                          onChange={(e) => setResponseText(e.target.value)}
                                          placeholder="Введите подробный официальный ответ на жалобу..."
                                          className="min-h-[120px]"
                                        />
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium mb-2 block">
                                            Новый статус
                                          </label>
                                          <Select value={newStatus} onValueChange={setNewStatus}>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Выберите статус" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="in_progress">В работе</SelectItem>
                                              <SelectItem value="resolved">Решена</SelectItem>
                                              <SelectItem value="rejected">Отклонена</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        
                                        <div>
                                          <label className="text-sm font-medium mb-2 block">
                                            Планируемая дата решения
                                          </label>
                                          <Input
                                            type="date"
                                            value={estimatedDate}
                                            onChange={(e) => setEstimatedDate(e.target.value)}
                                          />
                                        </div>
                                      </div>
                                      
                                      <div className="flex justify-end gap-2">
                                        <Button 
                                          variant="outline" 
                                          onClick={() => setSelectedComplaint(null)}
                                        >
                                          Отмена
                                        </Button>
                                        <Button 
                                          onClick={handleSubmitResponse}
                                          disabled={!responseText.trim() || responseSubmissionMutation.isPending}
                                          className="gap-2"
                                        >
                                          <Send className="h-4 w-4" />
                                          Отправить ответ
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {recentComplaints.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Нет новых обращений</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Agency Performance */}
        {topAgencies && topAgencies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Эффективность ведомств
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topAgencies.slice(0, 3).map((agency, index) => (
                  <Card key={agency.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">{agency.name}</h3>
                        <Badge className="bg-green-100 text-green-800">
                          #{index + 1}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{agency.contact}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Эффективность:</span>
                          <span className="font-semibold">{agency.successRate}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Среднее время:</span>
                          <span className="font-semibold">{agency.averageResponseTime}ч</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Загрузка:</span>
                          <span className="font-semibold">{agency.currentLoad}/{agency.maxCapacity}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}