import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/hooks/use-language";
import { NotificationProvider } from "@/hooks/use-notifications";
import LandingPage from "@/pages/landing-page";
import UserDashboard from "@/pages/user-dashboard";
import EnhancedHomePage from "@/components/enhanced-home-page";
import GovernmentDashboard from "@/pages/government-dashboard";
import EnhancedGovernmentDashboard from "@/pages/enhanced-government-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import AuthPage from "@/pages/auth-page";
import ComplaintsPage from "@/pages/complaints-page";
import InitiativesPage from "@/pages/initiatives-page";
import StatisticsPage from "@/pages/statistics-page";
import ProfilePage from "@/pages/profile-page";
import SettingsPage from "@/pages/settings-page";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import { CleanChatbot } from "@/components/clean-chatbot";
import { PWAInstallPrompt, NetworkStatus } from "@/components/pwa-install-prompt";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function DashboardRouter() {
  const { user } = useAuth();
  
  if (!user) return <Redirect to="/auth" />;
  
  // Route based on user role
  if (user.role === "admin") {
    return <AdminDashboard />;
  } else if (user.role === "government") {
    return <GovernmentDashboard />;
  } else {
    return <EnhancedHomePage />;
  }
}

function Router() {
  const { user } = useAuth();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <div className="relative">
      <NetworkStatus />
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/dashboard" component={DashboardRouter} />
        <ProtectedRoute path="/government" component={EnhancedGovernmentDashboard} />
        <ProtectedRoute path="/complaints" component={ComplaintsPage} />
        <ProtectedRoute path="/initiatives" component={InitiativesPage} />
        <ProtectedRoute path="/statistics" component={StatisticsPage} />
        <ProtectedRoute path="/profile" component={() => <ProfilePage />} />
        <ProtectedRoute path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>

      {/* Chatbot for authenticated users */}
      {user && (
        <>
          <CleanChatbot open={isChatbotOpen} onOpenChange={setIsChatbotOpen} />
          {!isChatbotOpen && (
            <Button
              onClick={() => setIsChatbotOpen(true)}
              className="fixed bottom-4 right-4 z-40 rounded-full w-14 h-14 gradient-primary text-white shadow-lg hover-lift"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
          )}
        </>
      )}
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </NotificationProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
