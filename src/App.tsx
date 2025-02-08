
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "./components/Layout";
import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Lazy load route components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Menu = lazy(() => import("./pages/Menu"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Waste = lazy(() => import("./pages/Waste"));
const StaffScheduling = lazy(() => import("./pages/StaffScheduling"));
const Profile = lazy(() => import("./pages/Profile"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const RoleManager = lazy(() => import("./components/roles/RoleManager"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const LoadingFallback = () => (
  <div className="w-full h-screen flex items-center justify-center">
    <div className="space-y-4 w-full max-w-3xl px-4">
      <Skeleton className="h-8 w-[250px]" />
      <Skeleton className="h-[200px] w-full" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
      </div>
    </div>
  </div>
);

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasRequiredRole, setHasRequiredRole] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      if (session && requiredRole) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);

        setHasRequiredRole(roles?.some(r => r.role === requiredRole) ?? false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, [requiredRole]);

  if (isAuthenticated === null) {
    return null; // or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  if (requiredRole && !hasRequiredRole) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route 
            path="/auth" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Auth />
              </Suspense>
            } 
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <Dashboard />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <Menu />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <Inventory />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/waste"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <Waste />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <StaffScheduling />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <Profile />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles"
            element={
              <ProtectedRoute requiredRole="owner">
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <RoleManager />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

