**Technical Preferences for Steppers Life**

This document outlines the specific technical preferences and technologies for the ticketing platform. This is the definitive guide for all development.

**I. Core Architecture**

* **Repository Structure:** A **Monorepo** using a single GitHub repository. This simplifies project management since all code (frontend, Supabase migrations, and edge functions) will live in one place.  
* **Service Architecture:** A **Backend-as-a-Service (BaaS)** approach is mandatory.  
  * **Provider:** **Supabase** will be used for the database (PostgreSQL), user authentication, file storage, and all server-side logic via Edge Functions.  
  * **No separate backend server (e.g., Express) will be used.** All secure logic, such as handling payment intents, will be managed within Supabase Edge Functions.

**II. Frontend Application**

* **Framework & Build Tool:** **React** (latest stable version) built with **Vite** (latest stable version).  
* **Programming Language:** **TypeScript**.  
* **Styling:**  
  * **Tailwind CSS** is the exclusive utility-first framework for all styling.  
  * **PostCSS** and **Autoprefixer** will be used in the build process.  
  * A simple, custom solution using CSS variables will be implemented for light/dark mode theming.  
* **UI Component Strategy:**  
  * **shadcn/ui** is the required method for building the UI. This provides unstyled, accessible components that we control and style with Tailwind.  
  * **Icons:** **Lucide React** will be used for all application icons.  
* **Routing:** **react-router-dom** (latest stable version) will handle all client-side routing.  
* **State Management:** The approach is to start simple and scale only when necessary.  
  * **Server State & Data Fetching:** Begin with simple async/await fetch calls within React components, managed by useState and useEffect. **TanStack Query (React Query)** should be considered only if data caching and synchronization needs become complex.  
  * **Form State:** Use controlled components with useState for simple forms. For complex forms, **React Hook Form** with **Zod** for schema validation is the preferred solution.  
  * **Global Client State:** Use **React's Context API** for minimal global state (e.g., theme, user session). If state logic becomes complex, **Zustand** is the approved library to implement.  
* **PWA Functionality:** The site must be installable as a PWA.  
  * **Tool:** **vite-plugin-pwa** is required to automate the generation of the service worker and web app manifest.

**III. Development & Deployment**

* **Version Control:** **Git** with **GitHub**.  
* **Code Quality:** **ESLint** and **Prettier** must be configured for all code.  
* **Testing:**  
  * **Unit/Integration:** **Vitest** with **React Testing Library**.  
  * **End-to-End (E2E):** **Playwright** is the preferred tool.  
* **Deployment & Hosting:** **Vercel**. The GitHub repository will be linked for automatic CI/CD and deployments.

**IV. Integrations & Services**

* **Payment Processing:**  
  * Square (react-square-web-payments-sdk)  
  * PayPal (@paypal/react-paypal-js)  
  * Cash App (Cash App Pay Kit SDK)  
* **Transactional Email:** **SendGrid**.  
* **Analytics:** **Google Analytics**.

**V. Technologies to AVOID**

To maintain simplicity, performance, and a focused technology stack, the following are to be avoided for this project:

* **Heavy State Management Libraries:** Do not use Redux, MobX, or similar libraries.  
* **Separate Backend Frameworks:** Do not use Express, NestJS, etc. All backend logic will be in Supabase Edge Functions.  
* **GraphQL:** Use REST-like API calls to Supabase. Do not introduce a GraphQL layer.  
* **Different Styling Systems:** Do not use CSS-in-JS (e.g., Styled Components, Emotion) or other component libraries (e.g., Material-UI, Ant Design). All styling will be done via Tailwind CSS.

