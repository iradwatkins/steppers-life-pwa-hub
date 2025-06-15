### IV. Component Breakdown & Implementation Details

This section outlines the conventions and templates for defining UI components for SteppersLife.com. Detailed specification for most feature-specific components will emerge as user stories are implemented. The AI Agent or developer MUST follow the "Template for Component Specification" below whenever a new component is identified for development, ensuring all mandatory fields in the template are filled.

#### Component Naming & Organization

* **Component Naming Convention:**
    * All React component files MUST be named using **PascalCase** (e.g., UserProfileCard.tsx, EventListItem.tsx).
    * The component function/class itself MUST also use PascalCase (e.g., export function UserProfileCard(...) { ... }).
* **Organization:**
    * **Globally Reusable UI Primitives/Elements:** Located in src/components/ui/ (e.g., Button.tsx, Card.tsx, Input.tsx). These are typically wrappers or compositions of Shadcn/UI components or other base elements. They MUST be purely presentational and contain minimal to no business logic.
    * **Global Layout Components:** Located in src/components/layout/ (e.g., Header.tsx, Footer.tsx, AppLayout.tsx, BottomNavPWA.tsx). These components define the structural layout of pages.
    * **Feature-Specific Components:** Components used exclusively by a single feature MUST be co-located within that feature's directory, typically under src/features/[featureName]/components/. If a component initially built for a feature is later identified as globally reusable, it MUST be refactored and moved to src/components/ui/ or src/components/layout/ as appropriate, with its dependencies updated.
    * **Page Components:** Components that represent entire pages or views routed by React Router DOM are located in src/pages/ (for top-level, non-feature-specific pages) or src/features/[featureName]/pages/ (for feature-specific pages).

#### Template for Component Specification

For each significant UI component identified (typically from the Steppers Life\_ Comprehensive UI\_UX Layou.pdf or as new requirements emerge during story development), the following details MUST be documented. This template ensures clarity for implementation.

##### ---

**Component: {ComponentName} (e.g., EventCard, RegistrationForm)**

* **Purpose:** *{Briefly describe what this component does and its role in the UI. MUST be clear and concise. Example: "Displays a summary of an event in a list format, including its title, date, location, and a primary image."}*
* **Source File(s):** *{The exact file path where this component will reside, following the organization guidelines. Example: src/features/events/components/EventCard.tsx}*
* **Visual Reference:** *{Link to the specific screen or element in the Steppers Life\_ Comprehensive UI\_UX Layou.pdf, a Figma frame/component link if available in the future, or a Storybook page. REQUIRED. Example: "See Steppers Life\_ Comprehensive UI\_UX Layou.pdf, Page 4, 'Event Grid / Cards'."}*
* **Props (Properties):** *{List each prop the component accepts. For each prop, all columns in the table MUST be filled. Types should be TypeScript types.}* 
  | Prop Name       | Type                                                              | Required? | Default Value | Description                                                                                                         |
  | :---------------| :---------------------------------------------------------------- | :-------- | :------------ | :------------------------------------------------------------------------------------------------------------------ |
  | title           | string                                                            | Yes       | N/A           | The main title text to be displayed. MUST NOT exceed 100 characters.                                                |
  | imageUrl        | string \| null                                                     | No        | null          | URL for the primary image. MUST be a valid HTTPS URL if provided; defaults to a placeholder if null.                  |
  | onClick         | (id: string) => void                                              | No        | N/A           | Callback function when the component is clicked, passing its associated ID.                                       |
  | {anotherProp}   | {Specific primitive, imported type, or inline interface/type definition} | {Yes/No}  | {If any}      | {MUST clearly state the prop's purpose and any constraints, e.g., 'Must be a positive integer.'}                |
* **Internal State (if any):** *{Describe any significant internal state the component manages. Only list state that is not derived from props or global state. If state is complex, consider if it should be managed by a custom hook or global state solution instead.}*
  | State Variable  | Type    | Initial Value | Description                                                                                             |
  | :---------------| :-------- | :------------ | :------------------------------------------------------------------------------------------------------ |
  | isExpanded      | boolean | false         | Tracks if the component's detailed view is expanded.                                                      |
  | {anotherState}  | {type}  | {value}       | {Description of state variable and its purpose.}                                                        |
* **Key UI Elements / Structure (Conceptual):** *{Provide a pseudo-HTML or JSX-like structure representing the component's DOM. Include key conditional rendering logic if applicable. This structure dictates the primary output for the AI agent or developer.*}
  ```html
  <div class="event-card" onClick={() => onClick(eventId)}>
    {imageUrl && <img src={imageUrl} alt={title} class="event-card-image" />}
    <h3 class="event-card-title">{title}</h3>
    <p class="event-card-date">{formattedDate}</p>
    {isExpanded && <p class="event-card-description">{description}</p>}
    <button class="event-card-toggle-button" onClick={toggleExpand}>
      {isExpanded ? 'Show Less' : 'Show More'}
    </button>
  </div>
  ```
* **Events Handled / Emitted:**
    * **Handles:** *{e.g., onClick on the main div (triggers onClick prop), onClick on the toggle button (calls internal toggleExpand function).}*
    * **Emits:** *{If the component emits custom events/callbacks not covered by props, describe them with their exact signature. e.g., onImageLoadError: () => void}*
* **Actions Triggered (Side Effects, if any):**
    * **State Management (Global):** *{e.g., "Dispatches uiSlice.actions.openEventDetailsModal({ eventId }) from src/store/uiStore.ts. Action payload MUST match the defined action creator."}*
    * **API Calls:** *{Specify which service/function from the API Interaction Layer is called. e.g., "Calls eventService.logEventView(eventId) from src/features/events/services/eventService.ts when expanded."}*
* **Styling Notes:** *{MUST reference specific Shadcn/UI component names if used as a base (e.g., "Uses <Card> and <Button variant='outline'> from src/components/ui/). Otherwise, specify primary Tailwind CSS utility classes or @apply directives for custom component classes. Any dynamic styling logic based on props or state MUST be described. Example: "Container uses p-4 bg-card text-card-foreground rounded-lg shadow-md. Title uses text-lg font-semibold. Image is w-full h-32 object-cover."}*
* **Accessibility Notes:** *{MUST list specific ARIA attributes and their values (e.g., aria-labelledby="event-card-title", role="article"), required keyboard navigation behavior (e.g., "Card is focusable. Enter/Space key activates the onClick prop. Toggle button is focusable and activated by Enter/Space."), and any focus management requirements. Example: "The toggle button MUST have aria-expanded={isExpanded} and aria-controls='event-card-description-id' if the description has an ID."}*

##### --- 