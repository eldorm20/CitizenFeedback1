import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  postId: number;
  votes: number;
  userVote?: 'upvote' | 'downvote' | null;
  className?: string;
}

export function VoteButtons({ postId, votes, userVote, className }: VoteButtonsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: async (voteType: 'upvote' | 'downvote') => {
      const response = await apiRequest("POST", `/api/posts/${postId}/vote`, { voteType });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка голосования",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVote = (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в систему для голосования",
        variant: "destructive",
      });
      return;
    }
    voteMutation.mutate(voteType);
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <Button
        variant={userVote === 'upvote' ? "default" : "outline"}
        size="sm"
        onClick={() => handleVote('upvote')}
        disabled={voteMutation.isPending}
        className={cn(
          "h-8 w-8 p-0 transition-colors",
          userVote === 'upvote' && "bg-green-500 hover:bg-green-600 text-white"
        )}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      
      <span className={cn(
        "text-sm font-medium min-w-[2rem] text-center",
        votes > 0 && "text-green-600",
        votes < 0 && "text-red-600",
        votes === 0 && "text-muted-foreground"
      )}>
        {votes}
      </span>
      
      <Button
        variant={userVote === 'downvote' ? "default" : "outline"}
        size="sm"
        onClick={() => handleVote('downvote')}
        disabled={voteMutation.isPending}
        className={cn(
          "h-8 w-8 p-0 transition-colors",
          userVote === 'downvote' && "bg-red-500 hover:bg-red-600 text-white"
        )}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
    </div>
  );
}