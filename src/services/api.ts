// API service for authentication

import { getToken } from '../utils/auth';

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface User {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  phone: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  data: {
    user: User;
    token: string;
  };
  message: string;
  success: boolean;
}

export interface UsersResponse {
  data: User[];
  message: string;
  success: boolean;
}

export interface ErrorResponse {
  message: string;
  success: false;
}

const API_BASE_URL = 'http://localhost:8080/api/v1';

// Get authorization headers
const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || 'Invalid phone number or password');
  }

  return data;
};

export const getUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/auth/admin/users`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch users');
  }

  return data.data || [];
};

