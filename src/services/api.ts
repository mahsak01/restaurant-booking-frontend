// API service for authentication

import { getToken } from '../utils/auth';

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface SignupRequest {
  phone: string;
  password: string;
  name: string;
  role: string;
}

export interface SignupResponse {
  data: {
    user: User;
  };
  message: string;
  success: boolean;
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

export interface Menu {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  image_url?: string;
  available?: boolean;
}

export interface MenusResponse {
  data: Menu[];
  message: string;
  success: boolean;
}

export interface Category {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  description?: string;
  image_url?: string;
}

export interface CategoriesResponse {
  data: Category[];
  message: string;
  success: boolean;
}

export interface CategoryOption {
  label: string;
  value: string;
}

export interface CategoriesOptionsResponse {
  data: CategoryOption[];
  message: string;
  success: boolean;
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
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token is required');
  }

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

export interface DeleteUserResponse {
  message: string;
  success: boolean;
}

export const deleteUser = async (id: number): Promise<DeleteUserResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/admin/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete user');
  }

  return data;
};

export const signup = async (userData: SignupRequest): Promise<SignupResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to create user');
  }

  return data;
};

export const getMenus = async (): Promise<Menu[]> => {
  const response = await fetch(`${API_BASE_URL}/menu`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch menus');
  }

  // Handle both response formats: {data: [...], success: true} or direct array
  if (data.success === false) {
    throw new Error(data.message || 'Failed to fetch menus');
  }

  return data.data || data || [];
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await fetch(`${API_BASE_URL}/menu/categories`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch categories');
  }

  // Handle both response formats: {data: [...], success: true} or direct array
  if (data.success === false) {
    throw new Error(data.message || 'Failed to fetch categories');
  }

  return data.data || data || [];
};

export const getCategoriesOptions = async (): Promise<CategoryOption[]> => {
  const response = await fetch(`${API_BASE_URL}/menu/categories`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data: CategoriesOptionsResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch categories');
  }

  return data.data || [];
};

export interface CreateMenuRequest {
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface CreateMenuResponse {
  data: {
    menu: Menu;
  };
  message: string;
  success: boolean;
}

export const createMenu = async (menuData: CreateMenuRequest): Promise<CreateMenuResponse> => {
  const response = await fetch(`${API_BASE_URL}/admin/menu`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(menuData),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to create menu item');
  }

  return data;
};

export interface UpdateMenuRequest extends CreateMenuRequest {}

export interface UpdateMenuResponse {
  data: {
    menu: Menu;
  };
  message: string;
  success: boolean;
}

export const updateMenu = async (id: number, menuData: UpdateMenuRequest): Promise<UpdateMenuResponse> => {
  const response = await fetch(`${API_BASE_URL}/admin/menu/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(menuData),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update menu item');
  }

  return data;
};

export interface DeleteMenuResponse {
  message: string;
  success: boolean;
}

export const deleteMenu = async (id: number): Promise<DeleteMenuResponse> => {
  const response = await fetch(`${API_BASE_URL}/admin/menu/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete menu item');
  }

  return data;
};

