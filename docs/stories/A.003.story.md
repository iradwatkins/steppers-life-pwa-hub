# Story A.003: Organizer Seating Configuration UI (GA, Tables, Sections)

## Status: Pending

## Story

- As an **event organizer/promoter**
- I want **flexible seating configuration options**
- so that **I can set up general admission, table-based, or section-based seating arrangements for my events**

## Acceptance Criteria (ACs)

1. **AC1:** Seating type definition (General Admission, Table-based, Section/Block-based)
2. **AC2:** Table configuration with total tables, names/numbers, and capacity
3. **AC3:** Pricing options for entire tables OR individual seats at tables
4. **AC4:** Section/Block configuration with named sections and capacity
5. **AC5:** Price per seat configuration for sections
6. **AC6:** Basic inventory management for tables and sections
7. **AC7:** Seat blocking functionality to mark tables/blocks as "unavailable"
8. **AC8:** Integration with event management workflow
9. **AC9:** Form validation for seating configuration
10. **AC10:** Mobile-responsive seating configuration interface

## Tasks / Subtasks

- [ ] Task 1: Create EventSeatingPage component (AC: 1, 9)
  - [ ] Build seating configuration interface
  - [ ] Implement seating type selection (GA vs Reserved)
- [ ] Task 2: General Admission configuration (AC: 1)
  - [ ] Add general admission seating option
  - [ ] Configure GA capacity and pricing
- [ ] Task 3: Table-based seating configuration (AC: 2, 3, 6)
  - [ ] Define total tables with names/numbers
  - [ ] Set table capacity and seat configuration
  - [ ] Add pricing for entire tables or individual seats
  - [ ] Implement basic table inventory management
- [ ] Task 4: Section/Block configuration (AC: 4, 5, 6)
  - [ ] Create named sections with capacity
  - [ ] Set price per seat for sections
  - [ ] Add section inventory management
- [ ] Task 5: Seat blocking and integration (AC: 7, 8, 10)
  - [ ] Implement seat blocking for unavailable tables/sections
  - [ ] Add route /organizer/event/:eventId/seating
  - [ ] Ensure mobile-responsive design

## Dev Technical Guidance

- Created EventSeatingPage.tsx with flexible seating arrangements
- Supports General Admission and Reserved Seating configurations
- Implements table and section management with capacity controls
- Provides basic inventory management and seat blocking
- Integrates with event management workflow

## Story Progress Notes

### Agent Model Used: `Lovable.dev Integration`

### Completion Notes List

- Successfully created EventSeatingPage.tsx allowing selection of GA or Reserved Seating
- For Reserved Seating, organizers can define sections (name, capacity, description)
- Added table configuration with names/numbers and seat management
- Implemented basic inventory management for seating arrangements
- Added route /organizer/event/:eventId/seating

### Change Log

- Created EventSeatingPage.tsx with seating type selection
- Added General Admission configuration option
- Implemented Reserved Seating with sections and tables
- Added section management (name, capacity, description)
- Created table configuration (name/number, seats, pricing)
- Implemented basic inventory management and seat blocking
- Added routing integration with event management system 