import React, { useState, useEffect } from "react";
import {
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  Users,
  Award,
  AlertCircle,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";
import { LeaveRequest } from "../types";
import StatusBadge from "../components/UI/StatusBadge";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import toast from "react-hot-toast";

/** ----------------- New types for HR statistics endpoint ----------------- */
type HrStatBucket = {
  totalRequests: number;
  pendingRequests: number;
  managerApproved: number;
  hrApproved: number;
  rejected: number;
  cancelled: number;
};

type HrStatistics = {
  users_count: number;
  leave_Count: number;
  leaveStatistics: HrStatBucket[];
};

/** ----------------- HR Pending Requests (new endpoint) ----------------- */
type HrPendingRequest = {
  id: number;
  userId: number;
  userName: string;
  managerName: string;
  fromDate: string; // ISO
  toDate: string;   // ISO
  leaveType: string;
  reason: string;
  status: string;   // e.g. "ManagerApproved"
  createdAt: string; // "YYYY-MM-DD HH:mm:ss"
};

type HrPendingResponse = {
  count: number;
  leaveRequests: HrPendingRequest[];
};

/** ----------------- Existing types you already had ----------------- */
export type LeaveCounts = {
  pending: number;
  managerApproved: number;
  hrApproved: number;
  rejected: number;
};

export type LeaveCountsApiResponse = {
  count: LeaveCounts;
};

/** ----------------- Tiny stat card component ----------------- */
type StatCardProps = {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  progress?: number;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, bgColor, progress }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`bg-gradient-to-r ${color} rounded-xl p-3 shadow-lg`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
    <div className={`mt-4 h-2 ${bgColor} rounded-full`}>
      <div
        className={`h-2 bg-gradient-to-r ${color} rounded-full`}
        style={{ width: `${Math.max(0, Math.min(100, progress ?? 100))}%` }}
      />
    </div>
  </div>
);

/** ----------------- HR cards section (uses /api/hr/hr-statistics) ----------------- */
const HrStatsSection: React.FC<{ data: HrStatistics | null; loading: boolean }> = ({ data, loading }) => {
  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const bucket: HrStatBucket = data.leaveStatistics?.[0] ?? {
    totalRequests: 0,
    pendingRequests: 0,
    managerApproved: 0,
    hrApproved: 0,
    rejected: 0,
    cancelled: 0,
  };

  const total = bucket.totalRequests || 0;
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  const cards: StatCardProps[] = [
    {
      title: "System Users",
      value: data.users_count,
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      progress: data.users_count,
    },
    {
      title: "Total Leave Records",
      value: data.leave_Count,
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      progress: data.leave_Count,
    },
    {
      title: "Total Requests",
      value: total,
      icon: FileText,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      progress: total,
    },
    {
      title: "Pending",
      value: bucket.pendingRequests,
      icon: Clock,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      progress: bucket.pendingRequests,
    },
    {
      title: "Manager Approved",
      value: bucket.managerApproved,
      icon: Award,
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
      progress: bucket.managerApproved,
    },
    {
      title: "HR Approved",
      value: bucket.hrApproved,
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      progress: bucket.hrApproved,
    },
    {
      title: "Rejected",
      value: bucket.rejected,
      icon: X,
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-rose-50",
      progress: bucket.rejected,
    },
    {
      title: "Cancelled",
      value: bucket.cancelled,
      icon: AlertCircle,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      progress: bucket.cancelled,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-violet-500 to-violet-600 rounded-lg p-2">
            <Users className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            HR Overview
          </h2>
        </div>
        <p className="text-sm text-gray-500 mt-1">Real-time statistics from the HR endpoint</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c, i) => (
            <StatCard key={i} {...c} />
          ))}
        </div>
      </div>
    </div>
  );
};

/** ----------------- Helpers ----------------- */
const parseLooseDate = (s: string) => {
  // Try native first (handles ISO strings like fromDate/toDate)
  let d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  // Handle "YYYY-MM-DD HH:mm:ss" -> treat as local
  const isoish = s.replace(" ", "T");
  d = new Date(isoish);
  return d;
};

const fmtDate = (s: string) => {
  const d = parseLooseDate(s);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** ----------------- HR Pending Table ----------------- */
const HrPendingTable: React.FC<{
  items: HrPendingRequest[];
  totalCount: number;
  loading: boolean;
}> = ({ items, totalCount, loading }) => {
  if (loading) return <LoadingSpinner />;
  if (!items || items.length === 0)
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-2">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Pending HR Approval</h2>
        </div>
        <p className="text-gray-500">No pending requests 🎉</p>
      </div>
    );

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-2">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Pending HR Approval (Last 5)</h2>
          </div>
          <p className="text-sm text-gray-500">
            Showing {items.length} of {totalCount}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {items.map((r,idx) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-3 py-3 text-sm text-gray-500">{idx + 1}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{r.userName || "—"}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{r.managerName || "—"}</td>
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  {fmtDate(r.fromDate)} → {fmtDate(r.toDate)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{r.leaveType}</td>
                <td className="px-4 py-3 text-sm text-gray-700 max-w-[280px]">
                  <div className="truncate" title={r.reason}>{r.reason}</div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{fmtDate(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/** ----------------- Dashboard ----------------- */
const HRDashboard: React.FC = () => {
  const { user } = useAuth();

  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [hrRequests, setHrRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // HR stats (cards)
  const [hrStats, setHrStats] = useState<HrStatistics | null>(null);
  const [hrStatsLoading, setHrStatsLoading] = useState(false);

  // HR pending (table)
  const [hrPending, setHrPending] = useState<HrPendingRequest[]>([]);
  const [hrPendingTotal, setHrPendingTotal] = useState<number>(0);
  const [hrPendingLoading, setHrPendingLoading] = useState(false);

  const [hrUsersCount, setHrUsersCount] = useState<number>(0);
  const [counts, setCounts] = useState<LeaveCounts>({
    pending: 0,
    managerApproved: 0,
    hrApproved: 0,
    rejected: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requests = await apiService.getMyLeaveRequests();
        setMyRequests(requests);

        if (user?.role === "MANAGER") {
          const pending = await apiService.getPendingRequests();
          setPendingRequests(pending);
        }

        if (user?.role === "HR") {
          const hrApprovals = await apiService.getManagerApprovedRequests();
          setHrRequests(hrApprovals);

          try {
            const usersRes = await apiService.getHRAllUsers({
              page: 1,
              pageSize: 20,
              sortBy: "id",
              desc: true,
            });
            setHrUsersCount(usersRes.count ?? usersRes.data?.length ?? 0);
          } catch {
            /* silent */
          }
        }
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.role]);

  /** ----------------- auth header util ----------------- */
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  /** ----------------- (kept) counts for employee tiles ----------------- */
  const loadCounts = async () => {
    if (user?.role !== "EMPLOYEE") return;
    try {
      const res = await fetch(
        "https://leavesystem-production-a4d3.up.railway.app/api/LeaveRequest/my/count",
        { method: "GET", headers: getAuthHeader() }
      );
      if (!res.ok) throw new Error("Failed to load count data");
      const data: LeaveCountsApiResponse = await res.json();
      setCounts(data.count);
    } catch {
      toast.error("Failed to load count data");
    }
  };

  /** ----------------- HR stats cards loader ----------------- */
  const loadHrStatistics = async () => {
    if (user?.role !== "HR") return;
    setHrStatsLoading(true);
    try {
      const res = await fetch(
        "https://leavesystem-production-a4d3.up.railway.app/api/hr/hr-statistics",
        { method: "GET", headers: getAuthHeader() }
      );
      if (!res.ok) throw new Error("Failed to load HR statistics");
      const data: HrStatistics = await res.json();
      setHrStats(data);
    } catch {
      toast.error("Failed to load HR statistics");
      setHrStats(null);
    } finally {
      setHrStatsLoading(false);
    }
  };

  /** ----------------- NEW: HR pending table loader ----------------- */
  const loadHrPending = async () => {
    if (user?.role !== "HR") return;
    setHrPendingLoading(true);
    try {
      const res = await fetch(
        "https://leavesystem-production-a4d3.up.railway.app/api/hr/pending-requests",
        { method: "GET", headers: getAuthHeader() }
      );
      if (!res.ok) throw new Error("Failed to load pending requests");
      const data: HrPendingResponse = await res.json();

      // sort by createdAt desc and keep only last 5
      const sorted = [...(data.leaveRequests ?? [])].sort((a, b) => {
        const da = parseLooseDate(a.createdAt).getTime();
        const db = parseLooseDate(b.createdAt).getTime();
        return db - da;
      });

      setHrPending(sorted.slice(0, 5));
      setHrPendingTotal(data.count ?? sorted.length);
    } catch {
      toast.error("Failed to load pending HR requests");
      setHrPending([]);
      setHrPendingTotal(0);
    } finally {
      setHrPendingLoading(false);
    }
  };

  useEffect(() => {
    loadCounts();
  }, [user?.role]);

  useEffect(() => {
    loadHrStatistics();
    loadHrPending();
  }, [user?.role]);

  const getStatusCount = (status: number) => {
    return myRequests.filter((req) => req.status === status).length;
  };

  const getRoleSpecificStats = () => {
    switch (user?.role) {
      case "EMPLOYEE":
        return [
          { title: "Total Requests", value: myRequests.length, icon: FileText, color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50" },
          { title: "Pending", value: counts.pending, icon: Clock, color: "from-yellow-500 to-yellow-600", bgColor: "bg-yellow-50" },
          { title: "Approved", value: counts.hrApproved, icon: CheckCircle, color: "from-green-500 to-green-600", bgColor: "bg-green-50" },
          { title: "Process", value: counts.managerApproved, icon: CheckCircle, color: "from-green-500 to-green-600", bgColor: "bg-green-50" },
          { title: "Reject", value: counts.rejected, icon: X, color: "from-red-500 to-red-600", bgColor: "bg-purple-50" },
        ];
      case "MANAGER":
        return [
          { title: "My Requests", value: myRequests.length, icon: FileText, color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50" },
          { title: "Team Pending", value: pendingRequests.length, icon: Clock, color: "from-orange-500 to-orange-600", bgColor: "bg-orange-50" },
          { title: "Processed", value: pendingRequests.length + 8, icon: CheckCircle, color: "from-green-500 to-green-600", bgColor: "bg-green-50" },
          { title: "Team Requests", value: pendingRequests.length + 5, icon: Users, color: "from-indigo-500 to-indigo-600", bgColor: "bg-indigo-50" },
        ];
      case "HR":
        // return [
        //   { title: "Awaiting Final", value: hrRequests.length, icon: AlertCircle, color: "from-red-500 to-red-600", bgColor: "bg-red-50" },
        //   { title: "System Users", value: hrStats?.users_count ?? hrUsersCount, icon: Users, color: "from-purple-500 to-purple-600", bgColor: "bg-purple-50" },
        // ];
      default:
        return [];
    }
  };

  const getRoleWelcomeMessage = () => {
    switch (user?.role) {
      case "EMPLOYEE":
        return { title: `Welcome back, ${user?.name}!`, subtitle: "Manage your leave requests and track their status", color: "from-green-500 to-emerald-600" };
      case "MANAGER":
        return { title: `Good day, ${user?.name}!`, subtitle: "Review team requests and manage your own leave", color: "from-blue-500 to-indigo-600" };
      case "HR":
        return { title: `Hello, ${user?.name}!`, subtitle: "Oversee all leave requests and manage system users", color: "from-purple-500 to-violet-600" };
      default:
        return { title: `Welcome, ${user?.name}!`, subtitle: "Your dashboard overview", color: "from-gray-500 to-gray-600" };
    }
  };

  if (loading) return <LoadingSpinner />;

  const stats = getRoleSpecificStats();
  const welcome = getRoleWelcomeMessage();
  const recentRequests = myRequests.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className={`bg-gradient-to-r ${welcome.color} rounded-2xl p-8 text-white shadow-xl`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">{welcome.title}</h1>
            <p className="text-xl opacity-90">{welcome.subtitle}</p>
            <div className="mt-4 flex items-center space-x-4 text-sm opacity-80">
              <span>Role: {user?.role}</span>
              <span>•</span>
              <span>Department: {user?.departmentName}</span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold">{user?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Small role-specific tiles */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={(stat as any).title}
              value={(stat as any).value}
              icon={(stat as any).icon}
              color={(stat as any).color}
              bgColor={(stat as any).bgColor}
              progress={100}
            />
          ))}
        </div>
      )}

      {/* HR cards from /api/hr/hr-statistics */}
      {user?.role === "HR" && <HrStatsSection data={hrStats} loading={hrStatsLoading} />}

      {/* NEW: HR Pending Table (last 5) */}
      {user?.role === "HR" && (
        <HrPendingTable items={hrPending} totalCount={hrPendingTotal} loading={hrPendingLoading} />
      )}

      {/* Manager: Requests awaiting approval */}
      {user?.role === "MANAGER" && pendingRequests.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-2">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Team Requests Awaiting Approval
              </h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {pendingRequests.slice(0, 3).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">{request.name}</h3>
                      <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                        {request.leaveType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{/* date range */}</p>
                  </div>
                  <div className="text-sm text-gray-500">{/* createdAt */}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HR: Requests awaiting final approval (existing small list) */}
      {user?.role === "HR" && hrRequests.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-2">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Requests Awaiting Final Approval
              </h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {hrRequests.slice(0, 3).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">{request.name}</h3>
                      <span className="text-sm text-red-600 bg-red-100 px-2 py-1 rounded-full">
                        {request.leaveType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{/* date range */}</p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Requests */}
     
    </div>
  );
};

export default HRDashboard;
