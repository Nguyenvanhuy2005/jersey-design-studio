import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import CreateOrder from "./pages/CreateOrder";
import OrderConfirmation from "./pages/OrderConfirmation";
import AdminLogin from "./pages/AdminLogin";
import AdminOrders from "./pages/AdminOrders";
import AdminCustomers from "./pages/AdminCustomers";
import NotFound from "./pages/NotFound";
import CustomerAuth from "./pages/CustomerAuth";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerOrderDetails from "./pages/CustomerOrderDetails";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import ThankYou from "./pages/ThankYou";

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/create-order" element={<CreateOrder />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/thank-you" element={<ThankYou />} />
              <Route path="/admin" element={<AdminLogin />} />
              
              <Route path="/customer/auth" element={<CustomerAuth />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                <Route path="/customer/orders/:orderId" element={<CustomerOrderDetails />} />
              </Route>
              
              <Route element={<ProtectedRoute requireAdmin={true} />}>
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/customers" element={<AdminCustomers />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);

export default App;
