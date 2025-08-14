import { AuthResponse, User, LeaveRequest, CreateLeaveRequest, ManagerApprovedResponse, RejectionRequest } from '../types';
import { mockApiService } from './mockApi';

const API_BASE_URL = 'http://localhost:5299/api';
const USE_MOCK_API = false; // Set to false when connecting to real API

/**
 * Main API Service Class
 * Handles all HTTP requests to the backend API
 * Includes authentication, leave requests, and user management
 */
class ApiService {
  /**
   * Get authorization header with current user token
   * @returns Authorization header object
   */
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Get current user from localStorage
   * @returns Current user object
   */
  private getCurrentUser(): User {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      throw new Error('No user found in localStorage – please log in first.');
    }
    return JSON.parse(userJson) as User;
  }

  /**
   * Handle API response and error parsing
   * @param response - Fetch response object
   * @returns Parsed JSON response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // ==================== AUTH ENDPOINTS ====================

  /**
   * User login
   * @param username - User's username
   * @param password - User's password
   * @returns Authentication response with token and user data
   */
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

  /**
   * User registration
   * @param userData - User registration data
   * @returns Authentication response with token and user data
   */
  async register(userData: {
    username: string;
    password: string;
    name: string;
    email: string;
    role: 'Employee' | 'Manager' | 'HR';
    department: string;
  }): Promise<AuthResponse> {
    if (USE_MOCK_API) {
      return mockApiService.register(userData);
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return this.handleResponse<AuthResponse>(response);
  }

  // ==================== LEAVE REQUEST ENDPOINTS ====================

  /**
   * Create new leave request
   * @param data - Leave request data
   * @returns Created leave request
   */
  async createLeaveRequest(data: CreateLeaveRequest): Promise<LeaveRequest> {
    if (USE_MOCK_API) {
      return mockApiService.createLeaveRequest(data);
    }
    
    const response = await fetch(`${API_BASE_URL}/LeaveRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse<LeaveRequest>(response);
  }

  /**
   * Get current user's leave requests
   * @returns Array of user's leave requests
   */
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

  /**
   * Get pending requests for manager approval
   * @returns Array of pending leave requests
   */
  async getPendingRequests(): Promise<LeaveRequest[]> {
    if (USE_MOCK_API) {
      return mockApiService.getPendingRequests();
    }
    
    const response = await fetch(`${API_BASE_URL}/manager/pending`, {
      headers: this.getAuthHeader(),
    });
    return this.handleResponse<LeaveRequest[]>(response);
  }

  /**
   * Get manager approved requests for HR
   * @returns Array of manager approved requests
   */
  async getManagerApprovedRequests(): Promise<LeaveRequest[]> {
    if (USE_MOCK_API) {
      return mockApiService.getManagerApprovedRequests();
    }
    
    const response = await fetch(`${API_BASE_URL}/Manager/approved`, {
      headers: this.getAuthHeader(),
    });
    return this.handleResponse<LeaveRequest[]>(response);
  }

  /**
   * Get HR pending requests
   * @returns Manager approved response with data array
   */
  async getHRPending(): Promise<ManagerApprovedResponse> {
    if (USE_MOCK_API) {
      const requests = await mockApiService.getManagerApprovedRequests();
      return {
        success: true,
        count: requests.length,
        data: requests.map(req => ({
          id: parseInt(req.id),
          userId: parseInt(req.employeeId),
          userName: req.employeeName || '',
          fromDate: req.startDate || req.fromDate || '',
          toDate: req.endDate || req.toDate || '',
          leaveType: req.leaveType,
          reason: req.reason,
          status: 'Manager_Approved' as const,
          createdAt: req.createdAt,
        }))
      };
    }
    
    const response = await fetch(`${API_BASE_URL}/HR/pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });
    return this.handleResponse<ManagerApprovedResponse>(response);
  }

  // ==================== MANAGER ACTIONS ====================

  /**
   * Manager approve leave request
   * @param leave_id - Leave request ID
   */
  async managerApprove(leave_id: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockApiService.managerApprove(leave_id);
    }
    
    const response = await fetch(`${API_BASE_URL}/manager/${leave_id}/approve`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });
    await this.handleResponse<void>(response);
  }

  /**
   * Manager reject leave request
   * @param leave_id - Leave request ID
   * @param reason - Rejection reason
   */
  async managerReject(leave_id: string, reason: string = "Rejected by Manager"): Promise<void> {
    if (USE_MOCK_API) {
      return mockApiService.managerReject(leave_id);
    }
    
    const response = await fetch(`${API_BASE_URL}/manager/${leave_id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ reason }),
    });
    await this.handleResponse<void>(response);
  }

  /**
   * Manager cancel/revoke leave request
   * @param leave_id - Leave request ID
   */
  async managerCancel(leave_id: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockApiService.managerCancel(leave_id);
    }
    
    const response = await fetch(`${API_BASE_URL}/manager/${leave_id}/cancel`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });
    await this.handleResponse<void>(response);
  }

  // ==================== HR ACTIONS ====================

  /**
   * HR approve leave request (final approval)
   * @param leave_id - Leave request ID
   */
  async hrApprove(leave_id: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockApiService.hrApprove(leave_id);
    }
    
    const response = await fetch(`${API_BASE_URL}/HR/${leave_id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      }
    });
    await this.handleResponse<void>(response);
  }

  /**
   * HR reject leave request with reason
   * @param leave_id - Leave request ID
   * @param reason - Rejection reason
   */
  async hrReject(leave_id: string, reason: string = "Rejected by HR"): Promise<void> {
    if (USE_MOCK_API) {
      return mockApiService.hrReject(leave_id);
    }
    
    const response = await fetch(`${API_BASE_URL}/HR/${leave_id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ reason })
    });
    await this.handleResponse<void>(response);
  }

  /**
   * HR cancel/revoke leave request
   * @param leave_id - Leave request ID
   */
  async hrCancel(leave_id: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockApiService.hrCancel(leave_id);
    }
    
    const response = await fetch(`${API_BASE_URL}/HR/${leave_id}/cancel`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });
    await this.handleResponse<void>(response);
  }

  // ==================== USER MANAGEMENT ====================

  /**
   * Get all system users (HR only)
   * @returns Array of all users
   */
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