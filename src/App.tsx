import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminBookings from "./pages/admin/AdminBookings.tsx";
import AdminDayOffs from "./pages/admin/AdminDayOffs.tsx";
import AdminServices from "./pages/admin/AdminServices.tsx";
import AdminPoints from "./pages/admin/AdminPoints.tsx";
import AdminVouchers from "./pages/admin/AdminVouchers.tsx";

import { getToken } from "@/hooks/useAuth";

const queryClient = new QueryClient();
const ROUTE_DELAY_MS = 15_000;

const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const isAuth = !!getToken();
  return isAuth ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

const RouteDelayLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background px-6">
    <div className="text-center">
      <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      <h2 className="text-lg font-semibold">Loading page...</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Please wait a moment.
      </p>
    </div>
  </div>
);

const AppRoutes = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const [isRouteLoading, setIsRouteLoading] = useState(isAdminRoute);

  useEffect(() => {
    if (!isAdminRoute) {
      setIsRouteLoading(false);
      return;
    }

    setIsRouteLoading(true);

    const timer = window.setTimeout(() => {
      setIsRouteLoading(false);
    }, ROUTE_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isAdminRoute, location.pathname]);

  if (isRouteLoading) {
    return <RouteDelayLoader />;
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />

      {/* Admin – public */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin – protected */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="day-offs" element={<AdminDayOffs />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="points" element={<AdminPoints />} />
        <Route path="vouchers" element={<AdminVouchers />} />
      </Route>

      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
