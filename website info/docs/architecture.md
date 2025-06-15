**SteppersLife.com Frontend Architecture Document (Version 1.0)**:

# ---

**SteppersLife.com Frontend Architecture Document**

## **Table of Contents**

* [I. Introduction](https://www.google.com/search?q=%23i-introduction)  
* [II. Overall Frontend Philosophy & Patterns](https://www.google.com/search?q=%23ii-overall-frontend-philosophy--patterns)  
* [III. Detailed Frontend Directory Structure](https://www.google.com/search?q=%23iii-detailed-frontend-directory-structure)  
* [IV. Component Breakdown & Implementation Details](https://www.google.com/search?q=%23iv-component-breakdown--implementation-details)  
* [V. State Management In-Depth](https://www.google.com/search?q=%23v-state-management-in-depth)  
* [VI. API Interaction Layer](https://www.google.com/search?q=%23vi-api-interaction-layer)  
* [VII. Routing Strategy](https://www.google.com/search?q=%23vii-routing-strategy)  
* [VIII. Build, Bundling, and Deployment](https://www.google.com/search?q=%23viii-build-bundling-and-deployment)  
* [IX. Frontend Testing Strategy](https://www.google.com/search?q=%23ix-frontend-testing-strategy)  
* [X. Accessibility (AX) Implementation Details](https://www.google.com/search?q=%23x-accessibility-ax-implementation-details)  
* [XI. Performance Considerations](https://www.google.com/search?q=%23xi-performance-considerations)  
* [XII. Internationalization (i18n) and Localization (l10n) Strategy](https://www.google.com/search?q=%23xii-internationalization-i18n-and-localization-l10n-strategy)  
* [XIII. Feature Flag Management](https://www.google.com/search?q=%23xiii-feature-flag-management)  
* [XIV. Frontend Security Considerations](https://www.google.com/search?q=%23xiv-frontend-security-considerations)  
* [XV. Browser Support and Progressive Enhancement](https://www.google.com/search?q=%23xv-browser-support-and-progressive-enhancement)  
* [XVI. Change Log](https://www.google.com/search?q=%23xvi-change-log)

## **I. Introduction**

This document details the technical architecture specifically for the frontend of **SteppersLife.com**. It complements the main SteppersLife.com Architecture Document (Version 0.2).md and the primary UI/UX design guidelines provided in the Steppers Life\_ Comprehensive UI\_UX Layou.pdf. This document details the frontend architecture and **builds upon the foundational decisions** (e.g., overall tech stack, CI/CD, primary testing tools) defined in the main SteppersLife.com Architecture Document. Frontend-specific elaborations or deviations from general patterns are explicitly noted herein. The goal is to provide a clear blueprint for frontend development, ensuring consistency, maintainability, and alignment with the overall system design and user experience goals outlined in the SteppersLife PRD Document \- Revision 3.2.md.

* **Link to Main Architecture Document (REQUIRED):** docs/SteppersLife.com Architecture Document (Version 0.2).md  
* **Link to Primary UI/UX Design & Layout Document (REQUIRED):** docs/Steppers Life\_ Comprehensive UI\_UX Layou.pdf (This document serves as the primary UI/UX specification and visual reference for this Frontend Architecture).  
* **Link to Deployed Storybook / Component Showcase:** Not applicable for the initial version of this document. (To be added if/when a Storybook instance is implemented).

## **II. Overall Frontend Philosophy & Patterns**

The frontend for SteppersLife.com will be a **Progressive Web App (PWA)** with a mobile-first responsive design, aiming for a sleek, modern, community-focused, and intuitive user experience. The architecture will prioritize maintainability, scalability, performance, and a robust developer experience, aligning with the choices in the SteppersLife.com Architecture Document (Version 0.2).md and 3\. Technical Preferences for {Project Name}.md.

* **Framework & Core Libraries:**  
  * **Framework:** React (Latest stable, e.g., 18.x)  
  * **Build Tool:** Vite (Latest stable, e.g., 5.x)  
  * **Language:** TypeScript (Latest stable)  
  * **Routing:** React Router DOM (Latest stable, e.g., 6.x) will be used for all client-side routing and navigation, enabling a single-page application experience.  
  * These choices are derived from the 'Definitive Tech Stack Selections' in the main Architecture Document and are chosen for their robust ecosystems, performance, and developer experience.  
* **Component Architecture:**  
  * A **feature-based or domain-driven component structure** will be adopted, where components specific to a feature reside within that feature's directory.  
  * Globally reusable UI primitives and layout components will be built using **Shadcn/UI** (which leverages **Radix UI** primitives), promoting accessibility and reusability. These will be organized in a shared components directory (e.g., src/components/ui/ and src/components/layout/).  
  * We will emphasize a clear distinction between **Presentational (UI) Components** (focused on looks) and **Container Components** (focused on logic and data fetching), although React Hooks often allow for more flexible composition.  
* **State Management Strategy:**  
  * **Server State & Caching:** **React Query (TanStack Query)** (Latest stable, e.g., 5.x) will be the primary tool for managing server state, including data fetching, caching, synchronization, and background updates.  
  * **Client-Side Global State:** For simple global state needs (e.g., theme, basic user session info if not fully managed by React Query's cache), **React Context API** will be used. For more complex global client-side state, **Zustand or Jotai** will be evaluated and implemented as needed.  
  * **Form State:** **React Hook Form** (Latest stable, e.g., 7.x) will manage form state and validation.  
  * **Local Component State:** React's built-in useState and useReducer will be used for UI-specific, non-shared state.  
* **Data Flow:**  
  * A generally **unidirectional data flow** will be maintained. Data fetched via React Query or held in global state will flow down to components via props or context. Updates will be triggered by user interactions, calling mutation functions (from React Query) or dispatching actions to update state, which then re-renders the UI.  
* **Styling Approach:**  
  * **Chosen Styling Solution:** **Tailwind CSS** (Latest stable, e.g., 3.x) will be the primary styling methodology, leveraging its utility-first approach for rapid development and consistency.  
  * **Configuration File(s):** tailwind.config.js, postcss.config.js.  
  * **Key Conventions:**  
    * Theme customizations (colors, fonts, spacing based on Steppers Life\_ Comprehensive UI\_UX Layou.pdf) will be defined in tailwind.config.js under theme.extend.  
    * Global base styles and Tailwind directives (@tailwind base; @tailwind components; @tailwind utilities;) will be in src/index.css or a similar global stylesheet.  
    * Reusable component styles that are complex or require more semantic grouping than utility classes alone can provide will be defined using @apply within component-specific CSS/SCSS modules or global styles, or encapsulated within Shadcn/UI components.  
    * Utility libraries like clsx and tailwind-merge will be used for conditional and combined class name management.  
* **Key Design Patterns Used:**  
  * **React Hooks:** For encapsulating stateful logic and side effects.  
  * **Provider Pattern:** For React Context and potentially other global services.  
  * **Service Layer for API Interactions:** Abstracting API calls into dedicated service modules (detailed in the API Interaction Layer section).  
  * **Container/Presentational Pattern (Conceptual):** As a guideline for separating concerns, even if not strictly implemented with separate component files for every instance.

## **III. Detailed Frontend Directory Structure**

This structure aims to promote modularity, scalability, and a clear separation of concerns for the Vite \+ React \+ TypeScript frontend application.

Plaintext

src/  
├── assets/                   \# Static assets like images, fonts (if not in public/). MUST contain project-specific static files not served directly from \`public/\`.  
├── components/               \# Globally reusable UI components.  
│   ├── ui/                   \# Primitive UI elements, often wrappers or compositions of Shadcn/UI. MUST contain only generic, reusable, presentational UI elements with minimal business logic.  
│   │   ├── Button.tsx  
│   │   ├── Card.tsx  
│   │   ├── Input.tsx  
│   │   ├── Modal.tsx  
│   │   └── ...  
│   └── layout/               \# Components structuring page layouts (e.g., AppShell, Header, Footer, Sidebar, Main PWA Bottom Navigation). MUST contain components that define the overall structure and navigation of pages, not specific page content.  
│       ├── AppLayout.tsx  
│       ├── Header.tsx  
│       └── BottomNavPWA.tsx  
├── config/                   \# Application-level configuration (e.g., constants, feature flag definitions if client-managed, API base URLs if not solely from .env). MUST contain non-sensitive, static configuration data for the application.  
│   └── appConfig.ts  
├── features/                 \# Feature-specific modules. Each major domain or feature of SteppersLife.com will have its own directory here.  
│   ├── auth/                 \# Example: Authentication feature (login, registration, password reset).  
│   │   ├── components/       \# Components specific to the auth feature (e.g., LoginForm, RegistrationForm). MUST NOT be imported directly by other features; promote to \`src/components/ui/\` if reusable.  
│   │   ├── hooks/            \# Custom React Hooks specific to the auth feature (e.g., \`useRegistrationForm\`).  
│   │   ├── pages/            \# Page components for auth routes (e.g., LoginPage, RegisterPage, ForgotPasswordPage). MUST be routed via the main router configuration.  
│   │   ├── services/         \# API service calls specific to authentication (e.g., loginUser, registerUser).  
│   │   └── types.ts          \# TypeScript types and interfaces specific to the auth feature.  
│   ├── events/               \# Example: Events feature (discovery, details, creation, ticketing).  
│   │   ├── components/       \# E.g., EventCard, EventDetailView, TicketSelectionForm.  
│   │   ├── hooks/  
│   │   ├── pages/            \# E.g., EventListPage, EventDetailPage, CreateEventPage.  
│   │   ├── services/  
│   │   └── types.ts  
│   ├── classes/              \# For physical and VOD class listings, management.  
│   ├── communityDirectory/   \# For store and service listings.  
│   ├── userProfile/          \# For user dashboards, settings, managing followed items.  
│   ├── store/                \# For the SteppersLife promotional products e-commerce store.  
│   ├── ads/                  \# For the advertising system (user-facing ad purchase portal, ad display logic if client-side).  
│   └── (other-features...)/  
├── hooks/                    \# Global/sharable custom React Hooks used across multiple features. MUST be generic and broadly applicable.  
│   └── useAuth.ts            \# Example: a hook to access authentication status and user data.  
├── lib/                      \# Third-party library configurations, API client setup, or core utility modules.  
│   └── apiClient.ts          \# Configured instance of Axios or fetch wrapper for API communication. MUST be the central point for API request configuration (base URL, interceptors).  
├── pages/                    \# Top-level page components that don't belong to a specific feature module or act as entry points.  
│   ├── HomePage.tsx  
│   ├── ExplorePage.tsx       \# Could be an alternative to a feature-specific events page for general discovery.  
│   ├── NotFoundPage.tsx  
│   └── ...  
├── providers/                \# React Context providers for global or semi-global state/functionality. MUST contain context definitions and their corresponding provider components.  
│   ├── ThemeProvider.tsx  
│   └── AuthProvider.tsx      \# If managing auth state via Context, though Zustand/Jotai might be preferred.  
├── routes/                   \# Routing configuration for the application.  
│   ├── index.tsx             \# Main router setup using React Router DOM. MUST define all application routes and integrate \`ProtectedRoute\`.  
│   └── ProtectedRoute.tsx    \# Component/logic for handling authenticated/authorized routes.  
├── services/                 \# Global API service definitions that are not feature-specific or are wrappers around \`apiClient.ts\`.  
│   └── notificationService.ts \# Example  
├── store/                    \# Global client-side state management setup (e.g., Zustand or Jotai stores).  
│   ├── uiStore.ts            \# Example: Zustand store for global UI state like modals, toasts, loading indicators.  
│   └── userSessionStore.ts   \# Example: Zustand store for user session details if not solely via React Query's cache or AuthProvider.  
├── styles/                   \# Global CSS styles, Tailwind CSS setup.  
│   └── index.css             \# Main CSS entry point, imports Tailwind base, components, utilities, and any global custom styles.  
├── types/                    \# Global TypeScript type definitions, interfaces, enums shared across the application. MUST contain types that are not specific to a single feature.  
│   └── index.ts              \# Often used to re-export types for easier imports.  
├── utils/                    \# General utility functions (pure functions). MUST contain helper functions that are broadly applicable and have no side effects.  
│   └── formatters.ts         \# E.g., date formatters, currency formatters.  
│   └── validators.ts         \# Generic validation helper functions.  
├── App.tsx                   \# Root application component. Sets up global providers (Theme, Router, State Store, React Query Client), and renders the main layout/router. MUST be the main application shell.  
└── main.tsx                  \# Main entry point of the React application. Renders the \`\<App /\>\` component into the DOM. MUST initialize the React application.

public/                       \# Static assets served directly by the web server (e.g., \`favicon.ico\`, \`manifest.json\`, \`robots.txt\`).  
vite.config.ts                \# Vite build and development server configuration.  
tsconfig.json                 \# TypeScript compiler options for the project.  
tailwind.config.js            \# Tailwind CSS theme and plugin configuration.  
postcss.config.js             \# PostCSS configuration (often used with Tailwind CSS).

### **Notes on Frontend Structure:**

* **Feature-Driven Organization:** The src/features/ directory is central. Each significant part of SteppersLife.com (auth, events, classes, etc.) will be a module here, containing its own components, pages, hooks, services, and types. This promotes modularity and makes it easier for teams or AI agents to work on specific parts of the application with less risk of conflict.  
* **Shared vs. Feature-Specific:** A clear distinction is made:  
  * src/components/ui/ and src/components/layout/ are for globally reusable, purely presentational or structural components.  
  * src/hooks/, src/services/, src/store/ (global parts), src/types/, src/utils/ are for globally shared logic.  
  * Anything specific to a feature lives within its src/features/\[featureName\]/ directory. If a component or hook within a feature becomes useful elsewhere, it should be refactored and moved to the appropriate global directory, with its dependencies updated.  
* **Routing:** Centralized in src/routes/ using React Router DOM, making it easy to understand the application's page structure and navigation flow.  
* **State Management:** Global client-side state (if needed beyond React Query) will be managed in src/store/ (e.g., using Zustand or Jotai), while feature-specific complex state might also live within the feature's store or use local hooks.  
* **API Client:** A single configured API client (e.g., src/lib/apiClient.ts) will be used for all backend communication, allowing for centralized request/response interception (e.g., for auth tokens, error handling).  
* **PWA Entry Point:** The public/ directory will hold the manifest.json and service worker registration (if manually managed, though Vite plugins often handle this).

## **IV. Component Breakdown & Implementation Details**

This section outlines the conventions and templates for defining UI components for SteppersLife.com. Detailed specification for most feature-specific components will emerge as user stories are implemented. The AI Agent or developer MUST follow the "Template for Component Specification" below whenever a new component is identified for development, ensuring all mandatory fields in the template are filled.

### **Component Naming & Organization**

* **Component Naming Convention:**  
  * All React component files MUST be named using **PascalCase** (e.g., UserProfileCard.tsx, EventListItem.tsx).  
  * The component function/class itself MUST also use PascalCase (e.g., export function UserProfileCard(...) { ... }).  
* **Organization:**  
  * **Globally Reusable UI Primitives/Elements:** Located in src/components/ui/ (e.g., Button.tsx, Card.tsx, Input.tsx). These are typically wrappers or compositions of Shadcn/UI components or other base elements. They MUST be purely presentational and contain minimal to no business logic.  
  * **Global Layout Components:** Located in src/components/layout/ (e.g., Header.tsx, Footer.tsx, AppLayout.tsx, BottomNavPWA.tsx). These components define the structural layout of pages.  
  * **Feature-Specific Components:** Components used exclusively by a single feature MUST be co-located within that feature's directory, typically under src/features/\[featureName\]/components/. If a component initially built for a feature is later identified as globally reusable, it MUST be refactored and moved to src/components/ui/ or src/components/layout/ as appropriate, with its dependencies updated.  
  * **Page Components:** Components that represent entire pages or views routed by React Router DOM are located in src/pages/ (for top-level, non-feature-specific pages) or src/features/\[featureName\]/pages/ (for feature-specific pages).

### **Template for Component Specification**

For each significant UI component identified (typically from the Steppers Life\_ Comprehensive UI\_UX Layou.pdf or as new requirements emerge during story development), the following details MUST be documented. This template ensures clarity for implementation.

#### ---

**Component: {ComponentName} (e.g., EventCard, RegistrationForm)**

* **Purpose:** *{Briefly describe what this component does and its role in the UI. MUST be clear and concise. Example: "Displays a summary of an event in a list format, including its title, date, location, and a primary image."}*  
* **Source File(s):** *{The exact file path where this component will reside, following the organization guidelines. Example: src/features/events/components/EventCard.tsx}*  
* **Visual Reference:** *{Link to the specific screen or element in the Steppers Life\_ Comprehensive UI\_UX Layou.pdf, a Figma frame/component link if available in the future, or a Storybook page. REQUIRED. Example: "See Steppers Life\_ Comprehensive UI\_UX Layou.pdf, Page 4, 'Event Grid / Cards'."}*  
* **Props (Properties):** *{List each prop the component accepts. For each prop, all columns in the table MUST be filled. Types should be TypeScript types.}* | Prop Name | Type | Required? | Default Value | Description | | :--------------- | :---------------------------------------- | :-------- | :------------ | :-------------------------------------------------------------------------------------------------------- | | title | string | Yes | N/A | The main title text to be displayed. MUST NOT exceed 100 characters. | | imageUrl | string \\| null | No | null | URL for the primary image. MUST be a valid HTTPS URL if provided; defaults to a placeholder if null. | | onClick | (id: string) \=\> void | No | N/A | Callback function when the component is clicked, passing its associated ID. | | {anotherProp} | {Specific primitive, imported type, or inline interface/type definition} | {Yes/No} | {If any} | {MUST clearly state the prop's purpose and any constraints, e.g., 'Must be a positive integer.'} |  
* **Internal State (if any):** *{Describe any significant internal state the component manages. Only list state that is not derived from props or global state. If state is complex, consider if it should be managed by a custom hook or global state solution instead.}* | State Variable | Type | Initial Value | Description | | :---------------| :-------- | :------------ | :----------------------------------------------------------------------------- | | isExpanded | boolean | false | Tracks if the component's detailed view is expanded. | | {anotherState}| {type} | {value} | {Description of state variable and its purpose.} |  
* **Key UI Elements / Structure (Conceptual):** *{Provide a pseudo-HTML or JSX-like structure representing the component's DOM. Include key conditional rendering logic if applicable. This structure dictates the primary output for the AI agent or developer.*}  
  HTML  
  \<div class\="event-card" onClick\={() \=\> onClick(eventId)}\>  
    {imageUrl && \<img src\={imageUrl} alt\={title} class\="event-card-image" /\>}  
    \<h3 class\="event-card-title"\>{title}\</h3\>  
    \<p class\="event-card-date"\>{formattedDate}\</p\>  
    {isExpanded && \<p class\="event-card-description"\>{description}\</p\>}  
    \<button class\="event-card-toggle-button" onClick\={toggleExpand}\>  
      {isExpanded ? 'Show Less' : 'Show More'}  
    \</button\>  
  \</div\>

* **Events Handled / Emitted:**  
  * **Handles:** *{e.g., onClick on the main div (triggers onClick prop), onClick on the toggle button (calls internal toggleExpand function).}*  
  * **Emits:** *{If the component emits custom events/callbacks not covered by props, describe them with their exact signature. e.g., onImageLoadError: () \=\> void}*  
* **Actions Triggered (Side Effects, if any):**  
  * **State Management (Global):** *{e.g., "Dispatches uiSlice.actions.openEventDetailsModal({ eventId }) from src/store/uiStore.ts. Action payload MUST match the defined action creator."}*  
  * **API Calls:** *{Specify which service/function from the API Interaction Layer is called. e.g., "Calls eventService.logEventView(eventId) from src/features/events/services/eventService.ts when expanded."}*  
* **Styling Notes:** *{MUST reference specific Shadcn/UI component names if used as a base (e.g., "Uses \<Card\> and \<Button variant='outline'\> from src/components/ui/). Otherwise, specify primary Tailwind CSS utility classes or @apply directives for custom component classes. Any dynamic styling logic based on props or state MUST be described. Example: "Container uses p-4 bg-card text-card-foreground rounded-lg shadow-md. Title uses text-lg font-semibold. Image is w-full h-32 object-cover."}*  
* **Accessibility Notes:** *{MUST list specific ARIA attributes and their values (e.g., aria-labelledby="event-card-title", role="article"), required keyboard navigation behavior (e.g., "Card is focusable. Enter/Space key activates the onClick prop. Toggle button is focusable and activated by Enter/Space."), and any focus management requirements. Example: "The toggle button MUST have aria-expanded={isExpanded} and aria-controls='event-card-description-id' if the description has an ID."}*

---

*(This template will be used for defining individual components as they are identified and required by user stories.)*

## **V. State Management In-Depth**

This section expands on the client-side state management strategy for SteppersLife.com, complementing React Query which handles server state. Our primary solutions for client-side global state are **Zustand** for more complex application-wide needs and the **React Context API** for localized sharing. This approach ensures state is managed at the most appropriate level, promoting both efficiency and maintainability, which is key for a good user experience in complex flows.

* **Chosen Solutions (Client-Side Global):**  
  * **Primary for complex global state:** Zustand (a lightweight, hook-based state management solution).  
  * **For localized hierarchical state sharing:** React Context API.  
  * (React Query handles all server-cached state. React Hook Form handles form state. Local useState/useReducer for component-internal state.)  
* **Decision Guide for Client-Side State Location:**  
  * **Global State (Zustand \- e.g., stores in src/store/):**  
    * Data shared across many unrelated components or features (e.g., UI theme preferences \[like Night Mode\], global notification messages, non-persistent user interface settings).  
    * State that needs to persist across route changes but isn't server data (Zustand stores can be configured with persistence middleware for things like theme choice).  
    * Complex client-side logic that benefits from a centralized store structure and well-defined actions/mutators.  
    * **MUST be used for:** User session details (if not solely managed by an AuthProvider context and React Query for user profile data), application-wide UI settings like the selected Night Mode, and global notification/alert states (e.g., for a "message sent" confirmation after contacting an organizer).  
  * **React Context API (e.g., providers in src/providers/):**  
    * State primarily passed down a specific component subtree (e.g., theming information via ThemeProvider, context for a complex multi-step form if its state doesn't need to be global, or providing shared state/functions to a closely related group of components).  
    * Simpler state management needs where a full global store is overkill.  
    * **MUST be used for:** Providing theming context, specific modal states that are only relevant to one part of the component tree, or other localized data/functions not suitable for extensive prop drilling and not required globally.  
  * **Local Component State (useState, useReducer):**  
    * UI-specific state that is not needed outside the component or its direct children (e.g., individual form input values before validation by React Hook Form, dropdown open/close status, active tab within a component like the "Upcoming"/"Past" tickets tabs).  
    * **MUST be the default choice unless clear criteria for Context or Global State (Zustand) are met.**

### **Global Store Structure (using Zustand as an example)**

Global client-side state stores using Zustand will typically be organized by domain or concern within the src/store/ directory (as per our approved directory structure).

* **Core Store Module Example (e.g., uiStore.ts in src/store/uiStore.ts):**  
  * **Purpose:** Manages global UI states such as theme selection (Night Mode), global user notification messages (toasts/banners), or global loading indicators not directly tied to React Query's loading states. This contributes to a consistent and responsive user experience.  
  * **State Shape (Interface/Type):**  
    TypeScript  
    interface NotificationMessage {  
      id: string;  
      message: string;  
      type: 'info' | 'success' | 'warning' | 'error';  
      duration?: number; // Optional: auto-dismiss duration  
    }

    interface UIState {  
      theme: 'light' | 'dark';  
      notifications: Array\<NotificationMessage\>;  
      isGlobalOverlayLoading: boolean; // For a full-screen, non-specific loading overlay  
    }

    interface UIActions {  
      setTheme: (theme: UIState\['theme'\]) \=\> void;  
      addNotification: (notification: Omit\<NotificationMessage, 'id'\>) \=\> string; // Returns ID  
      removeNotification: (id: string) \=\> void;  
      setGlobalOverlayLoading: (isLoading: boolean) \=\> void;  
    }

  * **Zustand Store Definition (Conceptual):**  
    TypeScript  
    import { create } from 'zustand';  
    import { devtools, persist } from 'zustand/middleware'; // Optional

    export const useUIStore \= create\<UIState & UIActions\>()(  
      devtools( // Optional: for Redux DevTools integration  
        persist( // Optional: to persist theme choice  
          (set, get) \=\> ({  
            theme: 'light', // Default theme  
            notifications: \[\],  
            isGlobalOverlayLoading: false,  
            setTheme: (theme) \=\> set({ theme }),  
            addNotification: (notificationContent) \=\> {  
              const id \= \`notif\_${Date.now()}\_${Math.random().toString(36).substring(2, 7)}\`;  
              set((state) \=\> ({  
                notifications: \[...state.notifications, { ...notificationContent, id }\],  
              }));  
              return id;  
            },  
            removeNotification: (id) \=\> set((state) \=\> ({  
              notifications: state.notifications.filter((n) \=\> n.id \!== id),  
            })),  
            setGlobalOverlayLoading: (isLoading) \=\> set({ isGlobalOverlayLoading: isLoading }),  
          }),  
          {  
            name: 'stepperslife-ui-settings', // Unique name for localStorage item  
            partialize: (state) \=\> ({ theme: state.theme }), // Only persist the 'theme'  
          }  
        )  
      )  
    );

* **Feature Store Module Template (e.g., src/features/{featureName}/store/{featureName}ClientStore.ts):**  
  * **Purpose:** *{To be defined when a specific feature requires its own complex client-side global state store (using Zustand). For example, managing the multi-step state of a complex event creation wizard if it doesn't fit well into local component state or form state.*}  
  * **State Shape (Interface/Type):** *{To be defined by the feature, ensuring clarity for AI Dev Agents.*}  
  * **Actions/Mutators:** *{To be defined by the feature. Actions should be granular and clearly named.*}  
  * **Export:** *{The custom hook (e.g., useFeatureNameClientStore) MUST be exported.}*

### **Key Selectors / Computed State (from Zustand stores)**

Selectors for Zustand stores are typically simple functions that access parts of the state from the hook. For more complex derived data, memoized selectors can be created outside the store definition using libraries like reselect if needed, or computed directly within components if simple.

* const currentTheme \= useUIStore(state \=\> state.theme);  
* const activeNotifications \= useUIStore(state \=\> state.notifications);

### **Key Actions / Mutators (for Zustand stores)**

Actions in Zustand are functions within the store definition that use the set function to update state. Asynchronous logic within these actions should be handled carefully; if they involve server interactions, those interactions are primarily React Query's responsibility. Client state updates post-server interaction can be triggered from React Query's callbacks.

* **Core Action Example: setTheme(theme) (in uiStore.ts):**  
  * **Purpose:** Updates the application-wide theme preference (e.g., for Night Mode).  
  * **Parameters:** theme: 'light' | 'dark'  
  * **Implementation:** (theme) \=\> set({ theme }) (as shown in the store definition). This might also trigger persistence to localStorage via the middleware.  
* Client-Side State Updates Post-Server Interaction (Example with React Query):  
  If a server operation (e.g., creating an event via a React Query mutation) needs to trigger a global UI notification:  
  TypeScript  
  // Inside a component or custom hook using the React Query mutation  
  const { mutate: createEvent } \= useCreateEventMutation({  
    onSuccess: (data) \=\> {  
      // Server operation successful  
      useUIStore.getState().addNotification({  
        message: \`Event "${data.title}" created successfully\!\`,  
        type: 'success',  
        duration: 5000  
      });  
      // Potentially navigate or trigger other client-side effects  
    },  
    onError: (error) \=\> {  
      // Server operation failed  
      useUIStore.getState().addNotification({  
        message: \`Failed to create event: ${error.message}\`,  
        type: 'error'  
      });  
    }  
  });

  This pattern keeps server state management with React Query and client UI state (like global notifications) with Zustand, ensuring a clean separation of concerns.

## **VI. API Interaction Layer**

This section details the strategy and conventions for frontend communication with the backend APIs, as defined in the main SteppersLife.com Architecture Document (Version 0.2).md (specifically its "API Reference" and "Data Models" sections). React Query will primarily consume the services defined here for its data fetching and mutation logic.

### **Client/Service Structure**

* **HTTP Client Setup:**  
  * **Library:** Axios will be used as the primary HTTP client for its ease of use, feature set (like interceptors), and broad community support.  
  * **Instance Configuration (src/lib/apiClient.ts):** A single, configured Axios instance MUST be created and used throughout the application.  
    * **Base URL:** The API base URL MUST be sourced from an environment variable (e.g., import.meta.env.VITE\_API\_BASE\_URL).  
    * **Default Headers:** Default headers like Content-Type: 'application/json' and Accept: 'application/json' MUST be configured.  
    * **Interceptors:**  
      * **Request Interceptor:** MUST be implemented to automatically attach the authentication token (e.g., JWT) to outgoing requests for protected endpoints. The token will be retrieved from our client-side state (e.g., userSessionStore.getState().token).  
      * **Response Interceptor:** MUST be implemented for global error handling (see "Error Handling & Retries" below) and potentially for response data normalization if needed.  
    * **Timeout:** A sensible default request timeout (e.g., 10-15 seconds) MUST be configured to prevent requests from hanging indefinitely, supporting performance NFRs.  
* **Service Definitions (Pattern):**  
  * All data transfer objects (DTOs) used for request payloads (e.g., EventCreationPayload) and for defining the shape of response data (e.g., Event) MUST be explicitly typed using TypeScript interfaces or types. These types should ideally be located in relevant types.ts files within feature directories (e.g., src/features/events/types.ts) or in src/types/ for globally applicable DTOs. These types must accurately reflect the schemas defined in the backend API Reference section of the SteppersLife.com Architecture Document (Version 0.2).md. Furthermore, these service function return types and payload types should be designed considering all data necessary for rich UI presentation, user interaction, and accessibility information as guided by the Steppers Life\_ Comprehensive UI\_UX Layou.pdf and future detailed component specifications.  
  * API interactions will be encapsulated within service modules, typically organized by feature or domain (e.g., in src/features/\[featureName\]/services/ or globally in src/services/ if broadly applicable).  
  * Each service function MUST:  
    * Have explicit TypeScript types for its parameters and return values (e.g., Promise\<EventType\>).  
    * Include JSDoc/TSDoc comments explaining its purpose, parameters, return value, and any specific error handling expectations or side effects.  
    * Use the configured apiClient instance from src/lib/apiClient.ts to make HTTP requests.  
    * Clearly map to specific backend API endpoints defined in the main Architecture Document.  
  * Service functions, especially those fetching lists of data (e.g., fetchEvents for event listings, or functions for the Community Directory), MUST explicitly support passing parameters for pagination, filtering, and sorting if the backend API (as defined in the Main Architecture Document) provides these capabilities. This is crucial for performance (NFRs) and a good user experience when dealing with potentially large datasets.  
  * For services supporting community interaction features (e.g., functions for following entities, posting reviews/comments, managing user network connections), function designs should aim to seamlessly support optimistic updates on the client-side. This will often be orchestrated by React Query's mutation features, but the underlying service call should return data conducive to this pattern, enhancing the perceived responsiveness and 'live' feel of the community platform.  
  * **Example (src/features/events/services/eventService.ts):**  
    TypeScript  
    import apiClient from '@/lib/apiClient'; // Adjust path as per actual structure  
    import type { Event, EventCreationPayload, EventFilters } from '@/features/events/types'; // Assuming types are defined

    /\*\*  
     \* Fetches a list of all events, supporting filtering and pagination.  
     \* @param filters \- Optional query parameters for filtering, pagination, etc.  
     \* @returns A promise that resolves to an array of Event objects.  
     \*/  
    export const fetchEvents \= async (filters?: EventFilters): Promise\<Event\[\]\> \=\> { // Example: EventFilters could include page, limit, category  
      const response \= await apiClient.get\<Event\[\]\>('/events', { params: filters });  
      return response.data;  
    };

    /\*\*  
     \* Fetches a single event by its ID.  
     \* @param eventId \- The ID of the event to fetch.  
     \* @returns A promise that resolves to the Event object.  
     \*/  
    export const fetchEventById \= async (eventId: string): Promise\<Event\> \=\> {  
      const response \= await apiClient.get\<Event\>(\`/events/${eventId}\`);  
      return response.data;  
    };

    /\*\*  
     \* Creates a new event.  
     \* @param payload \- The data required to create the event.  
     \* @returns A promise that resolves to the newly created Event object.  
     \*/  
    export const createEvent \= async (payload: EventCreationPayload): Promise\<Event\> \=\> {  
      const response \= await apiClient.post\<Event\>('/events', payload);  
      return response.data;  
    };

    // ... other event-related service functions (updateEvent, deleteEvent, etc.)

### **Error Handling & Retries (Frontend)**

* **Global Error Handling:**  
  * **Mechanism:** The Axios response interceptor in src/lib/apiClient.ts WILL be the primary point for global API error handling.  
  * **Error Normalization & Propagation:** It SHOULD attempt to normalize errors into a consistent shape before they are propagated (e.g., ensuring error.response.data.message or a specific error.message field is reliably available). After normalization, it will typically dispatch a global user-friendly notification (via uiStore, e.g., useUIStore.getState().addNotification({ message: 'An unexpected error occurred...', type: 'error' })) for widespread issues and then re-throw the normalized error object. This allows React Query's onError callbacks or specific component-level error handlers to receive a predictable error structure for more contextual handling if needed.  
  * **Logging:** All significant API errors caught by the interceptor SHOULD be logged to the console (during development) and potentially to a remote logging service (in production) with relevant context (URL, status, error message).  
  * **Specific HTTP Status Codes:** The interceptor may handle specific status codes globally (e.g., a 401 Unauthorized could trigger a logout action or a token refresh attempt, a 403 Forbidden could redirect to an access denied page or show a specific message).  
* **Specific Error Handling in Components/Hooks (via React Query):**  
  * While global handlers catch general errors, React Query's onError callbacks in useQuery and useMutation hooks WILL be used by components or feature-specific hooks to handle errors in a more context-specific manner.  
  * For example, a form submission mutation might use onError to display inline error messages next to form fields or show a specific error message related to that particular action. This MUST be documented in the relevant component's specification if it deviates from or augments global handling.  
* **Retry Logic:**  
  * **Library:** A library like axios-retry CAN be integrated with our apiClient instance.  
  * **Configuration:** If implemented, it MUST be configured with:  
    * **Max Retries:** A sensible number (e.g., 2-3 attempts).  
    * **Retry Conditions:** Only for transient network errors or specific idempotent server errors (e.g., 502, 503, 504). It MUST NOT retry on 4xx client errors by default.  
    * **Retry Delay:** An exponential backoff strategy is recommended (e.g., retryDelay: axiosRetry.exponentialDelay).  
  * **Idempotency:** Automatic retry logic MUST only be applied to idempotent HTTP requests (e.g., GET, PUT, DELETE). POST requests SHOULD NOT be retried automatically by this global mechanism unless the specific endpoint is known to be safely idempotent. React Query itself provides options for retrying queries.

## **VII. Routing Strategy**

This section details how navigation and routing will be handled within the SteppersLife.com Progressive Web App (PWA), ensuring a seamless single-page application experience for users.

* **Routing Library:** As established in our "Overall Frontend Philosophy & Patterns," **React Router DOM (v6.x or latest stable)** will be used for all client-side routing. Its features for route definition, nested routes, programmatic navigation, and route protection are well-suited for this application. The main router setup will reside in src/routes/index.tsx.

### **Route Definitions**

The following table outlines the main routes envisioned for the application. Component paths are illustrative and will align with our approved directory structure (e.g., feature pages in src/features/\[featureName\]/pages/ and general pages in src/pages/).

| Path Pattern | Component/Page (Illustrative Path) | Protection Level | Notes |
| :---- | :---- | :---- | :---- |
| / | src/pages/HomePage.tsx | Public | Main landing page. |
| /explore/events | src/features/events/pages/EventListPage.tsx | Public | Event discovery, search, filtering. |
| /events/:eventId | src/features/events/pages/EventDetailPage.tsx | Public | View details of a specific event. Param: eventId. |
| /events/create | src/features/events/pages/CreateEventPage.tsx | Authenticated, Role:\[ORGANIZER\] | Organizer event creation form. |
| /manage/events/:eventId | src/features/events/pages/ManageEventPage.tsx | Authenticated, Role:\[ORGANIZER\] | Organizer dashboard for a specific event. Param: eventId. |
| /manage/events/check-in/:eventId | src/features/events/pages/EventCheckInPage.tsx | Authenticated, Role:\[ORGANIZER, EVENT\_STAFF\] | PWA page for on-site check-in. Param: eventId. |
| /explore/classes | src/features/classes/pages/ClassListPage.tsx | Public | Class discovery. |
| /classes/:classId | src/features/classes/pages/ClassDetailPage.tsx | Public | View details of a specific class (physical or VOD). Param: classId. |
| /classes/vod/:vodClassId/watch | src/features/classes/pages/WatchVODPage.tsx | Authenticated, Subscribed | Access purchased VOD content. Param: vodClassId. (Subscribed check is a form of authorization). |
| /manage/classes/create | src/features/classes/pages/CreateClassPage.tsx | Authenticated, Role:\[INSTRUCTOR\] | Instructor class listing/VOD creation. |
| /community | src/features/communityDirectory/pages/DirectoryHomePage.tsx | Public | Main page for Community Directory (Stores & Services). |
| /community/:listingType/:listingId | src/features/communityDirectory/pages/ListingDetailPage.tsx | Public | View details of a store/service. Params: listingType (store/service), listingId. |
| /auth/login | src/features/auth/pages/LoginPage.tsx | Public (Redirect if Authed) | User login page. |
| /auth/register | src/features/auth/pages/RegisterPage.tsx | Public (Redirect if Authed) | User registration page. |
| /auth/forgot-password | src/features/auth/pages/ForgotPasswordPage.tsx | Public |  |
| /auth/reset-password | src/features/auth/pages/ResetPasswordPage.tsx | Public | Requires valid token usually via email link. |
| /dashboard/my-tickets | src/features/userProfile/pages/MyTicketsPage.tsx | Authenticated | User's purchased tickets. |
| /dashboard/my-classes | src/features/userProfile/pages/MyClassesPage.tsx | Authenticated | User's enrolled/purchased VOD classes. |
| /dashboard/profile | src/features/userProfile/pages/ProfileSettingsPage.tsx | Authenticated | User profile editing. |
| /dashboard/organizer | src/features/userProfile/pages/OrganizerDashboardPage.tsx | Authenticated, Role:\[ORGANIZER\] | Organizer's main dashboard. |
| /dashboard/instructor | src/features/userProfile/pages/InstructorDashboardPage.tsx | Authenticated, Role:\[INSTRUCTOR\] | Instructor's main dashboard. |
| /store | src/features/store/pages/PromoProductStorePage.tsx | Authenticated, Role:\[ELIGIBLE\_ROLES\] | SteppersLife promotional products store. |
| /ads/portal | src/features/ads/pages/AdPurchasePortalPage.tsx | Authenticated, Role:\[ADVERTISER\_ELIGIBLE\] | User-facing portal for purchasing ad placements. |
| /blog | src/features/blog/pages/BlogListPage.tsx | Public | List of blog posts. |
| /blog/:slug | src/features/blog/pages/BlogPostPage.tsx | Public | Individual blog post. Param: slug. |
| /admin/\* | src/features/admin/pages/AdminLayout.tsx | Authenticated, Role:\[ADMIN\] | Entry point for all admin panel routes (nested routing). |
| \* | src/pages/NotFoundPage.tsx | Public | Catch-all for 404 Not Found pages. |

**Notes on Route Definitions:**

* Role:\[ROLE\_NAME\] indicates a specific user role is required. ELIGIBLE\_ROLES for the store would include Organizers, Instructors, Community Listers. ADVERTISER\_ELIGIBLE would be similar.  
* Subscribed implies a check that the user has purchased access to specific content (e.g., a VOD class).  
* Parameterized routes (e.g., /:eventId) will use React Router's mechanisms for accessing parameters.

### **Route Guards / Protection**

Access to certain routes will be controlled based on authentication status and user roles. This will be implemented using a custom ProtectedRoute component (e.g., located in src/routes/ProtectedRoute.tsx).

* **Authentication Guard:**  
  * **Mechanism:** The ProtectedRoute component will wrap routes that require authentication.  
  * **Logic:** It will check the user's authentication status (e.g., by accessing state from userSessionStore.getState().isAuthenticated or an AuthProvider context).  
  * **Behavior:**  
    * If the user is not authenticated and attempts to access a protected route, they MUST be redirected to the /auth/login page. The original intended path MAY be stored (e.g., in state or query params) to redirect them back after successful login.  
    * If the user is authenticated, the component will render the requested child route/page.  
  * Routes marked Public (Redirect if Authed) (like /auth/login) will also use logic (perhaps within the page component itself or a simple wrapper) to redirect already authenticated users to a default authenticated page (e.g., /dashboard/my-tickets).  
* **Authorization Guard (Role-Based):**  
  * **Mechanism:** The same ProtectedRoute component can be extended to handle role-based authorization. It can accept a prop specifying the required role(s) (e.g., \<ProtectedRoute requiredRoles={\['ORGANIZER', 'ADMIN'\]}\>).  
  * **Logic:** After confirming authentication, it will check if the authenticated user's roles (e.g., from userSessionStore.getState().currentUser.roles) include any of the requiredRoles.  
  * **Behavior:**  
    * If the user has the required role(s), the component will render the requested child route/page.  
    * If the user is authenticated but lacks the necessary role(s), they MUST be redirected to a designated "Access Denied" or "Forbidden" page (e.g., a generic error page displaying a 403 message, or back to their main dashboard with a notification). They SHOULD NOT be redirected to the login page if already authenticated.

## **VIII. Build, Bundling, and Deployment**

This section details specific aspects of the frontend build process, bundling optimizations, and deployment strategy, complementing the broader "Infrastructure and Deployment Overview" in the main SteppersLife.com Architecture Document (Version 0.2).md.

### **Build Process & Scripts**

* **Build Tool:** Vite (as per our approved "Overall Frontend Philosophy & Patterns").  
* **Key Build Scripts (to be defined in package.json):**  
  * "dev": "vite": Starts the development server with Hot Module Replacement (HMR).  
  * "build": "tsc && vite build": First type-checks with TypeScript, then creates a production-optimized1 build of the application in the dist/ directory.  
  * "preview": "vite preview": Serves the production build locally for testing.  
  * "lint": "eslint . \--ext ts,tsx \--report-unused-disable-directives \--max-warnings 0": Runs ESLint to check for code quality and style issues.  
  * "test": "vitest": Runs unit and integration tests using Vitest.  
* **Environment Configuration Management:**  
  * Environment variables (e.g., API base URL, feature flags) MUST be managed using .env files and accessed in the application via Vite's import.meta.env object.  
  * Standard files:  
    * .env: Default values, committed to the repository (for non-sensitive defaults only).  
    * .env.local: Local overrides, NOT committed.  
    * .env.development, .env.production: Environment-specific settings.  
    * .env.development.local, .env.production.local: Local overrides for specific environments, NOT committed.  
  * Variables intended for client-side exposure MUST be prefixed with VITE\_ (e.g., VITE\_API\_BASE\_URL).  
  * AI Agent MUST NOT generate code that hardcodes environment-specific values. All such values MUST be accessed via import.meta.env.VITE\_YOUR\_VARIABLE.

### **Key Bundling Optimizations**

* **Code Splitting:**  
  * **Route-based:** Vite automatically performs code splitting for route components (pages) when dynamic imports via React.lazy are used in conjunction with React Router. This is the PRIMARY method for code splitting.  
    TypeScript  
    // Example in src/routes/index.tsx  
    const EventListPage \= React.lazy(() \=\> import('@/features/events/pages/EventListPage'));  
    // ...  
    \<Route path\="/explore/events" element\={\<Suspense fallback\={\<PageLoader /\>}\>\<EventListPage /\>\</Suspense\>} /\>

  * **Component-based (Manual):** For very large, non-critical components not loaded immediately on a route, dynamic import() with React.lazy and \<React.Suspense\> MUST be used to split them into separate chunks. This directly supports performance NFRs.  
* **Tree Shaking:**  
  * Ensured by Vite (which uses Rollup under the hood) when using ES Modules (import/export). All code SHOULD be written using ES Modules to benefit from tree shaking, removing unused code from the final bundle. Avoid side-effectful imports in shared libraries where possible.  
* **Lazy Loading (for Assets):**  
  * **Components:** As described above using React.lazy and dynamic import().  
  * **Images:** For off-screen or non-critical images, the native loading="lazy" attribute on \<img\> tags MUST be used. For critical LCP images, this should be avoided. Consider using intersection observer for more complex lazy-loading scenarios if needed.  
  * **Other Assets:** Large data files or non-critical scripts should also be loaded on demand if possible.  
* **Minification & Compression:**  
  * **Minification:** Vite handles minification of JavaScript (using esbuild/Terser) and CSS (using Lightning CSS or esbuild) automatically for production builds.  
  * **Compression (Gzip/Brotli):** This is typically handled by the hosting platform (e.g., Hostinger, Vercel, Netlify) or CDN. The build output will be static assets ready for such compression.

### **Deployment to CDN/Hosting**

* **Target Platform:** As per the SteppersLife.com Architecture Document (Version 0.2).md, hosting options include **Hostinger** (for evaluation), **Vercel**, or **Netlify**. The final choice will depend on feature set, pricing, and ease of use for a Vite-React PWA.  
* **Deployment Trigger:** CI/CD pipeline via **GitHub Actions** (defined in the main Architecture Document) will trigger deployments. Typically, pushes/merges to main or release/\* branches will deploy to production/staging environments respectively.  
* **Asset Caching Strategy:**  
  * **Immutable Assets:** JavaScript and CSS bundles generated by Vite will include content hashes in their filenames (e.g., app.\[hash\].js). These assets MUST be served with long-lived Cache-Control headers (e.g., Cache-Control: public, max-age=31536000, immutable).  
  * **HTML Files (e.g., index.html):** Should be served with Cache-Control: no-cache or a very short max-age with revalidation (e.g., Cache-Control: public, max-age=0, must-revalidate) to ensure users always get the latest version of the application shell, which then loads the versioned assets.  
  * **Other Static Assets (images, fonts from public/):** Can have moderate caching headers, depending on their update frequency (e.g., Cache-Control: public, max-age=86400).  
  * Caching headers will be configured at the hosting platform level (Hostinger, Vercel, Netlify) or via CDN settings if a separate CDN is used.

## **IX. Frontend Testing Strategy**

This section details the frontend-specific testing strategies for SteppersLife.com, complementing the "Overall Testing Strategy" outlined in the SteppersLife.com Architecture Document (Version 0.2).md. The goal is to build a comprehensive test suite that ensures code quality, functional correctness, and a reliable user experience.

* **Link to Main Overall Testing Strategy:** For overarching principles, general tool choices, and CI integration details, please refer to the SteppersLife.com Architecture Document (Version 0.2).md \- Section 14: Overall Testing Strategy. The tools chosen there (Vitest with React Testing Library for unit/integration, and Playwright/Cypress for E2E) will be applied as follows.

### **Component Testing**

* **Scope:** Testing individual UI components in isolation. This includes components from src/components/ui/, src/components/layout/, and feature-specific components within src/features/\[featureName\]/components/.  
* **Tools:** **Vitest** as the test runner and assertion library, with **React Testing Library (RTL)** for rendering components and simulating user interactions. This aligns with the main architecture's tech stack.  
* **Focus:**  
  * Correct rendering with various props.  
  * User interactions (e.g., clicks, form input changes, keyboard events) simulated via RTL's user-event library.  
  * Correct event emission or callback invocation.  
  * Basic internal state changes and their reflection in the UI.  
  * Accessibility (AX) checks using jest-axe or a similar utility integrated with Vitest/RTL, validating against WCAG AA criteria.  
  * **Snapshot testing MUST be used sparingly** and only with clear justification (e.g., for highly stable, purely presentational components with complex but deterministic DOM structures). Explicit assertions about component output and behavior are strongly preferred.  
* **Location:** Test files (e.g., MyComponent.test.tsx or MyComponent.spec.tsx) MUST be co-located alongside the component files within their respective directories or in a \_\_tests\_\_ subdirectory.

### **Feature/Flow Testing (UI Integration)**

* **Scope:** Testing how multiple components interact within a specific feature or user flow on a single page or a small set of related pages. This focuses on the integration of components within the frontend itself. API calls and global state will typically be mocked at this level.  
* **Tools:** Same as component testing: **Vitest** with **React Testing Library**. More complex setups will be required, involving mocking:  
  * React Router context for components that use routing features.  
  * Global state providers (e.g., Zustand store, React Context) to provide necessary application state.  
  * API service calls (from our "API Interaction Layer") using tools like msw (Mock Service Worker) or Vitest's mocking capabilities (vi.mock).  
* **Focus:**  
  * Data flow between parent and child components within a feature.  
  * Conditional rendering based on state changes and interactions across multiple components.  
  * Navigation triggers and state changes within a self-contained feature flow (e.g., steps within a multi-part form before final submission).  
  * Integration with mocked API services to simulate data fetching and mutations for the feature.

### **End-to-End (E2E) UI Testing**

* **Tools:** **Playwright** is the recommended E2E testing framework (with Cypress as a viable alternative, as noted in the main Architecture Document). Playwright offers robust cross-browser testing, auto-waits, and good integration with CI pipelines.  
* **Scope (Frontend Focus):** E2E tests will validate critical user journeys across the entire application from a user's perspective. For the initial launch, a minimum of 3-5 key user journeys MUST be covered. Examples include:  
  1. **New User Registration & Login:** Successfully creating an account and logging in.  
  2. **Event Discovery & Basic Ticket Selection (for GA):** Finding an event, viewing its details, and adding a General Admission ticket to a conceptual cart or initiating checkout.  
  3. **Community Directory Listing Submission:** A Community Lister successfully submitting their business/service for review.  
  4. **Organizer Creates a Basic Event:** An Organizer successfully navigates the event creation form and publishes a simple event (without complex ticketing initially).  
  5. **Instructor Lists a Physical Class:** An Instructor successfully lists a new physical class.  
* **Test Data Management for UI E2E Tests:**  
  * **API Mocking:** For most E2E tests, **Mock Service Worker (MSW)** SHOULD be used to mock backend API responses. This provides consistent and predictable data, isolates frontend tests from backend fluctuations, and avoids the need for complex backend database seeding for every test run. MSW can run in the browser alongside the application.  
  * **Dedicated Test Accounts/Data:** For scenarios where actual backend interaction is unavoidable or specifically being tested (less common for pure frontend E2E), dedicated test accounts with pre-seeded data on a staging/test backend environment will be necessary. This approach should be minimized to keep tests fast and reliable.

## **X. Accessibility (AX) Implementation Details**

This section outlines the technical strategies and best practices to ensure SteppersLife.com meets a high standard of accessibility, striving for **WCAG 2.1 Level AA compliance** as a baseline. Accessibility will be an integral part of the design and development process, building upon the accessible primitives provided by Radix UI (via Shadcn/UI) and adhering to the following guidelines. The detailed application of these principles will also be documented in individual component specifications under "Accessibility Notes".

* **Semantic HTML:**  
  * **Mandate:** AI Agents and developers MUST prioritize the use of correct, semantic HTML5 elements for their intended purpose (e.g., \<nav\> for navigation blocks, \<button\> for interactive buttons, \<article\> for self-contained content, \<aside\> for complementary content, proper heading levels \<h1\> through \<h6\> for document structure).  
  * Generic elements like \<div\> and \<span\> should only be used for styling or grouping when no suitable semantic element exists. ARIA roles should supplement, not replace, native HTML semantics where possible.  
* **ARIA (Accessible Rich Internet Applications) Implementation:**  
  * **Leverage Primitives:** Shadcn/UI components, built on Radix UI, provide excellent foundational accessibility with appropriate ARIA attributes. These should be used wherever possible.  
  * **Custom Components:** For any custom-developed interactive components not covered by Shadcn/UI, ARIA attributes (roles, states, properties) MUST be implemented correctly according to the **WAI-ARIA Authoring Practices Guide (APG)**.  
    * Example: A custom tab interface must use role="tablist", role="tab", role="tabpanel", aria-selected, aria-controls. A custom modal dialog must manage aria-modal="true", aria-labelledby, aria-describedby.  
  * **Dynamic Content:** ARIA live regions (e.g., aria-live="polite" or aria-live="assertive") MUST be used to announce dynamic content changes to assistive technologies (e.g., for form submission confirmations, error messages, chat updates if applicable).  
* **Keyboard Navigation:**  
  * **Focusability:** All interactive elements (links, buttons, form fields, custom controls) MUST be focusable and operable using only a keyboard.  
  * **Logical Focus Order:** The tab order through interactive elements MUST be logical and intuitive, generally following the visual flow of the page. Avoid "keyboard traps" where a user cannot navigate out of a component.  
  * **Custom Component Interactions:** Custom components (e.g., sliders, custom dropdowns, tree views) MUST implement standard keyboard interaction patterns as defined in the ARIA APG (e.g., arrow keys for navigating options, Space/Enter for selection).  
  * Visible focus indicators MUST be clear and conform to WCAG contrast requirements.  
* **Focus Management:**  
  * **Modals & Dialogs:** When a modal dialog or non-modal dialog (like a custom select dropdown's listbox) opens, focus MUST be programmatically moved to an element within it (ideally the first focusable element or the dialog container itself). Focus MUST be trapped within the modal while it is open. Upon closing, focus MUST return to the element that triggered its opening.  
  * **Dynamic UI Updates:** When new content is revealed or a significant UI change occurs (e.g., after submitting a form and showing a success message), focus should be managed appropriately, potentially moving to the new content or a summary message if it aids usability.  
  * **Route Transitions:** Upon navigating to a new page/view, focus SHOULD ideally be moved to the main content area of the new page or its primary heading (\<h1\>) to assist screen reader users.  
* **Content & Presentation:**  
  * **Text Alternatives:** All non-decorative images (\<img\> tags) MUST have appropriate alt text. Decorative images should have empty alt="". Icons that convey meaning (e.g., icon buttons) MUST have accessible names (e.g., via aria-label or visually hidden text).  
  * **Color Contrast:** Text and UI elements MUST meet WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text and graphical objects). This applies to both light and Night Mode themes. Tools will be used to check this.  
  * **Responsive Design & Zoom:** The UI must be responsive and content must reflow without loss of information or functionality when zoomed up to 200%.  
  * **Forms:** All form inputs MUST have associated, programmatically linked \<label\> elements. Required fields and error messages MUST be clearly indicated and programmatically associated with their respective inputs.  
* **Testing Tools for AX:**  
  * **Automated Scans (CI & Development):**  
    * **jest-axe (or equivalent like axe-playwright):** MUST be integrated into component tests and E2E tests to automatically scan for many common WCAG violations during development and in the CI/CD pipeline. Builds SHOULD fail on new critical/serious accessibility violations.  
  * **Browser Extensions (Manual/Dev Checks):** Tools like **Axe DevTools** or **Lighthouse** (accessibility audit) in browser developer tools WILL be used regularly by developers during implementation and by QA/UX for manual checks.  
  * **Manual Testing Procedures:** Key user flows (e.g., registration, event discovery, ticket purchase, form submissions) WILL undergo manual accessibility testing, including:  
    * Keyboard-only navigation testing.  
    * Screen reader testing (e.g., using NVDA, JAWS, or VoiceOver) for critical user journeys.  
    * Checking color contrast and zoom functionality.

## **XI. Performance Considerations**

Optimizing frontend performance is critical for user satisfaction, engagement, and achieving the project's goals, including a PageSpeed Insights score of 90+ and specific Core Web Vital targets (LCP \< 2.5s, TTI \< 5s). The following strategies MUST be implemented:

* **Image Optimization:** Images are a major factor in web performance.  
  * **Formats:** Prioritize modern image formats like **WebP** for their superior compression and quality. Provide fallbacks (e.g., JPEG/PNG) for older browser compatibility if necessary, though our target browsers should largely support WebP. SVGs MUST be used for icons and simple vector graphics.  
  * **Responsive Images:** Use HTML's \<picture\> element or the srcset and sizes attributes on \<img\> tags to serve appropriately sized images based on the user's viewport and device resolution.  
  * **Lazy Loading:** Non-critical, below-the-fold images MUST use the loading="lazy" attribute. For more complex scenarios or background images, Intersection Observer API can be leveraged. LCP (Largest Contentful Paint) images MUST NOT be lazy-loaded.  
  * **Compression:** While server-side compression for user-uploaded content is noted in the PRD, the frontend must ensure that any images it bundles (e.g., placeholders, UI elements) are optimally compressed without significant quality loss.  
  * **Implementation Mandate:** When displaying images, especially those from dynamic sources (user uploads, event flyers), components MUST be designed to gracefully handle potentially large images, perhaps by enforcing max dimensions or aspect ratios via CSS, and utilizing \<img\> attributes like srcset if multiple resolutions are available from the backend.  
* **Code Splitting & Lazy Loading (Components & Routes):**  
  * **Impact:** As detailed in "VIII. Build, Bundling, and Deployment," route-based code splitting (via React.lazy with React Router) and component-level lazy loading (dynamic import()) are crucial for reducing initial bundle sizes, improving TTI, and speeding up perceived load times.  
  * **Implementation Mandate:** Route components MUST be lazy-loaded. Large, non-critical UI sections or components (e.g., complex modals not immediately visible, feature modules loaded on demand) MUST also be lazy-loaded using React.lazy() and \<React.Suspense\>.  
* **Minimizing Re-renders (React Specific):** Unnecessary re-renders are a common source of frontend performance issues.  
  * **Techniques:**  
    * React.memo for functional components to prevent re-renders if props haven't changed.  
    * useCallback for memoizing callback functions passed to child components.  
    * useMemo for memoizing computationally expensive values.  
    * Ensuring stable dependency arrays for useEffect, useCallback, useMemo.  
    * Optimized selectors for global state management (e.g., from Zustand/Jotai stores, or React Query's select option) to prevent components from re-rendering if the specific slice of state they care about hasn't changed.  
  * **Implementation Mandate:** Developers and AI Agents MUST be mindful of prop stability (avoiding new object/array/function literals directly in props passed to memoized children). React.memo SHOULD be applied to components that are pure or render frequently with the same props. The React Profiler (DevTools) SHOULD be used to identify and optimize components causing excessive re-renders.  
* **Debouncing and Throttling:** For event handlers that fire frequently (e.g., search input onChange, window resize or scroll events).  
  * **Implementation Mandate:** Use utility functions (e.g., from lodash.debounce or lodash.throttle, or custom hooks) to limit the rate at which these handlers execute. Define sensible wait times (e.g., 200-300ms for debounce on search input).  
* **Virtualization (for Long Lists):** For rendering long lists of data (e.g., event listings, community directory results, class schedules, blog posts) to avoid rendering all items at once.  
  * **Tools:** Libraries like **TanStack Virtual (React Virtual)** SHOULD be considered.  
  * **Implementation Mandate:** Virtualization MUST be implemented for any list anticipated to regularly display more than 50-100 items if initial rendering or scrolling performance becomes noticeably slow during development or testing.  
* **Client-Side Caching Strategies:**  
  * **API Data Caching (React Query):** React Query's built-in caching is fundamental. Its default stale-while-revalidate strategy will be leveraged to provide fast perceived performance and reduce redundant network requests. Cache times can be configured per query if needed.  
  * **PWA Caching (Service Workers):** A service worker (configured via Vite PWA plugins or manually) WILL be used to cache the application shell (core HTML, CSS, JS) and key static assets. This enables faster subsequent visits and provides a degree of offline capability (e.g., displaying previously visited pages or a custom offline page).  
  * **HTTP Caching:** Leverage browser HTTP caching effectively for static assets, as defined in "VIII. Build, Bundling, and Deployment" (Asset Caching Strategy).  
* **Font Loading Optimization:**  
  * **Strategy:** Use font-display: swap; in @font-face declarations to ensure text remains visible during font loading, preventing FOIT (Flash of Invisible Text). Preload critical font files used above the fold using \<link rel="preload" as="font"\>.  
  * **Implementation Mandate:** Web fonts SHOULD be self-hosted or served from a performant CDN. Font files should be in modern, compressed formats (e.g., WOFF2).  
* **Critical CSS / Above-the-Fold Optimization:**  
  * **Strategy:** Ensure that CSS required for rendering the initial viewport content (above-the-fold) is delivered and parsed as quickly as possible. Vite, with its modern build approach, helps optimize CSS delivery.  
  * **Implementation Mandate:** Avoid large, render-blocking CSS imports if possible. Critical styles should be inlined or loaded very early. Tailwind CSS's JIT mode helps by only including styles actually used.  
* **Performance Monitoring Tools:**  
  * **Development:** Browser Developer Tools (Performance tab, Network tab, Lighthouse panel), React Developer Tools (Profiler).  
  * **Auditing:** **Lighthouse** (via Chrome DevTools or CLI) and **WebPageTest.org** WILL be used regularly to audit performance against Core Web Vitals and other metrics.  
  * **CI Integration (Consideration):** Consider integrating Lighthouse CI or a similar tool into the CI/CD pipeline to track performance budgets and prevent regressions, initially as a non-blocking information step.  
  * **Real User Monitoring (RUM) (Future):** Post-launch, implementing a RUM solution could provide insights into actual user performance.

## **XII. Internationalization (i18n) and Localization (l10n) Strategy**

* **Requirement Level:**  
  * Full multi-language internationalization (i18n) and localization (l10n) are **NOT requirements** for the SteppersLife.com platform.  
  * The platform WILL be developed and supported exclusively in **English (United States, en-US)**.  
  * Users who wish to view the content in other languages will be expected to use their web browser's built-in translation capabilities (e.g., Google Translate).  
* **Chosen i18n Library/Framework:**  
  * Not applicable. No dedicated i18n library (like i18next) will be implemented, as multi-language support is out of scope.  
* **Translation File Structure & Format:**  
  * Not applicable. There will be no external translation files.  
* **Translation Key Naming Convention:**  
  * Not applicable.  
* **Process for Adding New User-Facing Strings:**  
  * All user-facing text strings WILL be implemented directly in English within the codebase (e.g., within JSX/TSX components or, for widely reused static UI text, potentially in a shared constants file for maintainability, but not for translation purposes).  
* **Handling Pluralization:**  
  * English pluralization rules (e.g., displaying "1 event" vs. "5 events") WILL be handled directly through standard conditional logic within the application code where necessary. No i18n library features for pluralization will be used.  
* **Date, Time, and Number Formatting:**  
  * All dates, times, numbers, and currency values displayed on the platform WILL adhere to standard **United States (en-US) conventions**.  
  * To ensure consistency, the native JavaScript **Intl API** SHOULD be used for formatting these values, with the locale explicitly set to 'en-US'.  
    * Example: new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(dateObject);  
    * Example: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numberValue);  
  * If a date manipulation library like date-fns is used (as per 3\. Technical Preferences for {Project Name}.md), its formatting functions should also be configured or used in a way that ensures en-US formatting.  
* **Default Language:**  
  * en-US (English \- United States) is the sole and default language of the platform.  
* **Language Switching Mechanism:**  
  * Not applicable, as the platform will only support English.

## **XIII. Feature Flag Management**

This section outlines the strategy for conditionally enabling or disabling features within the SteppersLife.com frontend. While the PRD specifies a comprehensive initial launch, feature flags can still be valuable for managing the deployment of particularly complex new functionalities, for operational toggles, or for enabling features post-deployment once all dependencies are met.

* **Requirement Level:**  
  * Feature flags are **not mandated for every new piece of functionality** in the initial V1 launch.  
  * They SHOULD be used strategically for:  
    * Rolling out particularly complex or potentially risky new features/integrations within the V1 scope, allowing them to be enabled in production once thoroughly tested or dependencies are met.  
    * Operational toggles (e.g., temporarily disabling a problematic third-party integration without a full redeploy).  
    * Potentially for internal testing of variations before a full V1 release.  
* **Chosen Feature Flag System/Library (for V1):**  
  * For the initial launch (V1), a simple, frontend-managed approach will be used, primarily leveraging **environment variables** sourced via Vite.  
  * **Mechanism:** Flags will be defined as environment variables (e.g., VITE\_FF\_NEW\_AD\_SYSTEM\_UI=true). These are build-time configurations.  
  * **Rationale:** This approach is lightweight, requires no external services for V1, and is sufficient for managing a limited number of strategic flags. More sophisticated third-party feature flag services (e.g., LaunchDarkly, Flagsmith) can be considered for future versions if dynamic remote configuration or advanced targeting becomes necessary.  
* **Accessing Flags in Code:**  
  * A dedicated utility or custom hook WILL be created to access feature flag statuses in a consistent manner.  
  * **Location:** e.g., src/lib/featureFlags.ts or src/hooks/useFeatureFlag.ts.  
  * **Interface Example (src/lib/featureFlags.ts):**  
    TypeScript  
    const flags \= {  
      NEW\_AD\_SYSTEM\_UI: import.meta.env.VITE\_FF\_NEW\_AD\_SYSTEM\_UI \=== 'true',  
      COMMUNITY\_DIRECTORY\_RATINGS: import.meta.env.VITE\_FF\_COMMUNITY\_DIRECTORY\_RATINGS \=== 'true',  
      // Add other flags here  
    };

    export type FeatureFlagName \= keyof typeof flags;

    export const isFeatureEnabled \= (flagName: FeatureFlagName): boolean \=\> {  
      return flags\[flagName\] || false; // Default to false if undefined  
    };

    // Optional hook:  
    // export const useFeatureFlag \= (flagName: FeatureFlagName): boolean \=\> isFeatureEnabled(flagName);

  * Components or services will then use isFeatureEnabled('FLAG\_NAME') to check the status.  
* **Flag Naming Convention:**  
  * Flags MUST be prefixed with FF\_ (for Feature Flag) to clearly distinguish them.  
  * Format: FF\_\[SCOPE\_OR\_FEATURE\_NAME\]\_\[SPECIFIC\_TOGGLE\_DESCRIPTION\] (all uppercase, snake\_case).  
  * Examples: FF\_EVENTS\_ENHANCED\_FILTER\_PANEL, FF\_ADS\_SELF\_SERVE\_PORTAL\_V1, FF\_PROFILE\_NEW\_LAYOUT\_PREVIEW.  
  * All feature flags defined as environment variables MUST be documented in .env.example with a brief description and their default V1 state.  
* **Code Structure for Flagged Features:**  
  * **Conditional Rendering:** Use simple boolean checks: {isFeatureEnabled('FF\_MY\_FEATURE') && \<NewFeatureComponent /\>}.  
  * **Conditional Component/Module Imports:** For larger features or components that should not be included in the bundle if the flag is off, dynamic import() with React.lazy can be combined with a feature flag check.  
    TypeScript  
    const NewFeatureModule \= React.lazy(() \=\>  
      isFeatureEnabled('FF\_MY\_BIG\_FEATURE')  
        ? import('@/features/myBigFeature/MyBigFeatureModule')  
        : Promise.resolve({ default: () \=\> null }) // Fallback for disabled feature  
    );

  * **Route Definitions:** Routes for entirely new, flagged features can be conditionally added to the router configuration in src/routes/index.tsx.  
  * **Logic Branching:** Avoid deep, complex branching logic within shared components based on feature flags. Prefer to flag at higher levels (e.g., rendering different components or entire sections of a page).  
* **Strategy for Code Cleanup (Post-Flag Retirement):**  
  * This is a critical step to avoid technical debt.  
  * Once a feature flag is deemed permanent (i.e., the feature is fully rolled out and stable, or definitively removed):  
    * All conditional logic associated with the flag MUST be removed.  
    * The old code path (if the flag was for an alternative) MUST be deleted.  
    * The feature flag itself (definition in environment variables, featureFlags.ts, and any checks in the code) MUST be removed.  
  * This cleanup SHOULD be scheduled as a technical debt task within 1-2 sprints after the decision to retire the flag.  
* **Testing Flagged Features:**  
  * **Local Development:** Developers can toggle flags by changing their local .env.local file values.  
  * **Automated Tests (Unit/Integration/E2E):**  
    * Tests SHOULD be written to cover both states of a feature flag where feasible and meaningful (feature enabled and feature disabled).  
    * Test environments (e.g., in Vitest setup or Playwright test configurations) can mock the isFeatureEnabled function or set environment variables to test different flag combinations.  
  * **Staging/QA:** Deployments to staging environments can use specific .env configurations to enable certain flags for QA testing before they are enabled in production.

## **XIV. Frontend Security Considerations**

Ensuring the security of the frontend application is paramount. This section highlights key practices.

* **Cross-Site Scripting (XSS) Prevention:**  
  * **Framework Reliance:** React's JSX auto-escaping of dynamic values MUST be relied upon for rendering content. This is the primary defense against XSS when rendering data into the DOM.  
  * **Explicit Sanitization:** The use of dangerouslySetInnerHTML is STRONGLY DISCOURAGED and requires explicit justification and approval. If absolutely unavoidable, any HTML content rendered this way MUST be sanitized using a robust library like **DOMPurify** with a restrictive configuration.  
  * **Content Security Policy (CSP):** A strong CSP WILL be enforced via HTTP headers set by the backend or hosting platform/CDN, as defined in the main Architecture Document. The frontend application MUST be developed to comply with this CSP (e.g., avoiding inline scripts/styles if restricted, using nonces if required for specific exceptions).  
* **Cross-Site Request Forgery (CSRF) Protection:**  
  * **Mechanism:** SteppersLife.com will primarily use token-based authentication (e.g., JWTs sent in Authorization headers) for API calls made by the SPA frontend to the Supabase backend or custom backend services. This method is generally not vulnerable to traditional CSRF attacks that exploit cookie-based session management.  
  * **If any legacy or specific parts of the application were to use cookie-based sessions with traditional HTML form submissions (highly unlikely for our PWA), then standard CSRF protection mechanisms (e.g., synchronizer tokens) managed by the backend would be essential.** For our primary SPA-to-API communication, this is less of a direct concern if tokens are handled correctly.  
* **Secure Token Storage & Handling (e.g., JWTs):**  
  * **Storage Mechanism:** Authentication tokens (e.g., JWT access tokens) obtained after login MUST be stored **in-memory** within the client-side state management solution (e.g., our userSessionStore using Zustand). They should be cleared upon user logout or session expiry (e.g., tab/browser close if not using refresh tokens).  
  * **localStorage or sessionStorage MUST NOT be used for storing sensitive tokens due to XSS vulnerabilities.**  
  * **Refresh Tokens:** If Supabase Auth or our custom auth flow utilizes refresh tokens, they should ideally be stored in HttpOnly cookies by the backend if possible, to prevent JavaScript access. If the frontend must handle refresh tokens, they require extremely careful management and should also avoid localStorage.  
  * **Token Refresh:** The Axios interceptor in src/lib/apiClient.ts WILL be responsible for handling 401 Unauthorized responses, triggering a token refresh mechanism if implemented (e.g., calling a dedicated refresh endpoint), and then retrying the original request with the new token.  
* **Third-Party Script Security:**  
  * **Policy:** All third-party scripts (e.g., for analytics like Google Analytics, payment gateways like Square/Cash App/PayPal, advertising like AdSense) MUST be vetted for necessity, security, and privacy implications.  
  * Scripts SHOULD be loaded asynchronously (async or defer attributes) to avoid blocking page rendering.  
  * **Subresource Integrity (SRI):** SRI hashes (integrity attribute) MUST be used for all third-party scripts and stylesheets loaded from CDNs or external sources whenever the resource is stable and SRI is supported by the provider. This ensures the loaded file hasn't been tampered with.  
* **Client-Side Data Validation:**  
  * **Purpose:** Client-side validation (e.g., using **React Hook Form** as per our state management strategy) is primarily for **improving User Experience (UX)** by providing immediate feedback on forms.  
  * **Mandate:** **All critical data validation MUST occur on the server-side** (backend), as stated in the main Architecture Document. The frontend MUST NOT rely solely on client-side validation for security or data integrity.  
* **Preventing Clickjacking:**  
  * **Mechanism:** The primary defense against clickjacking is the use of X-Frame-Options: DENY or Content-Security-Policy: frame-ancestors 'self' (or a more restrictive policy) HTTP headers. These headers MUST be set by the backend services or the hosting platform/CDN. The frontend application itself should not need to implement frame-busting scripts.  
* **API Key Exposure (for client-side consumed services):**  
  * **Restriction:** Any API keys used directly by the frontend (e.g., for a mapping service, if SteppersLife.com were to use one directly on the client) MUST be restricted as much as possible via the service provider's console (e.g., by HTTP referrer, IP address, or API-specific restrictions). These keys will be accessed via Vite environment variables (e.g., import.meta.env.VITE\_Maps\_API\_KEY).  
  * **Backend Proxy:** For operations involving sensitive API keys or keys that cannot be sufficiently restricted for client-side use, a backend proxy endpoint MUST be created. The frontend will call this secure backend proxy, which then communicates with the third-party service.  
* **Secure Communication (HTTPS):**  
  * **Mandate:** All communication between the frontend and backend APIs (via apiClient.ts) MUST use HTTPS. The application MUST be served over HTTPS in all environments (staging, production). Mixed content (loading HTTP resources on an HTTPS page) is strictly forbidden and MUST be prevented.  
* **Dependency Vulnerabilities:**  
  * **Process:** Regular automated vulnerability scans of frontend dependencies (e.g., using npm audit \--audit-level=high or equivalent tools like Snyk/Dependabot integrated into the CI/CD pipeline) MUST be performed.  
  * High and critical severity vulnerabilities MUST be addressed (updated or mitigated) before deployment or as soon as possible.  
* **Rendering External/User-Generated Content (e.g., Ads, Blog Comments, Directory Listings):**  
  * **Ads:** As per PRD X.2.3, admin must review direct ad creatives. For rendering, if ads are not served via a sandboxed mechanism like AdSense, directly embedded HTML ads MUST be treated with extreme caution. If possible, they should be rendered within sandboxed \<iframe\> elements with restrictive permissions to prevent them from accessing or manipulating the main page.  
  * **User-Generated Content (UGC):** Any UGC displayed (e.g., text from blog comments, directory listing descriptions) MUST be properly sanitized before rendering if there's any risk of it containing HTML or script tags. Rely on React's default JSX escaping. If UGC can contain rich text that needs to be rendered as HTML, it MUST be sanitized with DOMPurify before using dangerouslySetInnerHTML.

## **XV. Browser Support and Progressive Enhancement**

This section defines the target browsers for SteppersLife.com and outlines the strategy for ensuring compatibility and a good user experience, including how the application behaves in environments with varying capabilities.

* **Target Browsers:**  
  * SteppersLife.com will officially support the **latest two (2) stable versions of major evergreen web browsers** at the time of any given release. This includes:  
    * Google Chrome (Desktop & Android)  
    * Mozilla Firefox (Desktop)  
    * Apple Safari (Desktop & iOS)  
    * Microsoft Edge (Desktop)  
  * This support matrix aligns with the modern mobile devices specified in the PRD for 2025 (e.g., iPhone 16 series, Samsung Galaxy S25 series, Google Pixel 9 series), which will run current versions of their respective mobile browsers.  
  * **Internet Explorer (any version) is explicitly NOT supported.**  
* **Polyfill Strategy:**  
  * **Mechanism:**  
    * Vite, our chosen build tool, by default targets modern browsers that support native ES modules, ES2020 features, and dynamic imports. This minimizes the need for extensive polyfills for modern JavaScript features.  
    * For any specific JavaScript features essential to the application that might not be available in the trailing versions of our supported browser matrix (i.e., the second-to-latest stable version), targeted polyfills from a library like **core-js** can be selectively imported where needed.  
    * The need for specific polyfills will be assessed during development based on feature requirements and browser compatibility testing (e.g., via CanIUse.com).  
  * **Specific Polyfills:** No specific broad polyfills beyond what Vite's modern target provides are mandated upfront. Individual polyfills (e.g., for IntersectionObserver if a slightly older supported browser version lacks full support and it's critical) will be added on an as-needed basis and documented.  
* **JavaScript Requirement & Progressive Enhancement:**  
  * **Baseline:** Core application functionality of SteppersLife.com, being a feature-rich Progressive Web App (PWA) with dynamic content, interactive dashboards, ticketing, VOD playback, and community features, **REQUIRES JavaScript to be enabled in the browser.**  
  * **No-JS Experience:** Due to the dynamic nature of the PWA, a functional experience without JavaScript is not a primary goal. Users without JavaScript enabled will be presented with a standard \<noscript\> message advising them to enable JavaScript to use the SteppersLife.com platform. Content that could potentially be server-rendered for SEO (like blog posts or public event pages) might offer some readability, but interactivity will be absent.  
* **CSS Compatibility & Fallbacks:**  
  * **Tooling:** Vite utilizes **PostCSS**, and **Autoprefixer** WILL be configured (typically via postcss.config.js or Vite's internal CSS configuration) to automatically add necessary vendor prefixes for CSS properties, targeting our defined browser support matrix.  
  * **Feature Usage:** Modern CSS features (e.g., Flexbox, Grid, Custom Properties, modern selectors) that are well-supported across our target browsers SHOULD be used.  
  * For newer CSS features with partial support, the @supports CSS at-rule SHOULD be used to provide graceful degradation or fallbacks for browsers that do not support the feature, ensuring core usability is maintained.  
* **Accessibility Fallbacks (related to browser/AT capabilities):**  
  * While our primary goal is WCAG 2.1 AA compliance using modern ARIA practices, we will aim for graceful degradation if certain very advanced ARIA features or JavaScript-driven accessibility enhancements are not fully supported by slightly older assistive technologies that are still prevalent within our supported browser versions.  
  * Core accessibility (semantic HTML, keyboard navigation, sufficient color contrast) must be maintained across all supported environments. Testing with various screen readers and keyboard navigation is key.

## **XVI. Change Log**

| Change | Date | Version | Description | Author |
| :---- | :---- | :---- | :---- | :---- |
| Initial Draft of Sections I-XV | June 1, 2025 | 0.1 | Collaboratively drafted all sections of the Frontend Architecture Document based on inputs and discussions. | Jane (Design Arch) |
| Checklist Review & Finalization | June 1, 2025 | 1.0 | Completed review against frontend-architecture-checklist.txt. Document finalized. | Jane (Design Arch) |

---

