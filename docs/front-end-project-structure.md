### III. Detailed Frontend Directory Structure

This structure aims to promote modularity, scalability, and a clear separation of concerns for the Vite + React + TypeScript frontend application.

```plaintext
src/
├── assets/                   # Static assets like images, fonts (if not in public/). MUST contain project-specific static files not served directly from `public/`.
├── components/               # Globally reusable UI components.
│   ├── ui/                   # Primitive UI elements, often wrappers or compositions of Shadcn/UI. MUST contain only generic, reusable, presentational UI elements with minimal business logic.
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   └── layout/               # Components structuring page layouts (e.g., AppShell, Header, Footer, Sidebar, Main PWA Bottom Navigation). MUST contain components that define the overall structure and navigation of pages, not specific page content.
│       ├── AppLayout.tsx
│       ├── Header.tsx
│       └── BottomNavPWA.tsx
├── config/                   # Application-level configuration (e.g., constants, feature flag definitions if client-managed, API base URLs if not solely from .env). MUST contain non-sensitive, static configuration data for the application.
│   └── appConfig.ts
├── features/                 # Feature-specific modules. Each major domain or feature of SteppersLife.com will have its own directory here.
│   ├── auth/                 # Example: Authentication feature (login, registration, password reset).
│   │   ├── components/       # Components specific to the auth feature (e.g., LoginForm, RegistrationForm). MUST NOT be imported directly by other features; promote to `src/components/ui/` if reusable.
│   │   ├── hooks/            # Custom React Hooks specific to the auth feature (e.g., `useRegistrationForm`).
│   │   ├── pages/            # Page components for auth routes (e.g., LoginPage, RegisterPage, ForgotPasswordPage). MUST be routed via the main router configuration.
│   │   ├── services/         # API service calls specific to authentication (e.g., loginUser, registerUser).
│   │   └── types.ts          # TypeScript types and interfaces specific to the auth feature.
│   ├── events/               # Example: Events feature (discovery, details, creation, ticketing).
│   │   ├── components/       # E.g., EventCard, EventDetailView, TicketSelectionForm.
│   │   ├── hooks/
│   │   ├── pages/            # E.g., EventListPage, EventDetailPage, CreateEventPage.
│   │   ├── services/
│   │   └── types.ts
│   ├── classes/              # For physical and VOD class listings, management.
│   ├── communityDirectory/   # For store and service listings.
│   ├── userProfile/          # For user dashboards, settings, managing followed items.
│   ├── store/                # For the SteppersLife promotional products e-commerce store.
│   ├── ads/                  # For the advertising system (user-facing ad purchase portal, ad display logic if client-side).
│   └── (other-features...)/
├── hooks/                    # Global/sharable custom React Hooks used across multiple features. MUST be generic and broadly applicable.
│   └── useAuth.ts            # Example: a hook to access authentication status and user data.
├── lib/                      # Third-party library configurations, API client setup, or core utility modules.
│   └── apiClient.ts          # Configured instance of Axios or fetch wrapper for API communication. MUST be the central point for API request configuration (base URL, interceptors).
├── pages/                    # Top-level page components that don't belong to a specific feature module or act as entry points.
│   ├── HomePage.tsx
│   ├── ExplorePage.tsx       # Could be an alternative to a feature-specific events page for general discovery.
│   ├── NotFoundPage.tsx
│   └── ...
├── providers/                # React Context providers for global or semi-global state/functionality. MUST contain context definitions and their corresponding provider components.
│   ├── ThemeProvider.tsx
│   └── AuthProvider.tsx      # If managing auth state via Context, though Zustand/Jotai might be preferred.
├── routes/                   # Routing configuration for the application.
│   ├── index.tsx             # Main router setup using React Router DOM. MUST define all application routes and integrate `ProtectedRoute`.
│   └── ProtectedRoute.tsx    # Component/logic for handling authenticated/authorized routes.
├── services/                 # Global API service definitions that are not feature-specific or are wrappers around `apiClient.ts`.
│   └── notificationService.ts # Example
├── store/                    # Global client-side state management setup (e.g., Zustand or Jotai stores).
│   ├── uiStore.ts            # Example: Zustand store for global UI state like modals, toasts, loading indicators.
│   └── userSessionStore.ts   # Example: Zustand store for user session details if not solely via React Query's cache or AuthProvider.
├── styles/                   # Global CSS styles, Tailwind CSS setup.
│   └── index.css             # Main CSS entry point, imports Tailwind base, components, utilities, and any global custom styles.
├── types/                    # Global TypeScript type definitions, interfaces, enums shared across the application. MUST contain types that are not specific to a single feature.
│   └── index.ts              # Often used to re-export types for easier imports.
├── utils/                    # General utility functions (pure functions). MUST contain helper functions that are broadly applicable and have no side effects.
│   └── formatters.ts         # E.g., date formatters, currency formatters.
│   └── validators.ts         # Generic validation helper functions.
├── App.tsx                   # Root application component. Sets up global providers (Theme, Router, State Store, React Query Client), and renders the main layout/router. MUST be the main application shell.
└── main.tsx                  # Main entry point of the React application. Renders the `<App />` component into the DOM. MUST initialize the React application.

public/                       # Static assets served directly by the web server (e.g., `favicon.ico`, `manifest.json`, `robots.txt`).
vite.config.ts                # Vite build and development server configuration.
tsconfig.json                 # TypeScript compiler options for the project.
tailwind.config.js            # Tailwind CSS theme and plugin configuration.
postcss.config.js             # PostCSS configuration (often used with Tailwind CSS).
```

### **Notes on Frontend Structure:**

* **Feature-Driven Organization:** The src/features/ directory is central. Each significant part of SteppersLife.com (auth, events, classes, etc.) will be a module here, containing its own components, pages, hooks, services, and types. This promotes modularity and makes it easier for teams or AI agents to work on specific parts of the application with less risk of conflict.
* **Shared vs. Feature-Specific:** A clear distinction is made:
    * src/components/ui/ and src/components/layout/ are for globally reusable, purely presentational or structural components.
    * src/hooks/, src/services/, src/store/ (global parts), src/types/, src/utils/ are for globally shared logic.
    * Anything specific to a feature lives within its src/features/[featureName]/ directory. If a component or hook within a feature becomes useful elsewhere, it should be refactored and moved to the appropriate global directory, with its dependencies updated.
* **Routing:** Centralized in src/routes/ using React Router DOM, making it easy to understand the application's page structure and navigation flow.
* **State Management:** Global client-side state (if needed beyond React Query) will be managed in src/store/ (e.g., using Zustand or Jotai), while feature-specific complex state might also live within the feature's store or use local hooks.
* **API Client:** A single configured API client (e.g., src/lib/apiClient.ts) will be used for all backend communication, allowing for centralized request/response interception (e.g., for auth tokens, error handling).
* **PWA Entry Point:** The public/ directory will hold the manifest.json and service worker registration (if manually managed, though Vite plugins often handle this). 