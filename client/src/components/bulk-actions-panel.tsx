import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PostWithAuthor } from "@shared/schema";
import { 
  CheckSquare, 
  Square, 
  MoreHorizontal, 
  FileText, 
  Send, 
  Archive,
  Clock,
  CheckCircle,
  XCircle,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BulkActionsPanelProps {
  posts: PostWithAuthor[];
  selectedPosts: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  onBulkAction: (action: string, data?: any) => Promise<void>;
}

export function BulkActionsPanel({ posts, selectedPosts, onSelectionChange, onBulkAction }: BulkActionsPanelProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkResponse, setBulkResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const isAllSelected = posts.length > 0 && selectedPosts.length === posts.length;
  const isPartiallySelected = selectedPosts.length > 0 && selectedPosts.length < posts.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(posts.map(post => post.id));
    }
  };

  const handlePostSelection = (postId: number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedPosts, postId]);
    } else {
      onSelectionChange(selectedPosts.filter(id => id !== postId));
    }
  };

  const openBulkActionDialog = (action: string) => {
    setActionType(action);
    setIsDialogOpen(true);
  };

  const executeBulkAction = async () => {
    if (selectedPosts.length === 0) {
      toast({
        title: "Ошибка",
        description: "Выберите обращения для выполнения действий",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      let actionData: any = {};

      switch (actionType) {
        case 'status':
          if (!bulkStatus) {
            toast({
              title: "Ошибка",
              description: "Выберите новый статус",
              variant: "destructive",
            });
            return;
          }
          actionData = { status: bulkStatus };
          break;
        case 'response':
          if (!bulkResponse.trim()) {
            toast({
              title: "Ошибка",
              description: "Введите текст ответа",
              variant: "destructive",
            });
            return;
          }
          actionData = { response: bulkResponse, status: bulkStatus || 'in_progress' };
          break;
        case 'archive':
          actionData = { archived: true };
          break;
      }

      await onBulkAction(actionType, { postIds: selectedPosts, ...actionData });
      
      // Reset form
      setIsDialogOpen(false);
      setBulkStatus("");
      setBulkResponse("");
      onSelectionChange([]);
      
      toast({
        title: "Успешно",
        description: `Массовое действие выполнено для ${selectedPosts.length} обращений`,
      });
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить массовое действие",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <FileText className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Bulk Selection Controls */}
      <Card className="glass-effect">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  ref={(el) => {
                    if (el) {
                      (el as any).indeterminate = isPartiallySelected;
                    }
                  }}
                />
                <span className="text-sm font-medium">
                  {selectedPosts.length > 0 
                    ? `Выбрано: ${selectedPosts.length} из ${posts.length}` 
                    : "Выбрать все"}
                </span>
              </div>
              {selectedPosts.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {selectedPosts.length}
                </Badge>
              )}
            </div>

            {selectedPosts.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openBulkActionDialog('status')}
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Изменить статус
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openBulkActionDialog('response')}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Массовый ответ
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openBulkActionDialog('archive')}
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Архивировать
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Posts List with Selection */}
      <div className="space-y-3">
        {posts.map((post) => (
          <Card 
            key={post.id} 
            className={`glass-effect transition-all duration-200 ${
              selectedPosts.includes(post.id) ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedPosts.includes(post.id)}
                  onCheckedChange={(checked) => handlePostSelection(post.id, checked as boolean)}
                  className="mt-1"
                />
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-sm">{post.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {post.author.firstName || ''} {post.author.lastName || ''} • {post.district}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getStatusColor(post.status || 'new')}`}>
                        {getStatusIcon(post.status || 'new')}
                        <span className="ml-1">
                          {post.status === 'new' && 'Новое'}
                          {post.status === 'in_progress' && 'В работе'}
                          {post.status === 'resolved' && 'Решено'}
                          {post.status === 'rejected' && 'Отклонено'}
                        </span>
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {post.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.content.substring(0, 150)}...
                  </p>
                  
                  {post.assignedAgency && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Ответственное ведомство:</span>
                      <span className="font-medium">{post.assignedAgency}</span>
                      {post.internalId && (
                        <Badge variant="outline" className="text-xs">
                          {post.internalId}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bulk Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Массовое действие для {selectedPosts.length} обращений
            </DialogTitle>
            <DialogDescription>
              {actionType === 'status' && 'Изменить статус для выбранных обращений'}
              {actionType === 'response' && 'Отправить одинаковый ответ для всех выбранных обращений'}
              {actionType === 'archive' && 'Архивировать выбранные обращения'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {actionType === 'status' && (
              <div>
                <label className="text-sm font-medium">Новый статус</label>
                <Select value={bulkStatus} onValueChange={setBulkStatus}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_progress">В работе</SelectItem>
                    <SelectItem value="resolved">Решено</SelectItem>
                    <SelectItem value="rejected">Отклонено</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {actionType === 'response' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Статус после ответа</label>
                  <Select value={bulkStatus} onValueChange={setBulkStatus}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_progress">В работе</SelectItem>
                      <SelectItem value="resolved">Решено</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Текст ответа</label>
                  <Textarea
                    value={bulkResponse}
                    onChange={(e) => setBulkResponse(e.target.value)}
                    placeholder="Введите текст ответа, который будет отправлен всем выбранным обращениям"
                    className="mt-2 min-h-[120px]"
                  />
                </div>
              </div>
            )}

            {actionType === 'archive' && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Архивированные обращения будут скрыты из основного списка. 
                  Это действие можно будет отменить позже.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={executeBulkAction} 
              disabled={isProcessing}
              className="min-w-[120px]"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Выполнение...
                </div>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Выполнить
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
