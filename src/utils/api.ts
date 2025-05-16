import axios from 'axios';

// Base URL for API requests
const API_URL = 'https://localhost:7118/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interface definitions based on API responses
export interface PaginatedResponse<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
}

export interface Worker {
  id: number;
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
  minPrice: number;
  maxPrice: number;
  completedRequests: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  profilePictureUrl: string;
  address: string;
  age: number;
  city: string;
  requestsCount: number;
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

// Common query parameters
export interface QueryParams {
  pageIndex?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
  cityId?: number;
  serviceId?: number;
  status?: number;
  workerId?: number;
  customerId?: number;
}

// API functions for workers
export const workersApi = {
  getWorkers: (params: QueryParams = {}) => 
    api.get<PaginatedResponse<Worker>>('/Admin/workers', { params }),
  
  getWorker: (id: number) => 
    api.get<Worker>(`/Admin/workers/${id}`),
};

// API functions for customers
export const customersApi = {
  getCustomers: (params: QueryParams = {}) =>
    api.get<PaginatedResponse<Customer>>('/Admin/Customers', { params }),
  
  getCustomer: (id: number) =>
    api.get<Customer>(`/Admin/Customers/${id}`),
};

// API functions for service requests
export const requestsApi = {
  getRequests: (params: QueryParams = {}) =>
    api.get<PaginatedResponse<ServiceRequest>>('/Admin/requests', { params }),
  
  getRequest: (id: number) =>
    api.get<ServiceRequest>(`/Admin/requests/${id}`),
};

export default api;