import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import ModernCheckoutPaymentPage from "./pages/ModernCheckoutPaymentPage";
import ModernPaymentPage from "./pages/ModernPaymentPage";
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
import TestUploads from "./pages/TestUploads";
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
import MagazineArticle from "./pages/MagazineArticle";
import MagazineManagementPage from "./pages/admin/MagazineManagementPage";
import MagazineEditorPage from "./pages/admin/MagazineEditorPage";
import CommunityManagementPage from "./pages/admin/CommunityManagementPage";
import StoreManagementPage from "./pages/admin/StoreManagementPage";
import CreatePhysicalClassPage from "./pages/classes/CreatePhysicalClassPage";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import ComparativeAnalyticsPage from "./pages/ComparativeAnalyticsPage";
import AutomatedReportsPage from "./pages/AutomatedReportsPage";
import EarningsPage from "./pages/instructor/EarningsPage";
import VODPurchasePage from "./pages/vod/VODPurchasePage";
import PromotionalStorePage from "./pages/store/PromotionalStorePage";
import MerchandiseStorePage from "./pages/merchandise/MerchandiseStorePage";
import NetworkGrowthPage from "./pages/NetworkGrowthPage";
import TestProductPage from "./pages/TestProductPage";
import SimpleCartPage from "./pages/SimpleCartPage";
import SimpleCheckoutPage from "./pages/SimpleCheckoutPage";
import SimpleConfirmationPage from "./pages/SimpleConfirmationPage";
import StorageDiagnosticPage from "./pages/StorageDiagnosticPage";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";

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
        <Route path="/events/create" element={<CreateEventPage />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/classes/create" element={<CreateClassPage />} />
        <Route path="/classes/create-physical" element={<CreatePhysicalClassPage />} />
        <Route path="/organizer/setup" element={<OrganizerSetupPage />} />
        
        {/* Organizer routes */}
        <Route path="/organizer/events" element={<OrganizerEventsPage />} />
        <Route path="/organizer/manage-events" element={<OrganizerEventManagementPage />} />
        <Route path="/organizer/event/:eventId" element={<ManageEventPage />} />
        <Route path="/organizer/event/:eventId/ticketing" element={<EventTicketingPage />} />
        <Route path="/organizer/event/:eventId/seating" element={<EventSeatingPage />} />
        <Route path="/organizer/event/:eventId/seating-chart" element={<EventSeatingChartPage />} />
        <Route path="/organizer/event/:eventId/custom-questions" element={<EventCustomQuestionsPage />} />
        <Route path="/organizer/event/:eventId/promo-codes" element={<EventPromoCodesPage />} />
        <Route path="/organizer/event/:eventId/seating/advanced" element={<AdvancedSeatingPage />} />
        
        {/* Email Campaign routes */}
        <Route path="/organizer/email-campaigns" element={<EmailCampaignsPage />} />
        <Route path="/organizer/email-campaigns/create" element={<CreateEmailCampaignPage />} />
        <Route path="/organizer/email-campaigns/:campaignId" element={<EmailCampaignAnalyticsPage />} />
        
        {/* Cash Payment routes */}
        <Route path="/organizer/event/:eventId/cash-payments" element={<EventCashPaymentPage />} />
        <Route path="/organizer/ticket-diagnostics" element={<TicketDiagnosticsPage />} />
        <Route path="/organizer/event/:eventId/performance" element={<EventPerformancePage />} />
        <Route path="/organizer/event/:eventId/attendees" element={<AttendeeReportPage />} />
        <Route path="/organizer/event/:eventId/financial" element={<FinancialReportPage />} />
        <Route path="/organizer/multi-event-analytics" element={<MultiEventAnalyticsPage />} />
        <Route path="/organizer/comparative-analytics" element={<ComparativeAnalyticsPage />} />
        <Route path="/organizer/automated-reports" element={<AutomatedReportsPage />} />
        <Route path="/cash-payment" element={<CashPaymentPage />} />
        
        {/* PWA routes */}
        <Route path="/pwa" element={<PWADashboard />} />
        <Route path="/pwa/checkin/:eventId" element={<PWACheckinPage />} />
        <Route path="/pwa/attendees/:eventId" element={<PWAAttendeeListPage />} />
        <Route path="/pwa/statistics/:eventId" element={<PWAStatisticsPage />} />
        <Route path="/pwa/payment/:eventId" element={<PWAPaymentPage />} />
        
        {/* Event routes */}
        <Route path="/events/:id/purchase" element={<EnhancedPurchasePage />} />
        <Route path="/events/:id/tickets" element={
          <TicketPageErrorBoundary>
            <TicketSelectionPage />
          </TicketPageErrorBoundary>
        } />
        <Route path="/events/:id/edit" element={<CreateEventPage />} />
        <Route path="/admin/events/:id/edit" element={<CreateEventPage />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/venues/:venueId" element={<VenueDetailPage />} />
        
        {/* Cart and Checkout routes */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout/details" element={<CheckoutDetailsPage />} />
        <Route path="/checkout/payment" element={<ModernCheckoutPaymentPage />} />
        <Route path="/payment" element={<ModernPaymentPage />} />
        <Route path="/checkout/payment/legacy" element={<CheckoutPaymentPage />} />
        
        {/* Simple Checkout Test Routes */}
        <Route path="/test-product" element={<TestProductPage />} />
        <Route path="/simple-cart" element={<SimpleCartPage />} />
        <Route path="/simple-checkout" element={<SimpleCheckoutPage />} />
        <Route path="/simple-confirmation" element={<SimpleConfirmationPage />} />
        <Route path="/checkout/confirmation" element={<CheckoutConfirmationPage />} />
        <Route path="/paypal/return" element={<PayPalReturnPage />} />
        
        {/* Community routes */}
        <Route path="/community" element={<Community />} />
        <Route path="/community/home" element={<CommunityHome />} />
        <Route path="/community/browse" element={<CommunityBrowse />} />
        <Route path="/community/stores/create" element={<CreateStorePage />} />
        <Route path="/community/services/create" element={<CreateServicePage />} />
        <Route path="/community/stores" element={<StoresBrowse />} />
        <Route path="/community/services" element={<ServicesBrowse />} />
        <Route path="/community/stores/:id" element={<StoreDetailPage />} />
        <Route path="/community/services/:id" element={<ServiceDetailPage />} />
        <Route path="/about" element={<About />} />
        
        {/* Magazine routes */}
        <Route path="/magazine/:slug" element={<MagazineArticle />} />
        
        {/* User routes */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/account" element={<AccountDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tickets" element={<TicketHistoryPage />} />
        
        {/* Ticket Transfer Routes */}
        <Route path="/tickets/:ticketId/transfer" element={<TicketTransferPage />} />
        <Route path="/transfer/claim/:linkCode" element={<TransferClaimPage />} />
        <Route path="/transfer/code/:transferCode?" element={<TransferClaimPage />} />
        
        {/* Group Booking Routes */}
        <Route path="/events/:eventId/group-booking" element={<GroupBookingPage />} />
        <Route path="/group/join/:inviteCode" element={<TransferClaimPage />} />
        
        {/* Resale Marketplace Routes */}
        <Route path="/resale" element={<TicketResalePage />} />
        <Route path="/resale/:eventId?" element={<TicketResalePage />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/following" element={<FollowingPage />} />
        <Route path="/network" element={<NetworkGrowthPage />} />
        <Route path="/claimable-events" element={<ClaimableEventsPage />} />
        
        {/* Instructor Routes */}
        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
        <Route path="/instructor/earnings" element={<EarningsPage />} />
        
        {/* VOD Routes */}
        <Route path="/vod/:id/purchase" element={<VODPurchasePage />} />
        
        {/* Store Routes */}
        <Route path="/store" element={<PromotionalStorePage />} />
        <Route path="/merchandise" element={<MerchandiseStorePage />} />
        
        {/* Debug routes */}
        <Route path="/debug/event" element={<EventDebugger />} />
        
        {/* Admin routes */}
        <Route path="/admin/test" element={<div>Admin Test Route Works!</div>} />
        <Route path="/admin/event-claims" element={<EventClaimsPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/create-event" element={<AdminCreateEventPage />} />
        <Route path="/admin/settings" element={
          <div className="p-8"><h1 className="text-2xl font-bold">Admin Settings</h1><p>Settings page coming soon...</p></div>
        } />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/events" element={<AdminEventManagementPage />} />
        <Route path="/admin/organizers" element={
          <div className="p-8"><h1 className="text-2xl font-bold">Manage Organizers</h1><p>Organizer management page coming soon...</p></div>
        } />
        <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
        <Route path="/admin/content" element={<ContentManagementPage />} />
        <Route path="/admin/platform-config" element={<PlatformConfigPage />} />
        <Route path="/admin/theme" element={<ThemeCustomizationPage />} />
        <Route path="/admin/vanity-urls" element={<VanityURLManagementPage />} />
        <Route path="/admin/storage-diagnostic" element={<StorageDiagnosticPage />} />
        <Route path="/vanity-urls" element={<VanityURLRequestPage />} />
        <Route path="/admin/refunds" element={<EventRefundsPage />} />
        <Route path="/admin/inventory" element={<InventoryDashboardPage />} />
        <Route path="/admin/web-analytics" element={<WebAnalyticsPage />} />
        <Route path="/admin/instructor-analytics" element={<InstructorAnalyticsPage />} />
        <Route path="/admin/reports" element={<AnalyticsDashboard />} />
        
        {/* Admin Magazine routes */}
        <Route path="/admin/magazine" element={<MagazineManagementPage />} />
        <Route path="/admin/magazine/create" element={<MagazineEditorPage />} />
        <Route path="/admin/magazine/edit/:articleId" element={<MagazineEditorPage />} />
        <Route path="/admin/community" element={<CommunityManagementPage />} />
        <Route path="/admin/stores" element={<StoreManagementPage />} />
        <Route path="/admin/advertising" element={<AdvertisingManagementPage />} />
        <Route path="/advertising" element={<AdPlacementPortalPage />} />
        <Route path="/test-uploads" element={<TestUploads />} />
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