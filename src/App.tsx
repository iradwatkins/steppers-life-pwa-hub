
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./components/layout/ThemeProvider";
import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./contexts/CartContext";
import { PWAProvider } from "./contexts/PWAContext";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import DatabaseTest from "./pages/DatabaseTest";
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
import CashPaymentPage from "./pages/CashPaymentPage";
import CreateEventPage from "./pages/CreateEventPage";
import EventTicketingPage from "./pages/EventTicketingPage";
import EventSeatingPage from "./pages/EventSeatingPage";
import EventSeatingChartPage from "./pages/EventSeatingChartPage";
import EventCustomQuestionsPage from "./pages/EventCustomQuestionsPage";
import EventPromoCodesPage from "./pages/EventPromoCodesPage";
import ManageEventPage from "./pages/ManageEventPage";
import ClaimableEventsPage from "./pages/ClaimableEventsPage";
import EventClaimsPage from "./pages/EventClaimsPage";
import AdminCreateEventPage from "./pages/AdminCreateEventPage";
import AdminDashboard from "./pages/AdminDashboard";
import OrganizerSetupPage from "./pages/OrganizerSetupPage";
import TestSeatingPage from "./pages/TestSeatingPage";
import AdvancedSeatingPage from "./pages/AdvancedSeatingPage";
import EnhancedPurchasePage from "./pages/EnhancedPurchasePage";
import EmailCampaignsPage from "./pages/organizer/EmailCampaignsPage";
import CreateEmailCampaignPage from "./pages/organizer/CreateEmailCampaignPage";
import EmailCampaignAnalyticsPage from "./pages/organizer/EmailCampaignAnalyticsPage";
import OrganizerEventsPage from "./pages/organizer/OrganizerEventsPage";
import PWADashboard from "./pages/PWADashboard";
import FollowingPage from "./pages/FollowingPage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import EventManagementPage from "./pages/admin/EventManagementPage";
import ContentManagementPage from "./pages/admin/ContentManagementPage";
import PlatformConfigPage from "./pages/admin/PlatformConfigPage";
import EventRefundsPage from "./pages/admin/EventRefundsPage";
import InventoryDashboardPage from "./pages/admin/InventoryDashboardPage";
import EventCashPaymentPage from "./pages/organizer/EventCashPaymentPage";
import CashPaymentPage from "./pages/CashPaymentPage";
import TicketHistoryPage from "./pages/TicketHistoryPage";
import WebAnalyticsPage from "./pages/WebAnalyticsPage";
import InstructorAnalyticsPage from "./pages/admin/InstructorAnalyticsPage";
import OrganizerEventManagementPage from "./pages/organizer/OrganizerEventManagementPage";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProtectedRoute, AdminRoute, OrganizerRoute, AuthRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

// Router wrapper to ensure components re-render on location changes
const RouterWrapper = () => {
  const location = useLocation();
  
  return (
    <Layout>
      <Routes key={location.pathname}>
        {/* Simple test route for database operations - TEMPORARILY DEFAULT */}
        <Route path="/" element={<DatabaseTest />} />
        <Route path="/home" element={<Index />} />
        <Route path="/magazine" element={<Magazine />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/create" element={
          <OrganizerRoute>
            <CreateEventPage />
          </OrganizerRoute>
        } />
        <Route path="/organizer/setup" element={
          <AuthRoute>
            <OrganizerSetupPage />
          </AuthRoute>
        } />
        
        {/* Organizer routes - must come before general event routes */}
        <Route path="/organizer/events" element={
          <OrganizerRoute>
            <OrganizerEventsPage />
          </OrganizerRoute>
        } />
        <Route path="/organizer/manage-events" element={
          <OrganizerRoute>
            <OrganizerEventManagementPage />
          </OrganizerRoute>
        } />
        <Route path="/organizer/event/:eventId" element={
          <OrganizerRoute>
            <ManageEventPage />
          </OrganizerRoute>
        } />
        <Route path="/organizer/event/:eventId/ticketing" element={
          <OrganizerRoute>
            <EventTicketingPage />
          </OrganizerRoute>
        } />
        <Route path="/organizer/event/:eventId/seating" element={
          <OrganizerRoute>
            <EventSeatingPage />
          </OrganizerRoute>
        } />
        <Route path="/organizer/event/:eventId/seating-chart" element={
          <OrganizerRoute>
            <EventSeatingChartPage />
          </OrganizerRoute>
        } />
        <Route path="/organizer/event/:eventId/custom-questions" element={
          <OrganizerRoute>
            <EventCustomQuestionsPage />
          </OrganizerRoute>
        } />
        <Route path="/organizer/event/:eventId/promo-codes" element={
          <OrganizerRoute>
            <EventPromoCodesPage />
          </OrganizerRoute>
        } />
        <Route path="/organizer/event/:eventId/seating/advanced" element={
          <OrganizerRoute>
            <AdvancedSeatingPage />
          </OrganizerRoute>
        } />
        
        {/* Email Campaign routes */}
        <Route path="/organizer/email-campaigns" element={
          <OrganizerRoute>
            <EmailCampaignsPage />
          </OrganizerRoute>
        } />
        <Route path="/organizer/email-campaigns/create" element={
          <OrganizerRoute>
            <CreateEmailCampaignPage />
          </OrganizerRoute>
        } />
        <Route path="/organizer/email-campaigns/:campaignId" element={
          <OrganizerRoute>
            <EmailCampaignAnalyticsPage />
          </OrganizerRoute>
        } />
        
        {/* Cash Payment routes */}
        <Route path="/organizer/event/:eventId/cash-payments" element={
          <OrganizerRoute>
            <EventCashPaymentPage />
          </OrganizerRoute>
        } />
        <Route path="/cash-payment" element={
          <AuthRoute>
            <CashPaymentPage />
          </AuthRoute>
        } />
        
        {/* PWA routes */}
        <Route path="/pwa" element={
          <ProtectedRoute>
            <PWADashboard />
          </ProtectedRoute>
        } />
        
        {/* Event routes */}
        <Route path="/events/:id/purchase" element={<EnhancedPurchasePage />} />
        <Route path="/events/:id/tickets" element={<TicketSelectionPage />} />
        <Route path="/events/:id" element={<EventDetail />} />
        
        {/* Checkout routes - require authentication */}
        <Route path="/checkout/details" element={
          <AuthRoute>
            <CheckoutDetailsPage />
          </AuthRoute>
        } />
        <Route path="/checkout/payment" element={
          <AuthRoute>
            <CheckoutPaymentPage />
          </AuthRoute>
        } />
        <Route path="/checkout/confirmation" element={
          <AuthRoute>
            <CheckoutConfirmationPage />
          </AuthRoute>
        } />
        
        {/* Public routes */}
        <Route path="/classes" element={<Classes />} />
        <Route path="/classes/:id" element={<ClassDetail />} />
        <Route path="/community" element={<Community />} />
        <Route path="/about" element={<About />} />
        
        {/* Protected user routes */}
        <Route path="/profile" element={
          <AuthRoute>
            <Profile />
          </AuthRoute>
        } />
        <Route path="/dashboard" element={
          <AuthRoute>
            <Dashboard />
          </AuthRoute>
        } />
        <Route path="/tickets" element={
          <AuthRoute>
            <TicketHistoryPage />
          </AuthRoute>
        } />
        <Route path="/notifications" element={
          <AuthRoute>
            <Notifications />
          </AuthRoute>
        } />
        <Route path="/following" element={
          <AuthRoute>
            <FollowingPage />
          </AuthRoute>
        } />
        <Route path="/claimable-events" element={
          <AuthRoute>
            <ClaimableEventsPage />
          </AuthRoute>
        } />
        
        {/* Admin routes */}
        <Route path="/admin/test" element={<div>Admin Test Route Works!</div>} />
        <Route path="/admin/event-claims" element={<EventClaimsPage />} />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/create-event" element={<AdminCreateEventPage />} />
        <Route path="/admin/settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Admin Settings</h1><p>Settings page coming soon...</p></div>} />
        <Route path="/admin/users" element={
          <AdminRoute>
            <UserManagementPage />
          </AdminRoute>
        } />
        <Route path="/admin/events" element={
          <AdminRoute>
            <EventManagementPage />
          </AdminRoute>
        } />
        <Route path="/admin/organizers" element={<div className="p-8"><h1 className="text-2xl font-bold">Manage Organizers</h1><p>Organizer management page coming soon...</p></div>} />
        <Route path="/admin/analytics" element={
          <AdminRoute>
            <AnalyticsDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/content" element={
          <AdminRoute>
            <ContentManagementPage />
          </AdminRoute>
        } />
        <Route path="/admin/platform-config" element={
          <AdminRoute>
            <PlatformConfigPage />
          </AdminRoute>
        } />
        <Route path="/admin/refunds" element={
          <AdminRoute>
            <EventRefundsPage />
          </AdminRoute>
        } />
        <Route path="/admin/inventory" element={
          <AdminRoute>
            <InventoryDashboardPage />
          </AdminRoute>
        } />
        <Route path="/admin/web-analytics" element={
          <AdminRoute>
            <WebAnalyticsPage />
          </AdminRoute>
        } />
        <Route path="/admin/instructor-analytics" element={
          <AdminRoute>
            <InstructorAnalyticsPage />
          </AdminRoute>
        } />
        <Route path="/admin/reports" element={
          <AdminRoute>
            <AnalyticsDashboard />
          </AdminRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <PWAProvider>
              <CartProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter future={{ 
                v7_startTransition: true,
                v7_relativeSplatPath: true 
              }}>
                <RouterWrapper />
              </BrowserRouter>
              </CartProvider>
            </PWAProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
