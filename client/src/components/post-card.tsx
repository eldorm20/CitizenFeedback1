import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { PostWithAuthor } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { VoteButtons } from "@/components/vote-buttons";
import { CommentSection } from "@/components/comment-section";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Clock, 
  AlertCircle, 
  Lightbulb,
  Eye,
  Calendar,
  User,
  Building2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: PostWithAuthor;
  onLike?: (postId: number) => void;
  onShare?: (post: PostWithAuthor) => void;
  showComments?: boolean;
  compact?: boolean;
}

export function PostCard({ 
  post, 
  onLike, 
  onShare, 
  showComments = false, 
  compact = false 
}: PostCardProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [showFullComments, setShowFullComments] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'initiative' ? Lightbulb : AlertCircle;
  };

  const TypeIcon = getTypeIcon(post.type);

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${compact ? 'p-3' : 'p-0'}`}>
      <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-600 text-white">
                {post.author.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm">{post.author.username}</span>
                {post.author.role === 'government' && (
                  <Badge variant="secondary" className="text-xs">
                    <Building2 className="w-3 h-3 mr-1" />
                    {t('role.government')}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                {post.views > 0 && (
                  <>
                    <span>•</span>
                    <Eye className="w-3 h-3" />
                    <span>{post.views} {t('post.views')}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TypeIcon className={`w-4 h-4 ${post.type === 'initiative' ? 'text-yellow-500' : 'text-red-500'}`} />
            <Badge variant="outline" className={getStatusColor(post.status)}>
              {t(`post.status.${post.status}`)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className={compact ? 'py-2' : 'py-3'}>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {compact && post.content.length > 200 
                ? `${post.content.substring(0, 200)}...` 
                : post.content
              }
            </p>
          </div>

          {post.imageUrl && (
            <div className="rounded-lg overflow-hidden">
              <img 
                src={post.imageUrl} 
                alt={post.title}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              {post.category}
            </Badge>
            {post.district && (
              <Badge variant="outline" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                {post.district}
              </Badge>
            )}
            {post.tags && post.tags.length > 0 && (
              post.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))
            )}
          </div>

          {post.officialResponse && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center space-x-2 mb-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-800 dark:text-blue-200">
                  {t('post.officialResponse')}
                </span>
                {post.responseDate && (
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(post.responseDate), { addSuffix: true })}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {post.officialResponse}
              </p>
              {post.estimatedResolution && (
                <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {t('post.estimatedResolution')}: {new Date(post.estimatedResolution).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className={compact ? 'pt-2' : 'pt-3'}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            {post.type === 'initiative' ? (
              <VoteButtons 
                postId={post.id}
                initialUpvotes={post.upvotes || 0}
                initialDownvotes={post.downvotes || 0}
                userVote={post.userVote}
                disabled={!user}
              />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike?.(post.id)}
                disabled={!user}
                className="flex items-center space-x-2"
              >
                <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{post.likes || 0}</span>
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullComments(!showFullComments)}
              className="flex items-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments?.length || 0}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare?.(post)}
              className="flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>{t('post.share')}</span>
            </Button>
          </div>

          {post.location && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              <span>{post.location}</span>
            </div>
          )}
        </div>

        {showComments && showFullComments && post.comments && (
          <div className="mt-4 w-full">
            <Separator className="mb-4" />
            <CommentSection 
              postId={post.id}
              comments={post.comments}
            />
          </div>
        )}
      </CardFooter>
    </Card>
  );
}