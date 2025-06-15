# **SteppersLife.com UI/UX Specification**

## **Table of Contents**

* [I. Introduction](https://www.google.com/search?q=%23i-introduction)  
* [II. Overall UX Goals & Principles](https://www.google.com/search?q=%23ii-overall-ux-goals--principles)  
* [III. Information Architecture (IA)](https://www.google.com/search?q=%23iii-information-architecture-ia)  
* [IV. User Flows](https://www.google.com/search?q=%23iv-user-flows)  
* [V. Wireframes & Mockups](https://www.google.com/search?q=%23v-wireframes--mockups)  
* [VI. Component Library / Design System Approach](https://www.google.com/search?q=%23vi-component-library--design-system-approach)  
* [VII. Branding & Style Guide Basics](https://www.google.com/search?q=%23vii-branding--style-guide-basics)  
* [VIII. Accessibility (AX) Requirements](https://www.google.com/search?q=%23viii-accessibility-ax-requirements)  
* [IX. Responsiveness](https://www.google.com/search?q=%23ix-responsiveness)  
* [X. Change Log](https://www.google.com/search?q=%23x-change-log)

## **I. Introduction**

This section outlines the foundational user experience goals and design principles that will guide the UI/UX design and development of SteppersLife.com. Our aim is to create a platform that is not only functional but also enjoyable, intuitive, and valuable for all members of the Stepping community.

* **Link to Primary Design Files:** docs/Steppers Life\_ Comprehensive UI\_UX Layou.pdf  
* **Link to Deployed Storybook / Design System:** Not applicable for the initial version of this document. (To be added if/when a Storybook instance is implemented).

## **II. Overall UX Goals & Principles**

This section outlines the foundational user experience goals and design principles that will guide the UI/UX design and development of SteppersLife.com. Our aim is to create a platform that is not only functional but also enjoyable, intuitive, and valuable for all members of the Stepping community.

* Target User Personas (Summary with a UX Focus):  
  The detailed User Personas and their specific needs are outlined in the SteppersLife PRD Document \- Revision 3.2.md (Sections: "Target User Personas (Summary)" and "Key User Role Needs & Platform Solutions"). For UX design purposes, we will focus on ensuring the platform caters effectively to:  
  * **Platform Participants (Attendees/Learners/Enthusiasts):** Seeking easy discovery of events and classes, engaging cultural content, and a simple way to connect with and follow organizers, instructors, and community listers. Their experience should be intuitive, visually engaging, and information-rich.  
  * **Event Organizers/Promoters:** Needing efficient tools to create, manage, and promote events, including advanced ticketing and follower/team management features. Their dashboard and workflows must be powerful yet clear and easy to navigate.  
  * **Instructors:** Requiring a straightforward way to list physical classes and manage/sell VOD content. Their content creation and management tools should be user-friendly.  
  * **Community Listers (Businesses & Services):** Looking for a simple process to list their offerings and gain visibility within the Stepping community. Their listing management should be uncomplicated.  
  * A key overarching consideration for all personas is **ease of use, even for those who may not be tech-savvy**.  
* **Key Usability Goals:**  
  1. **Intuitive Navigation & Discoverability:** Users should be able to easily find what they are looking for (events, classes, directory listings, information) with minimal effort and a clear sense of orientation within the platform. Search and filtering should be powerful yet simple to use.  
  2. **Efficiency for Key Tasks:** Core tasks for each persona (e.g., purchasing a ticket for an attendee, creating an event for an organizer, listing a class for an instructor) should be streamlined and completable in a minimal number of steps.  
  3. **High Learnability:** New users should be able to quickly understand how to use the platform's main features without requiring extensive tutorials. The interface should be predictable and employ familiar patterns where appropriate.  
  4. **Error Prevention & Graceful Recovery:** The design should aim to prevent users from making common errors. When errors do occur, they should be communicated clearly, in plain language, with actionable guidance on how to recover.  
  5. **Accessibility:** The platform must strive for WCAG 2.1 Level AA compliance, ensuring it is usable by people with a wide range of abilities. This is a foundational usability goal.  
  6. **Engaging & Satisfying Experience:** Beyond just being usable, the platform should provide a visually appealing, modern, and satisfying experience that encourages repeat visits and community engagement.  
* **Core Design Principles:**  
  1. **Clarity First:** The UI must be clear and unambiguous. Information should be presented in a way that is easy to understand at a glance. Avoid jargon and overly complex interfaces.  
  2. **Consistent Experience:** Maintain consistency in design language, interaction patterns, and terminology across all sections of the PWA (mobile and desktop) to build familiarity and reduce cognitive load.  
  3. **Community-Centric & Welcoming:** The design should foster a sense of belonging and connection. It should feel inviting and tailored to the Stepping community's culture and values.  
  4. **Visually Engaging & Modern:** The aesthetic should be sleek, modern, and visually appealing, utilizing high-quality imagery and a clean layout to make content discovery and interaction enjoyable.  
  5. **Mobile-First & Responsive:** Design primarily for the mobile PWA experience, ensuring core functionality and usability are excellent on smaller screens, then scale and adapt gracefully for desktop users.  
  6. **Feedback & Responsiveness:** The system should provide immediate and clear feedback for user actions, making interactions feel responsive and reliable.

## **III. Information Architecture (IA)**

This section outlines the overall structure of information and navigation pathways within the SteppersLife.com platform.

* Site Map / Screen Inventory (Key Screens based on Frontend Architecture Route Definitions):  
  The platform comprises several key sections and pages. The following list, derived from our Frontend Architecture's route definitions, serves as a high-level screen inventory:  
  * **Public Area & Core Discovery:**  
    * / (Homepage)  
    * /explore/events (Event List Page / Event Discovery)  
    * /events/:eventId (Event Detail Page)  
    * /explore/classes (Class List Page / Class Discovery)  
    * /classes/:classId (Class Detail Page \- Physical or VOD)  
    * /community (Community Directory Home \- Stores & Services)  
    * /community/:listingType/:listingId (Community Listing Detail Page)  
    * /blog (Blog List Page)  
    * /blog/:slug (Individual Blog Post Page)  
  * **Authentication:**  
    * /auth/login (Login Page)  
    * /auth/register (Registration Page)  
    * /auth/forgot-password (Forgot Password Page)  
    * /auth/reset-password (Reset Password Page)  
  * **User Dashboard & Profile (Authenticated Users):**  
    * /dashboard/my-tickets (User's Purchased Tickets)  
    * /dashboard/my-classes (User's Enrolled/Purchased VOD Classes)  
    * /dashboard/profile (User Profile & Settings Page)  
    * /dashboard/favorites (User's Saved/Favorited Items \- *implied, linked from Bottom Nav*)  
  * **Role-Specific Dashboards & Management (Authenticated & Authorized Users):**  
    * /dashboard/organizer (Organizer Main Dashboard)  
    * /events/create (Organizer Event Creation Page)  
    * /manage/events/:eventId (Organizer Event Management Page)  
    * /manage/events/check-in/:eventId (Organizer/Staff On-Site Event Check-in PWA Page)  
    * /dashboard/instructor (Instructor Main Dashboard)  
    * /manage/classes/create (Instructor Class Listing/VOD Creation Page)  
    * /store (SteppersLife Promotional Products Store \- for eligible roles)  
    * /ads/portal (Advertising System \- User Ad Purchase Portal \- for eligible roles)  
  * **Administrative Area (Authenticated & Authorized Admin Users):**  
    * /admin/\* (Admin Panel Base \- with nested routes for user management, event oversight, content moderation, platform configuration, ad management, etc.)  
  * **Utility Pages:**  
    * \* (NotFoundPage / 404 Error Page)  
    * Static pages like "About Us," "Contact Us," "Terms of Service," "Privacy Policy" (typically linked from footer).  
* **Navigation Structure:**  
  * **1\. Primary Mobile PWA Navigation (Bottom Navigation Bar):**  
    * This is the main navigation method for mobile PWA users, fixed at the bottom of the screen.  
    * As detailed in Steppers Life\_ Comprehensive UI\_UX Layou.pdf, it consists of six tappable tabs:  
      1. **Home:** (Links to /)  
      2. **Explore:** (Links to /explore/events or a general exploration hub)  
      3. **My Tickets:** (Links to /dashboard/my-tickets)  
      4. **Favorites:** (Links to a user-specific favorites/saved items page, e.g., /dashboard/favorites)  
      5. **Community:** (Links to /community)  
      6. **Profile:** (Links to /dashboard/profile or a main user dashboard area)  
    * The active tab will be visually distinct.  
  * **2\. Primary Desktop Navigation (Top Header Bar):**  
    * The main header (Header.tsx) will contain:  
      * **SteppersLife Logo/Brand Name:** Links to Homepage (/).  
      * **Key Navigational Links:** Prominent links to main sections, e.g., "Events" (/explore/events), "Classes" (/explore/classes), "Community" (/community), "Blog" (/blog). The exact links will be based on the final top-level content categories.  
      * **User Authentication / Profile Section:** "Login" and "Sign Up" buttons for unauthenticated users. For authenticated users, a profile avatar/name with a dropdown menu accessing "My Dashboard" (could link to a relevant starting point like /dashboard/my-tickets), "Profile Settings" (/dashboard/profile), and "Logout."  
    * On smaller desktop viewports or tablets, this header navigation might adapt (e.g., some links collapsing into a hamburger menu).  
  * **3\. Secondary Navigation & In-Page Navigation:**  
    * **Tabs:** Used within sections for further organization (e.g., "Upcoming" / "Past" tickets on the /dashboard/my-tickets page; "Events" / "Collections" / "About" on an Organizer Profile page).  
    * **Filters & Sort Controls:** Prominently available on list/discovery pages (Events, Classes, Community Directory) to refine results. These might appear as sidebars, dropdowns, or dedicated filter modals/drawers.  
    * **Dashboard Navigation:** User-specific dashboards (Organizer, Instructor, Admin, general User Profile) will have their own internal navigation (e.g., sidebar menu or tabbed sections) to access different management tools and information sections.  
    * **Breadcrumbs:** May be used for deeply nested sections, particularly within the Admin panel or complex management flows, to aid orientation.  
  * **4\. Footer Navigation (Conceptual \- for Desktop & PWA):**  
    * A site footer (if implemented) would typically contain links to static informational pages such as:  
      * About Us  
      * Contact Us  
      * Terms of Service  
      * Privacy Policy  
      * FAQ  
      * Social media links.  
  * **5\. Contextual Navigation:**  
    * Links within content (e.g., an event card linking to its detail page, an organizer's name linking to their profile).  
    * Calls to action (CTAs) that navigate the user to relevant next steps (e.g., "Get Tickets" button on an event page).

## **IV. User Flows**

This section details key user tasks and journeys within the SteppersLife.com platform. The following critical user journeys have been identified and detailed in the SteppersLife PRD Document \- Revision 3.2.md and are reiterated here for completeness within this UI/UX Specification. For detailed screen layouts and component interactions for each step, please refer to the Steppers Life\_ Comprehensive UI\_UX Layou.pdf as referenced in the PRD.

### **1\. User Journey: New User Onboarding & First Event Ticket Purchase**

* **Primary User/Role:** New User (potential Attendee)  
* **Goal:** For a new user to successfully register on SteppersLife.com, find an event of interest, and complete a ticket purchase.  
* **High-Level Key Steps:**  
  1. User arrives at the SteppersLife platform (e.g., Homepage).  
  2. User initiates and completes the registration process (e.g., using email/password or a social login option).  
  3. User logs in to their new account.  
  4. User navigates to discover events (e.g., using homepage features, search, or explore sections, potentially leveraging geolocation for local events or searching specific areas).  
  5. User selects a specific event to view its details.  
  6. From the event detail page, the user initiates the ticket purchasing process.  
  7. User selects desired ticket type(s), quantity, and any seating options if applicable (e.g., general admission, specific table/seat for relevant events – V1 scope: no complex visual seating chart).  
  8. User proceeds to checkout, confirms order details, and selects a payment method (e.g., Square, Cash App, PayPal, or initiates the Direct Cash Payment Workflow).  
  9. User successfully completes the payment.  
  10. User receives an order confirmation (on-screen and/or via email) and their e-ticket(s) with QR codes are made available in their user dashboard and sent via email.  
* **Key Decision Points for User:**  
  * Choosing registration method (e.g., email vs. social media).  
  * Deciding which event to explore/select.  
  * Selecting ticket types, quantity, and (if applicable) specific seats/tables.  
  * Choosing a payment method.  
* **Reference for Detailed Screens & Interactions:** Steppers Life\_ Comprehensive UI\_UX Layou.pdf (sections "Steppers Life Homepage", "PWA Mobile Bottom Navigation Menu", "Section: Steppers Life iOS Logging In", "Section: Steppers Life iOS Searching Steppers Life", "Section: Steppers Life iOS Event Details", "Section: Steppers Life iOS Purchasing a Ticket", "Section: Steppers Life iOS Tickets").

### **2\. User Journey: Organizer: Event Creation, Publishing, and Enabling Follower Ticket Sales**

* **Primary User/Role:** Event Organizer/Promoter  
* **Goal:** For an Organizer to successfully create a new event, configure all necessary details (including ticketing and options for their followers to sell tickets), publish the event to the platform, and optionally assign roles to followers.  
* **High-Level Key Steps:** (Summarized from PRD)  
  1. Login & Access Organizer Dashboard.  
  2. Initiate "Create New Event."  
  3. Provide event details (title, description, date/time with complex recurring patterns, venue, categories, images).  
  4. Configure ticketing (types, price, quantity, sales periods, group/pre-sale options).  
  5. Configure seating (GA, Table-based, Section/Block-based – V1 scope: no complex visual seating chart).  
  6. Specify attendee information to collect (with custom questions).  
  7. Enable/configure follower "Sales Agent" functionality (commissions).  
  8. Optionally assign roles ("Sales Agent," "Event Staff") to followers.  
  9. Review and publish (or save draft).  
  10. (Post-Publish) Utilize promotional tools.  
  11. (Post-Publish) Monitor event performance.  
* **Key Decision Points for Organizer:** Event type, categories, ticketing structures, pricing, seating (V1), enabling follower sales, assigning roles, publishing timing.  
* **Reference for Detailed Screens & Interactions:** Relevant sections detailing Organizer Dashboard, event creation forms, ticketing/seating setup, follower management, and sales reporting in Steppers Life\_ Comprehensive UI\_UX Layou.pdf (though these are not explicitly named as a single section in the PDF's TOC, the functionalities imply various screens detailed within it like forms, lists, etc.).

### **3\. User Journey: Instructor: Listing a Physical Class & Offering/Selling a VOD Class (plus User VOD Purchase)**

* **Primary User/Role:** Instructor; User/Attendee (for VOD purchase part)  
* **Goal:** For an Instructor to list physical classes, create/sell VOD classes (with payouts), and for Users to purchase VODs.  
* **High-Level Key Steps:** (Summarized from PRD)  
  * **Instructor \- Physical Class:** Login, Access Instructor Dashboard, Add Physical Class, complete detailed form (title, level, location, complex schedule, cost, etc.), publish. Manage listings (validity checks, PWA push notifications).  
  * **Instructor \- Paid VOD Class:** Subscribe to VOD hosting, Create VOD Class Series (title, description, structure, levels), upload/order videos, set pricing, publish. View VOD attendees, manage optional T-shirt sales, receive payouts.  
  * **User/Attendee \- VOD Purchase:** Browse/filter VODs, select VOD, purchase access, complete payment, access purchased VOD content.  
* **Key Decision Points:**  
  * **Instructor:** Offering physical vs. VOD; pricing; VOD content structure; T-shirt sales.  
  * **User/Attendee:** Selecting VOD class for purchase.  
* **Reference for Detailed Screens & Interactions:** Relevant sections in Steppers Life\_ Comprehensive UI\_UX Layou.pdf for instructor dashboards, class/VOD creation forms, VOD Browse/purchase UIs (e.g., the "Class Detail Page (Physical & VOD)" is listed in the PDF's main PRD references).

### **4\. User Journey: User & Community Lister: Interacting with the Community Directory**

* **Primary User/Role:** Community Lister (Business Owner/Service Provider); User/Attendee  
* **Goal:** For a Lister to submit their business/service listing, and for a User to discover, view, and interact with these listings.  
* **High-Level Key Steps:** (Summarized from PRD)  
  * **Lister:** Login/Register, Select "List Your Service/Store," complete submission form (name, category, description, contact, location, images, etc.), submit for Admin approval. Manage listing post-approval.  
  * **User/Attendee:** Navigate to "Community" section, browse/search directory, filter by category/location (including "near me"), view listing details, submit ratings/reviews/comments, follow listing.  
* **Key Decision Points:**  
  * **Lister:** Information detail, category choice.  
  * **User:** Search/filter criteria; which listing to view; decision to rate/review/comment/follow.  
* **Reference for Detailed Screens & Interactions:** Steppers Life\_ Comprehensive UI\_UX Layou.pdf \- "Community / Neighborhood" tab and elements listed as "Community Directory (Services/Stores) Landing Page & Listing Detail Page".

### **5\. User Journey: Eligible User: Purchasing Promotional Material from Steppers Life Store**

* **Primary User/Role:** Eligible User (e.g., Event Organizer/Promoter, Instructor, Service/Store Lister)  
* **Goal:** For an eligible user to access the exclusive Store, select products, manage artwork, and complete purchase with special pricing/shipping.  
* **High-Level Key Steps:** (Summarized from PRD)  
  1. Eligible User logs in.  
  2. Navigates to "Promotional Materials" / "Steppers Life Store" in Dashboard.  
  3. Browses/searches product catalog (Business Cards, Banners, etc.) at special prices.  
  4. Selects product, views details (specs, price, artwork requirements).  
  5. Uploads artwork (or notes to email later), adds order note.  
  6. Adds to cart, proceeds to checkout.  
  7. Checkout applies Chicago/Non-Chicago shipping/pickup logic and pricing.  
  8. User confirms order, completes payment.  
  9. Receives order confirmation.  
  10. If artwork not uploaded, receives instructions to email it.  
* **Key Decision Points for Eligible User:** Product selection, artwork submission method, (Chicago users) Pickup vs. Shipping.  
* **Reference for Detailed Screens & Interactions:** Screens for "Promotional Materials" store section, product pages, artwork uploader, and modified checkout flow as would be detailed in the UI/UX design (conceptualized in PRD L.4 and would be visually defined in Steppers Life\_ Comprehensive UI\_UX Layou.pdf if specific screens were mocked for this).

## **V. Wireframes & Mockups**

The definitive source for all wireframes, detailed mockups, screen layouts, component visual appearances, and interaction flows for the SteppersLife.com platform is the comprehensive document provided by you:

* **Primary Design & Layout Document:** docs/Steppers Life\_ Comprehensive UI\_UX Layou.pdf

This PDF document contains extensive visual representations for a wide array of screens and user interface elements, including but not limited to:

* Homepage and primary landing areas  
* PWA Mobile Bottom Navigation  
* User Authentication flows (Login, Registration, Password Reset)  
* Event Discovery, Search, Filtering, and Detail pages  
* Ticket Purchasing and Management flows (My Tickets, Ticket Details, QR Codes, Refund Requests, Order Cancellation)  
* User Profile, Settings, Following/Follower management, and Notification screens  
* Community Directory interactions (implying screens for listings and details)  
* Help Center and other informational pages

**Usage:**

* This front-end-spec.md document provides the textual and structural specification for UI/UX. For the **visual design and detailed layout of any specific screen or component** mentioned herein or in the PRD, the Steppers Life\_ Comprehensive UI\_UX Layou.pdf **MUST be consulted as the primary source of truth.**  
* For example, when a user story refers to the "Event Details Page," developers and designers should refer to the corresponding detailed mockups and layout descriptions within the Steppers Life\_ Comprehensive UI\_UX Layou.pdf to understand its visual structure, key elements, and appearance.  
* The Frontend Architecture Document also references this PDF for visual context when defining component strategies.

## **VI. Component Library / Design System Approach**

This section outlines the approach to building and utilizing UI components for SteppersLife.com, aiming for consistency, reusability, accessibility, and alignment with the visual design specified in the Steppers Life\_ Comprehensive UI\_UX Layou.pdf.

* **Core Component Toolkit: Shadcn/UI**  
  * SteppersLife.com will leverage **Shadcn/UI** as its foundational component toolkit.  
  * **Rationale:**  
    * Shadcn/UI provides a collection of beautifully designed, accessible, and customizable components built using Radix UI primitives and styled with Tailwind CSS.  
    * This aligns perfectly with our chosen technology stack (React, TypeScript, Tailwind CSS).  
    * By using Shadcn/UI, we get a head start on accessible, unstyled (or minimally styled) primitives that we can then fully customize to match the unique visual identity of SteppersLife.com as defined in the Steppers Life\_ Comprehensive UI\_UX Layou.pdf.  
    * Unlike traditional component libraries, Shadcn/UI components are typically added to our codebase via its CLI, meaning we "own" the component code, allowing for full control and customization.  
* **Customization and Styling:**  
  * All components derived from or inspired by Shadcn/UI will be styled using **Tailwind CSS** to precisely match the visual specifications in the Steppers Life\_ Comprehensive UI\_UX Layou.pdf. This includes colors, typography, spacing, border radius, shadows, etc..  
  * The tailwind.config.js file will be configured with the SteppersLife theme (colors, fonts, etc.) as detailed in the "Design System & Visual Guidelines" section of the AI Frontend Prompt we prepared earlier.  
* Foundational Components (Examples derived from Shadcn/UI and styled for SteppersLife):  
  The Steppers Life\_ Comprehensive UI\_UX Layou.pdf showcases many UI elements. We will build or customize a core set of reusable components, including but not limited to:  
  * **Buttons:** Primary, secondary, outline, destructive, link variants; different sizes; loading states. (e.g., based on shadcn/ui/button)  
  * **Inputs & Forms:** Text inputs, textareas, checkboxes, radio groups, select dropdowns, switches, with clear labels, validation states, and error message display. (e.g., based on shadcn/ui/input, textarea, checkbox, radio-group, select, switch, label, form \[React Hook Form integration\])  
  * **Cards:** For displaying event summaries, directory listings, user profiles, etc. (e.g., based on shadcn/ui/card)  
  * **Modals/Dialogs:** For confirmations, forms, or detailed information pop-ups. (e.g., based on shadcn/ui/dialog)  
  * **Navigation Elements:** Tabs, dropdown menus, accordions. (e.g., based on shadcn/ui/tabs, dropdown-menu, accordion)  
  * **Data Display:** Avatars, badges, tooltips, skeleton loaders for loading states. (e.g., based on shadcn/ui/avatar, badge, tooltip, skeleton)  
  * The specific visual appearance and interaction behavior for these components will be dictated by the Steppers Life\_ Comprehensive UI\_UX Layou.pdf.  
* **Iconography:**  
  * As specified in the 3\. Technical Preferences for {Project Name}.md and Frontend Architecture, **Lucide React** will be the primary icon library, providing a comprehensive set of clean and consistent SVG icons. Specific icons to be used are indicated throughout the Steppers Life\_ Comprehensive UI\_UX Layou.pdf.  
* **Component Specification & Development:**  
  * While this UI/UX Specification document outlines the *approach* and visual guidelines, the detailed *technical specification* for each newly created or significantly customized component (including its props, internal state, key UI elements, styling notes, and accessibility notes) MUST follow the "Template for Component Specification" defined in the "SteppersLife.com Frontend Architecture Document (Version 1.0)".  
  * New global components will reside in src/components/ui/ or src/components/layout/, while feature-specific components will be in src/features/\[featureName\]/components/.  
* **No Separate, Formal "Design System" Document for V1 (beyond this spec and UI/UX PDF):**  
  * For V1, the Steppers Life\_ Comprehensive UI\_UX Layou.pdf combined with the Tailwind theme configuration and the collection of Shadcn/UI-based components in our codebase will effectively serve as our design system.  
  * A more formal, separately documented design system (e.g., with its own Storybook instance, detailed usage guidelines per component beyond their technical spec) can be developed in future phases if the platform's complexity and team size warrant it. For now, the focus is on building a consistent component set based on the provided visuals.

## **VII. Branding & Style Guide Basics**

The foundational branding elements and visual style for SteppersLife.com are comprehensively detailed in the Steppers Life\_ Comprehensive UI\_UX Layou.pdf. This PDF serves as the primary visual style guide.

For technical implementation, particularly for configuring Tailwind CSS, these visual guidelines will be translated into theme settings within the tailwind.config.js file, as outlined in the AI Frontend Prompt we prepared (Section 2: Design System & Visual Guidelines).

This section summarizes the key categories of branding and style elements defined in the Steppers Life\_ Comprehensive UI\_UX Layou.pdf:

* **Primary Visual Reference Document:**  
  * docs/Steppers Life\_ Comprehensive UI\_UX Layou.pdf – This document is the definitive source for all visual branding, color palettes, typography, iconography, and layout styling.  
* **Color Palette:**  
  * The Steppers Life\_ Comprehensive UI\_UX Layou.pdf visually defines the complete color palette for the platform.  
  * This includes:  
    * Primary brand colors  
    * Secondary brand colors  
    * Accent colors  
    * Destructive action colors (e.g., for warnings or delete actions)  
    * Neutral colors for backgrounds, foregrounds (text), cards, borders, and input fields.  
    * Specific color definitions for both **Light Mode** and the required **Night Mode / Dark Theme**.  
  * These colors will be mapped to Tailwind CSS theme configuration (e.g., in tailwind.config.js under theme.extend.colors).  
* **Typography:**  
  * The Steppers Life\_ Comprehensive UI\_UX Layou.pdf specifies the font families, sizes, weights, and line heights for all text elements, including headings (H1-H6), body text, button text, input field text, labels, and captions.  
  * We have decided on **Playfair Display** for headings and **Inter** for body text to achieve a "Stylish \+ professional" vibe.  
  * This establishes a clear typographic hierarchy to ensure readability and visual appeal.  
  * These typographic scales will be configured in tailwind.config.js (e.g., theme.extend.fontFamily, theme.extend.fontSize).  
* **Iconography:**  
  * As established in our technical preferences and Frontend Architecture, **Lucide React** will be the primary icon library.  
  * The Steppers Life\_ Comprehensive UI\_UX Layou.pdf provides visual examples of icons used for navigation, actions, and informational purposes throughout the application. The closest matching Lucide React icon should be used. Custom SVG icons will only be created if a suitable Lucide React icon cannot be found.  
* **Spacing & Grid:**  
  * The Steppers Life\_ Comprehensive UI\_UX Layou.pdf visually defines the principles for margins, padding, and the general grid system or layout rhythm.  
  * A base spacing unit (e.g., 4px or 8px) will be inferred from the designs and used to create a consistent spacing scale in the Tailwind CSS configuration (tailwind.config.js under theme.extend.spacing), likely starting with Tailwind's defaults and customizing if needed.  
* **Border Radius & Shadows:**  
  * Standardized border-radius values (e.g., for cards, buttons, inputs) and box-shadow styles are visually defined in the Steppers Life\_ Comprehensive UI\_UX Layou.pdf.  
  * These will be configured in tailwind.config.js (e.g., theme.extend.borderRadius, theme.extend.boxShadow), likely starting with Tailwind's defaults and customizing based on the PDF.  
* **Logo Usage:**  
  * The official SteppersLife logo, as shown in the Steppers Life\_ Comprehensive UI\_UX Layou.pdf, will be used in designated areas such as the main application header.

**Implementation Note:** All developers and AI agents MUST refer to the Steppers Life\_ Comprehensive UI\_UX Layou.pdf for visual details and ensure that components built adhere to these established branding and style guidelines. The Tailwind CSS configuration (tailwind.config.js) will be the technical translation of these visual rules.

## **VIII. Accessibility (AX) Requirements**

Accessibility is a core principle for SteppersLife.com, ensuring an inclusive experience for all users, including those with disabilities. The platform will strive to meet established web accessibility standards.

* **Target Compliance:**  
  * SteppersLife.com will aim for conformance with the **Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA**. This applies to all aspects of the platform, including both Light and Night Modes.  
* Specific Requirements & Principles (User Experience & Design Focus):  
  While the detailed technical implementation of accessibility features is outlined in the "SteppersLife.com Frontend Architecture Document (Version 1.0)" (Section X: Accessibility (AX) Implementation Details), this UI/UX Specification emphasizes the following key requirements from a design and user experience perspective:  
  1. **Perceivable:**  
     * **Text Alternatives:** All non-decorative images and meaningful visual elements MUST have clear and concise text alternatives (alt text). Icons that convey information or actions must have accessible names.  
     * **Adaptable Content:** Content MUST be structured semantically (using correct HTML5 elements) so it can be presented in different ways (e.g., by screen readers) without losing information or structure.  
     * **Distinguishable Content:**  
       * **Color Contrast:** Sufficient color contrast between text and background (at least 4.5:1 for normal text, 3:1 for large text) MUST be maintained across both Light and Night themes to ensure readability.  
       * Information MUST NOT be conveyed by color alone.  
       * Text should be resizable up to 200% without loss of content or functionality.  
  2. **Operable:**  
     * **Keyboard Accessibility:** All interactive UI components (links, buttons, form controls, custom widgets) MUST be fully operable via a keyboard alone, with a logical focus order and clearly visible focus indicators.  
     * **Sufficient Time:** Users should have enough time to read and use content. Avoid timed interactions where possible, or provide controls to adjust or extend time limits (unless the time limit is essential, e.g., a timed offer).  
     * **No Keyboard Traps:** Users must be able to navigate into and out of all sections and components using only the keyboard.  
     * **Clear Navigation:** Consistent navigation mechanisms, clear labeling, and site search functionality will aid users in finding content and orienting themselves.  
  3. **Understandable:**  
     * **Readability & Language:** Content should be written in clear, simple language, avoiding unnecessary jargon. The language of the page (English, en-US) will be programmatically set.  
     * **Predictability:** The UI should behave in predictable ways. Navigation and interactive elements should function consistently across the platform.  
     * **Input Assistance & Error Handling:** Forms should have clear labels, instructions, and provide helpful, accessible error messages when input is incorrect. Error prevention is prioritized, and recovery from errors should be straightforward.  
  4. **Robust:**  
     * **Compatibility:** Content must be robust enough to be interpreted reliably by a wide variety of user agents, including current and future assistive technologies (e.g., screen readers, screen magnifiers, voice recognition software).  
     * **Valid Code:** Adherence to web standards (HTML, CSS, ARIA) will be important for ensuring robustness.  
* **Component-Level Accessibility:**  
  * Specific accessibility considerations, including necessary ARIA attributes, keyboard interaction patterns, and focus management for custom or complex UI components, will be detailed in individual component specifications as per the template in the "SteppersLife.com Frontend Architecture Document (Version 1.0)". This aligns with our earlier recommendation to embed accessibility notes thoroughly from the outset of component design.  
* **Testing & Validation:**  
  * Accessibility will be an ongoing consideration throughout the design and development lifecycle, involving automated testing tools (e.g., Axe, Lighthouse, jest-axe), manual checks (keyboard navigation, screen reader testing for key flows), and adherence to the testing strategies outlined in the Frontend Architecture Document.

## **IX. Responsiveness**

SteppersLife.com will be developed using a **mobile-first responsive design** approach. This ensures a quality experience on smaller screens, which will then be progressively enhanced for larger viewports like tablets and desktops. All designs and implementations MUST prioritize usability and content accessibility across all supported screen sizes.

* **Breakpoints:**  
  * We will primarily utilize **Tailwind CSS's default responsive breakpoints** as a starting foundation, given its adoption in our tech stack. These are:  
    * sm: 640px  
    * md: 768px  
    * lg: 1024px  
    * xl: 1280px  
    * 2xl: 1536px  
  * These breakpoints provide a sensible range for adapting layouts from mobile to large desktop screens.  
  * Specific overrides or additions to these breakpoints can be defined in the tailwind.config.js file if detailed visual designs in the Steppers Life\_ Comprehensive UI\_UX Layou.pdf necessitate distinct layout shifts at other specific widths.  
* **Adaptation Strategy:**  
  * **Layouts:**  
    * **Mobile-First:** Designs will originate with the mobile PWA experience in mind, typically featuring single-column layouts, stacked elements, and touch-friendly navigation (e.g., the PWA Bottom Navigation Bar).  
    * **Larger Screens (Tablets, Desktops):** As screen real estate increases, layouts will adapt to utilize the available space effectively. This may include:  
      * Transitioning to multi-column grids for content like event cards or directory listings.  
      * Displaying more information on screen simultaneously (e.g., sidebars for filters or navigation in dashboards).  
      * Adjusting spacing, margins, and padding for better visual balance.  
      * The primary desktop navigation will be via the top Header.tsx component.  
  * **Components:**  
    * Individual UI components (buttons, inputs, cards, modals, etc.) will be designed to be intrinsically responsive.  
    * Tailwind CSS responsive utility classes (e.g., sm:, md:, lg:) will be extensively used to apply different styles, sizes, visibility, or layout properties based on the current breakpoint.  
  * **Touch Targets & Interactions:**  
    * On touch-enabled devices (primarily mobile), all interactive elements (buttons, links, form controls) MUST have sufficiently large touch targets (e.g., minimum 44x44 CSS pixels) to ensure ease of use.  
    * Hover interactions prominent on desktop will have suitable touch-based alternatives or will be designed such that hover is an enhancement, not a requirement for core functionality.  
  * **Text & Readability:**  
    * Font sizes, line heights, and text block widths will be managed to ensure optimal readability across all screen sizes. While the base typography is set globally, minor adjustments using responsive Tailwind utilities might be applied to headings or specific text elements for larger screens.  
  * **Images & Media:**  
    * Responsive image techniques (e.g., using \<picture\>, srcset, or ensuring CSS handles image scaling appropriately within containers) MUST be used to serve appropriately sized and optimized images for different viewports and resolutions, as detailed in the "Performance Considerations" section of the Frontend Architecture Document.  
  * **Primary Visual Reference:**  
    * The Steppers Life\_ Comprehensive UI\_UX Layou.pdf provides detailed mobile PWA layouts and, in some cases, illustrates or describes desktop adaptations (e.g., for the header and event grids). This document will be the primary guide for how specific layouts and components should adapt.  
    * Where explicit desktop views are not provided in the PDF, logical and consistent adaptations will be made, prioritizing usability, maintaining the established visual style, and ensuring a cohesive experience with the mobile design.

## **X. Change Log**

| Date | Version | Description | Author |
| :---- | :---- | :---- | :---- |
| June 1, 2025 | 1.0 | Initial collaborative draft and approval of all sections of the UI/UX Specification document. | Jane (Design Arch) |

---

This concludes the **front-end-spec.md (UI/UX Specification Document Version 1.0)**.

