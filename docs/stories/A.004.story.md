# Story A.004: Upload & Configure Seating Charts

## Status: Pending

## Story

- As an **event organizer/promoter**
- I want **to upload my existing seating charts and configure seat mapping**
- so that **I can sell tickets with visual seat selection without building complex charts from scratch**

## Acceptance Criteria (ACs)

1. **AC1:**  Upload seating chart images (PNG, JPG, PDF)
2. **AC2:**  Interactive seat mapping tool to define sellable seats on uploaded charts
3. **AC3:**  Configure seat properties (price tier, section, row/seat number, ADA status)
4. **AC4:**  Visual seat status overlay (available/sold/reserved) on customer-facing chart
5. **AC5:**  Customer interactive seat selection on uploaded charts
6. **AC6:**  Save and manage multiple seating chart configurations per venue
7. **AC7:**  Integration with ticketing and inventory management (Backend needed)
8. **AC8:**  Mobile-responsive chart viewing and selection
9. **AC9:**  ADA seat designation and accessibility compliance
10. **AC10:**  Chart preview and testing tools for organizers

## Tasks / Subtasks

- [ ] Task 1: File upload and management system
  - [ ] Implement secure chart image upload
  - [ ] Add file validation and processing
  - [ ] Create chart storage and retrieval system
- [ ] Task 2: Interactive seat mapping interface
  - [ ] Build click-to-map seat definition tool
  - [ ] Add seat property configuration forms
  - [ ] Implement seat coordinate saving system
  - [ ] **NEW:** Enhanced visual feedback for seat type selection
  - [ ] **NEW:** Prominent real-time seat count dashboard
  - [ ] **NEW:** Revenue tracking and estimation
- [ ] Task 3: Customer-facing interactive charts
  - [ ] Create seat selection overlay system
  - [ ] Add real-time seat status updates (Frontend ready)
  - [ ] Implement mobile-responsive chart viewing
- [ ] Task 4: Chart management and integration
  - [ ] Build chart template save/load functionality
  - [ ] **NEW:** Integrated pricing workflow (Setup → Upload → Map → Preview)
  - [ ] Integrate with existing ticketing system (Backend API needed)
  - [ ] Connect to inventory management (Backend API needed)
- [ ] Task 5: ADA compliance and accessibility
  - [ ] Add ADA seat designation tools
  - [ ] Implement accessibility compliance features
  - [ ] Ensure WCAG compliance for chart interfaces

## Dev Technical Guidance

-  File upload system with validation (PNG, JPG, PDF support)
-  JSON-based seat mapping storage: `{x, y, seatId, properties}`
-  SVG/Canvas overlay for seat status and interaction
-  Real-time inventory integration for seat availability (Needs backend API)
-  Mobile-first responsive design for chart viewing
-  Secure file storage with event-based organization (Needs backend implementation)

## Story Progress Notes

### Agent Model Used: `Claude Sonnet 4 - BMAD Orchestrator`

### Latest Completion Notes

-  **MAJOR UX UPGRADE:** Enhanced seat type selection with visual feedback
-  **DASHBOARD:** Real-time seat count tracking at top of mapping interface  
-  **REVENUE TRACKING:** Live revenue estimation as seats are placed
-  **VISUAL FEEDBACK:** Hover effects, tooltips, and selection indicators
-  **WORKFLOW INTEGRATION:** 5-tab system (Setup → Upload → Map → Configure → Preview)
-  **PROGRESS TRACKING:** Visual progress indicators and completion status
-  **PROFESSIONAL UI:** Card-based dashboard with color-coded statistics

### Technical Implementation Details

**Latest Frontend Enhancements:**
- **Seat Type Selection:** Enhanced buttons with hover effects, tooltips, and clear selection states
- **Real-Time Dashboard:** Prominent seat count tracking with color-coded categories
- **Revenue Calculator:** Live revenue estimation based on seat placement
- **Visual Feedback:** Checkmarks, scaling effects, and selection indicators
- **Integrated Workflow:** Complete pricing setup → chart upload → seat mapping flow
- **Professional UI:** Card-based design with gradient backgrounds and proper spacing

**Pending Backend Integration:**
- File storage API for seating chart images
- Database schema for seat mappings and chart configurations
- Integration with existing ticketing system
- Real-time seat status updates via WebSocket or polling
- Inventory management connection

### Change Log

-  **Latest:** Enhanced visual feedback and dashboard interface
-  Updated from deferred visual builder to active upload-based system
-  Completed frontend implementation with full functionality
-  Focused on practical implementation over complex chart creation
-  Moved from future phase to completed development scope
-  Ready for backend integration and Epic G implementation 