import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { MessageSquare, Sun, Moon, User, Settings, LogOut, Bell, Plus } from "lucide-react";

interface NavigationHeaderProps {
  onCreatePost?: () => void;
  showCreateButton?: boolean;
}

export function NavigationHeader({ onCreatePost, showCreateButton = true }: NavigationHeaderProps) {
  const { user, logoutMutation } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin": return "Администратор";
      case "government": return "Правительство";
      default: return "Пользователь";
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "government": return "default";
      default: return "secondary";
    }
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b glass-effect backdrop-blur-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-6">
            <Link href="/dashboard">
              <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">Muloqot Plus</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-sm">
                  Главная
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="text-sm">
                Жалобы
              </Button>
              <Button variant="ghost" size="sm" className="text-sm">
                Инициативы
              </Button>
              <Button variant="ghost" size="sm" className="text-sm">
                Статистика
              </Button>
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Create Post Button */}
            {showCreateButton && onCreatePost && (
              <Button
                onClick={onCreatePost}
                className="gradient-primary hover-lift text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Создать обращение
              </Button>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-9 h-9"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="w-9 h-9 relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 h-auto p-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="gradient-primary text-white text-sm">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </div>
                    <Badge 
                      variant={getRoleBadgeVariant(user.role || "user")} 
                      className="text-xs h-4"
                    >
                      {getRoleText(user.role || "user")}
                    </Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-effect">
                <div className="flex items-center space-x-2 p-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="gradient-primary text-white text-sm">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Профиль
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Настройки
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logoutMutation.mutate()}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}