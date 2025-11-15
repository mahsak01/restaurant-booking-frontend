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
  display_name: string;
  description?: string;
  sort_order?: number;
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

  const response = await fetch(`${API_BASE_URL}/admin/users`, {
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
  const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
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

export interface CreateCategoryRequest {
  name: string;
  display_name: string;
  description?: string;
  sort_order?: number;
}

export interface CreateCategoryResponse {
  data: {
    category: Category;
  };
  message: string;
  success: boolean;
}

export const createCategory = async (categoryData: CreateCategoryRequest): Promise<CreateCategoryResponse> => {
  const response = await fetch(`${API_BASE_URL}/admin/categories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(categoryData),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to create category');
  }

  return data;
};

export interface UpdateCategoryRequest extends CreateCategoryRequest {}

export interface UpdateCategoryResponse {
  data: {
    category: Category;
  };
  message: string;
  success: boolean;
}

export const updateCategory = async (id: number, categoryData: UpdateCategoryRequest): Promise<UpdateCategoryResponse> => {
  const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(categoryData),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update category');
  }

  return data;
};

export interface DeleteCategoryResponse {
  message: string;
  success: boolean;
}

export const deleteCategory = async (id: number): Promise<DeleteCategoryResponse> => {
  const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete category');
  }

  return data;
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

export interface Table {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  number: number;
  capacity: number;
  status: string;
  location: string;
}

export interface TablesResponse {
  data: Table[];
  message: string;
  success: boolean;
}

export interface TableResponse {
  data: Table;
  message: string;
  success: boolean;
}

export const getTables = async (): Promise<Table[]> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token is required');
  }

  const response = await fetch(`${API_BASE_URL}/admin/tables`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data: TablesResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch tables');
  }

  return data.data || [];
};

export const getTableById = async (id: number): Promise<Table> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token is required');
  }

  const response = await fetch(`${API_BASE_URL}/admin/tables/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data: TableResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch table');
  }

  return data.data;
};

export interface CreateTableRequest {
  number: number;
  capacity: number;
  status: string;
  location: string;
}

export interface CreateTableResponse {
  data: {
    table: Table;
  };
  message: string;
  success: boolean;
}

export const createTable = async (tableData: CreateTableRequest): Promise<CreateTableResponse> => {
  const response = await fetch(`${API_BASE_URL}/admin/tables`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(tableData),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to create table');
  }

  return data;
};

export interface UpdateTableRequest extends CreateTableRequest {}

export interface UpdateTableResponse {
  data: {
    table: Table;
  };
  message: string;
  success: boolean;
}

export const updateTable = async (id: number, tableData: UpdateTableRequest): Promise<UpdateTableResponse> => {
  const response = await fetch(`${API_BASE_URL}/admin/tables/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(tableData),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update table');
  }

  return data;
};

export interface DeleteTableResponse {
  message: string;
  success: boolean;
}

export const deleteTable = async (id: number): Promise<DeleteTableResponse> => {
  const response = await fetch(`${API_BASE_URL}/admin/tables/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete table');
  }

  return data;
};

export interface Reservation {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user_id: number;
  table_id: number;
  date: string;
  time: string;
  status: string;
  user?: User;
  table?: Table;
}

export interface ReservationsResponse {
  data: Reservation[];
  message: string;
  success: boolean;
}

export interface ReservationResponse {
  data: Reservation;
  message: string;
  success: boolean;
}

export interface ReservationStatus {
  value: string;
  label: string;
}

export interface ReservationStatusesResponse {
  data: ReservationStatus[];
  message: string;
  success: boolean;
}

export const getReservations = async (): Promise<Reservation[]> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token is required');
  }

  const response = await fetch(`${API_BASE_URL}/admin/reservations`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data: ReservationsResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch reservations');
  }

  return data.data || [];
};

export const getReservationById = async (id: number): Promise<Reservation> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token is required');
  }

  const response = await fetch(`${API_BASE_URL}/admin/reservations/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data: ReservationResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch reservation');
  }

  return data.data;
};

export const getReservationStatuses = async (): Promise<ReservationStatus[]> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token is required');
  }

  const response = await fetch(`${API_BASE_URL}/admin/reservations/statuses`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data: ReservationStatusesResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch reservation statuses');
  }

  return data.data || [];
};

export interface UpdateReservationStatusRequest {
  status: string;
}

export interface UpdateReservationStatusResponse {
  data: {
    reservation: Reservation;
  };
  message: string;
  success: boolean;
}

export const updateReservationStatus = async (id: number, status: string): Promise<UpdateReservationStatusResponse> => {
  const response = await fetch(`${API_BASE_URL}/admin/reservations/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update reservation status');
  }

  return data;
};

export interface CancelReservationResponse {
  message: string;
  success: boolean;
}

export const cancelReservation = async (id: number): Promise<CancelReservationResponse> => {
  const response = await fetch(`${API_BASE_URL}/admin/reservations/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to cancel reservation');
  }

  return data;
};

export interface OrderItem {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  order_id: number;
  menu_item_id: number;
  quantity: number;
  price: number;
  notes?: string;
  menu_item?: Menu;
}

export interface Order {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user_id: number;
  status: string;
  total_price: number;
  user?: User;
  order_items?: OrderItem[];
}

export interface OrdersResponse {
  data: Order[];
  message: string;
  success: boolean;
}

export interface OrderResponse {
  data: Order;
  message: string;
  success: boolean;
}

export interface OrderStatus {
  value: string;
  label: string;
}

export interface OrderStatusesResponse {
  data: OrderStatus[];
  message: string;
  success: boolean;
}

export const getOrders = async (): Promise<Order[]> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token is required');
  }

  const response = await fetch(`${API_BASE_URL}/admin/orders`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data: OrdersResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch orders');
  }

  return data.data || [];
};

export const getOrderById = async (id: number): Promise<Order> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token is required');
  }

  const response = await fetch(`${API_BASE_URL}/admin/orders/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data: OrderResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch order');
  }

  return data.data;
};

export const getOrderStatuses = async (): Promise<OrderStatus[]> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token is required');
  }

  const response = await fetch(`${API_BASE_URL}/admin/orders/statuses`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data: OrderStatusesResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch order statuses');
  }

  return data.data || [];
};

export interface CreateOrderItemRequest {
  menu_item_id: number;
  quantity: number;
  notes?: string;
}

export interface CreateOrderRequest {
  user_id: number;
  order_items: CreateOrderItemRequest[];
}

export interface CreateOrderResponse {
  data: {
    order: Order;
  };
  message: string;
  success: boolean;
}

export const createOrder = async (orderData: CreateOrderRequest): Promise<CreateOrderResponse> => {
  const response = await fetch(`${API_BASE_URL}/admin/orders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(orderData),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to create order');
  }

  return data;
};

export interface UpdateOrderStatusRequest {
  status: string;
}

export interface UpdateOrderStatusResponse {
  data: {
    order: Order;
  };
  message: string;
  success: boolean;
}

export const updateOrderStatus = async (id: number, status: string): Promise<UpdateOrderStatusResponse> => {
  const response = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update order status');
  }

  return data;
};

