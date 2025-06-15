
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
import CreateEventPage from "./pages/CreateEventPage";
import EventTicketingPage from "./pages/EventTicketingPage";
import EventSeatingPage from "./pages/EventSeatingPage";
import EventSeatingChartPage from "./pages/EventSeatingChartPage";
import EventCustomQuestionsPage from "./pages/EventCustomQuestionsPage";
import ManageEventPage from "./pages/ManageEventPage";
import ClaimableEventsPage from "./pages/ClaimableEventsPage";
import EventClaimsPage from "./pages/EventClaimsPage";
import AdminCreateEventPage from "./pages/AdminCreateEventPage";
import TestSeatingPage from "./pages/TestSeatingPage";
import AdvancedSeatingPage from "./pages/AdvancedSeatingPage";
import EnhancedPurchasePage from "./pages/EnhancedPurchasePage";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
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
                  <Route path="/create-event" element={<CreateEventPage />} />
                  
                  {/* Organizer routes - must come before general event routes */}
                  <Route path="/organizer/events/:eventId" element={<ManageEventPage />} />
                  <Route path="/organizer/event/:eventId/ticketing" element={<EventTicketingPage />} />
                  <Route path="/organizer/event/:eventId/seating" element={<EventSeatingPage />} />
                  <Route path="/organizer/event/:eventId/seating-chart" element={<EventSeatingChartPage />} />
                  <Route path="/organizer/event/:eventId/custom-questions" element={<EventCustomQuestionsPage />} />
                  <Route path="/organizer/event/:eventId/seating/advanced" element={<AdvancedSeatingPage />} />
                  
                  {/* Event routes */}
                  <Route path="/events/:eventId/purchase" element={<EnhancedPurchasePage />} />
                  <Route path="/events/:eventId/tickets" element={<TicketSelectionPage />} />
                  <Route path="/events/:id" element={<EventDetail />} />
                  
                  {/* Checkout routes */}
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
                  <Route path="/claimable-events" element={<ClaimableEventsPage />} />
                  <Route path="/admin/event-claims" element={<EventClaimsPage />} />
                  <Route path="/admin/create-event" element={<AdminCreateEventPage />} />
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
  </ErrorBoundary>
);

export default App;
