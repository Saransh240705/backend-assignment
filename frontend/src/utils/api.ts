// Read API URL dynamically from environment, fallback to localhost for local development
let rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5051/api/v1';

// Trim trailing slash if present
if (rawBaseUrl.endsWith('/')) {
  rawBaseUrl = rawBaseUrl.slice(0, -1);
}

// Automatically append /api/v1 if the user provided only the root domain
if (!rawBaseUrl.includes('/api/v1')) {
  rawBaseUrl = `${rawBaseUrl}/api/v1`;
}

const BASE_URL = rawBaseUrl;

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
