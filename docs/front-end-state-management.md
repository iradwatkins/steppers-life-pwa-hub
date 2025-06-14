### V. State Management In-Depth

This section expands on the client-side state management strategy for SteppersLife.com, complementing React Query which handles server state. Our primary solutions for client-side global state are **Zustand** for more complex application-wide needs and the **React Context API** for localized sharing. This approach ensures state is managed at the most appropriate level, promoting both efficiency and maintainability, which is key for a good user experience in complex flows.

* **Chosen Solutions (Client-Side Global):**
    * **Primary for complex global state:** Zustand (a lightweight, hook-based state management solution).
    * **For localized hierarchical state sharing:** React Context API.
    * (React Query handles all server-cached state. React Hook Form handles form state. Local useState/useReducer for component-internal state.)
* **Decision Guide for Client-Side State Location:**
    * **Global State (Zustand - e.g., stores in src/store/):**
        * Data shared across many unrelated components or features (e.g., UI theme preferences \[like Night Mode\], global notification messages, non-persistent user interface settings).
        * State that needs to persist across route changes but isn't server data (Zustand stores can be configured with persistence middleware for things like theme choice).
        * Complex client-side logic that benefits from a centralized store structure and well-defined actions/mutators.
        * **MUST be used for:** User session details (if not solely managed by an AuthProvider context and React Query for user profile data), application-wide UI settings like the selected Night Mode, and global notification/alert states (e.g., for a "message sent" confirmation after contacting an organizer).
    * **React Context API (e.g., providers in src/providers/):**
        * State primarily passed down a specific component subtree (e.g., theming information via ThemeProvider, context for a complex multi-step form if its state doesn't need to be global, or providing shared state/functions to a closely related group of components).
        * Simpler state management needs where a full global store is overkill.
        * **MUST be used for:** Providing theming context, specific modal states that are only relevant to one part of the component tree, or other localized data/functions not suitable for extensive prop drilling and not required globally.
    * **Local Component State (useState, useReducer):**
        * UI-specific state that is not needed outside the component or its direct children (e.g., individual form input values before validation by React Hook Form, dropdown open/close status, active tab within a component like the "Upcoming"/"Past" tickets tabs).
        * **MUST be the default choice unless clear criteria for Context or Global State (Zustand) are met.**

#### Global Store Structure (using Zustand as an example)

Global client-side state stores using Zustand will typically be organized by domain or concern within the src/store/ directory (as per our approved directory structure).

* **Core Store Module Example (e.g., uiStore.ts in src/store/uiStore.ts):**
    * **Purpose:** Manages global UI states such as theme selection (Night Mode), global user notification messages (toasts/banners), or global loading indicators not directly tied to React Query's loading states. This contributes to a consistent and responsive user experience.
    * **State Shape (Interface/Type):**
        ```typescript
        interface NotificationMessage {
          id: string;
          message: string;
          type: 'info' | 'success' | 'warning' | 'error';
          duration?: number; // Optional: auto-dismiss duration
        }

        interface UIState {
          theme: 'light' | 'dark';
          notifications: Array<NotificationMessage>;
          isGlobalOverlayLoading: boolean; // For a full-screen, non-specific loading overlay
        }

        interface UIActions {
          setTheme: (theme: UIState['theme']) => void;
          addNotification: (notification: Omit<NotificationMessage, 'id'>) => string; // Returns ID
          removeNotification: (id: string) => void;
          setGlobalOverlayLoading: (isLoading: boolean) => void;
        }
        ```
    * **Zustand Store Definition (Conceptual):**
        ```typescript
        import { create } from 'zustand';
        import { devtools, persist } from 'zustand/middleware'; // Optional

        export const useUIStore = create<UIState & UIActions>()(
          devtools( // Optional: for Redux DevTools integration
            persist( // Optional: to persist theme choice
              (set, get) => ({
                theme: 'light', // Default theme
                notifications: [],
                isGlobalOverlayLoading: false,
                setTheme: (theme) => set({ theme }),
                addNotification: (notificationContent) => {
                  const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
                  set((state) => ({
                    notifications: [...state.notifications, { ...notificationContent, id }],
                  }));
                  return id;
                },
                removeNotification: (id) => set((state) => ({
                  notifications: state.notifications.filter((n) => n.id !== id),
                })),
                setGlobalOverlayLoading: (isLoading) => set({ isGlobalOverlayLoading: isLoading }),
              }),
              {
                name: 'stepperslife-ui-settings', // Unique name for localStorage item
                partialize: (state) => ({ theme: state.theme }), // Only persist the 'theme'
              }
            )
          )
        );
        ```
* **Feature Store Module Template (e.g., src/features/{featureName}/store/{featureName}ClientStore.ts):**
    * **Purpose:** *{To be defined when a specific feature requires its own complex client-side global state store (using Zustand). For example, managing the multi-step state of a complex event creation wizard if it doesn't fit well into local component state or form state.*}
    * **State Shape (Interface/Type):** *{To be defined by the feature, ensuring clarity for AI Dev Agents.*}
    * **Actions/Mutators:** *{To be defined by the feature. Actions should be granular and clearly named.*}
    * **Export:** *{The custom hook (e.g., useFeatureNameClientStore) MUST be exported.}*

#### Key Selectors / Computed State (from Zustand stores)

Selectors for Zustand stores are typically simple functions that access parts of the state from the hook. For more complex derived data, memoized selectors can be created outside the store definition using libraries like reselect if needed, or computed directly within components if simple.

* const currentTheme = useUIStore(state => state.theme);
* const activeNotifications = useUIStore(state => state.notifications);

#### Key Actions / Mutators (for Zustand stores)

Actions in Zustand are functions within the store definition that use the set function to update state. Asynchronous logic within these actions should be handled carefully; if they involve server interactions, those interactions are primarily React Query's responsibility. Client state updates post-server interaction can be triggered from React Query's callbacks.

* **Core Action Example: setTheme(theme) (in uiStore.ts):**
    * **Purpose:** Updates the application-wide theme preference (e.g., for Night Mode).
    * **Parameters:** theme: 'light' | 'dark'
    * **Implementation:** (theme) => set({ theme }) (as shown in the store definition). This might also trigger persistence to localStorage via the middleware.
* Client-Side State Updates Post-Server Interaction (Example with React Query):
    If a server operation (e.g., creating an event via a React Query mutation) needs to trigger a global UI notification:
    ```typescript
    // Inside a component or custom hook using the React Query mutation
    const { mutate: createEvent } = useCreateEventMutation({
      onSuccess: (data) => {
        // Server operation successful
        useUIStore.getState().addNotification({
          message: `Event "${data.title}" created successfully!`,
          type: 'success',
          duration: 5000
        });
        // Potentially navigate or trigger other client-side effects
      },
      onError: (error) => {
        // Server operation failed
        useUIStore.getState().addNotification({
          message: `Failed to create event: ${error.message}`,
          type: 'error'
        });
      }
    });
    ```
    This pattern keeps server state management with React Query and client UI state (like global notifications) with Zustand, ensuring a clean separation of concerns. 