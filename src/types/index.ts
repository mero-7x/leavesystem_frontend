export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Employee' | 'Manager' | 'HR';
  department?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  status: 'Pending' | 'ManagerApproved' | 'HRApproved' | 'Rejected' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveRequest {
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
}

export interface ApiError {
  message: string;
  details?: string[];
}