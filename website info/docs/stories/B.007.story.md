# Story B.007: Unified Cash/Direct Payment Workflow (Buyer & Seller UI/Logic)

## Status: Done

## Story

- As a **ticket buyer and event organizer**
- I want **a complete cash payment system with code generation and verification**
- so that **I can handle direct cash transactions securely with proper verification workflow**

## Acceptance Criteria (ACs)

1. **AC1:** Organizers can generate and verify payment codes through dedicated interface
2. **AC2:** Buyers can request cash payment codes with QR generation
3. **AC3:** 5-digit verification code system with 4-hour expiration
4. **AC4:** QR code generation for easy code sharing
5. **AC5:** Integration with ticket selection page for cash payment option
6. **AC6:** Real-time code verification and status updates
7. **AC7:** Automatic inventory hold during cash payment process
8. **AC8:** Order completion upon successful code verification
9. **AC9:** Mobile-optimized interfaces for both buyer and seller
10. **AC10:** Integration with existing checkout flow

## Tasks / Subtasks

- [x] Task 1: Create EventCashPaymentPage for organizers (AC: 1)
  - [x] Build cash payment management interface
  - [x] Implement code generation and verification system
- [x] Task 2: Create CashPaymentPage for buyers (AC: 2, 4)
  - [x] Build buyer cash payment request interface
  - [x] Implement QR code generation for payment codes
- [x] Task 3: Implement verification system (AC: 3, 6, 8)
  - [x] Create 5-digit code generation logic
  - [x] Add 4-hour expiration handling
  - [x] Implement real-time verification status
  - [x] Add order completion on successful verification
- [x] Task 4: Integration with ticket flow (AC: 5, 7, 10)
  - [x] Add cash payment option to ticket selection
  - [x] Implement inventory hold during cash payment
  - [x] Integrate with existing checkout flow
- [x] Task 5: QR code library and routing (AC: 4, 9)
  - [x] Add QR code generation library
  - [x] Create routes for cash payment pages
  - [x] Ensure mobile optimization

## Dev Technical Guidance

- Created EventCashPaymentPage.tsx for organizer code management
- Created CashPaymentPage.tsx for buyer code requests
- Added QR code library for payment code sharing
- Integrated with existing ticket selection and checkout flows
- Implements 4-hour inventory hold system with automatic cleanup

## Story Progress Notes

### Agent Model Used: `Claude Sonnet 4 (BMAD Orchestrator)`

### Completion Notes List

- Successfully created complete cash payment system
- Built EventCashPaymentPage.tsx for organizers to generate and verify payment codes
- Created CashPaymentPage.tsx for buyers to request cash payment codes with QR generation
- Added QR code library and integrated with ticket selection page
- Implemented 4-hour hold system with automatic order cancellation

### Change Log

- Created EventCashPaymentPage.tsx with code generation and verification
- Created CashPaymentPage.tsx with QR code generation for buyers
- Added QR code library dependency for payment code sharing
- Created routes for both cash payment interfaces
- Integrated cash payment option with ticket selection page
- Implemented 4-hour inventory hold and expiration system 