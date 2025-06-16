# Story B.012: Event Ratings & Reviews System

## Status: ✅ Complete

## Story

- As a **buyer who has attended an event**
- I want **to rate and review my experience**
- so that **other users can make informed decisions and organizers can receive valuable feedback to improve future events**

## Acceptance Criteria (ACs)

1. **AC1:** Only users who have purchased tickets for an event can submit reviews
2. **AC2:** Review system includes 1-5 star rating and optional written review
3. **AC3:** Reviews display user name, attendance verification, rating, review text, and date
4. **AC4:** Event details page shows aggregate rating and recent reviews
5. **AC5:** Organizers can respond to reviews with public replies
6. **AC6:** Users can edit/delete their own reviews within 30 days of submission
7. **AC7:** Review moderation system with report functionality for inappropriate content
8. **AC8:** Reviews are sorted by most recent by default with option to sort by rating
9. **AC9:** Review statistics show rating breakdown (5-star: X, 4-star: Y, etc.)
10. **AC10:** Integration with existing EventDetailsPage and user profile sections

## Tasks / Subtasks

- [ ] Task 1: Create review data structures and service (AC: 1, 2, 3)
  - [ ] Define review interfaces and types
  - [ ] Create review service with CRUD operations
  - [ ] Implement ticket ownership verification for review eligibility
- [ ] Task 2: Build interactive star rating system (AC: 2, 9)
  - [ ] Create StarRating component with hover effects
  - [ ] Implement rating breakdown visualization with statistics
  - [ ] Add descriptive labels for rating levels
- [ ] Task 3: Implement review form and validation (AC: 2, 6)
  - [ ] Create ReviewForm component with guidelines
  - [ ] Add character limits and input validation
  - [ ] Implement 30-day edit window for user reviews
- [ ] Task 4: Build review display and management (AC: 3, 5, 8)
  - [ ] Create ReviewList component with sorting and filtering
  - [ ] Add organizer reply functionality
  - [ ] Implement user actions (edit/delete) with proper permissions
- [ ] Task 5: Add review moderation system (AC: 7)
  - [ ] Implement review reporting functionality
  - [ ] Add automatic hiding of reported content
  - [ ] Create moderation interface for admins
- [ ] Task 6: Integrate with EventDetailsPage (AC: 4, 10)
  - [ ] Create ReviewsSection component for event details
  - [ ] Replace static review display with dynamic system
  - [ ] Add aggregate rating display and statistics
- [ ] Task 7: Add profile integration and notifications (AC: 10)
  - [ ] Integrate review system with user profiles
  - [ ] Add toast notifications for all review actions
  - [ ] Implement proper error handling and loading states

## Dev Technical Guidance

- Create comprehensive review service with validation and moderation features
- Use React hooks for seamless frontend integration with real-time data management
- Implement modular review components for reusability across different pages
- Add proper authentication checks to ensure only ticket holders can review
- Create interactive rating system with visual feedback and accessibility features
- Ensure review moderation system protects against inappropriate content
- Install date-fns for consistent date formatting across review components

## Story Progress Notes

### Agent Model Used: `Claude Sonnet 4 (BMAD Product Owner)`

### Completion Notes List

- Created comprehensive review service with full CRUD operations, validation, and moderation features
- Built useReviews React hook for seamless frontend integration with real-time data management
- Created modular review components: StarRating, ReviewForm, ReviewList, and ReviewsSection
- Implemented interactive star rating system with hover effects and descriptive labels
- Added comprehensive review form with guidelines, character limits, and validation
- Built review list with sorting, filtering, user actions (edit/delete/report), and organizer reply functionality
- Integrated rating breakdown visualization with percentage bars and statistics
- Added review reporting and moderation system with automatic hiding of reported content
- Implemented 30-day edit window for reviews with clear user feedback
- Added verification badges for ticket holders and organizer response features
- Fully integrated with existing EventDetailsPage replacing old static review display
- Added proper error handling, loading states, and toast notifications throughout
- Installed and configured date-fns for consistent date formatting across components

### Change Log

- Created src/services/reviewService.ts with comprehensive review management and moderation
- Built src/hooks/useReviews.ts for seamless frontend review data management
- Created src/components/reviews/StarRating.tsx with interactive rating system
- Implemented src/components/reviews/ReviewForm.tsx with validation and guidelines
- Built src/components/reviews/ReviewList.tsx with sorting, filtering, and user actions
- Created src/components/reviews/ReviewsSection.tsx for integration with EventDetailsPage
- Updated EventDetailsPage.tsx to use new dynamic review system instead of static display
- Added proper authentication checks for review submission and management
- Implemented review ownership verification to ensure only ticket holders can review
- Added comprehensive error handling and user feedback throughout all review components
- Installed date-fns package for consistent date formatting across review components 