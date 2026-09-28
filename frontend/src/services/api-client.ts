/**
 * Aptora — API Client
 * Centralized fetch wrapper with base URL, error handling, and type safety.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: { ...options.headers },
      ...options,
    };
    const headers = new Headers(config.headers);
    if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const token = this.getAuthToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    config.headers = headers;

    try {
      const response = await fetch(url, { ...config, credentials: "include" });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        const message = body?.message || body?.detail || body?.error?.detail || `HTTP ${response.status}`;
        throw new ApiError(message, response.status, body);
      }

      return body as T;
    } catch (error) { throw error; }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async upload<T>(endpoint: string, body: FormData): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body });
  }

  async uploadWithProgress<T>(
    endpoint: string,
    body: FormData,
    onProgress?: (percent: number) => void
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.withCredentials = true;

      const token = this.getAuthToken();
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        let responseData: any;
        try {
          responseData = JSON.parse(xhr.responseText);
        } catch {
          responseData = null;
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(responseData as T);
        } else {
          const message =
            responseData?.message ||
            responseData?.detail ||
            responseData?.error?.detail ||
            `Upload failed with HTTP ${xhr.status}`;
          reject(new ApiError(message, xhr.status, responseData));
        }
      };

      xhr.onerror = () => {
        reject(new ApiError("Network error occurred during upload.", 0));
      };

      xhr.send(body);
    });
  }
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly body?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { ApiResponse };
