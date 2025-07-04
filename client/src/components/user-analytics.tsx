import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MessageCircle, Heart, Eye } from "lucide-react";

interface UserAnalyticsProps {
  userId: number;
}

export function UserAnalytics({ userId }: UserAnalyticsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">User Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Posts Created</span>
          </div>
          <Badge variant="secondary">0</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Comments</span>
          </div>
          <Badge variant="secondary">0</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="text-sm">Likes Given</span>
          </div>
          <Badge variant="secondary">0</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-purple-500" />
            <span className="text-sm">Profile Views</span>
          </div>
          <Badge variant="secondary">0</Badge>
        </div>
      </CardContent>
    </Card>
  );
}