import axios from 'axios';
import { useAuth } from './auth';

// Base URL for API requests
const API_URL = 'http://localhost:7118/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useAuth.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

// Interface definitions
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Category {
  id: number;
  name: string;
  pictureUrl?: string;
}

export interface Service {
  id: number;
  name: string;
  categoryId: number;
}

export interface PaginatedResponse<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
}

export interface Worker {
  id: number;
  userId?: number;
  name: string;
  email: string;
  city: string;
  phoneNumber: string;
  profilePictureUrl: string;
  age: number;
  address: string;
  serviceName: string;
  rating: number;
  description: string;
  minPrice?: number;
  maxPrice?: number;
  completedRequests: number;
  isLocked: boolean;
  isBlocked: boolean;
}

export interface Customer {
  id: number;
  userId?: number;
  name: string;
  email: string;
  phoneNumber: string;
  profilePictureUrl: string;
  address: string;
  age: number;
  city: string;
  requestsCount: number;
  isBlocked: boolean;
}

export interface ServiceRequest {
  requestId: number;
  workerName: string;
  customerName: string;
  customerAddress: string;
  serviceName: string;
  requestDate: string;
  comment: string;
  status: string;
  customerSuggestedPrice: number;
  workerSuggestedPrice: number;
  finalAgreedPrice: number;
  negotiationStatus: string;
}

export interface QueryParams {
  pageIndex?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
  cityId?: number | null;
  serviceId?: number | null;
  status?: number;
  workerId?: number;
  customerId?: number;
}

// Auth API
export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post('/Account/login', credentials),
};

// Categories API
export const categoriesApi = {
  create: (data: { name: string; pictureUrl?: string }) =>
    api.post('/Admin/categories', data),
  
  delete: (id: number) =>
    api.delete(`/Admin/categories/${id}`),
};

// Services API
export const servicesApi = {
  create: (data: { name: string; categoryId: number }) =>
    api.post('/Admin/services', data),
  
  delete: (id: number) =>
    api.delete(`/Admin/services/${id}`),
};

export const workersApi = {
  getWorkers: (params: QueryParams = {}) => 
    api.get<PaginatedResponse<Worker>>('/Admin/workers', { params }),
  
  getWorker: (id: number) => 
    api.get<Worker>(`/Admin/workers/${id}`),
    
  blockUser: (userId: number) => {
    console.log(`Calling block-user API for userId: ${userId}`);
    return api.post(`/Admin/block-user/${userId}`);
  },
    
  unblockUser: (userId: number) => {
    console.log(`Calling unblock-user API for userId: ${userId}`);
    return api.post(`/Admin/unblock-user/${userId}`);
  },
    
  toggleUserLock: async (worker: Worker) => {
    const idToUse = worker.userId !== undefined ? worker.userId : worker.id;
        
    try {
      const endpoint = worker.isBlocked ? 'unblock-user' : 'block-user';
      const response = await api.post(`/Admin/${endpoint}/${idToUse}`);
      console.log(`API Response:`, response);
      return response;
    } catch (error) {
      console.error(`Failed to ${worker.isBlocked ? 'unblock' : 'block'} user:`, error);
      throw error;
    }
  },
};

export const customersApi = {
  getCustomers: (params: QueryParams = {}) => 
    api.get<PaginatedResponse<Customer>>('/Admin/Customers', { params }),
  
  getCustomer: (id: number) => 
    api.get<Customer>(`/Admin/Customers/${id}`),
  
  blockUser: (userId: number) => {
    console.log(`Calling block-user API for customer ID: ${userId}`);
    return api.post(`/Admin/block-user/${userId}`);
  },
  
  unblockUser: (userId: number) => {
    console.log(`Calling unblock-user API for customer ID: ${userId}`);
    return api.post(`/Admin/unblock-user/${userId}`);
  },
  
  toggleUserLock: async (customer: Customer) => {
    const idToUse = customer.userId !== undefined ? customer.userId : customer.id;
    
    console.log(`Toggling block status for customer (ID: ${customer.id}), current status: ${customer.isBlocked ? 'Blocked' : 'Active'}`);
    
    try {
      const endpoint = customer.isBlocked ? 'unblock-user' : 'block-user';
      const response = await api.post(`/Admin/${endpoint}/${idToUse}`);
      console.log(`API Response:`, response);
      return response;
    } catch (error) {
      console.error(`Failed to ${customer.isBlocked ? 'unblock' : 'block'} customer:`, error);
      throw error;
    }
  },
};

export const requestsApi = {
  getRequests: (params: QueryParams = {}) =>
    api.get<PaginatedResponse<ServiceRequest>>('/Admin/requests', { params }),
  
  getRequest: (id: number) =>
    api.get<ServiceRequest>(`/Admin/requests/${id}`),
};

export default api;