/**
 * ExamForge AI — API Client
 * Centralized fetch wrapper with base URL, error handling, and type safety.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const startedAt = performance.now();
    const payload = options.body ? JSON.parse(String(options.body)) : undefined;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    console.group("==========================\nAPI REQUEST\n==========================");
    console.log("Method:", config.method || "GET");
    console.log("URL:", url);
    console.log("Headers:", config.headers);
    console.log("Payload:", payload);
    if (payload && typeof payload === "object") console.table(payload);
    console.log("Time:", new Date().toISOString());
    console.groupEnd();

    try {
      const response = await fetch(url, { ...config, credentials: "include" });
      const body = await response.json().catch(() => null);
      console.group("==========================\nAPI RESPONSE\n==========================");
      console.log("Status:", response.status);
      console.log("Response:", body);
      console.log("Time Taken:", `${(performance.now() - startedAt).toFixed(1)}ms`);
      console.groupEnd();

      if (!response.ok) {
        throw new Error(body?.message || body?.detail || `HTTP ${response.status}`);
      }

      return body as T;
    } catch (error) {
      console.group("==========================\nAPI ERROR\n==========================");
      console.error("Status:", error instanceof Error ? error.message : "Network error");
      console.error("Message:", error instanceof Error ? error.message : error);
      console.error("Stack:", error instanceof Error ? error.stack : undefined);
      console.groupEnd();
      throw error;
    }
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
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { ApiResponse };
