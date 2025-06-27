# 3-Tier Event System Integration Test Plan

## Overview
Complete integration test plan for the newly implemented 3-tier event system with RSVP removal and follower sales restrictions.

## Database Migrations Required

### 1. RSVP Removal Migration
**File:** `20250628000000_remove_rsvp.sql`
**Status:** ⏳ Pending execution
**Actions:**
- Drops `event_rsvps` table
- Removes RSVP columns from events table
- Drops RSVP-related functions and constraints

### 2. Event Types Migration  
**File:** `20250627000000_add_event_types.sql`
**Status:** ⏳ Pending execution
**Actions:**
- Adds `event_type` enum (simple, ticketed, premium)
- Adds simple event fields (free_entry_condition, door_price)
- Updates existing events based on requires_tickets field

## System Architecture Testing

### Tier 1: Simple Events ✅
**Features Implemented:**
- [x] Event type selection in CreateEventPage
- [x] Free entry condition field
- [x] Door price configuration
- [x] View-only event detail pages
- [x] EventCard pricing display integration
- [x] No checkout process (view-only)

**Test Cases:**
1. Create Simple Event with free entry condition
2. Verify door price displays correctly
3. Confirm no ticket purchase options shown
4. Test event card pricing display

### Tier 2: Ticketed Events ✅
**Features Preserved:**
- [x] Standard ticket sales system
- [x] Square/PayPal/CashApp payment integration
- [x] Inventory management
- [x] Promo codes and discounts
- [x] QR code generation and email delivery

**Test Cases:**
1. Create standard ticketed event
2. Verify payment processing works
3. Test ticket inventory management
4. Confirm QR codes generated properly

### Tier 3: Premium Events ✅  
**Features Preserved:**
- [x] Interactive seating charts (Stories A.003, A.004, G.003)
- [x] Table booking system
- [x] Custom venue layouts
- [x] Seat selection and reservation

**Test Cases:**
1. Create premium event with seating
2. Test interactive seat selection
3. Verify table booking functionality
4. Confirm seating chart uploads work

## Follower Sales System ✅

### Individual Ticket Sales (Allowed)
**Features Enhanced:**
- [x] Clear UI indicators ("Individual Tickets Only" badge)
- [x] Commission tracking preserved
- [x] Trackable links functionality
- [x] BMAD system integration

### Table Sales Restrictions (Organizer-Only)
**Features Clarified:**
- [x] UI warnings in FollowerDashboard
- [x] Permission form clarifications
- [x] Service layer documentation
- [x] No functional changes needed (already restricted)

## Integration Test Scenarios

### Scenario 1: Event Creation Workflow
1. **Simple Event Creation**
   - Select "Simple" event type
   - Add free entry condition
   - Set door price
   - Verify form validation

2. **Ticketed Event Creation**  
   - Select "Ticketed" event type
   - Add ticket types and pricing
   - Configure inventory
   - Test payment integration

3. **Premium Event Creation**
   - Select "Premium" event type
   - Upload seating chart
   - Configure seat pricing
   - Test table booking

### Scenario 2: Event Display & Interaction
1. **Simple Event Viewing**
   - Verify view-only display
   - Check free entry condition display
   - Confirm door price shown
   - Test no checkout available

2. **Ticketed Event Purchasing**
   - Test ticket selection
   - Verify payment processing
   - Confirm QR code delivery
   - Check inventory updates

3. **Premium Event Seating**
   - Test seat selection interface
   - Verify table booking
   - Check seating chart interaction
   - Confirm reservation process

### Scenario 3: Follower Sales Testing
1. **Individual Ticket Sales**
   - Test follower dashboard access
   - Verify commission tracking
   - Check trackable links
   - Confirm sales attribution

2. **Table Sales Restrictions**
   - Verify table booking not available to followers
   - Check UI restrictions display
   - Confirm organizer-only access
   - Test permission clarity

## Verification Checklist

### ✅ Code Implementation
- [x] RSVP code completely removed
- [x] Event types system implemented
- [x] Simple events functionality added
- [x] Follower restrictions clarified
- [x] Build successful with no errors

### ⏳ Database Schema
- [ ] RSVP removal migration executed
- [ ] Event types migration executed
- [ ] Existing data preserved
- [ ] New fields available

### ⏳ End-to-End Testing
- [ ] Simple event creation and display
- [ ] Ticketed event purchasing flow
- [ ] Premium event seating selection
- [ ] Follower sales restrictions

### ⏳ Regression Testing
- [ ] Existing features still work
- [ ] Payment processing intact
- [ ] Seating system preserved
- [ ] BMAD system functional

## Success Criteria

1. **All three event tiers functional**
2. **RSVP completely removed**
3. **Follower sales restrictions clear**
4. **Existing features preserved**
5. **No breaking changes**
6. **Build and deployment successful**

## Post-Implementation Notes

- Event type migration will set existing events to appropriate tiers
- No data loss expected during RSVP removal
- Follower sales capabilities unchanged (only UI clarified)
- Seating system fully preserved and functional
- All payment integrations maintained

---

**Status:** Ready for database migration and final testing
**Next Steps:** Execute migrations → Test all scenarios → Deploy