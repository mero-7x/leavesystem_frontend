// ---------- Auth / User ----------
export interface User {
  id: string; // if your backend sends a number, string is still fine for URLs; otherwise change to number
  email: string;
  name: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'HR';
  department?: string;
  username?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ---------- App-wide Leave model (your existing one) ----------
export type LeaveStatus =
  | 'Pending'
  | 'Manager_Approved'
  | 'Manager_approved'   // backend sometimes sends this exact casing
  | 'HR_Approved'
  | 'Rejected'
  | 'Cancelled';

export interface LeaveRequest {
  id: string;            // if you want to accept numbers too: string | number
  employeeId: string;    // same note: string | number if needed
  name: string;
  fromDate: string;      // "YYYY-MM-DDTHH:mm:ss" or "YYYY-MM-DD"
  toDate: string;
  leaveType: string;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
  updatedAt: string;
  userName: string;
}

// ---------- Generic API envelope ----------
export type ApiListResponse<T> = {
  success: boolean;
  count: number;
  data: T[];
};

// ---------- Exact row shape for HR/ pending & Manager/ approved ----------
export type ManagerApprovedStatus = 'Manager_Approved';

export interface ManagerApprovedItem {
  id: number;
  userId: number;
  userName: string;      // backend sends empty string sometimes, still string
  fromDate: string;      // "YYYY-MM-DDTHH:mm:ss"
  toDate: string;        // "YYYY-MM-DDTHH:mm:ss"
  leaveType: 'Sick' | 'Annual' | 'Temporary' | string;
  reason: string;
  status: ManagerApprovedStatus;
  createdAt: string;     // "YYYY-MM-DD HH:mm:ss"
}

// Envelope for HR/pending (and Manager/approved if it uses the same shape)
export type ManagerApprovedResponse = ApiListResponse<ManagerApprovedItem>;

// ---------- Create payload ----------
export interface CreateLeaveRequest {
  fromDate: string;
  toDate: string;
  leaveType: string;
  reason: string;
}

// ---------- Errors ----------
export interface ApiError {
  message: string;
  details?: string[];
}
