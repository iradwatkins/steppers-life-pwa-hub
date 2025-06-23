
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
import Magazine from "./pages/Magazine";
import Events from "./pages/Events";
import Classes from "./pages/Classes";
import Community from "./pages/Community";
import CommunityHome from "./pages/community/CommunityHome";
import CommunityBrowse from "./pages/community/CommunityBrowse";
import CreateStorePage from "./pages/community/CreateStorePage";
import CreateServicePage from "./pages/community/CreateServicePage";
import StoreDetailPage from "./pages/community/StoreDetailPage";
import ServiceDetailPage from "./pages/community/ServiceDetailPage";
import StoresBrowse from "./pages/community/StoresBrowse";
import ServicesBrowse from "./pages/community/ServicesBrowse";
import About from "./pages/About";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AuthCallback from "./pages/auth/AuthCallback";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Profile from "./pages/Profile";
import AccountDashboard from "./pages/AccountDashboard";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import EventDetail from "./pages/EventDetail";
import ClassDetail from "./pages/ClassDetail";
import TicketSelectionPage from "./pages/TicketSelectionPage";
import CheckoutDetailsPage from "./pages/CheckoutDetailsPage";
import CheckoutPaymentPage from "./pages/CheckoutPaymentPage";
import CheckoutConfirmationPage from "./pages/CheckoutConfirmationPage";
import PayPalReturnPage from "./pages/PayPalReturnPage";
import CartPage from "./pages/CartPage";
import CashPaymentPage from "./pages/CashPaymentPage";
import CreateEventPage from "./pages/CreateEventPage";
import CreateClassPage from "./pages/CreateClassPage";
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
import AdvancedSeatingPage from "./pages/AdvancedSeatingPage";
import EnhancedPurchasePage from "./pages/EnhancedPurchasePage";
import EmailCampaignsPage from "./pages/organizer/EmailCampaignsPage";
import CreateEmailCampaignPage from "./pages/organizer/CreateEmailCampaignPage";
import EmailCampaignAnalyticsPage from "./pages/organizer/EmailCampaignAnalyticsPage";
import OrganizerEventsPage from "./pages/organizer/OrganizerEventsPage";
import PWADashboard from "./pages/PWADashboard";
import { PWACheckinPage } from "./pages/pwa/PWACheckinPage";
import PWAAttendeeListPage from "./pages/pwa/PWAAttendeeListPage";
import { PWAStatisticsPage } from "./pages/pwa/PWAStatisticsPage";
import { PWAPaymentPage } from "./pages/pwa/PWAPaymentPage";
import EventPerformancePage from "./pages/EventPerformancePage";
import MultiEventAnalyticsPage from "./pages/MultiEventAnalyticsPage";
import AttendeeReportPage from "./pages/AttendeeReportPage";
import FinancialReportPage from "./pages/FinancialReportPage";
import VenueDetailPage from "./pages/VenueDetailPage";
import FollowingPage from "./pages/FollowingPage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import AdminEventManagementPage from "./pages/admin/AdminEventManagementPage";
import ContentManagementPage from "./pages/admin/ContentManagementPage";
import PlatformConfigPage from "./pages/admin/PlatformConfigPage";
import ThemeCustomizationPage from "./pages/admin/ThemeCustomizationPage";
import VanityURLManagementPage from "./pages/admin/VanityURLManagementPage";
import VanityURLRequestPage from "./pages/VanityURLRequestPage";
import AdvertisingManagementPage from "./pages/admin/AdvertisingManagementPage";
import AdPlacementPortalPage from "./pages/AdPlacementPortalPage";
import EventRefundsPage from "./pages/admin/EventRefundsPage";
import InventoryDashboardPage from "./pages/admin/InventoryDashboardPage";
import EventCashPaymentPage from "./pages/organizer/EventCashPaymentPage";
import TicketHistoryPage from "./pages/TicketHistoryPage";
import WebAnalyticsPage from "./pages/WebAnalyticsPage";
import InstructorAnalyticsPage from "./pages/admin/InstructorAnalyticsPage";
import OrganizerEventManagementPage from "./pages/organizer/OrganizerEventManagementPage";
import TicketDiagnosticsPage from "./pages/organizer/TicketDiagnosticsPage";
import { TicketPageErrorBoundary } from "./components/TicketPageErrorBoundary";
import { EventDebugger } from "./components/EventDebugger";
import TicketTransferPage from "./pages/TicketTransferPage";
import TransferClaimPage from "./pages/TransferClaimPage";
import GroupBookingPage from "./pages/GroupBookingPage";
import TicketResalePage from "./pages/TicketResalePage";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogManagementPage from "./pages/admin/BlogManagementPage";
import BlogEditorPage from "./pages/admin/BlogEditorPage";
import CommunityManagementPage from "./pages/admin/CommunityManagementPage";
import FollowerManagementPage from "./pages/organizer/FollowerManagementPage";
import CreatePhysicalClassPage from "./pages/classes/CreatePhysicalClassPage";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import ComparativeAnalyticsPage from "./pages/ComparativeAnalyticsPage";
import AutomatedReportsPage from "./pages/AutomatedReportsPage";
import EarningsPage from "./pages/instructor/EarningsPage";
import VODPurchasePage from "./pages/vod/VODPurchasePage";
import PromotionalStorePage from "./pages/store/PromotionalStorePage";
import MerchandiseStorePage from "./pages/merchandise/MerchandiseStorePage";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProtectedRoute, AdminRoute, OrganizerRoute, AuthRoute } from "./components/auth/ProtectedRoute";
// Navigation utilities no longer needed for router wrapper

const queryClient = new QueryClient();

// Router wrapper component
const RouterWrapper = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<Index />} />
        <Route path="/magazine" element={<Magazine />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/create" element={
          <OrganizerRoute>
            <CreateEventPage />
          </OrganizerRoute>
        } />
        <Route path="/classes" element={<Classes />} />
        <Route path="/classes/create" element={
          <AuthRoute>
            <CreateClassPage />
          </AuthRoute>
        } />
        <Route path="/classes/create-physical" element={
          <AuthRoute>
            <CreatePhysicalClassPage />
          </AuthRoute>
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
        <Route path="/organizer/ticket-diagnostics" element={
          <OrganizerRoute>
            <TicketDiagnosticsPage />
          </OrganizerRoute>
        } />
        <Route path="/organizer/event/:eventId/performance" element={
          <OrganizerRoute>
            <EventPerformancePage />
          </OrganizerRoute>
        } />
        <Route path="/organizer/event/:eventId/attendees" element={
          <OrganizerRoute>
            <AttendeeReportPage />
          </OrganizerRoute>
        } />
        <Route path="/organizer/event/:eventId/financial" element={
          <OrganizerRoute>
            <FinancialReportPage />
          </OrganizerRoute>
        } />
        <Route path="/organizer/multi-event-analytics" element={
          <OrganizerRoute>
            <MultiEventAnalyticsPage />
          </OrganizerRoute>
        } />
        <Route path="/organizer/comparative-analytics" element={
          <OrganizerRoute>
            <ComparativeAnalyticsPage />
          </OrganizerRoute>
        } />
        <Route path="/organizer/automated-reports" element={
          <OrganizerRoute>
            <AutomatedReportsPage />
          </OrganizerRoute>
        } />
        <Route path="/organizer/team" element={
          <OrganizerRoute>
            <FollowerManagementPage />
          </OrganizerRoute>
        } />
        <Route path="/organizer/event/:eventId/team" element={
          <OrganizerRoute>
            <FollowerManagementPage />
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
        <Route path="/pwa/checkin/:eventId" element={
          <ProtectedRoute>
            <PWACheckinPage />
          </ProtectedRoute>
        } />
        <Route path="/pwa/attendees/:eventId" element={
          <ProtectedRoute>
            <PWAAttendeeListPage />
          </ProtectedRoute>
        } />
        <Route path="/pwa/statistics/:eventId" element={
          <ProtectedRoute>
            <PWAStatisticsPage />
          </ProtectedRoute>
        } />
        <Route path="/pwa/payment/:eventId" element={
          <ProtectedRoute>
            <PWAPaymentPage />
          </ProtectedRoute>
        } />
        
        {/* Event routes */}
        <Route path="/events/:id/purchase" element={<EnhancedPurchasePage />} />
        <Route path="/events/:id/tickets" element={
          <TicketPageErrorBoundary>
            <TicketSelectionPage />
          </TicketPageErrorBoundary>
        } />
        <Route path="/events/:id/edit" element={
          <OrganizerRoute>
            <CreateEventPage />
          </OrganizerRoute>
        } />
        <Route path="/admin/events/:id/edit" element={
          <AdminRoute>
            <CreateEventPage />
          </AdminRoute>
        } />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/venues/:venueId" element={<VenueDetailPage />} />
        
        {/* Cart and Checkout routes - require authentication */}
        <Route path="/cart" element={
          <AuthRoute>
            <CartPage />
          </AuthRoute>
        } />
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
        <Route path="/paypal/return" element={
          <AuthRoute>
            <PayPalReturnPage />
          </AuthRoute>
        } />
        
        {/* Public routes */}
        <Route path="/classes" element={<Classes />} />
        <Route path="/classes/:id" element={<ClassDetail />} />
        
        {/* VOD Routes */}
        <Route path="/vod/:id/purchase" element={<VODPurchasePage />} />
        
        {/* Store Routes */}
        <Route path="/store" element={<PromotionalStorePage />} />
        <Route path="/merchandise" element={<MerchandiseStorePage />} />
        
        {/* Instructor Routes */}
        <Route path="/instructor/dashboard" element={
          <AuthRoute>
            <InstructorDashboard />
          </AuthRoute>
        } />
        <Route path="/instructor/earnings" element={
          <AuthRoute>
            <EarningsPage />
          </AuthRoute>
        } />
        <Route path="/community" element={<Community />} />
        <Route path="/community/home" element={<CommunityHome />} />
        <Route path="/community/browse" element={<CommunityBrowse />} />
        <Route path="/community/stores/create" element={
          <AuthRoute>
            <CreateStorePage />
          </AuthRoute>
        } />
        <Route path="/community/services/create" element={
          <AuthRoute>
            <CreateServicePage />
          </AuthRoute>
        } />
        <Route path="/community/stores" element={<StoresBrowse />} />
        <Route path="/community/services" element={<ServicesBrowse />} />
        <Route path="/community/stores/:id" element={<StoreDetailPage />} />
        <Route path="/community/services/:id" element={<ServiceDetailPage />} />
        <Route path="/about" element={<About />} />
        
        {/* Blog routes */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        
        {/* Protected user routes */}
        <Route path="/profile" element={
          <AuthRoute>
            <Profile />
          </AuthRoute>
        } />
        <Route path="/account" element={
          <AuthRoute>
            <AccountDashboard />
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
        
        {/* Epic B: Ticket Transfer Routes */}
        <Route path="/tickets/:ticketId/transfer" element={
          <AuthRoute>
            <TicketTransferPage />
          </AuthRoute>
        } />
        <Route path="/transfer/claim/:linkCode" element={<TransferClaimPage />} />
        <Route path="/transfer/code/:transferCode?" element={<TransferClaimPage />} />
        
        {/* Epic B: Group Booking Routes */}
        <Route path="/events/:eventId/group-booking" element={
          <AuthRoute>
            <GroupBookingPage />
          </AuthRoute>
        } />
        <Route path="/group/join/:inviteCode" element={<TransferClaimPage />} />
        
        {/* Epic B: Resale Marketplace Routes */}
        <Route path="/resale" element={<TicketResalePage />} />
        <Route path="/resale/:eventId?" element={<TicketResalePage />} />
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
        
        {/* Debug routes */}
        <Route path="/debug/event" element={<EventDebugger />} />
        
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
        <Route path="/admin/create-event" element={
          <AdminRoute>
            <AdminCreateEventPage />
          </AdminRoute>
        } />
        <Route path="/admin/settings" element={
          <AdminRoute>
            <div className="p-8"><h1 className="text-2xl font-bold">Admin Settings</h1><p>Settings page coming soon...</p></div>
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute>
            <UserManagementPage />
          </AdminRoute>
        } />
        <Route path="/admin/events" element={
          <AdminRoute>
            <AdminEventManagementPage />
          </AdminRoute>
        } />
        <Route path="/admin/organizers" element={
          <AdminRoute>
            <div className="p-8"><h1 className="text-2xl font-bold">Manage Organizers</h1><p>Organizer management page coming soon...</p></div>
          </AdminRoute>
        } />
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
        <Route path="/admin/theme" element={
          <AdminRoute>
            <ThemeCustomizationPage />
          </AdminRoute>
        } />
        <Route path="/admin/vanity-urls" element={
          <AdminRoute>
            <VanityURLManagementPage />
          </AdminRoute>
        } />
        <Route path="/vanity-urls" element={
          <AuthRoute>
            <VanityURLRequestPage />
          </AuthRoute>
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
        
        {/* Admin Blog routes */}
        <Route path="/admin/blog" element={
          <AdminRoute>
            <BlogManagementPage />
          </AdminRoute>
        } />
        <Route path="/admin/blog/create" element={
          <AdminRoute>
            <BlogEditorPage />
          </AdminRoute>
        } />
        <Route path="/admin/blog/edit/:postId" element={
          <AdminRoute>
            <BlogEditorPage />
          </AdminRoute>
        } />
        <Route path="/admin/community" element={
          <AdminRoute>
            <CommunityManagementPage />
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
              <BrowserRouter>
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
