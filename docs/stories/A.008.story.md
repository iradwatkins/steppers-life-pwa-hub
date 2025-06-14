# Story A.008: Admin Direct Event Setup & Assignment to Promoter UI

## Status: Pending

## Story

- As a **platform administrator**
- I want **to directly create events and assign them to specific promoters**
- so that **I can efficiently set up events on behalf of organizers and manage platform content**

## Acceptance Criteria (ACs)

1. **AC1:** Admin panel interface for creating events on behalf of promoters
2. **AC2:** Direct assignment of events to specific promoters during creation
3. **AC3:** Access to full event creation capabilities from admin panel
4. **AC4:** Promoter selection interface with search/browse functionality
5. **AC5:** Event assignment notification to promoters
6. **AC6:** Integration with existing event creation workflow
7. **AC7:** Admin override capabilities for event management
8. **AC8:** Audit trail for admin-created events
9. **AC9:** Mobile-responsive admin event creation interface
10. **AC10:** Link from admin dashboard for easy access

## Tasks / Subtasks

- [ ] Task 1: Create AdminCreateEventPage component (AC: 1, 6)
  - [ ] Build admin interface for event creation
  - [ ] Integrate with existing event creation workflow
- [ ] Task 2: Promoter assignment functionality (AC: 2, 4)
  - [ ] Add promoter selection interface
  - [ ] Implement search/browse for available promoters
  - [ ] Enable direct assignment during event creation
- [ ] Task 3: Admin capabilities and permissions (AC: 3, 7)
  - [ ] Grant admin access to full event creation features
  - [ ] Implement admin override capabilities
  - [ ] Add administrative controls for event management
- [ ] Task 4: Notification and audit systems (AC: 5, 8)
  - [ ] Create assignment notification system for promoters
  - [ ] Implement audit trail for admin-created events
- [ ] Task 5: Dashboard integration (AC: 9, 10)
  - [ ] Add link from Admin dashboard
  - [ ] Ensure mobile-responsive design
  - [ ] Integrate with admin panel navigation

## Dev Technical Guidance

- Created AdminCreateEventPage.tsx for administrative event creation
- Allows admins to create events and assign to mock promoters
- Integrates with existing event creation workflow
- Provides promoter selection and assignment capabilities
- Links from Admin dashboard for easy access

## Story Progress Notes

### Agent Model Used: `Lovable.dev Integration`

### Completion Notes List

- Successfully created AdminCreateEventPage.tsx allowing admins to create events
- Implemented direct assignment to specific promoters from mock promoter list
- Added link from Admin dashboard for administrative event creation
- Integrated with existing event creation workflow and capabilities
- Provided promoter selection interface for event assignment

### Change Log

- Created AdminCreateEventPage.tsx with administrative event creation
- Added promoter selection and assignment during event creation
- Implemented admin access to full event creation features
- Created link from Admin dashboard to event creation
- Added mock promoter selection for testing purposes
- Integrated with existing event management workflow
- Ensured mobile-responsive admin interface 