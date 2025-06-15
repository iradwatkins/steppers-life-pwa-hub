### L. Classes Module (Initial Launch)
* **L.0. General Instructor Features:**
    * L.0.1. Instructors have followers.
    * L.0.2. Instructor Profile includes editable contact info for workshop/hiring inquiries.
    * L.0.3. Instructors get lists of attendees for their VOD classes.
* **L.1. Physical Class Listings (Instructor - Free Tier):**
    * L.1.1. "Add Class" button on Instructor Profile Page section of their dashboard.
    * L.1.2. Create/Edit Physical Class/Workshop Form: Class Type (Regular Class / Workshop), Title, Level (Beginner, Intermediate, Advanced, Footwork), Location (Venue, Address), Schedule (Single Date / **Complex Weekly/Monthly Recurring Patterns**), Start/End Time, Frequency Notes), Cost (Free or Price set by Instructor), Capacity (optional), RSVP/Interest Tracking Recommended (toggle), Class Image/Flyer (optional), Specific Class Contact (encouraged email/phone, defaults to profile), What to Bring/Wear (optional), Prerequisites (optional), Extras/Notes (optional).
    * L.1.3. Instructors can list unlimited physical classes/locations/times.
    * L.1.4. Class Validity Notification System: Periodic notifications to instructors to re-confirm active status of ongoing physical classes; auto-deletion if not confirmed. (UI for instructor confirmation and admin oversight).
    * L.1.5. PWA Push Notifications (for Instructors of Physical Classes): Ability to send reminders, cancellation, or reschedule notifications to attendees who RSVP'd/expressed interest.
    * L.1.6. Attendee "Interest List" for Physical Classes: Instructors can view a list of users who indicated "I want to attend" (for gauging interest, not formal attendance).
    * **L.1.7. Class Discovery for Attendees:** Attendees can discover physical classes by: Browse categories, levels, instructor, keyword search, and **location-based search (e.g., finding physical classes 'near me' or in specified cities/regions).**
* **L.2. Instructor Setup for Paid VOD Classes (Instructor - Paid Tier):**
    * L.2.1. Requires $40/month Steppers Life VOD hosting fee (editable by admin, with admin-toggleable intro offer). UI for instructor to subscribe/manage this.
    * L.2.2. Interface to Create/Edit VOD Class Series: Title, Description.
    * L.2.3. Structure VOD Class: Define sections (if any), assign Levels (Beginner, Intermediate, Advanced, Footwork) to class or sections.
    * L.2.4. Video Management: Upload self-hosted videos (platform optimizes/compresses), order videos within class/sections.
    * L.2.5. VOD Class Pricing: Instructors set their own price (minimum $40, editable by instructor).
* **L.3. Attendee Purchasing & Access for Paid VOD Classes:**
    * L.3.1. UI for attendees to browse, filter (by level/category, **location if relevant for instructor/style**), and view details of VOD classes.
    * L.3.2. UI for attendees to purchase access to VOD classes or specific levels within them.
    * L.3.3. UI for attendees to access and view VOD content they have purchased (access control by level).
    * **L.3.4. Automated Payout System for VOD Sales:** System to handle payouts to instructors for VOD class sales (net of platform fees).
* **L.4. Steppers Life Store - Promotional Products (Initial Launch - for eligible roles):**
    * L.4.1. Exclusive Access: Visible only to users with active roles (Promoters, Instructors, Service/Store Listers). General users/followers do not see these products or prices. Sales Agents (who only sell tickets) also do not get access unless they have another qualifying role.
    * L.4.2. Product Catalog: Simple promotional products (e.g., Business Cards, Banners, Flyers, Tickets, Wristbands, Lawn Signs). Categories managed by Admin.
    * L.4.3. Product Information (Admin managed): Name, Description (incl. specs, quantity included), Special Price (for eligible roles), Artwork Requirements (standardized - e.g., up to 2 files, common types like PDF/JPG/PNG/AI/PSD, design guidelines provided as static info/tooltip).
    * L.4.4. Artwork Submission (User):
        * Upload container always visible on product page for eligible users. Supports drag & drop and file browse.
        * User can checkout without uploading artwork.
        * If no artwork uploaded, post-checkout message and dedicated follow-up email instructs user to email artwork to `[artwork@stepperslife.com]` referencing order number.
        * User can add a "Note" to their order regarding artwork/customization.
    * L.4.5. Fulfillment: By Steppers Life. Manual check of artwork files.
    * L.4.6. Pricing & Shipping (Admin managed): Admin sets Base Product Price (special price) and a separate Shipping Price.
    * L.4.7. Checkout Logic (User):
        * Non-Chicago users: Price = Base Product Price + Shipping Price.
        * Chicago users: Offered choice of Pickup (Price = Base Product Price) OR Ship (Price = Base Product Price + Shipping Price). Pickup address(es) in Chicago managed by Admin.
    * L.4.8. Access Point: Eligible users access via "Promotional Materials" section in their User Dashboard. Page shows categories, products under them, and is searchable.
* **L.5. T-Shirt Sales (Instructor Merchandise - VOD related):**
    * L.5.1. Steppers Life provides/designs T-shirts.
    * L.5.2. Instructors (likely those on paid VOD plan) can opt to sell these via their profile/class pages.
    * L.5.3. Instructors set their selling price (e.g., $35). Steppers Life has a fixed portion (e.g., $10, representing cost + platform fee). Both prices editable (instructor sets retail, admin sets base/platform cut).
    * L.5.4. UI for instructor to select designs and set prices. UI for attendees to purchase. 