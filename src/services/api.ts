// src/services/api.ts

import { AuthResponse, User, LeaveRequest, CreateLeaveRequest } from '../types';
import { mockApiService } from './mockApi';

const API_BASE_URL = 'http://localhost:5299/api'; // Update with your API URL
const USE_MOCK_API = false; // Set to false when connecting to real API

class ApiService {
  // Read token from localStorage and return the Authorization header
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Read and parse the current user object from localStorage
  private getCurrentUser(): User {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      throw new Error('No user found in localStorage – please log in first.');
    }
    return JSON.parse(userJson) as User;
  }

  // Common response handler
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Auth endpoints

  async login(username: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK_API) {
      return mockApiService.login(username, password);
    }
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return this.handleResponse<AuthResponse>(response);
  }

  async register(userData: {
    username: string;
    password: string;
    name: string;
    email: string;
    role: 'EMPLOYEE' | 'MANAGER' | 'HR';
    department: string;
  }): Promise<AuthResponse> {
    // if (USE_MOCK_API) {
    //   return mockApiService.register(userData);
    // }
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return this.handleResponse<AuthResponse>(response);
  }

  // Leave request endpoints

  async createLeaveRequest(data: CreateLeaveRequest): Promise<LeaveRequest> {
    if (USE_MOCK_API) {
      return mockApiService.createLeaveRequest(data);
    }
    const response = await fetch(`${API_BASE_URL}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse<LeaveRequest>(response);
  }

  async getMyLeaveRequests(): Promise<LeaveRequest[]> {
    if (USE_MOCK_API) {
      return mockApiService.getMyLeaveRequests();
    }
    const user = this.getCurrentUser();
    const response = await fetch(
      `${API_BASE_URL}/LeaveRequest/${user.id}`, 
      { headers: this.getAuthHeader() }
    );
    return this.handleResponse<LeaveRequest[]>(response);
  }

  async getPendingRequests(): Promise<LeaveRequest[]> {
    if (USE_MOCK_API) {
      return mockApiService.getPendingRequests();
    }
    const response = await fetch(`${API_BASE_URL}/manager/pending`, {
      headers: this.getAuthHeader(),
    });
    return this.handleResponse<LeaveRequest[]>(response);
  }

  async getManagerApprovedRequests(): Promise<LeaveRequest[]> {
    if (USE_MOCK_API) {
      return mockApiService.getManagerApprovedRequests();
    }
    const response = await fetch(`${API_BASE_URL}/leave/manager-approved`, {
      headers: this.getAuthHeader(),
    });
    return this.handleResponse<LeaveRequest[]>(response);
  }

  // Manager actions

  async managerApprove(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockApiService.managerApprove(id);
    }
    const response = await fetch(`${API_BASE_URL}/manager/approve/`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });
    await this.handleResponse<void>(response);
  }

  async managerReject(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockApiService.managerReject(id);
    }
    const response = await fetch(`${API_BASE_URL}/leave/manager/reject/${id}`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });
    await this.handleResponse<void>(response);
  }

  // HR actions

  async hrApprove(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockApiService.hrApprove(id);
    }
    const response = await fetch(`${API_BASE_URL}/leave/hr/approve/${id}`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });
    await this.handleResponse<void>(response);
  }

  async hrReject(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockApiService.hrReject(id);
    }
    const response = await fetch(`${API_BASE_URL}/leave/hr/reject/${id}`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });
    await this.handleResponse<void>(response);
  }

  // User management

  async getUsers(): Promise<User[]> {
    if (USE_MOCK_API) {
      return mockApiService.getUsers();
    }
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: this.getAuthHeader(),
    });
    return this.handleResponse<User[]>(response);
  }
}

export const apiService = new ApiService();
