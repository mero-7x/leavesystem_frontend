// ---------- Auth / User ----------
export type User = {
  id: number;
  username: string;
  name: string;
  email: string;
  departmentId: number | null;
  departmentName: string;  // <-- matches your response
  managerId: number | null;
  managerName: string;
  role: "EMPLOYEE" | "MANAGER" | "HR" | string;
  isActive: boolean;
  createdAt: string; // ISO
};

export interface AuthResponse {
  token: string;
  user: User;
  departmentName?: string;
}


export type GetUsersResponse = {
  success: boolean;
  total: number;
  page: number;
  pageSize: number;
  items: User[];
};


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
  fromDate?: string | any;
  toDate?: string | any;
  leaveType?: string |any;
  reason: string;
  status: LeaveStatus | any;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  rejectionReason?: string;
  
}

export type Status = 'pending' | 'managerApproved' | 'hrApproved' | 'rejected';

export type Counts = Record<Status, number>;

export interface CountResponse {
  count: Counts;
}
// src/types/LeaveRequest.ts

export interface LeaveRequest3 {
  id: number;
  userId: number;
  userName: string;
  managerName: string;
  fromDate: string;   // ISO (e.g. "2025-08-25T12:20:54Z")
  toDate: string;     // ISO
  leaveType: number;  // 0=Annual, 1=Sick, 2=Unpaid (example)
  reason: string;
  status: number;     // 0=Pending, 1=Mgr Approved, 2=HR Approved, 3=Rejected, 4=Cancelled
  createdAt: string;  // "YYYY-MM-DD HH:mm:ss"
}

// Enums (adjust if your backend uses different codes)
export enum LeaveTypeCode { Annual = 0, Sick = 1, Unpaid = 2 }
export enum LeaveStatusCode { Pending = 0, Manager_Approved = 1, HRApproved = 2, Rejected = 3, Cancelled = 4 }

export const LeaveTypeLabelByCode: Record<number, string> = {
  [LeaveTypeCode.Annual]: 'Annual',
  [LeaveTypeCode.Sick]: 'Sick',
  [LeaveTypeCode.Unpaid]: 'Unpaid',
};

export const LeaveStatusLabelByCode: Record<number, string> = {
  [LeaveStatusCode.Pending]: 'Pending',
  [LeaveStatusCode.Manager_Approved]: 'Manager Approved',
  [LeaveStatusCode.HRApproved]: 'Approved',
  [LeaveStatusCode.Rejected]: 'Rejected',
  [LeaveStatusCode.Cancelled]: 'Cancelled',
};


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

// export type ManagerApprovedItem = {
//   id: number;
//   userId: number;
//   userName: string;
//   managerName?: string;
//   fromDate: string; // ISO
//   toDate: string;   // ISO
//   leaveType: string;
//   reason: string;
//   status: 'ManagerApproved' | string;
//   createdAt: string;
// };

export type HRPendingResponse = {
  count: number;
  leaveRequests: ManagerApprovedItem[];
};