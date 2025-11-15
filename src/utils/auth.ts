// Utility functions for authentication token management

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const getUserRole = (): string | null => {
  return localStorage.getItem('userRole');
};

export const setUserRole = (role: string): void => {
  localStorage.setItem('userRole', role);
};

export const isAdmin = (): boolean => {
  return getUserRole() === 'admin';
};

