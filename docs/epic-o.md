### O. Advertising System (Initial Launch)
*(This new section details the Advertising System requirements based on recent discussions)*
The SteppersLife.com platform will incorporate an advertising system to generate revenue and provide marketing opportunities for users. This system will support both automated network ads (e.g., Google AdSense) and directly sold "User Ads" from platform participants (Organizers/Promoters, Instructors, Businesses, Services).

* **O.1. General Ad Display & Control**
    * **O.1.1. Ad Density/Frequency:**
        * Administrators can control the display frequency for "In-Feed/In-Listing" ad units (e.g., display one ad after every 5-7 content items).
        * As a general guideline for other page types, a maximum of 2-3 distinct ad slots per standard page view should be maintained for the Initial Launch to prioritize content over ads.
    * **O.1.2. Page/Section Exclusions:** Ads (both direct and AdSense) must be excluded from: user registration/login/password recovery flows, user profile editing pages, all checkout/payment processing pages (for tickets, store items, class purchases, and direct ad purchases), core legal pages (Terms of Service, Privacy Policy), and system error pages.
    * **O.1.3. Responsive Behavior:** Ad zones are to be designed responsively. The system will display ads that correctly fit the defined zone dimensions for the user's current screen size. Advertisers for direct ads will provide creatives based on specified dimensions. AdSense typically handles its own responsive serving within provided containers.
    * **O.1.4. Administrator Ad System Controls (General):**
        * Administrators can globally enable/disable the Google AdSense integration.
        * Administrators can enable/disable entire direct "User Ad" zones.
        * Administrators can enable/disable/pause individual approved direct "User Ads," manage updates to existing ads (e.g., change creative or details as requested by advertiser), and re-launch them.

* **O.2. Direct "User Ad" Sales & Management (Initial Launch)**
    * **O.2.1. User-Facing Ad Placement Portal:**
        * Eligible users (Organizers, Instructors, Businesses, Services) can access a dedicated section/page on the platform to:
            * View a list of available ad zones/types with their detailed specifications (dimensions, supported image file types) and current pricing.
            * Understand availability and options for selecting run duration or schedule for their ad.
            * Select desired ad zone(s) and scheduling options.
            * See a clear calculation of the total price.
            * Upload their ad creative (image file) according to specifications and provide a click-through URL.
            * Review an order summary.
            * Complete online payment for their ad order.
        * Post-submission and payment, users receive an on-screen success message and an email confirmation.
        * Users can view the status of their submitted ads (e.g., "Pending Approval," "Approved & Scheduled," "Running," "Rejected," "Completed") in a dedicated section of their user dashboard.
    * **O.2.2. Administrator - Ad Zone & Pricing Management:**
        * Admins can define and manage ad zones, including attributes like: zone name (e.g., "Event Listing In-Feed Ad," "Homepage Top Banner"), image dimensions/specifications, typical placement locations (e.g., "Event Feed," "Blog Sidebar Right," "End of Blog Post Banner"), and associated pricing or pricing tiers (with the ability to set higher prices for more popular/visible areas).
        * The system must support a "random option" for ad display: users can purchase cheaper ads that are then displayed by the system randomly in any ad zone that fits the creative's dimensions and is eligible for such random ads (typically non-premium slots). Admins approve the creative, and the system handles random placement.
    * **O.2.3. Administrator - Direct Ad Order Management & Approval:**
        * Admins can view and manage a list/dashboard of pending direct ad orders/submissions (including advertiser information, selected zone, uploaded creative, payment status).
        * Admins can review uploaded ad creatives for quality, appropriateness, and adherence to specifications, with options to approve or reject them. (If an ad is rejected after payment, the Admin will contact the user via email/call to resolve; if not resolvable, a refund process will be necessary – details of refund process TBD).
        * Admins can manage the schedule/duration for approved direct ads (e.g., set start/end dates, or based on purchased duration, clicks, or impressions as applicable for Initial Launch).
        * Admins can track basic performance metrics for direct ads (impressions and/or clicks) for Initial Launch reporting to the advertiser.

* **O.3. Google AdSense Integration (Initial Launch)**
    * **O.3.1. Configuration:** Administrators can input and manage necessary AdSense account details (e.g., publisher ID, ad unit IDs) via the platform's admin panel to enable the integration.
    * **O.3.2. Goal:** The primary purpose of AdSense integration is to fill ad inventory that has not been sold directly via "User Ads."
    * **O.3.3. Placement Logic:** When AdSense is enabled (globally by Admin) and a defined ad zone does not have a direct "User Ad" scheduled, AdSense should automatically attempt to fill that space with an appropriately sized ad. 