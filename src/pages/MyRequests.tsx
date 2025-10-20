import React, { useEffect, useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import {  
  LeaveRequest,
  LeaveStatusCode,
  LeaveStatusLabelByCode,
  LeaveTypeLabelByCode,
} from '../types';
import StatusBadge from '../components/UI/StatusBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Safely parse "YYYY-MM-DD HH:mm:ss" or ISO strings
function parseApiDate(input: string) {
  // If it already has a 'T', let Date parse it; otherwise replace space with 'T'
  const isoish = input.includes('T') ? input : input.replace(' ', 'T');
  return new Date(isoish);
}

function formatRange(fromISO: string, toISO: string) {
  const from = new Date(fromISO);
  const to = new Date(toISO);

  // e.g. "Aug 25 – Sep 28, 2025"
  const sameYear = from.getUTCFullYear() === to.getUTCFullYear();
  const start = format(from, 'MMM dd');
  const end = sameYear ? format(to, 'MMM dd, yyyy') : format(to, 'MMM dd, yyyy');
  return `${start} – ${end}`;
}

type FilterKey = 'all' | keyof typeof LeaveStatusCode;
// we’ll actually store numeric code or 'all' to avoid string-vs-number bugs
type FilterValue = 'all' | number;

const statusOptions: Array<{ value: FilterValue; label: string }> = [
  { value: 'all', label: 'All Requests' },
  { value: LeaveStatusCode.Pending, label: LeaveStatusLabelByCode[LeaveStatusCode.Pending] },
  { value: LeaveStatusCode.Manager_Approved, label: LeaveStatusLabelByCode[LeaveStatusCode.Manager_Approved] },
  { value: LeaveStatusCode.HRApproved, label: LeaveStatusLabelByCode[LeaveStatusCode.HRApproved] },
  { value: LeaveStatusCode.Rejected, label: LeaveStatusLabelByCode[LeaveStatusCode.Rejected] },
  { value: LeaveStatusCode.Cancelled, label: LeaveStatusLabelByCode[LeaveStatusCode.Cancelled] },
];

const MyRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterValue>('all');

  useEffect(() => {
        if (!user) return;

    if (user?.role !== "EMPLOYEE") return;
    (async () => {
      
      try {
        const data = await apiService.getMyLeaveRequests();
        setRequests(data);
      } catch (error) {
        toast.error('Failed to load leave requests');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredRequests = useMemo(() => {
    if (filter === 'all') return requests;
    return requests.filter(r => r.status === filter);
  }, [requests, filter]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Leave Requests</h1>
          <p className="text-gray-600 mt-2">Track and manage your leave requests</p>
        </div>

        <div>
          <select
            value={filter}
            onChange={(e) => {
              const v = e.target.value;
              setFilter(v === 'all' ? 'all' : Number(v));
            }}
            className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            {statusOptions.map(option => (
              <option key={String(option.value)} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">No leave requests found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {filter === 'all'
                ? "You haven't submitted any leave requests yet."
                : `No ${LeaveStatusLabelByCode[filter as number]?.toLowerCase() ?? 'matching'} requests found.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => {
                  const submittedOn = parseApiDate(request.createdAt);
                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {LeaveTypeLabelByCode[request.leaveType] ?? request.leaveType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatRange(request.fromDate, request.toDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* If your StatusBadge expects a string, pass the label. If it expects codes, pass request.status */}
                        <StatusBadge status={LeaveStatusLabelByCode[request.status] ?? String(request.status)} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isNaN(submittedOn.getTime()) ? '-' : format(submittedOn, 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={request.reason}>
                          {request.reason}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;
