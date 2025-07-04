import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CommentSection } from "./comment-section";
import { VoteButtons } from "./vote-buttons";
import { PostWithAuthor } from "@shared/schema";
import { Heart, MessageCircle, Share2, Eye, Lightbulb, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PostCardProps {
  post: PostWithAuthor;
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

const categoryColors = {
  "Дороги": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "ЖКХ": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "Транспорт": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "Экология": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  "Парки": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  "Безопасность": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
};

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/posts/${post.id}/like`);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        description: data.liked ? "Жалоба отмечена как понравившаяся" : "Отметка убрана",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось поставить лайк",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Только что";
    if (diffHours < 24) return `${diffHours} часов назад`;
    if (diffDays < 7) return `${diffDays} дней назад`;
    return date.toLocaleDateString("ru-RU");
  };

  return (
    <article className="glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.author.avatar || undefined} />
              <AvatarFallback className="gradient-primary text-white text-sm">
                {post.author.firstName?.[0]}{post.author.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-foreground">
                {post.author.firstName} {post.author.lastName}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDate(post.createdAt?.toString() || "")} • {post.district}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={statusColors[post.status as keyof typeof statusColors]}>
              {statusLabels[post.status as keyof typeof statusLabels]}
            </Badge>
            <Badge className={categoryColors[post.category as keyof typeof categoryColors] || "bg-gray-100 text-gray-800"}>
              {post.category}
            </Badge>
          </div>
        </div>

        {/* Post Content */}
        <div className="flex items-center gap-2 mb-3">
          {post.type === 'initiative' ? (
            <Lightbulb className="h-5 w-5 text-blue-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          )}
          <h3 className="text-xl font-semibold text-foreground">
            {post.title}
          </h3>
        </div>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          {post.content}
        </p>

        {/* Post Image */}
        {post.imageUrl && (
          <div className="mb-4 rounded-xl overflow-hidden">
            <img
              src={post.imageUrl}
              alt="Изображение к жалобе"
              className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-6">
            {/* Show voting for initiatives, likes for complaints */}
            {post.type === 'initiative' ? (
              <VoteButtons 
                postId={post.id} 
                votes={post.votes || 0} 
                userVote={post.userVote}
                className="mr-2"
              />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => likeMutation.mutate()}
                disabled={likeMutation.isPending}
                className={`transition-colors ${post.isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"}`}
              >
                <Heart className={`mr-2 h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
                {post.likes}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="text-muted-foreground hover:text-primary"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              {post.comments?.length || 0}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary"
              onClick={() => {
                navigator.share?.({
                  title: post.title,
                  text: post.content,
                  url: window.location.href,
                });
              }}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Поделиться
            </Button>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>{post.views}</span>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <CommentSection 
            postId={post.id} 
            comments={post.comments || []} 
          />
        )}
      </div>
    </article>
  );
}
