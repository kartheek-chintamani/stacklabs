import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Sharing from "./pages/Sharing";
import Scheduler from "./pages/Scheduler";
import Analytics from "./pages/Analytics";
import Earnings from "./pages/Earnings";
import Audience from "./pages/Audience";
import Competitors from "./pages/Competitors";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AuthLayout from "./components/layouts/AuthLayout";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import UpdatePasswordPage from "./pages/auth/UpdatePasswordPage";
import ContentStudio from "./pages/ContentStudio";
import ShortLinks from "./pages/ShortLinks";
import { Automation } from "./pages/Automation";

import LinkAnalyticsPage from "./pages/LinkAnalyticsPage";


const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/products" replace />} />

              {/* Auth Routes */}
              <Route path="/auth" element={<AuthRoute><AuthLayout /></AuthRoute>}>
                <Route index element={<Navigate to="/auth/login" replace />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="signup" element={<SignupPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
              </Route>

              {/* Protected Routes */}
              <Route path="/auth/update-password" element={<ProtectedRoute><AuthLayout /></ProtectedRoute>}>
                <Route index element={<UpdatePasswordPage />} />
              </Route>

              <Route path="/studio" element={<ProtectedRoute><ContentStudio /></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
              <Route path="/links" element={<ProtectedRoute><ShortLinks /></ProtectedRoute>} />
              <Route path="/links/:id/analytics" element={<ProtectedRoute><LinkAnalyticsPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/sharing" element={<ProtectedRoute><Sharing /></ProtectedRoute>} />
              <Route path="/scheduler" element={<ProtectedRoute><Scheduler /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/automation" element={<ProtectedRoute><Automation /></ProtectedRoute>} />
              <Route path="/ earnings" element={<ProtectedRoute><Earnings /></ProtectedRoute>} />
              <Route path="/audience" element={<ProtectedRoute><Audience /></ProtectedRoute>} />
              <Route path="/competitors" element={<ProtectedRoute><Competitors /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
