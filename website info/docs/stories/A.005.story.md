# Story A.005: Organizer Custom Attendee Information Questions UI

## Status: Done

## Story

- As an **event organizer/promoter**
- I want **to create custom questions for event registration**
- so that **I can collect specific information from attendees beyond standard name and email**

## Acceptance Criteria (ACs)

1. **AC1:** Interface to add custom questions to event registration forms
2. **AC2:** Support for text input question types
3. **AC3:** Support for multiple choice question types
4. **AC4:** Question management (add, edit, delete, reorder)
5. **AC5:** Required vs optional question designation
6. **AC6:** Preview of how questions will appear to attendees
7. **AC7:** Integration with event registration workflow
8. **AC8:** Form validation for custom question setup
9. **AC9:** Mobile-responsive custom questions interface
10. **AC10:** Standard attendee information (name, email) remains required

## Tasks / Subtasks

- [x] Task 1: Create EventCustomQuestionsPage component (AC: 1, 8)
  - [x] Build custom questions management interface
  - [x] Implement form validation for question setup
- [x] Task 2: Question type implementation (AC: 2, 3)
  - [x] Add text input question type
  - [x] Add multiple choice question type
  - [x] Create question type selection interface
- [x] Task 3: Question management functionality (AC: 4, 5)
  - [x] Implement add/edit/delete question operations
  - [x] Add question reordering capability
  - [x] Set required vs optional designation
- [x] Task 4: Preview and integration (AC: 6, 7, 10)
  - [x] Create attendee view preview of questions
  - [x] Integrate with event registration workflow
  - [x] Ensure standard fields remain required
- [x] Task 5: Routing and mobile optimization (AC: 9)
  - [x] Add route /organizer/event/:eventId/custom-questions
  - [x] Ensure mobile-responsive design

## Dev Technical Guidance

- Created EventCustomQuestionsPage.tsx for question management
- Supports text and multiple choice question types
- Implements CRUD operations for custom questions
- Provides preview of attendee registration experience
- Integrates with event management workflow

## Story Progress Notes

### Agent Model Used: `Lovable.dev Integration`

### Completion Notes List

- Successfully created EventCustomQuestionsPage.tsx for organizers to add/edit custom questions
- Implemented text and multiple choice question types for event registration
- Added question management with add/edit/delete/reorder functionality
- Created preview functionality for attendee registration experience
- Added route /organizer/event/:eventId/custom-questions

### Change Log

- Created EventCustomQuestionsPage.tsx with question management interface
- Added text input and multiple choice question type support
- Implemented CRUD operations for custom questions
- Added required vs optional question designation
- Created attendee preview functionality
- Integrated with event registration workflow
- Added routing and mobile-responsive design 