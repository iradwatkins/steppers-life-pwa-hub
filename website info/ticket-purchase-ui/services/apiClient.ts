import type { ApiResponse } from '../types';

interface ApiClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}

class ApiClient {
  private static instance: ApiClient;
  private config: ApiClientConfig;

  private constructor() {
    this.config = {
      baseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.config.baseUrl}${endpoint}`;
      const headers = {
        ...this.config.headers,
        ...customHeaders
      };

      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include'
      });

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: responseData.error || 'An error occurred'
        };
      }

      return {
        success: true,
        data: responseData
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, headers);
  }

  async post<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, headers);
  }

  async put<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, headers);
  }

  async patch<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, headers);
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, headers);
  }

  // Configuration methods
  setBaseUrl(baseUrl: string): void {
    this.config.baseUrl = baseUrl;
  }

  setHeaders(headers: Record<string, string>): void {
    this.config.headers = {
      ...this.config.headers,
      ...headers
    };
  }

  setAuthToken(token: string): void {
    this.setHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  clearAuthToken(): void {
    const { Authorization, ...headers } = this.config.headers || {};
    this.config.headers = headers;
  }
}

export const apiClient = ApiClient.getInstance(); 