
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/layout/ThemeProvider";
import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./contexts/CartContext";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import Magazine from "./pages/Magazine";
import Events from "./pages/Events";
import Classes from "./pages/Classes";
import Community from "./pages/Community";
import About from "./pages/About";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AuthCallback from "./pages/auth/AuthCallback";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import EventDetail from "./pages/EventDetail";
import ClassDetail from "./pages/ClassDetail";
import TicketSelectionPage from "./pages/TicketSelectionPage";
import CheckoutDetailsPage from "./pages/CheckoutDetailsPage";
import CheckoutPaymentPage from "./pages/CheckoutPaymentPage";
import CheckoutConfirmationPage from "./pages/CheckoutConfirmationPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/magazine" element={<Magazine />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:id" element={<EventDetail />} />
                  <Route path="/events/:eventId/tickets" element={<TicketSelectionPage />} />
                  <Route path="/checkout/details" element={<CheckoutDetailsPage />} />
                  <Route path="/checkout/payment" element={<CheckoutPaymentPage />} />
                  <Route path="/checkout/confirmation" element={<CheckoutConfirmationPage />} />
                  <Route path="/classes" element={<Classes />} />
                  <Route path="/classes/:id" element={<ClassDetail />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
