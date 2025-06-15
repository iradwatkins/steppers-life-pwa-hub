interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async makeRequest<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    const { method, url, data, headers = {}, requiresAuth = false } = config;

    // Build headers
    const requestHeaders = { ...this.defaultHeaders, ...headers };
    
    if (requiresAuth) {
      const token = this.getAuthToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    // Build request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (data && method !== 'GET') {
      requestOptions.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${this.baseURL}${url}`, requestOptions);
      
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        return {
          error: responseData?.detail || responseData || `HTTP ${response.status}`,
          status: response.status
        };
      }

      return {
        data: responseData,
        status: response.status
      };
    } catch (error) {
      console.error('API Request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0
      };
    }
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    return this.makeRequest<{
      access_token: string;
      token_type: string;
      expires_in: number;
      user: any;
    }>({
      method: 'POST',
      url: '/auth/login',
      data: { email, password }
    });
  }

  async register(userData: {
    email: string;
    password: string;
    username: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
  }) {
    return this.makeRequest({
      method: 'POST',
      url: '/auth/register',
      data: userData
    });
  }

  async getCurrentUser() {
    return this.makeRequest({
      method: 'GET',
      url: '/auth/me',
      requiresAuth: true
    });
  }

  async verifyEmail(token: string) {
    return this.makeRequest({
      method: 'POST',
      url: '/auth/verify-email',
      data: { token }
    });
  }

  async requestPasswordReset(email: string) {
    return this.makeRequest({
      method: 'POST',
      url: '/auth/password-reset-request',
      data: { email }
    });
  }

  async confirmPasswordReset(token: string, new_password: string) {
    return this.makeRequest({
      method: 'POST',
      url: '/auth/password-reset-confirm',
      data: { token, new_password }
    });
  }

  // Events endpoints
  async getEvents(params?: { 
    category_id?: number;
    skip?: number;
    limit?: number;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const url = `/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest({
      method: 'GET',
      url,
      requiresAuth: true
    });
  }

  async getEvent(eventId: number) {
    return this.makeRequest({
      method: 'GET',
      url: `/events/${eventId}`,
      requiresAuth: true
    });
  }

  async createEvent(eventData: any) {
    return this.makeRequest({
      method: 'POST',
      url: '/events',
      data: eventData,
      requiresAuth: true
    });
  }

  async updateEvent(eventId: number, eventData: any) {
    return this.makeRequest({
      method: 'PUT',
      url: `/events/${eventId}`,
      data: eventData,
      requiresAuth: true
    });
  }

  async deleteEvent(eventId: number) {
    return this.makeRequest({
      method: 'DELETE',
      url: `/events/${eventId}`,
      requiresAuth: true
    });
  }

  // Tickets endpoints
  async getEventTickets(eventId: number) {
    return this.makeRequest({
      method: 'GET',
      url: `/tickets/event/${eventId}`,
      requiresAuth: true
    });
  }

  async purchaseTicket(ticketData: {
    event_id: number;
    ticket_type: string;
    quantity: number;
    attendee_name: string;
    attendee_email: string;
    attendee_phone?: string;
  }) {
    return this.makeRequest({
      method: 'POST',
      url: '/tickets/purchase',
      data: ticketData,
      requiresAuth: true
    });
  }

  async getTicket(ticketId: number) {
    return this.makeRequest({
      method: 'GET',
      url: `/tickets/${ticketId}`,
      requiresAuth: true
    });
  }

  async checkInTicket(ticketId: number) {
    return this.makeRequest({
      method: 'POST',
      url: `/tickets/${ticketId}/checkin`,
      requiresAuth: true
    });
  }

  async verifyTicket(verification_token: string) {
    return this.makeRequest({
      method: 'POST',
      url: '/tickets/verify',
      data: { verification_token },
      requiresAuth: true
    });
  }

  // Payments endpoints
  async createPaymentIntent(amount: number, currency: string = 'usd') {
    return this.makeRequest({
      method: 'POST',
      url: '/payments/create-intent',
      data: { amount, currency },
      requiresAuth: true
    });
  }

  async confirmPayment(payment_intent_id: string) {
    return this.makeRequest({
      method: 'POST',
      url: '/payments/confirm',
      data: { payment_intent_id },
      requiresAuth: true
    });
  }

  async refundPayment(payment_intent_id: string, amount?: number) {
    return this.makeRequest({
      method: 'POST',
      url: '/payments/refund',
      data: { payment_intent_id, amount },
      requiresAuth: true
    });
  }

  // File uploads endpoints
  async uploadImage(file: File, category: string = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    return this.makeRequest({
      method: 'POST',
      url: '/uploads/image',
      data: formData,
      headers: {}, // Let the browser set Content-Type for FormData
      requiresAuth: true
    });
  }

  async uploadDocument(file: File, category: string = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    return this.makeRequest({
      method: 'POST',
      url: '/uploads/document',
      data: formData,
      headers: {}, // Let the browser set Content-Type for FormData
      requiresAuth: true
    });
  }

  async batchUpload(files: File[], category: string = 'general') {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('category', category);

    return this.makeRequest({
      method: 'POST',
      url: '/uploads/batch',
      data: formData,
      headers: {}, // Let the browser set Content-Type for FormData
      requiresAuth: true
    });
  }

  // Admin endpoints
  async getCategories() {
    return this.makeRequest({
      method: 'GET',
      url: '/admin/event-categories',
      requiresAuth: true
    });
  }

  async createCategory(categoryData: { name: string; description?: string }) {
    return this.makeRequest({
      method: 'POST',
      url: '/admin/event-categories',
      data: categoryData,
      requiresAuth: true
    });
  }

  async updateCategory(categoryId: number, categoryData: { name: string; description?: string }) {
    return this.makeRequest({
      method: 'PUT',
      url: `/admin/event-categories/${categoryId}`,
      data: categoryData,
      requiresAuth: true
    });
  }

  async deleteCategory(categoryId: number) {
    return this.makeRequest({
      method: 'DELETE',
      url: `/admin/event-categories/${categoryId}`,
      requiresAuth: true
    });
  }

  // Health check
  async healthCheck() {
    return this.makeRequest({
      method: 'GET',
      url: '/health',
      requiresAuth: false
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient; 