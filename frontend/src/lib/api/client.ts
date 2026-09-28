import type { ApiResponse, ApiError, ApiRequestConfig } from '@/types/api';

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.slice(4) : endpoint;
    const base = this.baseURL.replace(/\/+$/, '');
    const path = cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`;
    const url = new URL(`${base}${path}`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081');

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let error: ApiError;

      try {
        const errorData = await response.json();
        error = {
          message: errorData.message || 'An error occurred',
          code: errorData.code,
          statusCode: response.status,
          details: errorData.details,
        };
      } catch {
        error = {
          message: response.statusText || 'An error occurred',
          statusCode: response.status,
        };
      }

      throw error;
    }

    return response.json();
  }

  async request<T = unknown>(config: ApiRequestConfig & { endpoint: string }): Promise<ApiResponse<T>> {
    const { endpoint, method = 'GET', params, body, headers } = config;
    const url = this.buildUrl(endpoint, params);

    const requestOptions: RequestInit = {
      method,
      headers: {
        ...this.getHeaders(),
        ...headers,
      },
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, requestOptions);
    const data = await this.handleResponse<T>(response);

    return {
      data,
      success: response.ok,
    };
  }

  async get<T = unknown>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, method: 'GET', params });
  }

  async post<T = unknown>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, method: 'POST', body });
  }

  async put<T = unknown>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, method: 'PUT', body });
  }

  async patch<T = unknown>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, method: 'PATCH', body });
  }

  async delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export { ApiClient };
