import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Filter, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { LeaveRequest } from '../types';
import StatusBadge from '../components/UI/StatusBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
// import { format } from 'date-fns';
import toast from 'react-hot-toast';

const History: React.FC = () => {
  const { user } = useAuth();
  const [allRequests, setAllRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    try {
      // For demo purposes, we'll get all requests and filter them
      // In a real app, you'd have specific endpoints for history
      const myRequests = await apiService.getMyLeaveRequests();
      
      if (user?.role === 'MANAGER') {
        const pendingRequests = await apiService.getPendingRequests();
        // Simulate processed requests by getting some mock data
        const processedRequests = [
          ...myRequests,
          ...pendingRequests.map(req => ({ ...req, status: 'Manager_Approved' as const }))
        ];
        setAllRequests(processedRequests);
      } else if (user?.role === 'HR') {
        const hrRequests = await apiService.getManagerApprovedRequests();
        // Simulate all processed requests
        const processedRequests = [
          ...myRequests,
          ...hrRequests.map(req => ({ ...req, status: 'HR_Approved' as const }))
        ];
        setAllRequests(processedRequests);
      }
    } catch (error) {
      toast.error('Failed to load history data');
    } finally {
      setLoading(false);
    }
  };

  const getProcessedRequests = () => {
    if (user?.role === 'MANAGER') {
      return allRequests.filter(req => 
        req.status === 'Manager_Approved' || req.status === 'Rejected'
      );
    } else if (user?.role === 'HR') {
      return allRequests.filter(req => 
        req.status === 'HR_Approved' || req.status === 'Rejected'
      );
    }
    return [];
  };

  const filteredRequests = getProcessedRequests().filter(req => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesAction = actionFilter === 'all' || 
      (actionFilter === 'approved' && (req.status === 'Manager_Approved' || req.status === 'HR_Approved')) ||
      (actionFilter === 'rejected' && req.status === 'Rejected');
    
    return matchesStatus && matchesAction;
  });

  const getRoleConfig = () => {
    if (user?.role === 'MANAGER') {
      return {
        title: 'Manager Approval History',
        subtitle: 'Track all leave requests you have approved or rejected',
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'bg-blue-50',
        icon: CheckCircle
      };
    } else {
      return {
        title: 'HR Approval History',
        subtitle: 'Complete history of all final approvals and rejections',
        color: 'from-purple-500 to-violet-600',
        bgColor: 'bg-purple-50',
        icon: FileText
      };
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Manager_Approved', label: 'Manager Approved' },
    { value: 'HR_Approved', label: 'HR Approved' },
    { value: 'Rejected', label: 'Rejected' },
  ];

  const actionOptions = [
    { value: 'all', label: 'All Actions' },
    { value: 'approved', label: 'Approved by Me' },
    { value: 'rejected', label: 'Rejected by Me' },
  ];

  if (loading) return <LoadingSpinner />;

  const roleConfig = getRoleConfig();
  const RoleIcon = roleConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex items-center space-x-4">
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="actionFilter" className="block text-sm font-medium text-gray-700 mb-1">
                My Actions
              </label>
              <select
                id="actionFilter"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {actionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No history found</h3>
            <p className="mt-2 text-gray-500">
              {statusFilter === 'all' && actionFilter === 'all'
                ? "You haven't processed any leave requests yet."
                : "No requests match the current filter criteria."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Processed Requests ({filteredRequests.length})
              </h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
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
                    Action Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {request.employeeName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.leaveType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {/* {format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd, yyyy')} */}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {/* {format(new Date(request.updatedAt), 'MMM dd, yyyy')} */}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={request.reason}>
                        {request.reason}
                      </div>
                    </td>
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