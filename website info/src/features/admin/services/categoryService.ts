import apiClient from '@/lib/apiClient'; // Adjusted path as per typical project structure

export interface EventCategory {
  id: string;
  name: string;
  is_active: boolean;
  // display_order?: number; // Future consideration
}

export interface EventCategoryCreationPayload {
  name: string;
}

export interface EventCategoryUpdatePayload {
  name?: string;
  is_active?: boolean;
}

/**
 * Fetches all event categories.
 * @param signal - Optional AbortSignal to cancel the request.
 * @returns A promise that resolves to an array of EventCategory objects.
 */
export const fetchEventCategories = async (signal?: AbortSignal): Promise<EventCategory[]> => {
  const response = await apiClient.get<EventCategory[]>('/admin/event-categories', { signal });
  return response.data;
};

/**
 * Creates a new event category.
 * @param payload - The data required to create the event category.
 * @param signal - Optional AbortSignal to cancel the request.
 * @returns A promise that resolves to the newly created EventCategory object.
 */
export const createEventCategory = async (payload: EventCategoryCreationPayload, signal?: AbortSignal): Promise<EventCategory> => {
  const response = await apiClient.post<EventCategory>('/admin/event-categories', payload, { signal });
  return response.data;
};

/**
 * Updates an existing event category.
 * @param categoryId - The ID of the category to update.
 * @param payload - The data to update the category with.
 * @param signal - Optional AbortSignal to cancel the request.
 * @returns A promise that resolves to the updated EventCategory object.
 */
export const updateEventCategory = async (categoryId: string, payload: EventCategoryUpdatePayload, signal?: AbortSignal): Promise<EventCategory> => {
  const response = await apiClient.put<EventCategory>(`/admin/event-categories/${categoryId}`, payload, { signal });
  return response.data;
};

/**
 * Deletes an event category (or toggles its active status - specific action TBD by backend).
 * For now, let's assume a toggle of active status is preferred over hard delete for referential integrity.
 * If backend supports soft delete via a PATCH to `is_active`, this is better.
 * If backend implements hard DELETE, then this function should be named deleteEventCategory.
 * @param categoryId - The ID of the category to modify.
 * @param isActive - The new active status for the category.
 * @param signal - Optional AbortSignal to cancel the request.
 * @returns A promise that resolves to the modified EventCategory object.
 */
export const toggleEventCategoryStatus = async (categoryId: string, isActive: boolean, signal?: AbortSignal): Promise<EventCategory> => {
  // This endpoint might be PATCH /admin/event-categories/{categoryId} with { is_active: isActive } in payload
  // Or it could be a specific DELETE endpoint if that implies deactivation.
  // For now, we model it as a PUT with the full is_active status, similar to update.
  const response = await apiClient.put<EventCategory>(`/admin/event-categories/${categoryId}`, { is_active: isActive }, { signal });
  return response.data;
};

// If a hard delete is required:
// /**
//  * Deletes an event category.
//  * @param categoryId - The ID of the category to delete.
//  * @returns A promise that resolves when the operation is complete.
//  */
// export const deleteEventCategory = async (categoryId: string): Promise<void> => {
//   await apiClient.delete(`/admin/event-categories/${categoryId}`);
// }; 