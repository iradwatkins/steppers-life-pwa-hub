# Ticket Purchase UI System

This folder contains the complete ticket and table purchase system components from SteppersLife.com.

## Folder Structure

```
ticket-purchase-ui/
├── components/           # React components
│   ├── ticket/          # Ticket-related components
│   ├── table/           # Table-related components
│   ├── checkout/        # Checkout flow components
│   └── shared/          # Shared UI components
├── services/            # API and business logic services
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── assets/             # Images, icons, and other static assets
└── docs/               # Documentation and specifications
```

## Core Features

### Ticket Purchase System
1. Ticket Selection
   - Event ticket types display
   - Quantity selection
   - Price calculation
   - Availability checking

2. Checkout Process
   - Attendee information collection
   - Payment processing
   - Order confirmation
   - Receipt generation

3. Ticket Management
   - QR code generation
   - Email delivery
   - Ticket transfer
   - Refund processing

### Table Purchase System
1. Table Configuration
   - Table layout design
   - Section management
   - Capacity settings
   - Pricing rules

2. Table Reservation
   - Table selection interface
   - Reservation management
   - Check-in system
   - Table status tracking

3. Table Management
   - Table dashboard
   - Reservation calendar
   - Guest list management
   - Table status updates

## Implementation Details

### Technologies Used
- React + TypeScript
- Shadcn/UI components
- Tailwind CSS
- React Hook Form
- Zod validation
- QR code generation
- Email service integration
- Payment processing

### Key Components

#### Ticket Components
- `TicketSelection.tsx`: Main ticket selection interface
- `TicketQuantity.tsx`: Quantity selection and price calculation
- `AttendeeForm.tsx`: Attendee information collection
- `TicketConfirmation.tsx`: Order confirmation and receipt
- `TicketQRCode.tsx`: QR code generation and display

#### Table Components
- `TableLayout.tsx`: Visual table layout designer
- `TablePricing.tsx`: Table pricing configuration
- `TableReservation.tsx`: Table reservation interface
- `TableManagement.tsx`: Table management dashboard
- `TableCheckIn.tsx`: Table check-in system

#### Checkout Components
- `CheckoutForm.tsx`: Main checkout form
- `PaymentProcessor.tsx`: Payment processing
- `OrderSummary.tsx`: Order summary display
- `ConfirmationPage.tsx`: Order confirmation page

#### Shared Components
- `PriceDisplay.tsx`: Price formatting and display
- `AvailabilityBadge.tsx`: Availability status display
- `LoadingSpinner.tsx`: Loading state indicator
- `ErrorDisplay.tsx`: Error message display

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

## Integration Points

### API Services
- Ticket service
- Table service
- Payment service
- Email service
- QR code service

### External Services
- Payment processor
- Email delivery
- QR code generation
- Calendar integration

## Documentation

Additional documentation can be found in the `docs/` folder:
- API specifications
- Component documentation
- Integration guides
- Testing procedures 