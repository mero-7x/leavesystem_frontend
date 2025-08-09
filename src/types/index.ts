export interface User {
  id: string;
  email: string;
  name : string;
  role: 'EMPLOYEE' | 'MANAGER' | 'HR';
  department?: string;
  username?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  FromDate: string;
  ToDate: string;
  leaveType: string;
  reason: string;
  status: 'Pending' | 'Manager_Approved' | 'HR_Approved' | 'Rejected' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveRequest {
  fromDate: string;
  toDate: string;
  leaveType: string;
  reason: string;
}

export interface ApiError {
  message: string;
  details?: string[];
}