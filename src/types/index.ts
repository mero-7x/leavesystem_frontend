// ---------- Auth / User ----------
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'HR';
  department?: string;
  username?: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ---------- App-wide Leave model ----------
export type LeaveStatus =
  | 'Pending'
  | 'Manager_Approved'
  | 'HR_Approved'
  | 'Rejected'
  | 'Cancelled';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  fromDate?: string;
  toDate?: string;
  leaveType: string;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  rejectionReason?: string;
}

// ---------- Generic API envelope ----------
export type ApiListResponse<T> = {
  success: boolean;
  count: number;
  data: T[];
};

// ---------- Manager Approved Item ----------
export type ManagerApprovedStatus = 'Manager_Approved';

export interface ManagerApprovedItem {
  id: number;
  userId: number;
  userName: string;
  fromDate: string;
  toDate: string;
  leaveType: 'Sick' | 'Annual' | 'Temporary' | string;
  reason: string;
  status: ManagerApprovedStatus;
  createdAt: string;
  rejectionReason?: string;
}

export type ManagerApprovedResponse = ApiListResponse<ManagerApprovedItem>;

// ---------- Create payload ----------
export interface CreateLeaveRequest {
  startDate?: string;
  endDate?: string;
  fromDate?: string;
  toDate?: string;
  leaveType: string;
  reason: string;
}

// ---------- Rejection payload ----------
export interface RejectionRequest {
  reason: string;
}

// ---------- Errors ----------
export interface ApiError {
  message: string;
  details?: string[];
}