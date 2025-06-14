# Story B.005: Promo Code System

## Status: Pending

## Story

- As an **event organizer**
- I want **to create and manage promotional discount codes**
- so that **I can offer special pricing and track promotional campaigns**

## Acceptance Criteria (ACs)

1. **AC1:** Organizers can create new promo codes with custom settings
2. **AC2:** Support for percentage-based and fixed-amount discounts
3. **AC3:** Promo codes can be activated/deactivated by organizers
4. **AC4:** Integration with checkout flow for code application
5. **AC5:** Real-time discount calculation during checkout
6. **AC6:** Admin interface for CRUD management of promo codes
7. **AC7:** Date picker component for setting validity periods
8. **AC8:** Validation and error handling for invalid codes
9. **AC9:** Promo code usage tracking and reporting
10. **AC10:** Mobile-responsive promo code management interface

## Tasks / Subtasks

- [ ] Task 1: Create EventPromoCodesPage component (AC: 1, 6)
  - [ ] Build organizer CRUD management interface
  - [ ] Implement promo code creation form
- [ ] Task 2: Create reusable DatePicker component (AC: 7)
  - [ ] Build date selection component
  - [ ] Integrate with promo code validity periods
- [ ] Task 3: Implement discount types (AC: 2)
  - [ ] Add percentage-based discount option
  - [ ] Add fixed-amount discount option
  - [ ] Create discount calculation logic
- [ ] Task 4: Add activation/deactivation functionality (AC: 3)
  - [ ] Implement toggle controls for promo codes
  - [ ] Update promo code status management
- [ ] Task 5: Integrate with checkout flow (AC: 4, 5, 8)
  - [ ] Update entire checkout flow for promo code handling
  - [ ] Add real-time discount calculations
  - [ ] Implement validation and error handling
- [ ] Task 6: Testing and optimization (AC: 9, 10)
  - [ ] Add usage tracking capabilities
  - [ ] Ensure mobile-responsive design
  - [ ] Test promo code application flow

## Dev Technical Guidance

- Created EventPromoCodesPage.tsx for organizer management
- Built reusable DatePicker component for date selections
- Integrated promo code logic throughout checkout flow
- Implements real-time discount calculations
- Uses mock data for development and testing

## Story Progress Notes

### Agent Model Used: `Claude Sonnet 4 (BMAD Orchestrator)`

### Completion Notes List

- Successfully created EventPromoCodesPage.tsx for organizer CRUD management
- Built reusable DatePicker component with activate/deactivate functionality
- Updated entire checkout flow to handle promo code application
- Implemented real-time discount calculations throughout purchase process
- Added comprehensive validation and error handling

### Change Log

- Created EventPromoCodesPage.tsx with full CRUD management
- Created reusable DatePicker component for validity periods
- Updated checkout flow with promo code integration
- Added discount calculation logic and validation
- Implemented activation/deactivation toggle functionality 