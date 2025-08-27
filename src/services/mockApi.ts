import { AuthResponse, User, LeaveRequest, CreateLeaveRequest } from '../types';

// Enhanced mock data with more realistic information
const mockUsers: User[] = [
  {
    id: '1',
    email: 'employee@company.com',
    firstName: 'أحمد',
    lastName: 'محمد',
    name: 'أحمد محمد',
    role: 2,
    department: 'تطوير البرمجيات',
    username: 2
  },
  {
    id: '2',
    email: 'manager@company.com',
    firstName: 'سارة',
    lastName: 'أحمد',
    name: 'سارة أحمد',
    role: 1,
    department: 'تطوير البرمجيات',
    username: 1
  },
  {
    id: '3',
    email: 'hr@company.com',
    firstName: 'محمد',
    lastName: 'علي',
    name: 'محمد علي',
    role: 0,
    department: 'الموارد البشرية',
    username: 0
  },
  {
    id: '4',
    email: 'employee2@company.com',
    firstName: 'فاطمة',
    lastName: 'حسن',
    name: 'فاطمة حسن',
    role: 2,
    department: 'التسويق',
    username: 'employee2'
  },
  {
    id: '5',
    email: 'employee3@company.com',
    firstName: 'خالد',
    lastName: 'عبدالله',
    name: 'خالد عبدالله',
    role: 2,
    department: 'المبيعات',
    username: 'employee3'
  }
];

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'أحمد محمد',
    name: 'أحمد محمد',
    startDate: '2024-02-15',
    endDate: '2024-02-17',
    fromDate: '2024-02-15',
    toDate: '2024-02-17',
    leaveType: 'إجازة سنوية',
    reason: 'إجازة عائلية',
    status: 'Pending',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    employeeId: '1',
    employeeName: 'أحمد محمد',
    name: 'أحمد محمد',
    startDate: '2024-01-20',
    endDate: '2024-01-22',
    fromDate: '2024-01-20',
    toDate: '2024-01-22',
    leaveType: 'إجازة مرضية',
    reason: 'موعد طبي',
    status: 'HR_Approved',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-12T14:00:00Z'
  },
  {
    id: '3',
    employeeId: '4',
    employeeName: 'فاطمة حسن',
    name: 'فاطمة حسن',
    startDate: '2024-02-20',
    endDate: '2024-02-25',
    fromDate: '2024-02-20',
    toDate: '2024-02-25',
    leaveType: 'إجازة سنوية',
    reason: 'احتفال بذكرى الزواج',
    status: 'Pending',
    createdAt: '2024-01-18T11:00:00Z',
    updatedAt: '2024-01-18T11:00:00Z'
  },
  {
    id: '4',
    employeeId: '4',
    employeeName: 'فاطمة حسن',
    name: 'فاطمة حسن',
    startDate: '2024-03-01',
    endDate: '2024-03-03',
    fromDate: '2024-03-01',
    toDate: '2024-03-03',
    leaveType: 'إجازة شخصية',
    reason: 'الانتقال إلى منزل جديد',
    status: 'Manager_Approved',
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-01-21T16:00:00Z'
  },
  {
    id: '5',
    employeeId: '2',
    employeeName: 'سارة أحمد',
    name: 'سارة أحمد',
    startDate: '2024-02-10',
    endDate: '2024-02-12',
    fromDate: '2024-02-10',
    toDate: '2024-02-12',
    leaveType: 'إجازة سنوية',
    reason: 'حضور مؤتمر',
    status: 'HR_Approved',
    createdAt: '2024-01-05T12:00:00Z',
    updatedAt: '2024-01-08T10:00:00Z'
  },
  {
    id: '6',
    employeeId: '5',
    employeeName: 'خالد عبدالله',
    name: 'خالد عبدالله',
    startDate: '2024-02-28',
    endDate: '2024-03-02',
    fromDate: '2024-02-28',
    toDate: '2024-03-02',
    leaveType: 'إجازة طارئة',
    reason: 'ظروف عائلية طارئة',
    status: 'Rejected',
    createdAt: '2024-01-25T14:00:00Z',
    updatedAt: '2024-01-26T09:00:00Z',
    rejectionReason: 'تعارض مع مواعيد مهمة في المشروع'
  }
];

let currentUser: User | null = null;
let authToken: string | null = null;

/**
 * Mock API Service for development and testing
 * Simulates backend API responses with realistic data
 */
class MockApiService {
  /**
   * Simulate network delay
   * @param ms - Milliseconds to delay
   */
  private delay(ms: number = 800) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate mock JWT token
   * @returns Mock token string
   */
  private generateToken(): string {
    return 'mock-jwt-token-' + Math.random().toString(36).substr(2, 9);
  }

  // ==================== AUTH METHODS ====================

  /**
   * Mock user login
   * @param username - Username or email
   * @param password - User password
   * @returns Authentication response
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    await this.delay();
    
    if (password !== 'password') {
      throw new Error('كلمة المرور غير صحيحة');
    }

    const user = mockUsers.find(u => u.username === username || u.email === username);
    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    const token = this.generateToken();
    currentUser = user;
    authToken = token;

    return { token, user };
  }

  /**
   * Mock user registration
   * @param userData - User registration data
   * @returns Authentication response
   */
  async register(userData: {
    username: string;
    password: string;
    name: string;
    email: string;
    role: 2 | 1 | 0;
    department: string;
  }): Promise<AuthResponse> {
    await this.delay();

    // Check if user already exists
    if (mockUsers.find(u => u.email === userData.email)) {
      throw new Error('المستخدم موجود بالفعل');
    }

    const nameParts = userData.name.split(' ');
    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      email: userData.email,
      firstName: nameParts[0] || userData.name,
      lastName: nameParts.slice(1).join(' ') || '',
      name: userData.name,
      role: userData.role,
      department: userData.department,
      username: userData.username
    };

    mockUsers.push(newUser);
    const token = this.generateToken();
    currentUser = newUser;
    authToken = token;

    return { token, user: newUser };
  }

  // ==================== LEAVE REQUEST METHODS ====================

  /**
   * Create new leave request
   * @param data - Leave request data
   * @returns Created leave request
   */
  async createLeaveRequest(data: CreateLeaveRequest): Promise<LeaveRequest> {
    await this.delay();

    if (!currentUser) {
      throw new Error('غير مصرح لك بالوصول');
    }

    const newRequest: LeaveRequest = {
      id: (mockLeaveRequests.length + 1).toString(),
      employeeId: currentUser.id,
      employeeName: `${currentUser.firstName} ${currentUser.lastName}`,
      name: currentUser.name || `${currentUser.firstName} ${currentUser.lastName}`,
      startDate: data.startDate || data.fromDate || '',
      endDate: data.endDate || data.toDate || '',
      fromDate: data.fromDate || data.startDate || '',
      toDate: data.toDate || data.endDate || '',
      leaveType: data.leaveType,
      reason: data.reason,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockLeaveRequests.push(newRequest);
    return newRequest;
  }

  /**
   * Get current user's leave requests
   * @returns Array of user's leave requests
   */
  async getMyLeaveRequests(): Promise<LeaveRequest[]> {
    await this.delay();

    if (!currentUser) {
      throw new Error('غير مصرح لك بالوصول');
    }

    return mockLeaveRequests.filter(req => req.employeeId === currentUser!.id);
  }

  /**
   * Get pending requests for manager approval
   * @returns Array of pending requests
   */
  async getPendingRequests(): Promise<LeaveRequest[]> {
    await this.delay();

    if (!currentUser || currentUser.role !== 1) {
      throw new Error('غير مصرح لك بالوصول');
    }

    return mockLeaveRequests.filter(req => req.status === 'Pending');
  }

  /**
   * Get manager approved requests for HR
   * @returns Array of manager approved requests
   */
  async getManagerApprovedRequests(): Promise<LeaveRequest[]> {
    await this.delay();

    if (!currentUser || currentUser.role !== 0) {
      throw new Error('غير مصرح لك بالوصول');
    }

    return mockLeaveRequests.filter(req => req.status === 'Manager_Approved');
  }

  // ==================== MANAGER ACTIONS ====================

  /**
   * Manager approve leave request
   * @param id - Leave request ID
   */
  async managerApprove(id: string): Promise<void> {
    await this.delay();

    if (!currentUser || currentUser.role !== 1) {
      throw new Error('غير مصرح لك بالوصول');
    }

    const request = mockLeaveRequests.find(req => req.id === id);
    if (!request) {
      throw new Error('الطلب غير موجود');
    }

    request.status = 'Manager_Approved';
    request.updatedAt = new Date().toISOString();
  }

  /**
   * Manager reject leave request
   * @param id - Leave request ID
   */
  async managerReject(id: string): Promise<void> {
    await this.delay();

    if (!currentUser || currentUser.role !== 1) {
      throw new Error('غير مصرح لك بالوصول');
    }

    const request = mockLeaveRequests.find(req => req.id === id);
    if (!request) {
      throw new Error('الطلب غير موجود');
    }

    request.status = 'Rejected';
    request.updatedAt = new Date().toISOString();
  }

  /**
   * Manager cancel leave request
   * @param id - Leave request ID
   */
  async managerCancel(id: string): Promise<void> {
    await this.delay();

    if (!currentUser || currentUser.role !== 1) {
      throw new Error('غير مصرح لك بالوصول');
    }

    const request = mockLeaveRequests.find(req => req.id === id);
    if (!request) {
      throw new Error('الطلب غير موجود');
    }

    request.status = 'Cancelled';
    request.updatedAt = new Date().toISOString();
  }

  // ==================== HR ACTIONS ====================

  /**
   * HR approve leave request (final approval)
   * @param id - Leave request ID
   */
  async hrApprove(id: string): Promise<void> {
    await this.delay();

    if (!currentUser || currentUser.role !== 0) {
      throw new Error('غير مصرح لك بالوصول');
    }

    const request = mockLeaveRequests.find(req => req.id === id);
    if (!request) {
      throw new Error('الطلب غير موجود');
    }

    request.status = 'HR_Approved';
    request.updatedAt = new Date().toISOString();
  }

  /**
   * HR reject leave request
   * @param id - Leave request ID
   */
  async hrReject(id: string): Promise<void> {
    await this.delay();

    if (!currentUser || currentUser.role !== 0) {
      throw new Error('غير مصرح لك بالوصول');
    }

    const request = mockLeaveRequests.find(req => req.id === id);
    if (!request) {
      throw new Error('الطلب غير موجود');
    }

    request.status = 'Rejected';
    request.updatedAt = new Date().toISOString();
  }

  /**
   * HR cancel leave request
   * @param id - Leave request ID
   */
  async hrCancel(id: string): Promise<void> {
    await this.delay();

    if (!currentUser || currentUser.role !== 0) {
      throw new Error('غير مصرح لك بالوصول');
    }

    const request = mockLeaveRequests.find(req => req.id === id);
    if (!request) {
      throw new Error('الطلب غير موجود');
    }

    request.status = 'Cancelled';
    request.updatedAt = new Date().toISOString();
  }

  // ==================== USER MANAGEMENT ====================

  /**
   * Get all system users (HR only)
   * @returns Array of all users
   */
  async getUsers(): Promise<User[]> {
    await this.delay();

    if (!currentUser || currentUser.role !== 0) {
      throw new Error('غير مصرح لك بالوصول');
    }

    return mockUsers;
  }
}

export const mockApiService = new MockApiService();