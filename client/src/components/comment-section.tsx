import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { CommentWithAuthor } from "@shared/schema";
import { Heart, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CommentSectionProps {
  postId: number;
  comments: CommentWithAuthor[];
}

export function CommentSection({ postId, comments }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/posts/${postId}/comments`, {
        content,
      });
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate multiple cache keys to ensure all views are updated
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId, "comments"] });
      setNewComment("");
      toast({
        description: "Comment added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const res = await apiRequest("POST", `/api/comments/${commentId}/like`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId, "comments"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to like comment",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      createCommentMutation.mutate(newComment.trim());
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (diffHours < 1) return "Только что";
    if (diffHours < 24) return `${diffHours} ч. назад`;
    return date.toLocaleDateString("ru-RU");
  };

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <div className="space-y-4">
        {/* Existing Comments */}
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={comment.author.avatar || undefined} />
              <AvatarFallback className="gradient-secondary text-white text-xs">
                {comment.author.firstName?.[0] || 'U'}{comment.author.lastName?.[0] || 'N'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="font-medium text-sm text-foreground">
                  {comment.author.firstName} {comment.author.lastName}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {comment.content}
                </p>
              </div>
              <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                <span>{formatDate(comment.createdAt?.toString() || "")}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => likeCommentMutation.mutate(comment.id)}
                  disabled={likeCommentMutation.isPending}
                  className={`p-0 h-auto text-xs ${comment.isLiked ? "text-red-500" : "hover:text-red-500"}`}
                >
                  <Heart className={`mr-1 h-3 w-3 ${comment.isLiked ? "fill-current" : ""}`} />
                  {(comment.likes || 0) > 0 && (comment.likes || 0)}
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Add Comment Form */}
        {user && (
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="gradient-primary text-white text-xs">
                {user.firstName?.[0] || 'U'}{user.lastName?.[0] || 'N'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Добавить комментарий..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="resize-none glass-input"
                rows={2}
              />
              <div className="flex justify-end mt-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newComment.trim() || createCommentMutation.isPending}
                  className="gradient-primary"
                >
                  <Send className="mr-1 h-3 w-3" />
                  {createCommentMutation.isPending ? "Отправка..." : "Отправить"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
