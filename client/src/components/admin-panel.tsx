import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Users, AlertCircle, CheckCircle } from "lucide-react";

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors = {
  new: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
};

const statusLabels = {
  new: "Новая",
  in_progress: "В работе",
  resolved: "Решено",
  rejected: "Отклонено"
};

export function AdminPanel({ open, onOpenChange }: AdminPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: open,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts", { page: 1, limit: 50 }],
    enabled: open,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ postId, status }: { postId: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/posts/${postId}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        description: "Статус жалобы обновлен",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус",
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiRequest("DELETE", `/api/posts/${postId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        description: "Жалоба удалена",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить жалобу",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="gradient-primary text-white p-6 -m-6 mb-6">
          <DialogTitle className="text-2xl font-semibold text-white flex items-center">
            <BarChart3 className="mr-2 h-6 w-6" />
            Панель администратора
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Admin Stats */}
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-xl">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats?.newPosts || 0}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Новые жалобы</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 p-4 rounded-xl">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats?.inProgressPosts || 0}
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">В работе</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4 rounded-xl">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats?.resolvedPosts || 0}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Решено</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-4 rounded-xl">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats?.totalUsers || 0}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Пользователей</div>
              </div>
            </div>
          )}

          {/* Complaints Management Table */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold">Управление жалобами</h3>
            </div>
            <div className="overflow-x-auto">
              {postsLoading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Жалоба
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Автор
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Статус
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {posts.slice(0, 10).map((post: any) => (
                      <tr key={post.id} className="hover:bg-muted/25">
                        <td className="px-6 py-4 text-sm font-mono">#{post.id}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-foreground max-w-xs truncate">
                            {post.title}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {post.district} • {post.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {post.author?.firstName} {post.author?.lastName}
                        </td>
                        <td className="px-6 py-4">
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
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Просмотр
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deletePostMutation.mutate(post.id)}
                              disabled={deletePostMutation.isPending}
                              className="text-red-600 hover:text-red-800"
                            >
                              Удалить
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
