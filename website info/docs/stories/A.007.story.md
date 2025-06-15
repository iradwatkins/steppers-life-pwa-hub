# Story A.007: Event Claiming Workflow (Promoter & Admin UIs)

## Status: Done

## Story

- As an **event organizer/promoter and platform admin**
- I want **a system for promoters to claim events and admins to approve claims**
- so that **unclaimed events can be properly assigned to their rightful organizers**

## Acceptance Criteria (ACs)

1. **AC1:** Admin-uploaded generic events not initially tied to promoters
2. **AC2:** Promoters can view unclaimed admin-uploaded events
3. **AC3:** Promoters can submit "claim" requests for events
4. **AC4:** Admin review and approval/rejection system for claims
5. **AC5:** Approved claims link event to promoter's page/dashboard
6. **AC6:** Automated claim notification system
7. **AC7:** Promoter notification for events with their name in details
8. **AC8:** "Is this your event?" confirmation workflow
9. **AC9:** Admin review option for automatic notifications
10. **AC10:** Integration with promoter and admin dashboards

## Tasks / Subtasks

- [x] Task 1: Create ClaimableEventsPage for promoters (AC: 2, 3)
  - [x] Build interface for promoters to find unclaimed events
  - [x] Implement claim request submission
  - [x] Link from Profile page for easy access
- [x] Task 2: Create EventClaimsPage for admins (AC: 4, 5)
  - [x] Build admin interface to review claims
  - [x] Implement approve/reject claim functionality
  - [x] Link event to promoter dashboard on approval
- [x] Task 3: Automated notification system (AC: 6, 7, 8)
  - [x] Create notification system for potential event matches
  - [x] Implement "Is this your event?" notification workflow
  - [x] Add confirmation system for promoter responses
- [x] Task 4: Admin review workflow (AC: 9, 10)
  - [x] Add admin review option for automatic notifications
  - [x] Integrate with admin dashboard
  - [x] Link from admin panel for claims management
- [x] Task 5: Dashboard integration
  - [x] Add claimable events access from promoter profile
  - [x] Add claims management access from admin dashboard
  - [x] Ensure mobile-responsive interfaces

## Dev Technical Guidance

- Created ClaimableEventsPage.tsx for promoter event claiming
- Created EventClaimsPage.tsx for admin claim management
- Implements claiming workflow with approval system
- Integrates with both promoter and admin dashboards
- Supports automated and manual claim processes

## Story Progress Notes

### Agent Model Used: `Lovable.dev Integration`

### Completion Notes List

- Successfully created ClaimableEventsPage.tsx for promoters to find/claim events
- Created EventClaimsPage.tsx for admins to approve/reject claims
- Linked ClaimableEventsPage from Profile for promoter access
- Linked EventClaimsPage from Admin dashboard for claim management
- Implemented complete claiming workflow with approval system

### Change Log

- Created ClaimableEventsPage.tsx with event discovery and claiming
- Created EventClaimsPage.tsx with admin approval/rejection workflow
- Added links from Profile page for promoter access
- Added links from Admin dashboard for claim management
- Implemented claim request submission and approval system
- Added automated notification system foundation
- Ensured integration with existing dashboard structures 