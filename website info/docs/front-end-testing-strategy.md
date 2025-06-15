### IX. Frontend Testing Strategy

This section details the frontend-specific testing strategies for SteppersLife.com, complementing the "Overall Testing Strategy" outlined in the SteppersLife.com Architecture Document (Version 0.2).md. The goal is to build a comprehensive test suite that ensures code quality, functional correctness, and a reliable user experience.

* **Link to Main Overall Testing Strategy:** For overarching principles, general tool choices, and CI integration details, please refer to the SteppersLife.com Architecture Document (Version 0.2).md - Section 14: Overall Testing Strategy. The tools chosen there (Vitest with React Testing Library for unit/integration, and Playwright/Cypress for E2E) will be applied as follows.

#### Component Testing

* **Scope:** Testing individual UI components in isolation. This includes components from src/components/ui/, src/components/layout/, and feature-specific components within src/features/[featureName]/components/.
* **Tools:** **Vitest** as the test runner and assertion library, with **React Testing Library (RTL)** for rendering components and simulating user interactions. This aligns with the main architecture's tech stack.
* **Focus:**
    * Correct rendering with various props.
    * User interactions (e.g., clicks, form input changes, keyboard events) simulated via RTL's user-event library.
    * Correct event emission or callback invocation.
    * Basic internal state changes and their reflection in the UI.
    * Accessibility (AX) checks using jest-axe or a similar utility integrated with Vitest/RTL, validating against WCAG AA criteria.
    * **Snapshot testing MUST be used sparingly** and only with clear justification (e.g., for highly stable, purely presentational components with complex but deterministic DOM structures). Explicit assertions about component output and behavior are strongly preferred.
* **Location:** Test files (e.g., MyComponent.test.tsx or MyComponent.spec.tsx) MUST be co-located alongside the component files within their respective directories or in a \_\_tests\_\_ subdirectory.

#### Feature/Flow Testing (UI Integration)

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

#### End-to-End (E2E) UI Testing

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