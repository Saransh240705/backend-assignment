// Actually, let's use localhost:5051 since that's what we tested and runs health checks successfully.
const BASE_URL = 'http://localhost:5051/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: {
    message: string;
    status: number;
    details?: any;
  };
}

export const getAuthToken = () => localStorage.getItem('authToken');
export const setAuthToken = (token: string) => localStorage.setItem('authToken', token);
export const removeAuthToken = () => localStorage.removeItem('authToken');

export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      // Return error structure matching backend
      return {
        success: false,
        error: data.error || {
          message: response.statusText || 'An unexpected error occurred',
          status: response.status,
        },
      };
    }
    
    return data as ApiResponse<T>;
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Network connection failed. Make sure the backend is running.',
        status: 500,
      },
    };
  }
}
