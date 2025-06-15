### VI. API Interaction Layer

This section details the strategy and conventions for frontend communication with the backend APIs, as defined in the main SteppersLife.com Architecture Document (Version 0.2).md (specifically its "API Reference" and "Data Models" sections). React Query will primarily consume the services defined here for its data fetching and mutation logic.

#### Client/Service Structure

* **HTTP Client Setup:**
    * **Library:** Axios will be used as the primary HTTP client for its ease of use, feature set (like interceptors), and broad community support.
    * **Instance Configuration (src/lib/apiClient.ts):** A single, configured Axios instance MUST be created and used throughout the application.
        * **Base URL:** The API base URL MUST be sourced from an environment variable (e.g., import.meta.env.VITE_API_BASE_URL).
        * **Default Headers:** Default headers like Content-Type: 'application/json' and Accept: 'application/json' MUST be configured.
        * **Interceptors:**
            * **Request Interceptor:** MUST be implemented to automatically attach the authentication token (e.g., JWT) to outgoing requests for protected endpoints. The token will be retrieved from our client-side state (e.g., userSessionStore.getState().token).
            * **Response Interceptor:** MUST be implemented for global error handling (see "Error Handling & Retries" below) and potentially for response data normalization if needed.
        * **Timeout:** A sensible default request timeout (e.g., 10-15 seconds) MUST be configured to prevent requests from hanging indefinitely, supporting performance NFRs.
* **Service Definitions (Pattern):**
    * All data transfer objects (DTOs) used for request payloads (e.g., EventCreationPayload) and for defining the shape of response data (e.g., Event) MUST be explicitly typed using TypeScript interfaces or types. These types should ideally be located in relevant types.ts files within feature directories (e.g., src/features/events/types.ts) or in src/types/ for globally applicable DTOs. These types must accurately reflect the schemas defined in the backend API Reference section of the SteppersLife.com Architecture Document (Version 0.2).md. Furthermore, these service function return types and payload types should be designed considering all data necessary for rich UI presentation, user interaction, and accessibility information as guided by the Steppers Life Comprehensive UI UX Layou.pdf and future detailed component specifications.
    * API interactions will be encapsulated within service modules, typically organized by feature or domain (e.g., in src/features/[featureName]/services/ or globally in src/services/ if broadly applicable).
    * Each service function MUST:
        * Have explicit TypeScript types for its parameters and return values (e.g., Promise<EventType>).
        * Include JSDoc/TSDoc comments explaining its purpose, parameters, return value, and any specific error handling expectations or side effects.
        * Use the configured apiClient instance from src/lib/apiClient.ts to make HTTP requests.
        * Clearly map to specific backend API endpoints defined in the main Architecture Document.
    * Service functions, especially those fetching lists of data (e.g., fetchEvents for event listings, or functions for the Community Directory), MUST explicitly support passing parameters for pagination, filtering, and sorting if the backend API (as defined in the Main Architecture Document) provides these capabilities. This is crucial for performance (NFRs) and a good user experience when dealing with potentially large datasets.
    * For services supporting community interaction features (e.g., functions for following entities, posting reviews/comments, managing user network connections), function designs should aim to seamlessly support optimistic updates on the client-side. This will often be orchestrated by React Query's mutation features, but the underlying service call should return data conducive to this pattern, enhancing the perceived responsiveness and 'live' feel of the community platform.
    * **Example (src/features/events/services/eventService.ts):**
        ```typescript
        import apiClient from '@/lib/apiClient'; // Adjust path as per actual structure
        import type { Event, EventCreationPayload, EventFilters } from '@/features/events/types'; // Assuming types are defined

        /**
         * Fetches a list of all events, supporting filtering and pagination.
         * @param filters - Optional query parameters for filtering, pagination, etc.
         * @returns A promise that resolves to an array of Event objects.
         */
        export const fetchEvents = async (filters?: EventFilters): Promise<Event[]> => { // Example: EventFilters could include page, limit, category
          const response = await apiClient.get<Event[]>('/events', { params: filters });
          return response.data;
        };

        /**
         * Fetches a single event by its ID.
         * @param eventId - The ID of the event to fetch.
         * @returns A promise that resolves to the Event object.
         */
        export const fetchEventById = async (eventId: string): Promise<Event> => {
          const response = await apiClient.get<Event>(`/events/${eventId}`);
          return response.data;
        };

        /**
         * Creates a new event.
         * @param payload - The data required to create the event.
         * @returns A promise that resolves to the newly created Event object.
         */
        export const createEvent = async (payload: EventCreationPayload): Promise<Event> => {
          const response = await apiClient.post<Event>('/events', payload);
          return response.data;
        };

        // ... other event-related service functions (updateEvent, deleteEvent, etc.)
        ```

#### Error Handling & Retries (Frontend)

* **Global Error Handling:**
    * **Mechanism:** The Axios response interceptor in src/lib/apiClient.ts WILL be the primary point for global API error handling.
    * **Error Normalization & Propagation:** It SHOULD attempt to normalize errors into a consistent shape before they are propagated (e.g., ensuring error.response.data.message or a specific error.message field is reliably available). After normalization, it will typically dispatch a global user-friendly notification (via uiStore, e.g., useUIStore.getState().addNotification({ message: 'An unexpected error occurred...', type: 'error' })) for widespread issues and then re-throw the normalized error object. This allows React Query's onError callbacks or specific component-level error handlers to receive a predictable error structure for more contextual handling if needed.
    * **Logging:** All significant API errors caught by the interceptor SHOULD be logged to the console (during development) and potentially to a remote logging service (in production) with relevant context (URL, status, error message).
    * **Specific HTTP Status Codes:** The interceptor may handle specific status codes globally (e.g., a 401 Unauthorized could trigger a logout action or a token refresh attempt, a 403 Forbidden could redirect to an access denied page or show a specific message).
* **Specific Error Handling in Components/Hooks (via React Query):**
    * While global handlers catch general errors, React Query's onError callbacks in useQuery and useMutation hooks WILL be used by components or feature-specific hooks to handle errors in a more context-specific manner.
    * For example, a form submission mutation might use onError to display inline error messages next to form fields or show a specific error message related to that particular action. This MUST be documented in the relevant component's specification if it deviates from or augments global handling.
* **Retry Logic:**
    * **Library:** A library like axios-retry CAN be integrated with our apiClient instance.
    * **Configuration:** If implemented, it MUST be configured with:
        * **Max Retries:** A sensible number (e.g., 2-3 attempts).
        * **Retry Conditions:** Only for transient network errors or specific idempotent server errors (e.g., 502, 503, 504). It MUST NOT retry on 4xx client errors by default.
        * **Retry Delay:** An exponential backoff strategy is recommended (e.g., retryDelay: axiosRetry.exponentialDelay).
    * **Idempotency:** Automatic retry logic MUST only be applied to idempotent HTTP requests (e.g., GET, PUT, DELETE). POST requests SHOULD NOT be retried automatically by this global mechanism unless the specific endpoint is known to be safely idempotent. React Query itself provides options for retrying queries. 