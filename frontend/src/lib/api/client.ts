import type { ApiResponse, ApiError, ApiRequestConfig } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    let base = (process.env.NEXT_PUBLIC_API_URL || this.baseURL || 'http://localhost:8000').trim();

    if (typeof window !== 'undefined') {
      if (!base.startsWith('http://') && !base.startsWith('https://')) {
        const origin = window.location.origin;
        const prefix = base.startsWith('/') ? base : `/${base}`;
        base = `${origin}${prefix === '/' ? '' : prefix}`;
      } else {
        try {
          const u = new URL(base);
          if (u.hostname === 'api' || u.hostname === 'backend') {
            base = `${window.location.origin}${u.pathname}`;
          }
        } catch {}
      }
    }

    let cleanBase = base.replace(/\/+$/, '');

    if (cleanBase.endsWith('/api') && (cleanEndpoint.startsWith('/api/') || cleanEndpoint === '/api')) {
      cleanEndpoint = cleanEndpoint === '/api' ? '' : cleanEndpoint.substring(4);
    } else if (!cleanBase.endsWith('/api') && !cleanEndpoint.startsWith('/api/') && cleanEndpoint !== '/api') {
      cleanEndpoint = `/api${cleanEndpoint}`;
    }

    let fullUrl = `${cleanBase}${cleanEndpoint}`;
    fullUrl = fullUrl.replace(/\/api\/api\//g, '/api/').replace(/\/api\/api$/g, '/api');

    const url = new URL(fullUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000');

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
