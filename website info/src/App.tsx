import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { FaviconManager } from "@/components/ui/FaviconManager";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AppLayout from "./components/layout/AppLayout";
import PWALayout from "./components/layout/PWALayout";
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import { Spinner } from "@/components/ui/spinner";
import MagicLinkHandler from "./components/MagicLinkHandler";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const Events = lazy(() => import("./pages/Events"));
const Classes = lazy(() => import("./pages/Classes"));
const Community = lazy(() => import("./pages/Community"));
const Profile = lazy(() => import("./pages/Profile"));
const Admin = lazy(() => import("./pages/Admin"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const RegisterDetails = lazy(() => import("./pages/auth/RegisterDetails"));
const AuthCallback = lazy(() => import("./pages/auth/Callback"));
const MagicLinkLogin = lazy(() => import("./pages/auth/MagicLinkLogin"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy load all other pages
const AppInstallPage = lazy(() => import("./pages/AppInstallPage"));
const CreateEventPage = lazy(() => import("./pages/organizer/CreateEventPage"));
const EventTicketingPage = lazy(() => import("./pages/organizer/EventTicketingPage"));
const EventSeatingPage = lazy(() => import("./pages/organizer/EventSeatingPage"));
const EventCustomQuestionsPage = lazy(() => import("./pages/organizer/EventCustomQuestionsPage"));
const ManageEventPage = lazy(() => import("./pages/organizer/ManageEventPage"));
const EventCollectionsPage = lazy(() => import("./pages/organizer/EventCollectionsPage"));
const MultiEventAnalyticsPage = lazy(() => import("./pages/MultiEventAnalyticsPage").then(m => ({ default: m.MultiEventAnalyticsPage })));
const FollowerManagementPage = lazy(() => import("./pages/organizer/FollowerManagementPage"));
const SalesAgentManagementPage = lazy(() => import("./pages/organizer/SalesAgentManagementPage"));
const RoleManagementPage = lazy(() => import("./pages/RoleManagementPage"));
const ClaimableEventsPage = lazy(() => import("./pages/promoter/ClaimableEventsPage"));
const EventClaimsPage = lazy(() => import("./pages/admin/EventClaimsPage"));
const AdminCreateEventPage = lazy(() => import("./pages/admin/AdminCreateEventPage"));
const InventoryDashboardPage = lazy(() => import("./pages/admin/InventoryDashboardPage"));
const CheckinManagementPage = lazy(() => import("./pages/admin/CheckinManagementPage").then(m => ({ default: m.CheckinManagementPage })));
const TicketSelectionPage = lazy(() => import("./pages/checkout/TicketSelectionPage"));
const CheckoutDetailsPage = lazy(() => import("./pages/checkout/CheckoutDetailsPage"));
const CheckoutPaymentPage = lazy(() => import("./pages/checkout/CheckoutPaymentPage"));
const CheckoutConfirmationPage = lazy(() => import("./pages/checkout/CheckoutConfirmationPage"));
const EventPromoCodesPage = lazy(() => import("./pages/organizer/EventPromoCodesPage"));
const EventRefundsPage = lazy(() => import("./pages/organizer/EventRefundsPage"));
const EventCashPaymentPage = lazy(() => import("./pages/organizer/EventCashPaymentPage"));
const EventEmailCampaignsPage = lazy(() => import("./pages/organizer/EventEmailCampaignsPage"));
const EventPerformancePage = lazy(() => import("./pages/organizer/EventPerformancePage"));
const FinancialReportsPage = lazy(() => import("./pages/organizer/FinancialReportsPage"));
const AttendeeReportPage = lazy(() => import('./pages/AttendeeReportPage'));
const CustomerAnalyticsPage = lazy(() => import("./pages/analytics/CustomerAnalyticsPage").then(m => ({ default: m.CustomerAnalyticsPage })));
const ComparativeAnalyticsPage = lazy(() => import("./pages/ComparativeAnalyticsPage"));
const AutomatedReportsPage = lazy(() => import("./pages/organizer/AutomatedReportsPage"));
const EventDetailsPage = lazy(() => import("./pages/EventDetailsPage"));
const CashPaymentPage = lazy(() => import("./pages/buyer/CashPaymentPage"));
const TicketHistoryPage = lazy(() => import("./pages/buyer/TicketHistoryPage"));
const AccountDashboard = lazy(() => import("./pages/buyer/AccountDashboard"));
const ProfileManagement = lazy(() => import("./pages/buyer/ProfileManagement"));
const AccountSettings = lazy(() => import("./pages/buyer/AccountSettings"));
const VenueDetailPage = lazy(() => import("./components/VenueDetailPage"));

// Magazine imports
const MagazinePage = lazy(() => import("./pages/MagazinePage"));
const MagazineCategoryPage = lazy(() => import("./pages/MagazineCategoryPage"));
const MagazineArticlePage = lazy(() => import("./pages/MagazineArticlePage"));
const MagazineRouter = lazy(() => import("./pages/admin/MagazineRouter"));

// Store Directory imports
const SubmitStore = lazy(() => import("./pages/stores/SubmitStore").then(m => ({ default: m.SubmitStore })));
const StoreDetailPage = lazy(() => import("./pages/stores/StoreDetailPage"));
const StoreDirectoryAdminPage = lazy(() => import("./pages/admin/StoreDirectoryAdminPage"));

// Instructor imports
const InstructorDashboardPage = lazy(() => import("./pages/instructor/InstructorDashboardPage"));

// Epic M imports
const VanityUrlManagementPage = lazy(() => import("./pages/VanityUrlManagementPage"));
const AdminVanityUrlPage = lazy(() => import("./pages/admin/AdminVanityUrlPage"));
const AdminEmailManagementPage = lazy(() => import("./pages/admin/AdminEmailManagementPage"));

// Import react-grid-layout and react-resizable CSS
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

// Epic X - Advertising System imports
const AdminAdvertisingPage = lazy(() => import("./pages/admin/AdminAdvertisingPage"));
const AdPortalPage = lazy(() => import("./pages/ads/AdPortalPage"));

// New Admin Dashboard imports
const AdminDashboardOverview = lazy(() => import("./pages/admin/AdminDashboardOverview"));
const AdminAnalyticsHub = lazy(() => import("./pages/admin/AdminAnalyticsHub"));
const AdminSystemSettings = lazy(() => import("./pages/admin/AdminSystemSettings"));
const UserManagementPage = lazy(() => import("./pages/admin/UserManagementPage"));

// Missing Admin Page imports
const AdminThemePage = lazy(() => import("./pages/admin/AdminThemePage"));
const AdminPaymentsPage = lazy(() => import("./pages/admin/AdminPaymentsPage"));
const AdminExportPage = lazy(() => import("./pages/admin/AdminExportPage"));
const AdminNotificationsPage = lazy(() => import("./pages/admin/AdminNotificationsPage"));
const AdminContentPage = lazy(() => import("./pages/admin/AdminContentPage"));
const AdminEventsPage = lazy(() => import("./pages/admin/AdminEventsPage"));
const AdminUserCreatePage = lazy(() => import("./pages/admin/AdminUserCreatePage"));
const AdminUserRolesPage = lazy(() => import("./pages/admin/AdminUserRolesPage"));

// PWA imports
const PWALoginPage = lazy(() => import("./pages/pwa/PWALoginPage"));
const PWADashboardPage = lazy(() => import("./pages/pwa/PWADashboardPage"));
const PWACheckinPage = lazy(() => import("./pages/pwa/PWACheckinPage"));
const PWAAttendancePage = lazy(() => import("./pages/pwa/PWAAttendancePage"));
const PWAAttendeeListPage = lazy(() => import("./pages/pwa/PWAAttendeeListPage"));
const PWAStatisticsPage = lazy(() => import("./pages/pwa/PWAStatisticsPage"));
const PWASettingsPage = lazy(() => import("./pages/pwa/PWASettingsPage"));
const PWASeatingPage = lazy(() => import("./pages/pwa/PWASeatingPage"));

const queryClient = new QueryClient();

// Loading component for Suspense
const PageLoader = () => (
  <div className="min-h-screen bg-background-main flex items-center justify-center">
    <div className="text-center">
      <Spinner size="lg" className="text-brand-primary" />
      <p className="mt-4 text-text-secondary">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <Toaster />
      <Sonner />
      <FaviconManager />
      <BrowserRouter>
        <MagicLinkHandler />
        <Suspense fallback={<PageLoader />}>
          <Routes>
          {/* Public routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/register/details" element={<RegisterDetails />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/magic-link" element={<MagicLinkLogin />} />
          <Route path="/download" element={<AppInstallPage />} />
          
          {/* Redirect from /users to /admin/users */}
          <Route path="/users" element={<Navigate replace to="/admin/users" />} />
          
          {/* PWA-specific routes (standalone, no layout) */}
          <Route path="/pwa/login" element={<PWALoginPage />} />
          
          {/* PWA routes with PWA layout */}
          <Route path="/pwa" element={<PWALayout />}>
            <Route path="dashboard" element={<PWADashboardPage />} />
            <Route path="checkin" element={<PWACheckinPage />} />
            <Route path="attendance" element={<PWAAttendancePage />} />
            <Route path="attendees/:eventId" element={<PWAAttendeeListPage />} />
            <Route path="statistics/:eventId" element={<PWAStatisticsPage />} />
            <Route path="payments/:eventId" element={<PWAPaymentPage />} />
            <Route path="settings" element={<PWASettingsPage />} />
            <Route path="seating/:eventId" element={<PWASeatingPage />} />
            {/* Redirect PWA root to dashboard */}
            <Route index element={<PWADashboardPage />} />
          </Route>
          
          {/* Protected routes with layout */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Index />} />
            
            {/* User Dashboard Route */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/events" element={<Events />} />
            <Route path="/venue/:venueId" element={<VenueDetailPage />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/community" element={<Community />} />
            
            {/* Magazine routes (public) */}
            <Route path="/magazine" element={<MagazinePage />} />
            <Route path="/magazine/:categorySlug" element={<MagazineCategoryPage />} />
            <Route path="/magazine/article/:articleSlug" element={<MagazineArticlePage />} />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            {/* Admin Routes with AdminLayout */}
            <Route path="/admin" element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </RoleProtectedRoute>
            }>
              <Route index element={<AdminDashboardOverview />} />
              <Route path="analytics" element={<AdminAnalyticsHub />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="users/create" element={<AdminUserCreatePage />} />
              <Route path="users/roles" element={<AdminUserRolesPage />} />
              <Route path="settings" element={<AdminSystemSettings />} />
              <Route path="theme" element={<AdminThemePage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route path="export" element={<AdminExportPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="content" element={<AdminContentPage />} />
              <Route path="events" element={<AdminEventsPage />} />
              <Route path="magazine/*" element={<MagazineRouter />} />
              <Route path="stores" element={<StoreDirectoryAdminPage />} />
              <Route path="vanity-urls" element={<AdminVanityUrlPage />} />
              <Route path="email-management" element={<AdminEmailManagementPage />} />
              <Route path="advertising" element={<AdminAdvertisingPage />} />
              <Route path="event-claims" element={<EventClaimsPage />} />
              <Route path="events/create-assign" element={<AdminCreateEventPage />} />
              <Route path="inventory" element={<InventoryDashboardPage />} />
              <Route path="event/:eventId/checkin" element={<CheckinManagementPage />} />
            </Route>
            
            {/* Legacy admin route for backwards compatibility */}
            <Route path="/admin/legacy" element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <Admin />
              </RoleProtectedRoute>
            } />
            <Route path="/ads/portal" element={
              <ProtectedRoute>
                <AdPortalPage />
              </ProtectedRoute>
            } />
            
            {/* Instructor routes */}
            <Route path="/instructor/dashboard" element={
              <RoleProtectedRoute allowedRoles={['instructor', 'admin']}>
                <InstructorDashboardPage />
              </RoleProtectedRoute>
            } />
            
            {/* Epic M - Vanity URL management */}
            <Route path="/vanity-urls" element={
              <ProtectedRoute>
                <VanityUrlManagementPage />
              </ProtectedRoute>
            } />
            
            <Route path="/organizer/events/create" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <CreateEventPage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/event/:eventId/ticketing" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <EventTicketingPage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/event/:eventId/seating" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <EventSeatingPage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/event/:eventId/seating/advanced" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <AdvancedSeatingEditorPage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/event/:eventId/custom-questions" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <EventCustomQuestionsPage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/event/:eventId/manage" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <ManageEventPage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/event/:eventId/promo-codes" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <EventPromoCodesPage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/event/:eventId/refunds" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <EventRefundsPage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/event/:eventId/cash-payments" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <EventCashPaymentPage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/event/:eventId/email-campaigns" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <EventEmailCampaignsPage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/event/:eventId/performance" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <EventPerformancePage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/event/:eventId/financial-reports" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <FinancialReportsPage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/event/:eventId/attendees" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <AttendeeReportPage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/event/:eventId/customer-analytics" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <CustomerAnalyticsPage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/event/:eventId/comparative-analytics" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <ComparativeAnalyticsPage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/automated-reports" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <AutomatedReportsPage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/collections" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <EventCollectionsPage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/analytics" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <MultiEventAnalyticsPage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/team" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <FollowerManagementPage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/roles" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <RoleManagementPage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/sales-agents" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <SalesAgentManagementPage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/event/:eventId/team" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <FollowerManagementPage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/event/:eventId/sales-agents" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <SalesAgentManagementPage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/event/:eventId/commission-payments" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <CommissionPaymentPage />
              </RoleProtectedRoute>
            } />
            <Route path="/organizer/commission-payments" element={
              <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                <CommissionPaymentPage />
              </RoleProtectedRoute>
            } />
            <Route path="/agent/dashboard" element={
              <RoleProtectedRoute allowedRoles={['sales_agent', 'admin']}>
                <SalesAgentDashboardPage />
              </RoleProtectedRoute>
            } />
            <Route path="/promoter/events/claim" element={
              <RoleProtectedRoute allowedRoles={['buyer', 'organizer', 'admin']}>
                <ClaimableEventsPage />
              </RoleProtectedRoute>
            } />

            
            {/* ===== SEO-FRIENDLY SLUG-BASED EVENT ROUTES ===== */}
            {/* New slug-based event details route */}
            <Route path="/event/:eventSlug" element={<EventDetailsPage />} />
            {/* New slug-based ticket selection route */}
            <Route path="/event/:eventSlug/tickets" element={<TicketSelectionPage />} />
            {/* New slug-based checkout routes */}
            <Route path="/event/:eventSlug/checkout/details" element={<CheckoutDetailsPage />} />
            <Route path="/event/:eventSlug/checkout/payment" element={<CheckoutPaymentPage />} />
            <Route path="/event/:eventSlug/checkout/confirmation" element={<CheckoutConfirmationPage />} />
            <Route path="/event/:eventSlug/cash-payment" element={<CashPaymentPage />} />
            
            {/* ===== LEGACY ID-BASED ROUTES (BACKWARD COMPATIBILITY) ===== */}
            {/* Legacy event details - will redirect to slug-based URL */}
            <Route path="/event/:eventId(\d+)" element={<EventDetailsPage />} />
            {/* Legacy ticket selection */}
            <Route path="/event/:eventId(\d+)/tickets" element={<TicketSelectionPage />} />
            {/* Legacy checkout routes */}
            <Route path="/checkout/:eventId(\d+)/details" element={<CheckoutDetailsPage />} />
            <Route path="/checkout/:eventId(\d+)/payment" element={<CheckoutPaymentPage />} />
            <Route path="/checkout/:eventId(\d+)/confirmation" element={<CheckoutConfirmationPage />} />
            <Route path="/event/:eventId(\d+)/cash-payment" element={<CashPaymentPage />} />
            
            {/* Protected route for ticket history */}
            <Route path="/tickets/history" element={
              <ProtectedRoute>
                <TicketHistoryPage />
              </ProtectedRoute>
            } />

            {/* Buyer Account Management Routes */}
            <Route path="/account" element={
              <ProtectedRoute>
                <AccountDashboard />
              </ProtectedRoute>
            } />
            <Route path="/account/profile" element={
              <ProtectedRoute>
                <ProfileManagement />
              </ProtectedRoute>
            } />
            <Route path="/account/settings" element={
              <ProtectedRoute>
                <AccountSettings />
              </ProtectedRoute>
            } />

            {/* Store Directory Routes */}
            <Route path="/stores/submit" element={
              <ProtectedRoute>
                <SubmitStore />
              </ProtectedRoute>
            } />
            <Route path="/stores/:storeId" element={<StoreDetailPage />} />
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
