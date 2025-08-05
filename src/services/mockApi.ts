import { AuthResponse, User, LeaveRequest, CreateLeaveRequest } from '../types';

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'employee@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'Employee',
    department: 'Engineering',
    username: 'employee'
  },
  {
    id: '2',
    email: 'manager@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'Manager',
    department: 'Engineering',
    username: 'manager'
  },
  {
    id: '3',
    email: 'hr@example.com',
    firstName: 'Alice',
    lastName: 'Johnson',
    role: 'HR',
    department: 'Human Resources',
    username: 'hr'
  },
  {
    id: '4',
    email: 'employee2@example.com',
    firstName: 'Bob',
    lastName: 'Wilson',
    role: 'Employee',
    department: 'Marketing',
    username: 'employee2'
  }
];

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Doe',
    startDate: '2024-02-15',
    endDate: '2024-02-17',
    leaveType: 'Annual Leave',
    reason: 'Family vacation',
    status: 'Pending',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    employeeId: '1',
    employeeName: 'John Doe',
    startDate: '2024-01-20',
    endDate: '2024-01-22',
    leaveType: 'Sick Leave',
    reason: 'Medical appointment',
    status: 'HRApproved',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-12T14:00:00Z'
  },
  {
    id: '3',
    employeeId: '4',
    employeeName: 'Bob Wilson',
    startDate: '2024-02-20',
    endDate: '2024-02-25',
    leaveType: 'Annual Leave',
    reason: 'Wedding anniversary celebration',
    status: 'Pending',
    createdAt: '2024-01-18T11:00:00Z',
    updatedAt: '2024-01-18T11:00:00Z'
  },
  {
    id: '4',
    employeeId: '4',
    employeeName: 'Bob Wilson',
    startDate: '2024-03-01',
    endDate: '2024-03-03',
    leaveType: 'Personal Leave',
    reason: 'Moving to new house',
    status: 'ManagerApproved',
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-01-21T16:00:00Z'
  },
  {
    id: '5',
    employeeId: '2',
    employeeName: 'Jane Smith',
    startDate: '2024-02-10',
    endDate: '2024-02-12',
    leaveType: 'Annual Leave',
    reason: 'Conference attendance',
    status: 'HRApproved',
    createdAt: '2024-01-05T12:00:00Z',
    updatedAt: '2024-01-08T10:00:00Z'
  }
];

let currentUser: User | null = null;
let authToken: string | null = null;

class MockApiService {
  private delay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateToken(): string {
    return 'mock-jwt-token-' + Math.random().toString(36).substr(2, 9);
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    await this.delay();
    
    if (password !== 'password') {
      throw new Error('Invalid credentials');
    }

    const user = mockUsers.find(u => u.username === username);
    if (!user) {
      throw new Error('User not found');
    }

    const token = this.generateToken();
    currentUser = user;
    authToken = token;

    return { token, user };
  }

  async register(userData: {
    username: string;
    password: string;
    name: string;
    email: string;
    role: 'Employee' | 'Manager' | 'HR';
    department: string;
  }): Promise<AuthResponse> {
    await this.delay();

    // Check if user already exists
    if (mockUsers.find(u => u.email === userData.email)) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      email: userData.email,
      firstName: userData.name.split(' ')[0] || userData.name,
      lastName: userData.name.split(' ').slice(1).join(' ') || '',
      role: userData.role,
      department: userData.department
    };

    mockUsers.push(newUser);
    const token = this.generateToken();
    currentUser = newUser;
    authToken = token;

    return { token, user: newUser };
  }

  async createLeaveRequest(data: CreateLeaveRequest): Promise<LeaveRequest> {
    await this.delay();

    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    const newRequest: LeaveRequest = {
      id: (mockLeaveRequests.length + 1).toString(),
      employeeId: currentUser.id,
      employeeName: `${currentUser.firstName} ${currentUser.lastName}`,
      startDate: data.startDate,
      endDate: data.endDate,
      leaveType: data.leaveType,
      reason: data.reason,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockLeaveRequests.push(newRequest);
    return newRequest;
  }

  async getMyLeaveRequests(): Promise<LeaveRequest[]> {
    await this.delay();

    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    return mockLeaveRequests.filter(req => req.employeeId === currentUser!.id);
  }

  async getPendingRequests(): Promise<LeaveRequest[]> {
    await this.delay();

    if (!currentUser || currentUser.role !== 'Manager') {
      throw new Error('Access denied');
    }

    // For demo purposes, show all pending requests
    return mockLeaveRequests.filter(req => req.status === 'Pending');
  }

  async getManagerApprovedRequests(): Promise<LeaveRequest[]> {
    await this.delay();

    if (!currentUser || currentUser.role !== 'HR') {
      throw new Error('Access denied');
    }

    return mockLeaveRequests.filter(req => req.status === 'ManagerApproved');
  }

  async managerApprove(id: string): Promise<void> {
    await this.delay();

    if (!currentUser || currentUser.role !== 'Manager') {
      throw new Error('Access denied');
    }

    const request = mockLeaveRequests.find(req => req.id === id);
    if (!request) {
      throw new Error('Request not found');
    }

    request.status = 'ManagerApproved';
    request.updatedAt = new Date().toISOString();
  }

  async managerReject(id: string): Promise<void> {
    await this.delay();

    if (!currentUser || currentUser.role !== 'Manager') {
      throw new Error('Access denied');
    }

    const request = mockLeaveRequests.find(req => req.id === id);
    if (!request) {
      throw new Error('Request not found');
    }

    request.status = 'Rejected';
    request.updatedAt = new Date().toISOString();
  }

  async hrApprove(id: string): Promise<void> {
    await this.delay();

    if (!currentUser || currentUser.role !== 'HR') {
      throw new Error('Access denied');
    }

    const request = mockLeaveRequests.find(req => req.id === id);
    if (!request) {
      throw new Error('Request not found');
    }

    request.status = 'HRApproved';
    request.updatedAt = new Date().toISOString();
  }

  async hrReject(id: string): Promise<void> {
    await this.delay();

    if (!currentUser || currentUser.role !== 'HR') {
      throw new Error('Access denied');
    }

    const request = mockLeaveRequests.find(req => req.id === id);
    if (!request) {
      throw new Error('Request not found');
    }

    request.status = 'Rejected';
    request.updatedAt = new Date().toISOString();
  }

  async getUsers(): Promise<User[]> {
    await this.delay();

    if (!currentUser || currentUser.role !== 'HR') {
      throw new Error('Access denied');
    }

    return mockUsers;
  }
}

export const mockApiService = new MockApiService();