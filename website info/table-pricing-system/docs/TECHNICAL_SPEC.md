# Table Pricing System - Technical Specification

## Component Architecture

### 1. Main Components

#### EventSeatingPage
- Primary container component
- Handles form state and submission
- Manages table and section arrays
- Implements routing and navigation

#### Table Configuration
- Table name/number input
- Capacity management
- Pricing type selection (table/individual)
- Price input fields
- Block/unblock functionality

#### Section Configuration
- Section naming
- Capacity management
- Price per seat
- Section description
- Block/unblock functionality

### 2. Data Models

```typescript
// Table Schema
interface Table {
  id: string;
  name: string;
  capacity: string;
  pricingType: 'table' | 'individual';
  tablePrice?: string;
  seatPrice?: string;
  isBlocked: boolean;
}

// Section Schema
interface Section {
  id: string;
  name: string;
  description?: string;
  capacity: string;
  pricePerSeat: string;
  isBlocked: boolean;
}

// Form Schema
interface SeatingFormData {
  eventId: string;
  seatingType: 'general' | 'reserved';
  generalAdmissionCapacity?: string;
  generalAdmissionPrice?: string;
  tables?: Table[];
  sections?: Section[];
}
```

### 3. Form Validation (Zod)

```typescript
const tableSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Table name is required'),
  capacity: z.string().min(1, 'Table capacity is required'),
  pricingType: z.enum(['table', 'individual']),
  tablePrice: z.string().optional(),
  seatPrice: z.string().optional(),
  isBlocked: z.boolean().default(false),
});

const sectionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Section name is required'),
  description: z.string().optional(),
  capacity: z.string().min(1, 'Section capacity is required'),
  pricePerSeat: z.string().min(1, 'Price per seat is required'),
  isBlocked: z.boolean().default(false),
});
```

### 4. UI Components (Shadcn/UI)

- Card
- Form
- Input
- Select
- Button
- Badge
- Switch
- Separator

### 5. Styling (Tailwind CSS)

Key classes used:
- Grid layouts: `grid grid-cols-1 md:grid-cols-2`
- Spacing: `space-y-4`, `gap-4`
- Flexbox: `flex justify-between items-center`
- Responsive: `md:grid-cols-2`
- Colors: `text-muted-foreground`, `bg-muted/30`
- Typography: `text-lg`, `font-bold`

### 6. State Management

- React Hook Form for form state
- useFieldArray for dynamic arrays
- Local state for loading/submitting
- Form validation with Zod

### 7. API Integration

[To be added after extraction]

### 8. Accessibility Features

- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support
- Color contrast compliance

### 9. Mobile Responsiveness

- Mobile-first design
- Responsive grid layouts
- Touch-friendly controls
- Adaptive spacing
- Flexible form layouts

### 10. Error Handling

- Form validation errors
- API error handling
- User feedback (toast notifications)
- Loading states
- Error boundaries 