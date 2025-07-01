import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme-provider";
import LandingPage from "@/pages/landing-page";
import UserDashboard from "@/pages/user-dashboard";
import GovernmentDashboard from "@/pages/government-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import { Chatbot } from "@/components/chatbot";
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
    return <UserDashboard />;
  }
}

function Router() {
  const { user } = useAuth();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <div className="relative">
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/dashboard" component={DashboardRouter} />
        <Route component={NotFound} />
      </Switch>

      {/* Chatbot for authenticated users */}
      {user && (
        <>
          <Chatbot open={isChatbotOpen} onOpenChange={setIsChatbotOpen} />
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
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
