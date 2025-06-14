Markdown

**\*\*(Start of PRD Document \- Updated by John, PM AI & User)\*\***

**\*\*Document Purpose:\*\*** This Product Requirements Document (PRD) for \`stepperslife.com\` (Initial Launch Version) outlines the features, functionalities, and requirements for the platform. This version consolidates previous drafts and integrates extensive clarifications and new requirements based on recent discussions.

**\*\*Current Status (As of Saturday, May 31, 2025):\*\***  
This document reflects discussions between the User and John (PM AI), building upon previous work (including "Revision 2" attributed to User and Gemini AI Asst.). Key recent decisions and clarifications incorporated into this version include:  
\* **\*\*Scope Confirmation:\*\*** All features discussed, including those previously considered "Post MVP," are now IN SCOPE for the initial comprehensive product launch. The timeline is flexible to accommodate this full scope. The "Out of Scope Ideas Post MVP" section has been removed.  
\* **\*\*User Definitions:\*\*** User Persona Summaries and Role-Specific Needs Summaries have been added.  
\* **\*\*Market Context:\*\*** Quantitative data regarding the U.S. Stepper community size and event volume has been included.  
\* **\*\*Geolocation:\*\*** Explicit Initial Launch requirements for robust geolocation features (local discovery and manual search) have been added for Events and Classes.  
\* **\*\*Advertising System:\*\*** A comprehensive Advertising System (supporting both direct "User Ad" sales and Google AdSense integration) has been defined as an Initial Launch functional requirement.  
\* **\*\*Theme & Display:\*\*** Admin Theme/Color Customization and User-selectable Night Mode functionalities have been added.  
\* **\*\*Content Strategy:\*\*** A high-level summary of content strategy has been noted for inclusion.  
\* **\*\*User Journeys:\*\*** High-level summaries of five critical user journeys have been added.  
\* **\*\*Non-Functional Requirements:\*\*** Enhanced with specific details for performance, security (including U.S. data privacy, PCI DSS, DMCA, security testing), reliability (backups, DR, fault tolerance, error handling, maintenance/support), and image optimization.  
\* **\*\*Technical Guidance:\*\*** Clarifications for infrastructure, development environment, and specific focus areas for the Architect (performance, security, complexity/risk) have been noted.

**\*\*Immediate Next Steps (Conceptual \- for User and AI Agent):\*\***  
Following the finalization of this PRD (Revision 3.2):  
1\.  The "Epic Overview" section requires substantial detailing to break down all in-scope features into Epics and User Stories with Acceptance Criteria. This is a critical subsequent task.  
2\.  Once the PRD (including detailed Epics/Stories) is stable, proceed to engage the Architect agent to create the system architecture.  
3\.  Subsequently, engage the Design Architect for frontend architecture and detailed UI/UX specifications based on this PRD and the \`Steppers Life\_ Comprehensive UI\_UX Layou.pdf\`.

\---

\# stepperslife.com Product Requirements Document (PRD) \- Initial Launch (Revision 3.2)

\#\# Goal, Objective and Context

**\*\*Goal:\*\*** To establish \`stepperslife.com\` as the leading online platform and centralized information hub for the global Stepping community and enthusiasts of related dance styles.

**\*\*Objective:\*\*** The primary objective for the initial launch of \`stepperslife.com\` is to provide users with accurately listed and easily discoverable Stepping events and classes, initially focusing on the **\*\*United States\*\***, enabling core groups of event organizers and class instructors to submit and manage their listings effectively, and providing foundational community directory, an integrated promotional products store, and a comprehensive advertising system. The launch date is flexible to accommodate the full scope of all discussed features.

**\*\*Context:\*\*** The Stepping community currently lacks a dedicated, reliable, and well-maintained central resource for event and class information. Details are often scattered, leading to difficulties in finding current and accurate information. \`stepperslife.com\` aims to solve this by offering a trustworthy, user-focused platform. The U.S. Stepping community is estimated to include about half a million participants, with approximately 20,000 events held annually. SteppersLife.com initially focuses on this national U.S. market, aiming to be a central hub for users from small towns to big cities, especially beneficial for those seeking information when traveling.

\#\#\# Target User Personas (Summary)  
*\*(This section was drafted based on user input and the SteppersLife\_ Platform Development Research Plan.txt)\**  
\* **\*\*Users (Platform Participants):\*\***  
    \* **\*\*Description:\*\*** Individuals who join SteppersLife.com. They might be active dancers, enthusiasts learning about the culture, students seeking classes, or simply looking for Stepping events and community connections.  
    \* **\*\*Goals:\*\*** To easily find and attend Stepping events and classes; to learn about Stepping culture, history, and music; to consume content from the digital magazine; to **\*\*follow\*\*** Event Organizers, Instructors, and Community (Businesses/Services) listings to stay updated.  
    \* **\*\*Pain Points:\*\*** Difficulty finding comprehensive and reliable Stepping information due to current market fragmentation; a desire for a central hub for all their Stepping-related interests.

\* **\*\*Event Organizers/Promoters:\*\***  
    \* **\*\*Description:\*\*** Key community figures or groups who plan, host, and promote Stepping events. They can build a list of **\*\*followers\*\*** on the platform.  
    \* **\*\*Goals:\*\*** To efficiently create and manage event listings; to sell tickets through a reliable system; to empower their **\*\*followers\*\*** by assigning them roles (e.g., to sell tickets or act as event staff); to manage ticket sales made by these designated **\*\*followers\*\*** and handle any related commissions; to reach a targeted Stepper audience.  
    \* **\*\*Pain Points:\*\*** Lack of integrated tools designed for their specific event management and sales needs, especially for managing team/follower-based sales; difficulty in effectively reaching the broader Stepping community.

\* **\*\*Instructors:\*\***  
    \* **\*\*Description:\*\*** Experienced steppers offering dance instruction. They can be followed by **\*\*Users\*\*** and may also be Organizers/Promoters.  
    \* **\*\*Goals:\*\*** To list their physical classes (location, schedule, level, cost); to create, host, market, and sell online video (VOD) classes; to gain **\*\*followers\*\*** and connect with a dedicated student base.  
    \* **\*\*Pain Points:\*\*** Limited reach for attracting students to physical classes or VOD offerings; absence of a dedicated platform focused on Stepping instruction.

\* **\*\*Community Listers (Businesses & Services):\*\***  
    \* **\*\*Description:\*\*** Local businesses (e.g., stores, venues) or service providers (e.g., DJs, photographers) catering to or wishing to engage with the Stepping community. **\*\*Users\*\*** can **\*\*follow\*\*** these listings.  
    \* **\*\*Goals:\*\*** To list their business or service in a dedicated, visible directory; to connect with and attract customers from the Stepping community.  
    \* **\*\*Pain Points:\*\*** Few effective, centralized channels to promote their offerings directly to this niche audience.

\#\#\# Key User Role Needs & Platform Solutions  
*\*(This section was drafted based on user input and the SteppersLife\_ Platform Development Research Plan.txt)\**  
SteppersLife.com aims to address the distinct needs of its core user groups by providing:

\* **\*\*For Users (Platform Participants):\*\***  
    \* **\*\*Need:\*\*** A single, comprehensive platform to discover Stepping events, classes, cultural content, community news, and to **\*\*follow\*\*** Organizers, Instructors, and Community (Business/Service) listings.  
    \* **\*\*Solution:\*\*** An integrated platform with robust search/discovery, content features, and a system for following preferred entities.

\* **\*\*For Event Organizers/Promoters:\*\***  
    \* **\*\*Need:\*\*** Efficient tools for event creation, ticketing, and management, including the ability to build a **\*\*follower\*\*** base and assign roles to selected **\*\*followers\*\*** to help sell tickets or assist with event operations, along with mechanisms to track these sales and manage related commissions.  
    \* **\*\*Solution:\*\*** A dedicated dashboard with comprehensive event management, ticketing, and tools for Organizers to manage and empower their **\*\*followers\*\*** with specific roles (e.g., "Sales Agent" as detailed in functional requirements).

\* **\*\*For Instructors:\*\***  
    \* **\*\*Need:\*\*** A platform to list physical classes, build a **\*\*follower\*\*** base, and effectively create, host, monetize, and market online video courses to a dedicated Stepping audience.  
    \* **\*\*Solution:\*\*** An integrated Learning Management System (LMS) with features for class/VOD listings, sales, and instructor **\*\*follower\*\*** engagement.

\* **\*\*For Community Listers (Businesses & Services):\*\***  
    \* **\*\*Need:\*\*** A visible, dedicated directory to list and promote their offerings, allowing **\*\*Users\*\*** to **\*\*follow\*\*** them for updates.  
    \* **\*\*Solution:\*\*** A unified "Community Directory" for managing listings and engaging with interested **\*\*Users\*\***.

\#\# Functional Requirements (Initial Launch)

**\*\*All features and functionalities detailed below are considered critical and essential for the successful initial launch of SteppersLife.com.\*\***

\#\#\# Initial User Dashboard & Role Activation  
\* **\*\*U.1. Generic User Dashboard:\*\*** Upon first sign-up, users have a basic dashboard.  
\* **\*\*U.2. "Post" Functionality:\*\*** A prominent "+ Post" (or similar) button on the generic dashboard.  
\* **\*\*U.3. Content Creation Options:\*\*** Clicking "Post" reveals options such as: "Post an Event," "List a Physical Class," "Offer a VOD Class," "List Your Service," "List Your Store."  
\* **\*\*U.4. Dashboard Extension:\*\*** Upon successful submission of content (e.g., first event, class, service/store listing), the user's dashboard dynamically extends to include the relevant management tabs and features for that new role/content (e.g., Promoter Dashboard, Instructor Dashboard sections appear).  
\* **\*\*U.5. User-Selectable Night Mode:\*\***  
    \* The platform must offer at least two themes: a standard (light) theme and a "Night Mode" (dark) theme.  
    \* End-users must have an easily accessible control (e.g., a toggle switch in the site header or within their user settings) to switch between these themes.  
    \* The user's selected theme preference should be saved and applied consistently during their sessions.  
    \* Both themes must adhere to accessibility guidelines for contrast and readability.

\#\#\# A. Event Creation & Setup (for Organizers/Promoters)  
*\*(Organizer & Promoter are used interchangeably)\**  
\* **\*\*A.1. Event Creation Interface:\*\*** Organizers to have a clear, intuitive interface (likely in their Organizer Dashboard section) to initiate new event listings.  
\* **\*\*A.2. Essential Event Details:\*\*** Organizers can define:  
    \* Event Title, Detailed Description (rich text), Date(s) & Time(s) (single, multi-day, **\*\*including complex recurring patterns like weekly, bi-weekly, monthly, specific days of the month\*\***), Venue/Location (physical address or "Online" with link fields).  
    \* Selection from Hyper-Specific Event Categories (Admin-managed).  
    \* **\*\*Event Images/Banners (Enhanced):\*\*** Upload up to three images. System provides recommended dimensions/aspect ratios, optimal for social media (e.g., Square 1080x1080px, Horizontal Rectangle 1080x566px or 1200x630px). System offers preview for how uploaded images (including common 4x6 flyers) might appear/crop.  
\* **\*\*A.3. Ticketing Configuration:\*\***  
    \* A.3.1. Ticket Types: Define multiple types (e.g., "General Admission," "VIP").  
    \* A.3.2. Pricing & Quantity: Set price, currency, and available quantity per ticket type.  
    \* A.3.3. Sales Period: Define general sales start/end dates/times per ticket type.  
    \* A.3.4. Group Tickets: Ability to set up group ticket options.  
    \* A.3.5. Pre-Sale Configuration (Optional): Define a pre-sale period (start/end date/time) for specific ticket types or tables (Initial Launch pre-sale is time-gated).  
\* **\*\*A.4. Seating Configuration (Initial Launch \- Table & Section/Block Focus, plus Visual Seating Chart Builder):\*\***  
    \* A.4.1. Seating Type Definition: General Admission, Table-based, Section/Block-based, **\*\*or Fully Custom Visual Seating Chart (user-configurable with various row types, seat numbering, ADA designations, etc.)\*\***.  
    \* A.4.2. Table Configuration: Define total tables, table name/number, capacity, price for entire table OR individual seats at table.  
    \* A.4.3. Section/Block Configuration: Define named sections, capacity, price per seat.  
    \* A.4.4. Basic Inventory Management for Tables/Sections.  
    \* A.4.5. Seat Blocking (Simplified Initial Launch): Mark entire tables or blocks as "unavailable".  
\* **\*\*A.5. Attendee Information Collection:\*\*** Organizers confirm standard information to collect (name, email) **\*\*and can add custom questions to the registration form\*\***.  
\* **\*\*A.6. Event Review & Publishing:\*\*** Organizers can save drafts and publish live.  
\* **\*\*A.7. Event Claiming Workflow (for Organizers & Admins):\*\***  
    \* A.7.1. Admin-Uploaded Generic Events: Admins can upload events not initially tied to a promoter.  
    \* A.7.2. Promoter Event Claim: Promoters can view unclaimed admin-uploaded events and submit a "claim" request.  
    \* A.7.3. Admin Approval for Claims: Admins review and approve/reject claims. Approved claims link event to promoter's page/dashboard.  
    \* A.7.4. Automated Claim Notification: If admin uploads an event with a known promoter's name in details, that promoter receives an "Is this your event?" notification. Confirmation links the event (potentially with admin review).  
\* **\*\*A.8. Admin Event Setup for Promoters:\*\*** Admins can directly create an event and assign it to a specific promoter.

\#\#\# B. Ticketing & Registration Operations  
\* B.1. Public Event Listing Page: Each published event has a publicly accessible detail page.  
\* B.2. Secure Online Ticket Sales: Platform facilitates secure checkout via **\*\*Square, Cash App, or PayPal\*\***. **\*\*On-site payment processing via PWA/app by Organizers/Staff using these gateways is also required.\*\***  
\* B.3. E-Ticket Delivery: Automatic issuance and delivery of digital tickets (with unique QR codes) via email and user dashboard.  
\* B.4. Basic Order Confirmation: On-screen and/or email confirmation after purchase.  
\* B.5. Real-time Inventory Management: Prevents overselling.  
\* B.6. Promo Codes/Discount Codes: Organizers can create and manage basic discount codes (percentage off, fixed amount off).  
\* B.7. Basic Refund/Cancellation Handling (Organizer-Initiated): Organizers can process refunds or manage cancellations.  
\* **\*\*B.8. Unified Cash/Direct Payment Workflow (Initial Launch):\*\***  
    \* B.8.1. Mandatory User Registration for buyers/recipients.  
    \* B.8.2. Order Initiation & "Pay Directly" Selection by buyer (via Organizer/Sales Agent link).  
    \* B.8.3. System Generates 5-Digit Code for Seller & Alerts seller.  
    \* B.8.4. Provisional Inventory Hold for **\*\*4 hours\*\***.  
    \* B.8.5. Cash Payment & Code Transfer from Seller to Buyer.  
    \* B.8.6. Buyer Validates Ticket/Order with Code in their \`stepperslife.com\` user account ("Ticket Pending Verification" section).  
    \* B.8.7. Transaction Finalization, E-ticket Issuance, Inventory Update, Sale Attribution upon successful code entry.  
    \* B.8.8. Automatic Order Cancellation if code not entered in 4 hours.  
    \* B.8.9. System-generated transaction codes (no personal pre-set codes).

\#\#\# C. Event Promotion & Marketing (for Organizers)  
\* C.1. Social Media Sharing Links on event pages.  
\* C.2. Public Event URL: Clean, shareable URL.  
\* C.3. Email Tools (for Organizers): Send email updates/reminders to their ticket purchasers, **\*\*including advanced promotional tools like email marketing integration and segmentation.\*\***  
\* C.4. Organizer Event Collections/Listings page.  
\* C.5. Organizer's Event Sales QR Code: Generate QR code linking to ticket sales page.  
\* C.6. Automated Platform Social Media Posting (to \`stepperslife.com\` accounts via n8n.io): Includes one free post for new organizers, then paid model. *\*(Details for UI/UX and exact mechanism TBD)\**.

\#\#\# D. On-Site Event Management (via PWA for Organizers/Staff \- Initial Launch)  
\* D.1. Organizer On-Site PWA: For on-site operations, accessible on mobile browsers.  
\* D.2. Secure PWA Login for Organizers & authorized staff/followers (role-based for specific event).  
\* D.3. Attendee Check-in via PWA (QR Code Scanning): Scan QR codes, prevent duplicates, real-time status.  
\* D.4. View Attendee List in PWA: Access, search, filter attendee list, view check-in status.  
\* D.5. Basic Event Statistics in PWA (Live): Simple view of total sold vs. checked-in.  
\* **\*\*D.6. On-Site Payment Processing:\*\*** The PWA must support on-site ticket sales and other payments using integrated payment gateways (Square, Cash App, PayPal).

\#\#\# E. Reporting & Analytics (for Organizers)  
\* E.1. Event Performance Dashboard (Per Event).  
\* E.2. Key Metrics: Total tickets sold (by type), gross revenue, attendees checked-in, basic sales trends, overview of sales channels. **\*\*Includes advanced analytics and reporting capabilities.\*\***  
\* E.3. Attendee Information Report: View and export (CSV) attendee list with registration info, ticket type, purchase date, check-in status.

\#\#\# F. Organizer's Team/Follower Management & Sales (Initial Launch)  
\* F.1. Organizer "Follower" System: Users can follow Organizers; Organizers see their follower list.  
\* F.2. Follower Role & Permission Management (by Organizer):  
    \* F.2.1. Management Interface in Organizer dashboard.  
    \* F.2.2. Assignable Roles: "Sales Agent" and "Event Staff (Scanner)".  
    \* F.2.3. Scope: Roles global or per-event.  
    \* F.2.4. Revoking Permissions.  
\* F.3. "Sales Agent" Functionality (Promoting Organizer's General Inventory):  
    \* F.3.1. Commission Configuration by Organizer (default and individual overrides).  
    \* F.3.2. Activating Sales Agents for an event.  
    \* F.3.3. Generation of Trackable Sales Links/Codes. *\*(Vanity URLs to be detailed)\**.  
    \* F.3.4. Sales Attribution.  
    \* F.3.5. Sales Agent Social Media Sharing Tool (get event images & unique link).  
\* F.4. Sales & Commission Tracking (Organizer View for F.3 Sales): Dashboard with metrics per Sales Agent, data export, manual "Paid" marking. **\*\*Automated payout system for Sales Agent commissions.\*\***  
\* F.5. "Event Staff (Scanner)" Functionality: Access PWA with event-specific limited permissions.  
\* F.6. Organizer Invites Sales Agent Follower to Pre-Buy Table: Invitation, special price setting, follower accepts/declines & purchases (can use B.8 cash workflow or external settlement).  
\* F.7. Sales Agent Follower \- Managing & Selling from Pre-Bought Table Inventory:  
    \* F.7.1. Sales Agent Table Inventory Dashboard.  
    \* F.7.2. Pricing: Followers sell at standard retail price set by Organizer.  
    \* F.7.3. Selling via Online Payments (using trackable link).  
    \* F.7.4. Handling Direct Payments/Cash Sales (using B.8 workflow).  
    \* F.7.5. "Claim Code" System for complimentary/offline-settled tickets from Follower's inventory.  
    \* F.7.6. Inventory Management for Follower's Tables.  
    \* F.7.7. Basic Sales Reporting for Follower's Table Inventory.

\#\#\# G. Attendee Experience & Ticket Management (Initial Launch)  
\* **\*\*G.1. User Registration & Login:\*\*** Standard (Email/password), Social Logins (Google, Facebook).  
\* **\*\*G.2. Event Discovery & Viewing:\*\*** Users can discover events by: Browse Hyper-Specific Event Categories, keyword search, and **\*\*location-based search (e.g., finding events 'near me' via browser geolocation with permission, or by manually searching/filtering by city, zip code, or region).\*\*** Detailed Event Pages are available.  
\* **\*\*G.3. Ticket Purchasing Process:\*\***  
    \* G.3.1. Interactive Seat/Table Selection (clear way to select from available tables/seats for Initial Launch, including from a **\*\*fully custom visual seating chart if configured by the organizer\*\***). Visual differentiation of seat status. Updates cart.  
    \* G.3.2. Cart/Order Summary.  
    \* G.3.3. Secure Checkout (Square, Cash App, PayPal or B.8 Cash Workflow).  
\* **\*\*G.4. Attendee Account Dashboard:\*\***  
    \* G.4.1. View Purchased Tickets (upcoming/past, with QR codes).  
    \* G.4.2. Manage "Pending Direct Payment" Tickets (enter 5-digit verification code).  
    \* G.4.3. Basic Profile Management (name, contact email).  
    \* G.4.4. Password Reset/Recovery.  
    \* G.4.5. Following Organizers/Instructors, **\*\*and Community (Businesses/Services) listings\*\***.

\#\#\# H. Administrative Platform Management (for \`stepperslife.com\` Staff \- Initial Launch)  
\* H.1. User Account Management (Admin): View/search users, view details, manually verify/approve Organizer accounts, manage Instructor VOD subscriptions, suspend/deactivate accounts, assist password resets.  
\* H.2. Platform Analytics & Reporting (Admin Dashboard \- Initial Launch): Macro view (total users, organizers, events, tickets, VOD subscriptions), "Top 10" lists, basic date filtering. **\*\*Includes advanced analytics capabilities.\*\***  
\* H.3. Event Oversight & Management (Admin \- Initial Launch): View all events, search/filter, view details, unpublish/suspend/remove, feature/highlight events. Manage event claims.  
\* H.4. Content Management (Basic \- for Platform-Owned Static Content \- Initial Launch): Manage static pages (About Us, Contact Us, ToS, Privacy Policy, FAQ) via rich text editor.  
\* H.5. Basic Platform Configuration (Admin \- Initial Launch): Manage Hyper-Specific Event Categories & Class Categories (add, edit, deactivate, reorder). Manage essential site settings. Manage VOD hosting fee amount & introductory offer toggle. Manage pickup locations for store.  
\* **\*\*H.6. Admin Theme/Color Customization:\*\***  
    \* Administrators can customize the colors for key website elements, including (but not limited to): Primary button colors, Secondary button colors, Main site background color, Header and footer background colors, Default text link colors.  
    \* The admin interface for this customization will allow selection via color picker tools, from a set of predefined color palettes/themes (provided by SteppersLife), and by direct hex color code input.  
    \* A default color scheme will be available, and Administrators must be able to easily reset any customizations back to this default.

\#\#\# I. Blog Management (Initial Launch)  
\* **\*\*I.1. Admin Interface to Create, Edit, Publish, and Manage Blog Posts:\*\***  
    \* Admins must have a rich text editor or similar interface for creating and editing blog post content.  
    \* This interface must support:  
        \* Standard text formatting (headings, bold, italics, lists, etc.).  
        \* **\*\*Embedding images\*\*** directly within the post content.  
        \* **\*\*Embedding videos from YouTube (by pasting a URL).\*\***  
            \* **\*\*The YouTube embedding feature must allow the Admin to specify custom start and stop times for the video playback.\*\***  
        \* Assigning categories and tags to posts.  
        \* Setting a **\*\*featured image (cover picture)\*\*** for each post.  
    \* Admins must be able to save drafts, schedule posts for future publication, publish posts immediately, and unpublish or delete posts.  
\* I.2. Public-facing Blog Page: List of posts (chronological, by category/tag), individual post view with comments (if Initial Launch).

\#\#\# J. Community Directory: Stores (Initial Launch)  
*\*(Combined with Services under "Community" Section)\**  
\* **\*\*J.1. Store Listing Submission (by Store Owners):\*\*** Store Name, Category (search-as-you-type from admin list, suggest new), Description, Contact Info (email/phone encouraged, website/social optional), Location (Physical Address or Online-Only), Operating Hours (optional), Images (optional), Keywords/Tags (optional).  
\* **\*\*J.2. Attendee Experience:\*\***  
    \* Browse/Search Stores via "Community" section.  
    \* Filter by category, **\*\*location (city, zip, near me)\*\***, potentially ratings.  
    \* View Store Listing Detail Page (all submitted info \+ user-generated content).  
\* **\*\*J.3. User-Generated Content for Stores:\*\***  
    \* Five-Star Ratings (listings start at 5 stars by default).  
    \* Reviews Section.  
    \* Comments Section.  
\* **\*\*J.4. Admin Management:\*\*** Manage store categories, approve category suggestions, moderate listings/reviews/comments.  
\* **\*\*J.5. Advanced Directory Features:\*\*** (e.g., "Angie's List" style features for hiring, on-platform job tracking, payments, advanced ratings).

\#\#\# K. Community Directory: Services (businesses) (Initial Launch)  
*\*(Combined with Stores under "Community" Section)\**  
\* **\*\*K.1. Service Listing Submission (by Service Providers):\*\*** Business Name, Service Category (search-as-you-type from admin list, suggest new), Description of Services, Contact Info (email/phone encouraged, website/social optional), Location (Physical Address, Online-Only option, Service Area notes), Operating Hours (optional), Images/Portfolio (optional), Keywords/Tags (optional).  
\* **\*\*K.2. Attendee Experience:\*\***  
    \* Browse/Search Services via "Community" section.  
    \* Filter by category, **\*\*location (city, zip, near me)\*\***, potentially ratings.  
    \* View Service Listing Detail Page (all submitted info \+ user-generated content).  
\* **\*\*K.3. User-Generated Content for Services:\*\***  
    \* Five-Star Ratings (listings start at 5 stars by default).  
    \* Reviews Section.  
    \* Comments Section.  
\* **\*\*K.4. Admin Management:\*\*** Manage service categories, approve category suggestions, moderate listings/reviews/comments.  
\* **\*\*K.5. Advanced Directory Features:\*\*** (As per J.5).

\#\#\# L. Classes Module (Initial Launch)  
\* **\*\*L.0. General Instructor Features:\*\***  
    \* L.0.1. Instructors have followers.  
    \* L.0.2. Instructor Profile includes editable contact info for workshop/hiring inquiries.  
    \* L.0.3. Instructors get lists of attendees for their VOD classes.  
\* **\*\*L.1. Physical Class Listings (Instructor \- Free Tier):\*\***  
    \* L.1.1. "Add Class" button on Instructor Profile Page section of their dashboard.  
    \* L.1.2. Create/Edit Physical Class/Workshop Form: Class Type (Regular Class / Workshop), Title, Level (Beginner, Intermediate, Advanced, Footwork), Location (Venue, Address), Schedule (Single Date / **\*\*Complex Weekly/Monthly Recurring Patterns\*\***), Start/End Time, Frequency Notes), Cost (Free or Price set by Instructor), Capacity (optional), RSVP/Interest Tracking Recommended (toggle), Class Image/Flyer (optional), Specific Class Contact (encouraged email/phone, defaults to profile), What to Bring/Wear (optional), Prerequisites (optional), Extras/Notes (optional).  
    \* L.1.3. Instructors can list unlimited physical classes/locations/times.  
    \* L.1.4. Class Validity Notification System: Periodic notifications to instructors to re-confirm active status of ongoing physical classes; auto-deletion if not confirmed. (UI for instructor confirmation and admin oversight).  
    \* L.1.5. PWA Push Notifications (for Instructors of Physical Classes): Ability to send reminders, cancellation, or reschedule notifications to attendees who RSVP'd/expressed interest.  
    \* L.1.6. Attendee "Interest List" for Physical Classes: Instructors can view a list of users who indicated "I want to attend" (for gauging interest, not formal attendance).  
    \* **\*\*L.1.7. Class Discovery for Attendees:\*\*** Attendees can discover physical classes by: Browse categories, levels, instructor, keyword search, and **\*\*location-based search (e.g., finding physical classes 'near me' or in specified cities/regions).\*\***  
\* **\*\*L.2. Instructor Setup for Paid VOD Classes (Instructor \- Paid Tier):\*\***  
    \* L.2.1. Requires $40/month Steppers Life VOD hosting fee (editable by admin, with admin-toggleable intro offer). UI for instructor to subscribe/manage this.  
    \* L.2.2. Interface to Create/Edit VOD Class Series: Title, Description.  
    \* L.2.3. Structure VOD Class: Define sections (if any), assign Levels (Beginner, Intermediate, Advanced, Footwork) to class or sections.  
    \* L.2.4. Video Management: Upload self-hosted videos (platform optimizes/compresses), order videos within class/sections.  
    \* L.2.5. VOD Class Pricing: Instructors set their own price (minimum $40, editable by instructor).  
\* **\*\*L.3. Attendee Purchasing & Access for Paid VOD Classes:\*\***  
    \* L.3.1. UI for attendees to browse, filter (by level/category, **\*\*location if relevant for instructor/style\*\***), and view details of VOD classes.  
    \* L.3.2. UI for attendees to purchase access to VOD classes or specific levels within them.  
    \* L.3.3. UI for attendees to access and view VOD content they have purchased (access control by level).  
    \* **\*\*L.3.4. Automated Payout System for VOD Sales:\*\*** System to handle payouts to instructors for VOD class sales (net of platform fees).  
\* **\*\*L.4. Steppers Life Store \- Promotional Products (Initial Launch \- for eligible roles):\*\***  
    \* L.4.1. Exclusive Access: Visible only to users with active roles (Promoters, Instructors, Service/Store Listers). General users/followers do not see these products or prices. Sales Agents (who only sell tickets) also do not get access unless they have another qualifying role.  
    \* L.4.2. Product Catalog: Simple promotional products (e.g., Business Cards, Banners, Flyers, Tickets, Wristbands, Lawn Signs). Categories managed by Admin.  
    \* L.4.3. Product Information (Admin managed): Name, Description (incl. specs, quantity included), Special Price (for eligible roles), Artwork Requirements (standardized \- e.g., up to 2 files, common types like PDF/JPG/PNG/AI/PSD, design guidelines provided as static info/tooltip).  
    \* L.4.4. Artwork Submission (User):  
        \* Upload container always visible on product page for eligible users. Supports drag & drop and file browse.  
        \* User can checkout without uploading artwork.  
        \* If no artwork uploaded, post-checkout message and dedicated follow-up email instructs user to email artwork to \`\[artwork@stepperslife.com\]\` referencing order number.  
        \* User can add a "Note" to their order regarding artwork/customization.  
    \* L.4.5. Fulfillment: By Steppers Life. Manual check of artwork files.  
    \* L.4.6. Pricing & Shipping (Admin managed): Admin sets Base Product Price (special price) and a separate Shipping Price.  
    \* L.4.7. Checkout Logic (User):  
        \* Non-Chicago users: Price \= Base Product Price \+ Shipping Price.  
        \* Chicago users: Offered choice of Pickup (Price \= Base Product Price) OR Ship (Price \= Base Product Price \+ Shipping Price). Pickup address(es) in Chicago managed by Admin.  
    \* L.4.8. Access Point: Eligible users access via "Promotional Materials" section in their User Dashboard. Page shows categories, products under them, and is searchable.  
\* **\*\*L.5. T-Shirt Sales (Instructor Merchandise \- VOD related):\*\***  
    \* L.5.1. Steppers Life provides/designs T-shirts.  
    \* L.5.2. Instructors (likely those on paid VOD plan) can opt to sell these via their profile/class pages.  
    \* L.5.3. Instructors set their selling price (e.g., $35). Steppers Life has a fixed portion (e.g., $10, representing cost \+ platform fee). Both prices editable (instructor sets retail, admin sets base/platform cut).  
    \* L.5.4. UI for instructor to select designs and set prices. UI for attendees to purchase.

\#\#\# M. Other Initial Launch Features  
\* **\*\*M.1. Vanity URLs:\*\*** For Organizers and Sales Agent followers. *\*(UI for request/management TBD)\**.  
\* **\*\*M.2. Email System Integration:\*\*** SendGrid or SMTP for all platform emails (transactional, notifications, marketing if any for Initial Launch).  
\* **\*\*M.3. Secondary Ticket Market (StubHub-like functionality):\*\*** Platform to facilitate users reselling tickets they have purchased. *\*(Details of commission structure, transfer process, and fraud prevention TBD)\**.

\#\#\# X. Advertising System (Initial Launch)  
*\*(This new section details the Advertising System requirements based on recent discussions)\**  
The SteppersLife.com platform will incorporate an advertising system to generate revenue and provide marketing opportunities for users. This system will support both automated network ads (e.g., Google AdSense) and directly sold "User Ads" from platform participants (Organizers/Promoters, Instructors, Businesses, Services).

**\*\*X.1. General Ad Display & Control\*\***  
    \* **\*\*X.1.1. Ad Density/Frequency:\*\***  
        \* Administrators can control the display frequency for "In-Feed/In-Listing" ad units (e.g., display one ad after every 5-7 content items).  
        \* As a general guideline for other page types, a maximum of 2-3 distinct ad slots per standard page view should be maintained for the Initial Launch to prioritize content over ads.  
    \* **\*\*X.1.2. Page/Section Exclusions:\*\*** Ads (both direct and AdSense) must be excluded from: user registration/login/password recovery flows, user profile editing pages, all checkout/payment processing pages (for tickets, store items, class purchases, and direct ad purchases), core legal pages (Terms of Service, Privacy Policy), and system error pages.  
    \* **\*\*X.1.3. Responsive Behavior:\*\*** Ad zones are to be designed responsively. The system will display ads that correctly fit the defined zone dimensions for the user's current screen size. Advertisers for direct ads will provide creatives based on specified dimensions. AdSense typically handles its own responsive serving within provided containers.  
    \* **\*\*X.1.4. Administrator Ad System Controls (General):\*\***  
        \* Administrators can globally enable/disable the Google AdSense integration.  
        \* Administrators can enable/disable entire direct "User Ad" zones.  
        \* Administrators can enable/disable/pause individual approved direct "User Ads," manage updates to existing ads (e.g., change creative or details as requested by advertiser), and re-launch them.

**\*\*X.2. Direct "User Ad" Sales & Management (Initial Launch)\*\***  
    \* **\*\*X.2.1. User-Facing Ad Placement Portal:\*\***  
        \* Eligible users (Organizers, Instructors, Businesses, Services) can access a dedicated section/page on the platform to:  
            \* View a list of available ad zones/types with their detailed specifications (dimensions, supported image file types) and current pricing.  
            \* Understand availability and options for selecting run duration or schedule for their ad.  
            \* Select desired ad zone(s) and scheduling options.  
            \* See a clear calculation of the total price.  
            \* Upload their ad creative (image file) according to specifications and provide a click-through URL.  
            \* Review an order summary.  
            \* Complete online payment for their ad order.  
        \* Post-submission and payment, users receive an on-screen success message and an email confirmation.  
        \* Users can view the status of their submitted ads (e.g., "Pending Approval," "Approved & Scheduled," "Running," "Rejected," "Completed") in a dedicated section of their user dashboard.  
    \* **\*\*X.2.2. Administrator \- Ad Zone & Pricing Management:\*\***  
        \* Admins can define and manage ad zones, including attributes like: zone name (e.g., "Event Listing In-Feed Ad," "Homepage Top Banner"), image dimensions/specifications, typical placement locations (e.g., "Event Feed," "Blog Sidebar Right," "End of Blog Post Banner"), and associated pricing or pricing tiers (with the ability to set higher prices for more popular/visible areas).  
        \* The system must support a "random option" for ad display: users can purchase cheaper ads that are then displayed by the system randomly in any ad zone that fits the creative's dimensions and is eligible for such random ads (typically non-premium slots). Admins approve the creative, and the system handles random placement.  
    \* **\*\*X.2.3. Administrator \- Direct Ad Order Management & Approval:\*\***  
        \* Admins can view and manage a list/dashboard of pending direct ad orders/submissions (including advertiser information, selected zone, uploaded creative, payment status).  
        \* Admins can review uploaded ad creatives for quality, appropriateness, and adherence to specifications, with options to approve or reject them. (If an ad is rejected after payment, the Admin will contact the user via email/call to resolve; if not resolvable, a refund process will be necessary – details of refund process TBD).  
        \* Admins can manage the schedule/duration for approved direct ads (e.g., set start/end dates, or based on purchased duration, clicks, or impressions as applicable for Initial Launch).  
        \* Admins can track basic performance metrics for direct ads (impressions and/or clicks) for Initial Launch reporting to the advertiser.

**\*\*X.3. Google AdSense Integration (Initial Launch)\*\***  
    \* **\*\*X.3.1. Configuration:\*\*** Administrators can input and manage necessary AdSense account details (e.g., publisher ID, ad unit IDs) via the platform's admin panel to enable the integration.  
    \* **\*\*X.3.2. Goal:\*\*** The primary purpose of AdSense integration is to fill ad inventory that has not been sold directly via "User Ads."  
    \* **\*\*X.3.3. Placement Logic:\*\*** When AdSense is enabled (globally by Admin) and a defined ad zone does not have a direct "User Ad" scheduled, AdSense should automatically attempt to fill that space with an appropriately sized ad.

\#\#\# Y. User Network Growth & Friend Invitation Features (Initial Launch)  
*\*(This new section details Friend Invitation features based on recent discussions)\**  
To facilitate community growth and user connections, the platform will include features for users to find and invite contacts:

\* **\*\*Y.1. Find Friends/Sync Contacts:\*\***  
    \* Users will have access to a feature (e.g., within their profile or a dedicated "Friends" section) to find other existing users on the platform or invite new contacts.  
    \* This will include an option to "Sync Contacts" from their device (via OS-level permissions and dialogs, as conceptualized in the UI/UX Layout PDF) to identify existing friends on SteppersLife.com or contacts to invite.  
\* **\*\*Y.2. Invite Contacts:\*\***  
    \* Users can invite contacts to join SteppersLife.com.  
    \* The platform will provide users with a unique **\*\*invitation link\*\*** that they can copy and share on their preferred social media platforms (e.g., Instagram, Facebook, Twitter) or through other messaging applications.  
    \* The platform may also provide an option to send invitations via email, if deemed necessary for the Initial Launch.  
    \* The platform will provide an "Invite Prompt" or interface for accessing these invitation options, as conceptualized in the UI/UX Layout PDF.  
\* **\*\*Y.3. Managing Follows/Friendships:\*\***  
    \* The platform will support users following each other (as previously discussed for Organizers, Instructors, etc.) and potentially managing "friend" connections or requests, as outlined in the UI/UX Layout PDF.

\#\# Non-Functional Requirements (Initial Launch)

**\*\*1. Performance & Core Web Vitals:\*\***  
    \* 1.1. Overall Performance Goal: 90+ ("A" grade) in Google PageSpeed Insights.  
        \* **\*\*Specific Response Time Expectations (User-Centric):\*\*** Interactive operations (e.g., loading event details, applying search filters, submitting forms) should provide initial visual feedback within **\*\*1 second\*\***, and the operation should aim to complete within **\*\*3-5 seconds\*\*** on an average user internet connection. Key landing and Browse pages should target a Largest Contentful Paint (LCP) of **\*\*under 2.5 seconds\*\*** and a Time to Interactive (TTI) of **\*\*under 5 seconds\*\***.  
    \* 1.2. Image and Media Optimization: Efficient compression (including server-side for VOD **\*\*and for all user-uploaded images across the platform\*\***), modern formats (e.g., WebP), responsive images, lazy loading, LCP prioritization.  
    \* 1.3. Code Optimization: Minification, remove unused code, critical CSS, optimize JS.  
    \* 1.4. Server & Network Performance: Fast TTFB, quality hosting, CDN, Gzip/Brotli, HTTP/3 or HTTP/2.  
    \* 1.5. Caching Strategies.  
    \* 1.6. Rendering & Layout Stability (CLS Focus).  
    \* 1.7. Resource Loading & Prioritization.  
    \* **\*\*1.8. Initial Throughput/Capacity Expectations:\*\***  
        \* **\*\*Concurrent Users:\*\*** For the initial launch phase, the platform should be designed to comfortably support an estimated **\*\*100-500 concurrent users\*\*** Browse and interacting with core features during anticipated peak usage times without noticeable degradation in performance.  
        \* **\*\*Transaction Throughput (Ticketing Example):\*\*** The ticketing system should be capable of processing at least **\*\*10-20 ticket purchase transactions per minute\*\*** for a single popular event during its peak sales period.  
    \* **\*\*1.9. Scalability:\*\*** The system architecture must be designed to be scalable to accommodate future growth in the number of users, events, classes, directory listings, data volume, and transaction load. Specific scalability strategies will be detailed in the Architecture Document, but the PRD establishes this as a key requirement.

**\*\*2. Security & Compliance:\*\***  
    \* 2.1. Secure Authentication & Session Management (including Social Logins). (Note: User confirmed this high-level NFR is sufficient for now; details like password policies or MFA specifics to be addressed in architecture/design if not already functionally implied).  
    \* 2.2. Protection of User Personal Data: The platform must be designed to comply with all applicable **\*\*U.S. data privacy laws and regulations, including federal and state-specific requirements such as the California Consumer Privacy Act (CCPA, as amended).\*\*** This includes best practice principles for user data protection, transparent data processing notices, consent management where required by law, and mechanisms to facilitate users' rights regarding their personal data (e.g., access, deletion) as mandated by such U.S. regulations.  
    \* 2.3. Secure Payment Gateway Integrations: All online payment processing for Square, Cash App, and PayPal must adhere to **\*\*Payment Card Industry Data Security Standard (PCI DSS) requirements.\*\*** This will be achieved primarily by integrating with compliant third-party payment gateway APIs in a manner that minimizes the platform's PCI DSS scope (e.g., aiming for SAQ A eligibility by not directly storing or transmitting sensitive cardholder data).  
    \* 2.4. Secure handling of uploaded artwork files.  
    \* 2.5. Advertising System Security: Ensure ad serving mechanisms do not introduce vulnerabilities (e.g., XSS through ad creatives). Direct ad uploads should be sanitized or restricted if possible.  
    \* **\*\*2.6. DMCA Compliance:\*\*** The platform must include mechanisms and processes to support Digital Millennium Copyright Act (DMCA) compliance, such as a method for copyright holders to submit takedown notices for allegedly infringing content.  
    \* **\*\*2.7. Security Testing:\*\*** The platform will undergo planned security assessments. These assessments should include, but are not limited to, regular automated vulnerability scanning (e.g., integrated into the CI/CD pipeline) and formal penetration testing phases (e.g., pre-launch and periodically post-launch) to proactively identify, assess, and remediate potential security weaknesses.

**\*\*3. Reliability & Availability:\*\***  
    \* 3.1. Target Uptime: The platform aims for at least 99% uptime. Critical user flows, including but not limited to event ticket purchasing, VOD class playback, payment processing (for all services), and on-site event check-in functionalities, should be designed for high resilience to minimize any potential service interruptions affecting these core operations.  
    \* 3.2. Downtime Notification to admin email.  
    \* 3.3. Graceful Error Handling: All user-facing error messages must be: Clear and Understandable (written in plain language, avoiding technical jargon), Informative (briefly explain the problem from a user's perspective), and Actionable (provide guidance on what the user can do next, where appropriate).  
    \* 3.4. PWA Push Notification reliability for class reminders/updates.  
    \* **\*\*3.5. Data Backups:\*\*** Regular, automated backups of all critical platform data must be performed. This includes, but is not limited to, user accounts and profiles, event and class information (including VOD content where feasible), submitted ad creatives and configurations, community directory listings, all transaction records (tickets, classes, store, ads), and essential platform configurations. Backup frequency and retention policies should be sufficient to meet recovery objectives.  
    \* **\*\*3.6. Disaster Recovery (DR):\*\*** A disaster recovery plan must be established and documented prior to launch. For the initial launch, this DR plan should outline procedures to restore essential platform services and critical data in the event of a significant system failure, aiming for a reasonable Recovery Time Objective (RTO – how quickly service is restored) and Recovery Point Objective (RPO – how much data loss is acceptable) suitable for the platform's critical functions. Specific RTO/RPO targets will be further defined during the architecture design phase.  
    \* **\*\*3.7. Fault Tolerance:\*\*** The platform should be designed for fault tolerance. The failure of non-critical auxiliary services or less critical features (e.g., automated social media posting encountering an error, a problem with a specific type of ad rendering) should not cascade to impact core user-facing functionalities. Essential services must remain operational, potentially in a gracefully degraded mode if a minor dependency is affected.  
    \* **\*\*3.8. Planned Maintenance Windows:\*\*** Planned system maintenance that may cause temporary service unavailability will be scheduled during periods of typically low user activity (e.g., late night U.S. Central Time) to minimize disruption. Users will be provided with advance notification through appropriate platform channels (e.g., a site-wide banner, an email to registered users) whenever feasible, especially for maintenance expected to last more than a few minutes.  
    \* **\*\*3.9. Initial Platform Support:\*\*** A clear mechanism for users to report critical platform outages or significant bugs affecting core functionality will be provided (e.g., via a dedicated support email address or a 'Report a Problem' option). For the initial launch, internal response targets will be established to acknowledge and begin investigation of verified critical, system-wide issues promptly.

**\*\*4. Usability:\*\***  
    \* 4.1. Responsive Web Design for PWA mobile and Desktop. **\*\*The platform must function correctly on the following target devices (or their contemporary equivalents at launch in 2025): Apple iPhone 16 series (Pro Max, Pro, Standard, Plus), Samsung Galaxy S25 series (Ultra, S25+, S25), Google Pixel 9 series (Pro, Standard, 9a), Samsung Galaxy Z Fold 7/6, Samsung Galaxy Z Flip 7/6, OnePlus 13, and other leading models as identified by the user.\*\***  
    \* 4.2. Ease of Use: Intuitive for all target users.  
    \* **\*\*4.3. Accessibility:\*\*** Strive for WCAG (Web Content Accessibility Guidelines) compliance (e.g., for color contrast, keyboard navigation, semantic HTML, alt text for images, accessible forms) across both light and Night Mode themes. (User confirmed current WCAG compliance goal is sufficient for PRD).

**\*\*5. Monitoring & Auditing:\*\***  
    \* 5.1. Continuous Performance Monitoring.  
    \* 5.2. Regular Audits for performance.  
**\*\*6. Data Integrity:\*\***  
    \* 6.1. System for ensuring physical class listings are current (validity checks, auto-deletion).

\#\# User Interaction and Design Goals

*\*(The User Persona Summaries and Role-Specific Needs Summaries have been placed earlier in the "Goal, Objective and Context" section. This section outlines general UI/UX principles, critical user journeys, and references the detailed UI/UX documentation.)\**

\* **\*\*1. Overall Vision & Experience:\*\***  
    \* Mobile-first PWA, responsive desktop experience.  
    \* Feel: Sleek and modern; Community-focused and welcoming; Easy to use, even for non-tech-savvy users.  
\* **\*\*2. Key Interaction Paradigms:\*\***  
    \* **\*\*Attendee Event/Class/Directory Discovery:\*\*** Highly visual and engaging, emphasizing imagery, rich browse/search/filter experience. Search-as-you-type for cities, group names, and categories. **\*\*Geolocation-based discovery ("near me") and manual location search are critical.\*\***  
    \* **\*\*Role-Based Extensible Dashboards:\*\*** Users see relevant management tools based on their active roles (Promoter, Instructor, Service/Store Lister, Sales Agent, General User).  
    \* **\*\*Clear Calls to Action\*\***.  
    \* *\*(Further paradigms for specific complex flows like ticket purchasing, VOD access, on-site PWA check-in to be considered during detailed UI design)\**.

\#\#\# Critical User Journeys (Summary)  
*\*(This new subsection includes the five user journey summaries drafted and approved previously)\**  
**\*\*Journey Name:\*\*** New User Onboarding & First Event Ticket Purchase  
\* **\*\*Primary User/Role:\*\*** New User (potential Attendee)  
\* **\*\*Goal:\*\*** For a new user to successfully register on SteppersLife.com, find an event of interest, and complete a ticket purchase.  
\* **\*\*High-Level Key Steps:\*\***  
    1\.  User arrives at the SteppersLife platform (e.g., Homepage).  
    2\.  User initiates and completes the registration process (e.g., using email/password or a social login option).  
    3\.  User logs in to their new account.  
    4\.  User navigates to discover events (e.g., using homepage features, search, or explore sections, potentially leveraging geolocation for local events or searching specific areas).  
    5\.  User selects a specific event to view its details.  
    6\.  From the event detail page, the user initiates the ticket purchasing process.  
    7\.  User selects desired ticket type(s), quantity, and any seating options if applicable (e.g., general admission, specific table/seat for relevant events, selection from custom visual seating chart).  
    8\.  User proceeds to checkout, confirms order details, and selects a payment method (e.g., Square, Cash App, PayPal, or initiates the Direct Cash Payment Workflow).  
    9\.  User successfully completes the payment.  
    10\. User receives an order confirmation (on-screen and/or via email) and their e-ticket(s) with QR codes are made available in their user dashboard and sent via email.  
\* **\*\*Key Decision Points for User:\*\***  
    \* Choosing registration method (e.g., email vs. social media).  
    \* Deciding which event to explore/select.  
    \* Selecting ticket types, quantity, and (if applicable) specific seats/tables.  
    \* Choosing a payment method.  
\* **\*\*Reference for Detailed Screens & Interactions:\*\***  
    \* For detailed screen layouts, component interactions, and specific UI elements related to this journey, please refer to the following sections in the \`Steppers Life\_ Comprehensive UI\_UX Layou.pdf\`: "Steppers Life Homepage", "PWA Mobile Bottom Navigation Menu", "Section: Steppers Life iOS Logging In" (for registration/login flows), "Section: Steppers Life iOS Searching Steppers Life", "Section: Steppers Life iOS Event Details", "Section: Steppers Life iOS Purchasing a Ticket", and "Section: Steppers Life iOS Tickets" (for viewing tickets post-purchase).

**\*\*Journey Name:\*\*** Organizer: Event Creation, Publishing, and Enabling Follower Ticket Sales  
\* **\*\*Primary User/Role:\*\*** Event Organizer/Promoter  
\* **\*\*Goal:\*\*** For an Organizer to successfully create a new event, configure all necessary details (including ticketing and options for their followers to sell tickets), publish the event to the platform, and optionally assign roles to followers.  
\* **\*\*High-Level Key Steps:\*\***  
    1\.  Organizer logs into their SteppersLife.com account and accesses their Organizer Dashboard.  
    2\.  Organizer initiates the "Create New Event" process.  
    3\.  Organizer provides essential event information: title, detailed description, date(s)/time(s) (including complex recurring patterns), venue/location (physical or online), event categories, and event images/banners.  
    4\.  Organizer configures ticketing: defines ticket types, sets pricing and quantity, specifies sales periods, and sets up group ticket or pre-sale options.  
    5\.  Organizer configures seating arrangements: chooses between General Admission, Table-based, Section/Block-based, or a Fully Custom Visual Seating Chart, and defines related capacities and pricing.  
    6\.  Organizer specifies what information to collect from attendees, adding custom questions if needed.  
    7\.  Organizer enables and configures options for their **\*\*followers\*\*** to sell tickets for the event (i.e., Sales Agent functionality), including setting commission structures.  
    8\.  Organizer may assign the "Sales Agent" role to specific followers or manage roles like "Event Staff".  
    9\.  Organizer reviews all event details and either saves as a draft or publishes live.  
    10\. (Post-Publishing) Organizer utilizes promotional tools (public URL, social sharing, QR code).  
    11\. (Post-Publishing) Organizer monitors event performance via their dashboard.  
\* **\*\*Key Decision Points for Organizer:\*\***  
    \* Event type, categories, ticketing structures, pricing, seating arrangements.  
    \* Enabling follower sales and setting commissions.  
    \* Assigning roles to followers.  
    \* Publishing timing.  
\* **\*\*Reference for Detailed Screens & Interactions:\*\***  
    \* The specific screens for the Organizer Dashboard, event creation forms, ticketing/seating setup interfaces, follower management, and sales reporting are detailed in the comprehensive UI/UX design deliverables. Functional capabilities are in \`Steppers Life PRD Document V3\` (Sections A, B, C, E, F).

**\*\*Journey Name:\*\*** Instructor: Listing a Physical Class & Offering/Selling a VOD Class (plus User VOD Purchase)  
\* **\*\*Primary User/Role:\*\*** Instructor; User/Attendee (for VOD purchase part)  
\* **\*\*Goal:\*\*** For an Instructor to list physical classes, create/sell VOD classes (with payouts), and for Users to purchase VODs.  
\* **\*\*High-Level Key Steps:\*\***  
    \* **\*\*Part A: Instructor Lists a Physical Class (Free Tier)\*\***  
        1\.  Instructor logs in and accesses Instructor Dashboard.  
        2\.  Initiates "Add Physical Class".  
        3\.  Completes detailed class form (type, title, level, location, complex schedule, cost, capacity, RSVP, image, contact, notes).  
        4\.  Publishes listing.  
        5\.  (Ongoing) Manages listings (validity checks, interest list, PWA push notifications).  
    \* **\*\*Part B: Instructor Creates & Offers a Paid VOD Class (Paid Tier)\*\***  
        6\.  Instructor subscribes to VOD hosting service.  
        7\.  Initiates "Create VOD Class Series".  
        8\.  Defines VOD details (title, description, structure, levels), uploads/orders videos.  
        9\.  Sets VOD pricing (min $40).  
        10\. Publishes VOD class.  
        11\. (Ongoing) Views VOD attendee lists, manages optional T-shirt sales, receives automated payouts.  
    \* **\*\*Part C: User/Attendee Purchases a VOD Class\*\***  
        12\. User browses/filters VOD classes.  
        13\. User selects VOD class, views details.  
        14\. User purchases access.  
        15\. User completes payment.  
        16\. User accesses purchased VOD content.  
\* **\*\*Key Decision Points:\*\***  
    \* **\*\*Instructor:\*\*** Offering physical vs. VOD; pricing for classes; VOD content structure; T-shirt sales.  
    \* **\*\*User/Attendee:\*\*** Selecting VOD class for purchase.  
\* **\*\*Reference for Detailed Screens & Interactions:\*\***  
    \* Detailed screens for Instructor Dashboard, class creation/management, VOD setup, and merchandise are part of UI/UX deliverables. The \`Steppers Life\_ Comprehensive UI\_UX Layou.pdf\` lists "Class Detail Page (Physical & VOD)". Functional capabilities are in \`Steppers Life PRD Document V3\` (Section L).

**\*\*Journey Name:\*\*** User & Community Lister: Interacting with the Community Directory  
\* **\*\*Primary User/Role:\*\*** Community Lister (Business Owner/Service Provider); User/Attendee  
\* **\*\*Goal:\*\*** For a Lister to submit their business/service listing, and for a User to discover, view, and interact with these listings.  
\* **\*\*High-Level Key Steps:\*\***  
    \* **\*\*Part A: Community Lister Submits a Listing\*\***  
        1\.  Lister logs in/registers.  
        2\.  Selects "List Your Service" or "List Your Store".  
        3\.  Completes submission form (Name, Category with type-ahead, Description, Contact, Location, Hours, Images, Keywords).  
        4\.  Submits listing for Admin approval.  
        5\.  (Post-Approval) Listing is live; Lister may manage it.  
    \* **\*\*Part B: User/Attendee Interacts with the Community Directory\*\***  
        6\.  User navigates to "Community" section.  
        7\.  User browses/searches directory, filters by category and location (city, zip, "near me").  
        8\.  User selects a listing to view details (info, ratings, reviews, comments).  
        9\.  User interacts: reads content, submits Five-Star Rating, writes Review, adds Comments, follows listing.  
\* **\*\*Key Decision Points:\*\***  
    \* **\*\*Lister:\*\*** Information detail, category choice.  
    \* **\*\*User:\*\*** Search/filter criteria; which listing to view; decision to rate/review/comment/follow.  
\* **\*\*Reference for Detailed Screens & Interactions:\*\***  
    \* The \`Steppers Life\_ Comprehensive UI\_UX Layou.pdf\` includes "Community / Neighborhood" tab and lists "Community Directory (Services/Stores) Landing Page & Listing Detail Page". Detailed screens for Lister submission, directory Browse, listing details, and review/rating interactions are part of UI/UX deliverables. Functional capabilities are in \`Steppers Life PRD Document V3\` (Sections J, K).

**\*\*Journey Name:\*\*** Eligible User: Purchasing Promotional Material from Steppers Life Store  
\* **\*\*Primary User/Role:\*\*** Eligible User (e.g., Event Organizer/Promoter, Instructor, Service/Store Lister)  
\* **\*\*Goal:\*\*** For an eligible user to access the exclusive Store, select products, manage artwork, and complete purchase with special pricing/shipping.  
\* **\*\*High-Level Key Steps:\*\***  
    1\.  Eligible User logs in.  
    2\.  Navigates to "Promotional Materials" / "Steppers Life Store" in Dashboard.  
    3\.  Browses/searches product catalog (Business Cards, Banners, etc.) at special prices.  
    4\.  Selects product, views details (description, specs, price, artwork requirements).  
    5\.  Uploads artwork via uploader (or notes to email later), adds order note.  
    6\.  Adds to cart, proceeds to checkout.  
    7\.  Checkout applies Chicago/Non-Chicago shipping/pickup logic and pricing.  
    8\.  User confirms order, completes payment.  
    9\.  Receives order confirmation.  
    10\. If artwork not uploaded, receives instructions to email it.  
    11\. (Backend) Steppers Life checks artwork, fulfills order.  
\* **\*\*Key Decision Points for Eligible User:\*\***  
    \* Product selection.  
    \* Artwork submission method.  
    \* (Chicago users) Pickup vs. Shipping.  
\* **\*\*Reference for Detailed Screens & Interactions:\*\***  
    \* Detailed screens for "Promotional Materials" store section, product pages, artwork uploader, and modified checkout flow are part of UI/UX deliverables. Functional capabilities are in \`Steppers Life PRD Document V3\` (Section L.4).

\#\#\# High-Level Content Strategy Summary  
*\*(Based on SteppersLife\_ Platform Development Research Plan.txt, Section VI)\**  
The platform's content will revolve around key pillars appealing to the Stepping community:  
\* **\*\*Core Content Pillars:\*\*** Instruction (how-to guides, technique), Culture & History (heritage, etiquette, fashion, music), Events (previews, reviews, contest coverage), Community (interviews, user stories, discussion topics), Music (DJ spotlights, playlists, history), and Lifestyle (travel guides for events, venue reviews).  
\* **\*\*Primary Content Sources:\*\*** A mix of In-House Team contributions, Commissioned Content from recognized community experts (instructors, historians), Guest Contributions from community leaders, and actively encouraged User-Generated Content (UGC) such as stories, reviews, photos, and videos (with clear usage rights policies).

\* **\*\*3. Core Screens/Views (Conceptual List \- to be detailed with UI layouts):\*\***  
    \* Homepage / Discover (Events, Classes, Community links).  
    \* Event Detail Page.  
    \* Class Detail Page (Physical & VOD).  
    \* Community Directory (Services/Stores) Landing Page & Listing Detail Page.  
    \* User Registration/Login Flow.  
    \* User Dashboard (base and extended views for roles).  
    \* Checkout Flow (Tickets, VOD, Store Products, **\*\*Direct Ad Placements\*\***).  
    \* Admin Portal sections (including **\*\*Ad Management\*\***).  
    \* On-Site PWA (Check-in, **\*\*On-Site Payments\*\***).  
    \* **\*\*User-Facing Ad Placement Portal\*\***.  
\* **\*\*4. UI Principles to Adhere To:\*\***  
    \* **\*\*Clarity and Simplicity:\*\*** Clean layouts, intuitive navigation, clear language.  
    \* **\*\*Consistency:\*\*** In visual style (colors, typography, buttons, icons) and interaction patterns.  
    \* **\*\*Visual Hierarchy:\*\*** Guide user attention effectively.  
    \* **\*\*Feedback:\*\*** Immediate and clear feedback for actions.  
    \* **\*\*Accessibility:\*\*** Strive for WCAG compliance (color contrast, keyboard navigation, semantic HTML) across both light and Night Mode themes.  
    \* **\*\*Brand Reinforcement:\*\*** Consistent use of Steppers Life branding.  
\* **\*\*5. Target Devices/Platforms:\*\*** Responsive Web (PWA for mobile, standard web for desktop). PWA for on-site organizer/staff tools. The platform must function correctly on target 2025 phone models including: Apple iPhone 16 series (Pro Max, Pro, Standard, Plus), Samsung Galaxy S25 series (Ultra, S25+, S25), Google Pixel 9 series (Pro, Standard, 9a), Samsung Galaxy Z Fold 7/6, Samsung Galaxy Z Flip 7/6, OnePlus 13, and other leading models as identified by the user.

\#\# Technical Assumptions

*\*(This section is largely taken from your existing PRD. Review if any assumptions need adjustment due to expanded scope, especially regarding the Advertising System or more complex features now in scope.)\**

\* PWA (Progressive Web App) for on-site organizer/staff tools and primary mobile user experience.  
\* Email: SendGrid or compatible SMTP mail system.  
\* Database: Supabase.  
\* Analytics: Google Analytics API, Ahrefs API integration.  
\* Payment Gateways: Square, Cash App, PayPal.  
\* Video Hosting for Paid VOD Classes (Initial Launch): Self-hosted by \`stepperslife.com\`, requiring on-platform video optimization and compression.  
\* \`stepperslife.com\` platform fees for cash sales (B.8) reconciled against Organizer's online sales proceeds.  
\* Vanity URLs for Organizers and Sales Agent followers. *\*(Mechanism for creation/assignment TBD)\**.  
\* n8n.io integration for automated social posting. *\*(Admin controls and potential organizer interface TBD)\**.  
\* **\*\*Advertising System Technology:\*\*** *\*(To be determined by Architect, but may involve WordPress plugins like Advanced Ads/WP AdCenter or custom development, capable of AdSense integration and direct ad sales/management as specified in functional requirements.)\**  
\* **\*\*Infrastructure:\*\*** The platform will be deployed on cloud-based infrastructure to ensure scalability, reliability, and performance. Hostinger is the preferred cloud hosting provider, to be evaluated during the architecture design phase. The specific cloud services will be determined during the architecture phase.  
\* **\*\*Development Environment:\*\*** A well-defined, consistent, and reproducible local development environment, following industry best practices, will be established and maintained for the development team to ensure efficient, high-quality code production and collaboration. Specifics of this environment will be detailed by the Architect.  
\* **\*\*Key Performance Focus Areas (for Architect):\*\***  
    \* Real-time Event Interaction & Ticketing.  
    \* On-Site PWA Operations (Check-in, Payments).  
    \* VOD Streaming & Access.  
    \* Search & Filtering Across Large Datasets.  
\* **\*\*Key Security Focus Areas (for Architect):\*\***  
    \* Payment Processing & Financial Data.  
    \* User Personally Identifiable Information (PII) & Account Security.  
    \* Instructor Content & VOD Intellectual Property.  
    \* Administrative Portal & Privileged Access Control.  
    \* Third-Party API & Service Integrations.  
\* **\*\*Areas of High Complexity or Technical Risk (for Architect Deep-Dive):\*\***  
    \* Fully Custom Visual Seating Chart Builder.  
    \* Secondary Ticket Market (Resale Functionality).  
    \* Automated Payouts (Sales Agents/Followers & VOD Instructors).  
    \* Comprehensive Advertising System (Direct Sales Portal & Random Option).  
    \* Overall System Integration & Data Consistency across numerous modules.

\#\# Epic Overview

*\*(This section requires substantial detailing. Based on discussions, the initial launch scope will be organized into approximately five major Epics. Each Epic needs a clear goal and will be broken down into detailed User Stories with Acceptance Criteria by the User or a PO/SM agent. Dependencies and sequence between Epics must also be defined here.)\**

\* **\*\*Suggested Epic Themes:\*\***  
    1\.  **\*\*Epic 1: Core Platform Foundation & User Experience\*\***  
    2\.  **\*\*Epic 2: Comprehensive Event Management & Ticketing Lifecycle\*\***  
    3\.  **\*\*Epic 3: Instructor & Classes Platform (Physical & VOD)\*\***  
    4\.  **\*\*Epic 4: Community Engagement Hub (Directory & Blog)\*\***  
    5\.  **\*\*Epic 5: Platform Monetization Services (Store & Advertising)\*\***

*\*(Placeholder for detailed Epics and Stories \- to be filled in)\**  
\* **\*\*Epic 1: {Example Title \- Core Platform Foundation}\*\***  
    \* Goal: {Example \- To establish the essential user management, navigation, and foundational services for the platform.}  
    \* Story 1.1: As a new user, I want to be able to register for an account using my email and password, so that I can access platform features.  
        \* Acceptance Criteria:  
            \* User can navigate to a registration page.  
            \* User can input email, password, and confirm password.  
            \* System validates input fields (e.g., email format, password complexity if defined).  
            \* Upon successful submission, a user account is created.  
            \* User receives a confirmation email (if part of flow).  
            \* User is logged in or redirected to login.  
    \* ... (other stories for Epic 1\) ...

\#\# Key Reference Documents  
\* Project Brief for \`stepperslife.com\`.  
\* This PRD (Revision 3.2).  
\* \`Steppers Life\_ Comprehensive UI\_UX Layou.pdf\`  
\* \`SteppersLife\_ Platform Development Research Plan.txt\` \[cite: 1\]  
\* (Future: Architecture Document, Detailed UI/UX Specifications linked to PRD).

\#\# Change Log  
| Version            | Date          | Author                     | Change Description                                                                                                                                                                                                                                                                                                                                                        |  
| :----------------- | :------------ | :------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |  
| 0.1 (Draft)        | May 30, 2025  | John (PM AI)               | Initial comprehensive draft based on user discussions with "John".                                                                                                                                                                                                                                                                           |  
| 0.2 (Revision 2\)   | May 30, 2025  | Gemini (AI Asst)           | Consolidated with "John's" draft, integrated extensive new requirements & clarifications from user for Store, Classes, Community Directory, Dashboards, Event Claiming, etc. Updated status and next steps.                                                                                                                        |  
| 0.3 (Revision 3\)   | May 31, 2025  | John (PM AI) & User      | Integrated User Persona Summaries & Role-Specific Needs. Added Market Context data. Clarified Geolocation as Initial Launch req for Events/Classes. Defined comprehensive Advertising System (Direct & AdSense) as Initial Launch req. Removed "Out of Scope Ideas Post MVP" section (all items now in scope). Expanded scope of several existing features based on user feedback. |  
| 0.3.1 (Revision 3.1) | May 31, 2025  | John (PM AI) & User      | Added summaries for five Critical User Journeys to the "User Interaction and Design Goals" section. Added detailed Admin Color Customization and User Night Mode functional requirements. Added "Find Friends/Invite Contacts" functional requirements.                                                                                                             |  
| 0.3.2 (Revision 3.2) | May 31, 2025  | John (PM AI) & User      | Added statement on criticality of all features. Clarified NFR 1.2 (Image Optimization) to cover all user uploads. Added NFRs for security testing, PCI DSS, DMCA. Enhanced NFRs for U.S. data privacy (CCPA), availability, backup/recovery, fault tolerance, user-facing error handling, maintenance/support. Added NFRs for cloud infrastructure and dev environment best practices. Noted agreement on Epic themes, goals, sizing, sequence/dependencies, and story/AC standards. |

\---  
**\*\*(Prompt for Design Architect (UI/UX Specification Mode) \- Retained from your V3 PRD, but ensure its inputs align with this revised PRD)\*\***

\#\# Prompt for Design Architect (UI/UX Specification Mode)

**\*\*Objective:\*\*** Elaborate on the UI/UX aspects of the product defined in this PRD (Revision 3.2).  
**\*\*Mode:\*\*** UI/UX Specification Mode  
**\*\*Input:\*\*** This completed PRD document (Revision 3.2) and the existing \`Steppers Life\_ Comprehensive UI\_UX Layou.pdf\`.  
**\*\*Key Tasks:\*\***  
1\.  Review the product goals, user stories (especially those impacted by expanded scope), user personas, role-specific needs, critical user journeys, and any UI-related notes herein.  
2\.  Ensure the existing \`Steppers Life\_ Comprehensive UI\_UX Layou.pdf\` fully aligns with all functional requirements in this PRD (Revision 3.2), including newly added features like the Advertising System portal for users and any UI implications of features previously deemed "Out of Scope." Identify any gaps.  
3\.  Collaboratively refine detailed user flows, wireframes (conceptual), and key screen mockups/descriptions as needed to cover all functionalities.  
4\.  Specify usability requirements and accessibility considerations, ensuring adherence to WCAG compliance across both light and Night Mode themes.  
5\.  If needed, update or create a formal \`front-end-spec-tmpl\` document (or equivalent UX/UI Specification document) that consolidates all UI/UX decisions and references the \`Steppers Life\_ Comprehensive UI\_UX Layou.pdf\`.  
6\.  Ensure that this PRD is updated or clearly references the detailed UI/UX specifications derived from your work, so that it provides a comprehensive foundation for subsequent architecture and development phases.  
Please guide the user through this process to ensure this PRD (Revision 3.2) is fully supported by detailed UI/UX specifications.

\---  
**\*\*(Initial Architect Prompt \- Retained from your V3 PRD, ensure its inputs align with this revised PRD)\*\***

\#\# Initial Architect Prompt

Based on our discussions and requirements analysis for the Steppers Life platform, I've compiled the following technical guidance to inform your architecture analysis and decisions to kick off Architecture Creation Mode. This PRD (Revision 3.2) contains the full scope of requirements.

\#\#\# Technical Infrastructure  
\* **\*\*Repository & Service Architecture Decision:\*\*** {Reiterate the decision made in 'Technical Assumptions', e.g., Monorepo with Next.js frontend and Python FastAPI backend services within the same repo; or Polyrepo with separate Frontend (Next.js) and Backend (Spring Boot Microservices) repositories}.  
\* **\*\*Starter Project/Template:\*\*** {Information about any starter projects, templates, or existing codebases that should be used}  
\* **\*\*Hosting/Cloud Provider:\*\*** The platform will be deployed on cloud-based infrastructure. Hostinger is the preferred provider, to be evaluated. Specific services TBD.  
\* **\*\*Frontend Platform:\*\*** {Framework/library preferences or requirements (React, Angular, Vue, etc.)}  
\* **\*\*Backend Platform:\*\*** {Framework/language preferences or requirements (Node.js, Python/Django, etc.)}  
\* **\*\*Database Requirements:\*\*** Supabase is the chosen database.

\#\#\# Technical Constraints  
\* {List any technical constraints that impact architecture decisions}  
\* {Include any mandatory technologies, services, or platforms from the 'Technical Assumptions' section}  
\* {Note any integration requirements with specific technical implications from the 'Technical Assumptions' section}

\#\#\# Deployment Considerations  
\* {Deployment frequency expectations}  
\* {CI/CD requirements}  
\* {Environment requirements (local, dev, staging, production)}

\#\#\# Local Development & Testing Requirements  
\* A well-defined, consistent, and reproducible local development environment, following industry best practices, is required.  
\* {Expectations for command-line testing capabilities}  
\* {Needs for testing across different environments}  
\* {Utility scripts or tools that should be provided}  
\* {Any specific testability requirements for components, including local testability for backend/data stories}

\#\#\# Key Performance Focus Areas  
\* Real-time Event Interaction & Ticketing (Browse, selection, purchase).  
\* On-Site PWA Operations (Check-in, Payments).  
\* VOD Streaming & Access.  
\* Search & Filtering Across Large Datasets.

\#\#\# Key Security Focus Areas  
\* Payment Processing & Financial Data (PCI DSS, fraud prevention).  
\* User Personally Identifiable Information (PII) & Account Security (CCPA compliance).  
\* Instructor Content & VOD Intellectual Property protection.  
\* Administrative Portal & Privileged Access Control (MFA recommended).  
\* Secure implementation of Third-Party API & Service Integrations.  
\* DMCA compliance mechanisms.

\#\#\# Areas of High Complexity or Technical Risk Requiring Deep Architectural Dive  
\* Fully Custom Visual Seating Chart Builder.  
\* Secondary Ticket Market (Resale Functionality).  
\* Automated Payouts (for Sales Agents/Followers & VOD Instructors).  
\* Comprehensive Advertising System (Direct Sales Portal, "Random Option" logic, AdSense integration).  
\* Overall System Integration & Data Consistency across all modules.  
\* Complex Recurring Event/Class Patterns implementation.

\#\#\# Other Technical Considerations  
\* {Security requirements with technical implications beyond those listed}  
\* {Scalability needs with architectural impact, aiming for targets in NFRs}  
\* {Any other technical context the Architect should consider}

**\*\*(End of PRD Document \- Revision 3.2)\*\***

