# Seating UI Reference

This folder contains the table pricing and seating UI components and their associated documentation from the SteppersLife.com project.

## Contents

### Components
- `EventSeatingPage.tsx`: The main component for configuring event seating arrangements
- `components/ui/`: UI components used by the seating system (buttons, inputs, cards, etc.)
- `hooks/`: Custom hooks used by the seating system (useToast)

### Configuration
- `package.json`: Required dependencies
- `tailwind.config.js`: Tailwind CSS configuration

### Documentation
- `STORY_A.003.md`: Story A.003 - Organizer Seating Configuration UI (GA, Tables, Sections)
- `STORY_A.004.md`: Story A.004 - Upload & Configure Seating Charts
- `STORIES_INDEX.md`: Index of all stories related to the seating system
- `UI_UX_SPEC.md`: Detailed UI/UX specification for the seating system

## Features

### Seating Configuration
- Table configuration with pricing options
- Section management
- Visual interface for seating arrangements
- Form validation and error handling
- Responsive design

### Core Functionality
- General Admission (GA) seating setup
- Table-based seating with capacity management
- Section/Block-based seating arrangements
- Pricing options for entire tables or individual seats
- Seat blocking for unavailable tables/sections
- Basic inventory management
- Mobile-responsive interface

## Implementation Details

The seating system is built using:
- React + TypeScript
- Shadcn/UI components
- Tailwind CSS for styling
- React Hook Form for form management
- Zod for form validation

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Configure Tailwind CSS:
```bash
npx tailwindcss init -p
```

3. Import the component:
```typescript
import EventSeatingPage from './EventSeatingPage';
```

4. Use the component:
```typescript
<EventSeatingPage />
```

## Note

These files are organized here for reference and documentation purposes. The folder is self-contained and includes all necessary files to rebuild the seating system. 