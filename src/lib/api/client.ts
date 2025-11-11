// lib/api/client.ts
import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  AxiosRequestConfig,
} from 'axios';
import { ApiResponse, ApiError } from '@/types/api';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  // listeners for 401 -> allow store to reset quickly
  private unauthorizedHandlers = new Set<() => void>();

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
      timeout: 30000,
      headers: {
        // Don't force JSON here so FormData works automatically
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
    this.loadToken();
  }

  /** Subscribe to 401 Unauthorized events */
  onUnauthorized(handler: () => void) {
    this.unauthorizedHandlers.add(handler);
    // return unsubscribe
    return () => this.unauthorizedHandlers.delete(handler);
  }

  private notifyUnauthorized() {
    this.unauthorizedHandlers.forEach((fn) => {
      try {
        fn();
      } catch {
        /* noop */
      }
    });
  }

  private setupInterceptors() {
    // Request interceptor: add Bearer token if present
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers = config.headers ?? {};
          (config.headers as any).Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: normalize errors, emit 401
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // clear token locally and notify store
          this.clearToken();
          this.notifyUnauthorized();
        }
        return Promise.reject(this.formatError(error));
      }
    );
  }

  private formatError(error: AxiosError): ApiError {
    if (error.response?.data) {
      const data = error.response.data as any;
      return {
        message: data.message || 'An error occurred',
        errors: data.errors,
        status: error.response.status,
      };
    }
    return {
      message: error.message || 'Network error',
      status: error.response?.status || 0,
    };
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // ---- HTTP helpers (return ApiResponse<T> to match your services) ----

  async get<T = any>(
    url: string,
    params?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, {
      params,
      ...(config || {}),
    });
    return response.data;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  // Support DELETE with body via config.data
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
