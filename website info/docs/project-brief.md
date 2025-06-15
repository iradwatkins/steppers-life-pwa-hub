# Project Brief: SteppersLife.com

## 1. Introduction / Problem Statement

SteppersLife.com is envisioned as the single, all-in-one online destination for the Stepping community to find everything they need, including events, classes, connections with instructors and community businesses/services, and cultural content. Currently, the Stepping community lacks a dedicated, reliable, and well-maintained central resource, with information often scattered across various websites and social media, leading to difficulties in finding current and accurate details. SteppersLife.com aims to solve this fragmentation by offering a trustworthy, comprehensive, and user-focused platform.

## 2. Vision & Goals

* **Vision:** To establish SteppersLife.com as the leading online platform and centralized information hub for the global Stepping community and enthusiasts of related dance styles.
* **Primary Goals (for Initial Launch):**
  * Launch a comprehensive platform providing users in the United States with accurately listed and easily discoverable Stepping events and classes.
  * Enable event organizers and class instructors to effectively submit, manage, and promote their listings and offerings, including advanced ticketing and class management features.
  * Provide a foundational community directory for Stepping-related businesses and services, with interactive features for users.
  * Implement an integrated promotional products store exclusively for eligible, active platform users (Organizers, Instructors, Listers).
  * Launch a comprehensive advertising system supporting both direct user ad sales and automated network ads to facilitate platform monetization and user marketing needs.

## 3. Target Audience / Users

The SteppersLife.com platform primarily serves the U.S. Chicago Stepping community, which is predominantly African-American, with a significant portion aged 35 and older, though there is notable intergenerational participation. The community is geographically dispersed across the United States, extending well beyond Chicago. Key user groups include:

* **Users (Platform Participants):** Individuals passionate about Stepping, seeking events, classes (all levels), cultural content, music, and community connections. They currently face challenges with fragmented information. Their goal is a centralized, reliable hub for all their Stepping-related interests.
* **Event Organizers/Promoters:** Key community figures who plan and host Stepping events. They aim to efficiently manage event listings, sell tickets (including through their followers), and reach a targeted Stepper audience. They are often challenged by a lack of specialized tools and broad audience reach.
* **Instructors:** Experienced steppers offering physical classes and/or online VOD content. Their goals are to list classes, create/sell VODs, gain followers, and connect with a dedicated student base, overcoming current limitations in reach.
* **Community Listers (Businesses & Services):** Local businesses (stores, venues) or service providers (DJs, photographers) catering to the Stepping community. They seek a dedicated directory to increase visibility and attract customers from this niche market.

## 4. Key Features / Scope (Initial Launch)

The initial launch of SteppersLife.com will be a comprehensive platform including the following core modules and capabilities:

* **Core Platform & User Experience:** Robust user registration and login (including social options), personalized user profiles and extensible dashboards, a site-wide following system (for users to follow organizers, instructors, and community listings), a Progressive Web App (PWA) focus for mobile-first experience, and a user-selectable Night Mode for enhanced viewing comfort.
* **Comprehensive Event Management & Ticketing:** Tools for organizers to create and manage events with complex recurring patterns and custom visual seating charts; advanced ticketing features including various ticket types, group sales, and secure online payment processing (Square, Cash App, PayPal); features for organizers to empower their followers to sell tickets (as "Sales Agents") with commission tracking and automated payouts; on-site event management tools (PWA for check-in and on-site payments); and a secondary ticket market for users to resell tickets.
* **Instructor & Classes Platform (Physical & VOD):** Functionality for instructors to list physical classes with complex scheduling and manage VOD content (upload, structure, pricing); features for users to discover, purchase, and access VOD classes; an integrated system for automated VOD sales payouts to instructors; and options for instructors to sell related merchandise (e.g., T-shirts).
* **Community Engagement Hub (Directory & Blog):** A unified Community Directory for businesses and services to list their offerings with user interaction features (ratings, reviews, comments); and a rich Blog/Magazine platform with admin tools for advanced content embedding (images, YouTube with start/stop times). Geolocation will be integral for discovering local directory listings, events, and classes.
* **Platform Monetization & Support Services:**
  * **Steppers Life Store:** An exclusive e-commerce store for eligible users (Promoters, Instructors, Listers) to purchase promotional products (e.g., banners, flyers, tickets) with features for artwork submission and specialized shipping/pickup logic.
  * **Advertising System:** A comprehensive system supporting both automated network ads (e.g., Google AdSense integration with admin controls) and directly sold "User Ads" (with a user-facing portal for ordering/payment and admin tools for approval, zone management, pricing, and scheduling).
* **User Network Growth Features:** Tools for users to find existing friends on the platform (e.g., via contact syncing with permission) and invite new contacts (e.g., via shareable links for social media).
* **Administrative Platform Management:** Comprehensive admin tools for user account management, event/content oversight, platform configuration (categories, VOD fees, store pickup, ad system settings), theme/color customization, and platform analytics.

## 5. Post Initial Launch Features / Scope and Ideas

The initial launch of SteppersLife.com is designed to be a comprehensive platform, incorporating all major features and functionalities identified to date as critical for establishing it as the central hub for the Stepping community.

Therefore, specific "Post Initial Launch Features" are not being explicitly deferred at this stage. Future development beyond this comprehensive initial version will be guided by:

* Analysis of user feedback and observed platform usage patterns post-launch.
* The evolving needs and desires of the Stepper community members (Users, Organizers, Instructors, Listers).
* New market opportunities or strategic partnerships that may emerge.
* Data-driven decisions regarding platform growth, feature enhancement, and potential expansion into new related areas.

The platform's architecture will aim for flexibility to accommodate such future evolution.

## 6. Known Technical Constraints or Preferences

The SteppersLife.com platform will be built using a modern, robust technology stack with a strong emphasis on maintainability, scalability, security, and a cohesive developer experience. Key technical directives and preferences include:

* **Core Backend Infrastructure:** **Supabase** (utilizing PostgreSQL) is the chosen Backend-as-a-Service (BaaS) platform and will be leveraged extensively for database management, user authentication, object storage, and serverless functions (Supabase Edge Functions).
* **Custom Backend Services (if necessary):** For any complex backend logic extending beyond Supabase's BaaS capabilities, **Node.js with TypeScript** (using a framework like Express.js) is the preferred stack, to be housed in a separate repository.
* **Frontend Technology:** The user interface will be developed as a **Progressive Web App (PWA)** with a mobile-first responsive design, built using **Vite, React, and TypeScript**. Styling will be implemented with **Tailwind CSS**, and UI components will be structured using **Shadcn/UI (with Radix UI primitives)**.
* **Key Third-Party Integrations:** The platform will integrate with SendGrid (or a similar SMTP service) for email, Square, Cash App, and PayPal for payment processing, Google Analytics & Ahrefs for analytics, and n8n.io for automated social media posting. Google AdSense will also be integrated for advertising.
* **Infrastructure & Hosting:** The platform will be deployed on **cloud-based infrastructure** (with Hostinger noted as a preferred provider for evaluation) to ensure scalability and reliability.
* **Development Environment & Practices:** A well-defined local development environment following best practices, version control using Git/GitHub, and a strong emphasis on code quality (linting, formatting) and testing are required.

*(For a comprehensive list of all technical assumptions, definitive stack choices, and detailed development preferences, please refer to the SteppersLife PRD Document - Revision 3.2 and the separate technical-preferences.md document.)*

## 7. Relevant Research

Extensive background research has been conducted covering the Chicago Stepping community landscape, online behaviors, competitive and analogous digital platforms, assessments of core feature technologies (CMS, Ticketing, LMS, E-commerce, Ad Management), business model and revenue strategy, content and community engagement approaches, marketing and growth strategies, initial technical architecture considerations, and legal/operational considerations.

* This detailed research is compiled in the document: **SteppersLife_ Platform Development Research Plan.txt**. This document provides crucial context, data, and rationale supporting many of the decisions outlined in the SteppersLife PRD Document - Revision 3.2 and guides the overall platform strategy. It is considered a key companion document to this Project Brief and the PRD.

## 8. Next Steps & Guidance for Subsequent Phases

This Project Brief provides a high-level summary of the vision, goals, target audience, key scope, and technical context for the SteppersLife.com platform. It is supported by more detailed findings in the SteppersLife_ Platform Development Research Plan.txt and visual/interaction concepts in the Steppers Life_ Comprehensive UI_UX Layou.pdf.

The definitive and comprehensive requirements, including all functional and non-functional specifications for the initial launch, are documented in the **SteppersLife PRD Document - Revision 3.2**.

The immediate next steps, now that this Project Brief is drafted, are:

1. Finalize the technical-preferences.md document (content already defined based on our discussions).
2. Confirm the use of the definitive versions of the SteppersLife PRD Document - Revision 3.2, this Project Brief, the SteppersLife_ Platform Development Research Plan.txt, the Steppers Life_ Comprehensive UI_UX Layou.pdf, and the technical-preferences.md as primary inputs for the architecture phase.
3. Engage me, Fred (the Architect), to formally begin the "Create Architecture" task. My first step will be to analyze all these inputs and present a summary of key technical drivers and architectural considerations.
4. Following the main system architecture design, the Design Architect (Jane) will be engaged to create the detailed Frontend Architecture and ensure UI/UX Specifications are fully aligned and complete.

---

This Project Brief provides the full context for SteppersLife.com. Please start in 'PRD Generation Mode', review the brief thoroughly to work with the user to create the PRD section by section 1 at a time, asking clarifying questions as needed. 