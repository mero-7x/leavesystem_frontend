// src/pages/History.tsx
import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { LeaveRequest } from '../types';
import StatusBadge from '../components/UI/StatusBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const fmtYMD = (v: string | Date | null | undefined) => {
  if (!v) return '';
  if (typeof v === 'string') return v.split('T')[0];
  return v.toISOString().slice(0, 10);
};

const History: React.FC = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiService.getManagerApprovedRequests();
        setRows(data); // already manager-approved
      } catch {
        toast.error('Failed to load manager-approved requests');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  const roleConfig =
    user?.role === 'HR'
      ? { title: 'Manager-Approved Requests', subtitle: 'Ready for HR review', color: 'from-purple-500 to-violet-600', icon: FileText }
      : { title: 'Manager Approval History', subtitle: 'Requests approved by Manager', color: 'from-blue-500 to-indigo-600', icon: CheckCircle };

  const RoleIcon = roleConfig.icon;

  return (
    <div className="space-y-6">
      <div className={`bg-gradient-to-r ${roleConfig.color} rounded-2xl p-8 text-white shadow-xl`}>
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-xl p-3">
            <RoleIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{roleConfig.title}</h1>
            <p className="text-xl opacity-90 mt-1">{roleConfig.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        {rows.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No manager-approved requests</h3>
            <p className="mt-2 text-gray-500">Nothing here yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Manager-Approved Requests ({rows.length})
              </h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="ml-3 text-sm font-medium text-gray-900">
                          {r.name || r.userName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.leaveType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fmtYMD(r.fromDate || r.fromDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fmtYMD(r.toDate || r.toDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={r.reason}>{r.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
