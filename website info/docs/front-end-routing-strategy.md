### VII. Routing Strategy

This section details how navigation and routing will be handled within the SteppersLife.com Progressive Web App (PWA), ensuring a seamless single-page application experience for users.

* **Routing Library:** As established in our "Overall Frontend Philosophy & Patterns," **React Router DOM (v6.x or latest stable)** will be used for all client-side routing. Its features for route definition, nested routes, programmatic navigation, and route protection are well-suited for this application. The main router setup will reside in src/routes/index.tsx.

#### Route Definitions

The following table outlines the main routes envisioned for the application. Component paths are illustrative and will align with our approved directory structure (e.g., feature pages in src/features/[featureName]/pages/ and general pages in src/pages/).

| Path Pattern                         | Component/Page (Illustrative Path)                      | Protection Level                        | Notes                                                                                             |
| :----------------------------------- | :------------------------------------------------------ | :-------------------------------------- | :------------------------------------------------------------------------------------------------ |
| /                                    | src/pages/HomePage.tsx                                  | Public                                  | Main landing page.                                                                                |
| /explore/events                      | src/features/events/pages/EventListPage.tsx             | Public                                  | Event discovery, search, filtering.                                                               |
| /events/:eventId                     | src/features/events/pages/EventDetailPage.tsx           | Public                                  | View details of a specific event. Param: eventId.                                                 |
| /events/create                       | src/features/events/pages/CreateEventPage.tsx           | Authenticated, Role:\[ORGANIZER\]        | Organizer event creation form.                                                                    |
| /manage/events/:eventId              | src/features/events/pages/ManageEventPage.tsx           | Authenticated, Role:\[ORGANIZER\]        | Organizer dashboard for a specific event. Param: eventId.                                         |
| /manage/events/check-in/:eventId     | src/features/events/pages/EventCheckInPage.tsx          | Authenticated, Role:\[ORGANIZER, EVENT_STAFF\] | PWA page for on-site check-in. Param: eventId.                                                    |
| /explore/classes                     | src/features/classes/pages/ClassListPage.tsx            | Public                                  | Class discovery.                                                                                  |
| /classes/:classId                    | src/features/classes/pages/ClassDetailPage.tsx          | Public                                  | View details of a specific class (physical or VOD). Param: classId.                             |
| /classes/vod/:vodClassId/watch       | src/features/classes/pages/WatchVODPage.tsx             | Authenticated, Subscribed               | Access purchased VOD content. Param: vodClassId. (Subscribed check is a form of authorization).   |
| /manage/classes/create               | src/features/classes/pages/CreateClassPage.tsx          | Authenticated, Role:\[INSTRUCTOR\]       | Instructor class listing/VOD creation.                                                            |
| /community                           | src/features/communityDirectory/pages/DirectoryHomePage.tsx | Public                                  | Main page for Community Directory (Stores & Services).                                            |
| /community/:listingType/:listingId   | src/features/communityDirectory/pages/ListingDetailPage.tsx | Public                                  | View details of a store/service. Params: listingType (store/service), listingId.                  |
| /auth/login                          | src/features/auth/pages/LoginPage.tsx                   | Public (Redirect if Authed)             | User login page.                                                                                  |
| /auth/register                       | src/features/auth/pages/RegisterPage.tsx                | Public (Redirect if Authed)             | User registration page.                                                                           |
| /auth/forgot-password                | src/features/auth/pages/ForgotPasswordPage.tsx          | Public                                  |                                                                                                   |
| /auth/reset-password                 | src/features/auth/pages/ResetPasswordPage.tsx           | Public                                  | Requires valid token usually via email link.                                                      |
| /dashboard/my-tickets                | src/features/userProfile/pages/MyTicketsPage.tsx        | Authenticated                           | User's purchased tickets.                                                                         |
| /dashboard/my-classes                | src/features/userProfile/pages/MyClassesPage.tsx        | Authenticated                           | User's enrolled/purchased VOD classes.                                                            |
| /dashboard/profile                   | src/features/userProfile/pages/ProfileSettingsPage.tsx  | Authenticated                           | User profile editing.                                                                             |
| /dashboard/organizer                 | src/features/userProfile/pages/OrganizerDashboardPage.tsx | Authenticated, Role:\[ORGANIZER\]        | Organizer's main dashboard.                                                                       |
| /dashboard/instructor                | src/features/userProfile/pages/InstructorDashboardPage.tsx| Authenticated, Role:\[INSTRUCTOR\]       | Instructor's main dashboard.                                                                      |
| /store                               | src/features/store/pages/PromoProductStorePage.tsx      | Authenticated, Role:\[ELIGIBLE_ROLES\]   | SteppersLife promotional products store.                                                          |
| /ads/portal                          | src/features/ads/pages/AdPurchasePortalPage.tsx         | Authenticated, Role:\[ADVERTISER_ELIGIBLE\]| User-facing portal for purchasing ad placements.                                                  |
| /blog                                | src/features/blog/pages/BlogListPage.tsx                | Public                                  | List of blog posts.                                                                               |
| /blog/:slug                          | src/features/blog/pages/BlogPostPage.tsx                | Public                                  | Individual blog post. Param: slug.                                                                |
| /admin/*                             | src/features/admin/pages/AdminLayout.tsx                | Authenticated, Role:\[ADMIN\]           | Entry point for all admin panel routes (nested routing).                                          |
| *                                    | src/pages/NotFoundPage.tsx                              | Public                                  | Catch-all for 404 Not Found pages.                                                                |

**Notes on Route Definitions:**

* Role:\[ROLE_NAME\] indicates a specific user role is required. ELIGIBLE_ROLES for the store would include Organizers, Instructors, Community Listers. ADVERTISER_ELIGIBLE would be similar.
* Subscribed implies a check that the user has purchased access to specific content (e.g., a VOD class).
* Parameterized routes (e.g., /:eventId) will use React Router's mechanisms for accessing parameters.

#### Route Guards / Protection

Access to certain routes will be controlled based on authentication status and user roles. This will be implemented using a custom ProtectedRoute component (e.g., located in src/routes/ProtectedRoute.tsx).

* **Authentication Guard:**
    * **Mechanism:** The ProtectedRoute component will wrap routes that require authentication.
    * **Logic:** It will check the user's authentication status (e.g., by accessing state from userSessionStore.getState().isAuthenticated or an AuthProvider context).
    * **Behavior:**
        * If the user is not authenticated and attempts to access a protected route, they MUST be redirected to the /auth/login page. The original intended path MAY be stored (e.g., in state or query params) to redirect them back after successful login.
        * If the user is authenticated, the component will render the requested child route/page.
    * Routes marked Public (Redirect if Authed) (like /auth/login) will also use logic (perhaps within the page component itself or a simple wrapper) to redirect already authenticated users to a default authenticated page (e.g., /dashboard/my-tickets).
* **Authorization Guard (Role-Based):**
    * **Mechanism:** The same ProtectedRoute component can be extended to handle role-based authorization. It can accept a prop specifying the required role(s) (e.g., <ProtectedRoute requiredRoles={['ORGANIZER', 'ADMIN']}>).
    * **Logic:** After confirming authentication, it will check if the authenticated user's roles (e.g., from userSessionStore.getState().currentUser.roles) include any of the requiredRoles.
    * **Behavior:**
        * If the user has the required role(s), the component will render the requested child route/page.
        * If the user is authenticated but lacks the necessary role(s), they MUST be redirected to a designated "Access Denied" or "Forbidden" page (e.g., a generic error page displaying a 403 message, or back to their main dashboard with a notification). They SHOULD NOT be redirected to the login page if already authenticated. 