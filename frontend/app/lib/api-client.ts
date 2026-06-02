const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  [key: string]: any;
}

const getHeaders = (isMultipart = false) => {
  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  headers['Accept'] = 'application/json';

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('page_user_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('page_user_token');
      localStorage.removeItem('page_user_payload');
      
      const path = window.location.pathname;
      if (path.includes('admin')) {
        window.location.href = '/admin-login';
      } else if (path.includes('org')) {
        window.location.href = '/org-login';
      } else {
        window.location.href = '/member-login';
      }
    }
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg) as any;
    err.errors = data.errors;
    err.status = response.status;
    throw err;
  }
  return data;
};

export const api = {
  get: async <T = any>(endpoint: string): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  post: async <T = any>(endpoint: string, body: any): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  patch: async <T = any>(endpoint: string, body: any): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  put: async <T = any>(endpoint: string, body: any): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  delete: async <T = any>(endpoint: string): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * For uploading files via FormData (featured images, research papers, chat attachments)
   */
  postMultipart: async <T = any>(endpoint: string, formData: FormData): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse(response);
  },
};
