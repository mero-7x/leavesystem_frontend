// services/api.ts
import { AuthResponse, User, LeaveRequest, CreateLeaveRequest, ManagerApprovedResponse, RejectionRequest, ApiListResponse, HRPendingResponse, GetUsersResponse, Department } from '../types';
import { mockApiService } from './mockApi';
import axios, { AxiosHeaders, type RawAxiosRequestHeaders } from "axios";

const API_BASE_URL = 'https://leavesystem-production-a4d3.up.railway.app/api';
const USE_MOCK_API = false;

const api = axios.create({
  baseURL: 'https://leavesystem-production-a4d3.up.railway.app',
  headers: { 'Content-Type': 'application/json' },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

/**
 * Main API Service Class
 */
class ApiService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private getCurrentUser(): User {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      throw new Error('No user found in localStorage – please log in first.');
    }
    return JSON.parse(userJson) as User;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // ==================== AUTH ENDPOINTS ====================
  async login(username: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK_API) return mockApiService.login(username, password);
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
    role: "EMPLOYEE" | "MANAGER" | "HR";
    department: string;
  }): Promise<AuthResponse> {
    if (USE_MOCK_API) return mockApiService.register(userData);
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return this.handleResponse<AuthResponse>(response);
  }


  async getUsersPage(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    departmentId?: number;
    managerId?: number;
    isActive?: boolean;
    sortBy?: string;
    desc?: boolean;
    role?: string;
  }): Promise<GetUsersResponse> {
    const res = await api.get<GetUsersResponse>(`${API_BASE_URL}/hr/All-users`, {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        search: params.search,
        departmentId: params.departmentId,
        managerId: params.managerId,
        isActive: params.isActive,   // only present if defined
        sortBy: params.sortBy ?? "id",
        desc: params.desc ?? true,
        role: params.role,
      },
    });
    return res.data;
  }

  // fetch all pages until we collect everything (honors isActive if provided)
  async getAllUsers(params: {
    search?: string;
    departmentId?: number;
    managerId?: number;
    isActive?: boolean; // true/false filters, omit for “all”
    sortBy?: string;
    desc?: boolean;
    role?: string;
  }): Promise<User[]> {
    const pageSize = 20;
    let page = 1;
    let all: User[] = [];

    // first page
    const first = await this.getUsersPage({ page, pageSize, ...params });
    all = first.items.slice();
    const total = first.total;

    // keep fetching until we have all items
    while (all.length < total) {
      page += 1;
      const next = await this.getUsersPage({ page, pageSize, ...params });
      all = all.concat(next.items);
      // safety break if API misreports total
      if (next.items.length === 0) break;
    }

    return all;
  }
  // ==================== LEAVE REQUEST ENDPOINTS ====================
  async createLeaveRequest(data: CreateLeaveRequest): Promise<LeaveRequest> {
    if (USE_MOCK_API) return mockApiService.createLeaveRequest(data);
    const response = await fetch(`${API_BASE_URL}/LeaveRequest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
      body: JSON.stringify(data),
    });
    return this.handleResponse<LeaveRequest>(response);
  }

  async getMyLeaveRequests(): Promise<LeaveRequest[]> {
    if (USE_MOCK_API) return mockApiService.getMyLeaveRequests();
    const response = await fetch(`${API_BASE_URL}/LeaveRequest/my`, { headers: this.getAuthHeader() });
    return this.handleResponse<LeaveRequest[]>(response);
  }

  // ✅ Your Axios GET for HR pending (exactly as you wrote)
  async getHRPending2() {
    return api.get<HRPendingResponse>('/api/hr/pending-requests');
  }

  // ✅ Your Axios POSTs for final approve/reject (with { reason })
  async hrApprove2(id: string, reason: string) {
    return api.post(`/api/hr/approve/${id}`, { reason });
  }

  async hrReject2(id: string, reason: string) {
    return api.post(`/api/hr/reject/${id}`, { reason });
  }

  async getPendingRequests(): Promise<LeaveRequest[]> {
    if (USE_MOCK_API) return mockApiService.getPendingRequests();
    const response = await fetch(`${API_BASE_URL}/manager/pending`, { headers: this.getAuthHeader() });
    return this.handleResponse<LeaveRequest[]>(response);
  }

  async getManagerApprovedRequests(): Promise<LeaveRequest[]> {
    if (USE_MOCK_API) return mockApiService.getManagerApprovedRequests();
    const response = await fetch(`${API_BASE_URL}/Manager/approved`, { headers: this.getAuthHeader() });
    return this.handleResponse<LeaveRequest[]>(response);
  }

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
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
    });
    return this.handleResponse<ManagerApprovedResponse>(response);
  }

  // ==================== MANAGER ACTIONS ====================
  async managerApprove(leave_id: string): Promise<void> {
    if (USE_MOCK_API) return mockApiService.managerApprove(leave_id);
    const response = await fetch(`${API_BASE_URL}/manager/${leave_id}/approve`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });
    await this.handleResponse<void>(response);
  }

  async managerReject(leave_id: string, reason: string = "Rejected by Manager"): Promise<void> {
    if (USE_MOCK_API) return mockApiService.managerReject(leave_id);
    const response = await fetch(`${API_BASE_URL}/manager/${leave_id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
      body: JSON.stringify({ reason }),
    });
    await this.handleResponse<void>(response);
  }

  async managerCancel(leave_id: string): Promise<void> {
    if (USE_MOCK_API) return mockApiService.managerCancel(leave_id);
    const response = await fetch(`${API_BASE_URL}/manager/${leave_id}/cancel`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });
    await this.handleResponse<void>(response);
  }

  // ==================== HR ACTIONS ====================
  async hrApprove(leave_id: string): Promise<void> {
    if (USE_MOCK_API) return mockApiService.hrApprove(leave_id);
    const response = await fetch(`${API_BASE_URL}/HR/${leave_id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
    });
    await this.handleResponse<void>(response);
  }

  async hrReject(leave_id: string, reason: string = "Rejected by HR"): Promise<void> {
    if (USE_MOCK_API) return mockApiService.hrReject(leave_id);
    const response = await fetch(`${API_BASE_URL}/HR/${leave_id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
      body: JSON.stringify({ reason })
    });
    await this.handleResponse<void>(response);
  }

  async hrCancel(leave_id: string): Promise<void> {
    if (USE_MOCK_API) return mockApiService.hrCancel(leave_id);
    const response = await fetch(`${API_BASE_URL}/HR/${leave_id}/cancel`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });
    await this.handleResponse<void>(response);
  }

  // ==================== USER MANAGEMENT ====================
  async getUsers(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    departmentId?: number;
    managerId?: number;
    isActive?: boolean; // ✅ now supported
    sortBy?: string;
    desc?: boolean;
    role?: string;
  }): Promise<{ items: User[]; total: number }> {
    const res = await api.get(`${API_BASE_URL}/hr/All-users`, {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        search: params?.search,
        departmentId: params?.departmentId,
        managerId: params?.managerId,
        isActive: params?.isActive, // ✅ will be true/false if provided
        sortBy: params?.sortBy ?? "id",
        desc: params?.desc ?? true,
        role: params?.role,
      },
    });
    return res.data; // assuming { items, total, ... }
  }
  async getDepartments(): Promise<Department[]> {
    const res = await api.get<Department[]>(`${API_BASE_URL}/hr/department-list`);
    return res.data;
  }

  async getHRAllUsers(params: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    desc?: boolean;
  } = {}): Promise<ApiListResponse<User>> {
    if (USE_MOCK_API) {
      const users = await mockApiService.getUsers();
      return { success: true, count: users.length, data: users };
    }

    const {
      page = 1,
      pageSize = 20,
      sortBy = 'id',
      desc = true,
    } = params;

    const url = new URL(`${API_BASE_URL}/hr/All-users`);
    url.searchParams.set('page', String(page));
    url.searchParams.set('pageSize', String(pageSize));
    url.searchParams.set('sortBy', String(sortBy));
    url.searchParams.set('desc', String(desc));

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
    });
    return this.handleResponse<ApiListResponse<User>>(response);
  }
}

export const apiService = new ApiService();
