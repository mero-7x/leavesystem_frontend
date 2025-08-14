import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Ban, Filter, Calendar } from 'lucide-react';
import { apiService } from '../services/api';
import { LeaveRequest } from '../types';
import StatusBadge from '../components/UI/StatusBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import RejectionModal from '../components/UI/RejectionModal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

/**
 * Pending Approvals Page for Managers
 * Handles approval/rejection of team leave requests
 * Includes filtering and rejection reason modal
 */
const PendingApprovals: React.FC = () => {
  // State management
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Filter states
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  
  // Rejection modal state
  const [rejectionModal, setRejectionModal] = useState<{
    isOpen: boolean;
    request: LeaveRequest | null;
  }>({
    isOpen: false,
    request: null
  });

  // Load data on component mount
  useEffect(() => {
    fetchPendingRequests();
  }, []);

  // Apply filters when data or filters change
  useEffect(() => {
    applyFilters();
  }, [requests, leaveTypeFilter, sortBy]);

  /**
   * Fetch pending requests from API
   */
  const fetchPendingRequests = async () => {
    try {
      const data = await apiService.getPendingRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      toast.error('فشل في تحميل الطلبات المعلقة');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Apply filters and sorting to requests
   */
  const applyFilters = () => {
    let filtered = [...requests];

    // Leave type filter
    if (leaveTypeFilter !== 'all') {
      filtered = filtered.filter(req => req.leaveType === leaveTypeFilter);
    }

    // Sorting
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'name':
        filtered.sort((a, b) => {
          const nameA = a.employeeName || '';
          const nameB = b.employeeName || '';
          return nameA.localeCompare(nameB);
        });
        break;
      default:
        break;
    }

    setFilteredRequests(filtered);
  };

  /**
   * Handle approval of leave request
   */
  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await apiService.managerApprove(id);
      toast.success('تمت الموافقة على الطلب بنجاح');
      await fetchPendingRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('فشل في الموافقة على الطلب');
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Open rejection modal
   */
  const openRejectionModal = (request: LeaveRequest) => {
    setRejectionModal({
      isOpen: true,
      request
    });
  };

  /**
   * Handle rejection with reason
   */
  const handleReject = async (reason: string) => {
    if (!rejectionModal.request) return;

    setActionLoading(rejectionModal.request.id);
    try {
      await apiService.managerReject(rejectionModal.request.id, reason);
      toast.success('تم رفض الطلب');
      setRejectionModal({ isOpen: false, request: null });
      await fetchPendingRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('فشل في رفض الطلب');
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Handle cancellation/revocation of leave request
   */
  const handleCancel = async (id: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) return;

    setActionLoading(id);
    try {
      await apiService.managerCancel(id);
      toast.success('تم إلغاء الطلب');
      await fetchPendingRequests();
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error('فشل في إلغاء الطلب');
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  // Get unique leave types for filter
  const uniqueLeaveTypes = Array.from(new Set(requests.map(req => req.leaveType)));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                <Clock className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">موافقات الفريق</h1>
                <p className="text-xl opacity-90">مراجعة والموافقة على طلبات إجازة أعضاء الفريق</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-yellow-300" />
                <div>
                  <p className="text-2xl font-bold">{filteredRequests.length}</p>
                  <p className="text-sm opacity-90">طلب معلق</p>
                </div>
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <User className="h-8 w-8 text-blue-300" />
                <div>
                  <p className="text-2xl font-bold">{new Set(requests.map(r => r.employeeId)).size}</p>
                  <p className="text-sm opacity-90">عضو فريق</p>
                </div>
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <Calendar className="h-8 w-8 text-green-300" />
                <div>
                  <p className="text-2xl font-bold">{uniqueLeaveTypes.length}</p>
                  <p className="text-sm opacity-90">نوع إجازة</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-2">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-gray-700">تصفية وترتيب:</span>
          </div>
          
          <div className="flex items-center space-x-6 flex-wrap gap-4">
            <div>
              <label htmlFor="leaveTypeFilter" className="block text-sm font-semibold text-gray-700 mb-2">
                نوع الإجازة
              </label>
              <select
                id="leaveTypeFilter"
                value={leaveTypeFilter}
                onChange={(e) => setLeaveTypeFilter(e.target.value)}
                className="rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm px-4 py-2"
              >
                <option value="all">جميع الأنواع</option>
                {uniqueLeaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="sortBy" className="block text-sm font-semibold text-gray-700 mb-2">
                ترتيب حسب
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm px-4 py-2"
              >
                <option value="recent">الأحدث أولاً</option>
                <option value="oldest">الأقدم أولاً</option>
                <option value="name">حسب الاسم</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="mx-auto h-20 w-20 text-gray-300" />
            <h3 className="mt-6 text-2xl font-semibold text-gray-900">لا توجد طلبات معلقة</h3>
            <p className="mt-3 text-gray-500 text-lg">
              جميع طلبات إجازة الفريق تم مراجعتها.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">
                طلبات الفريق المعلقة ({filteredRequests.length})
              </h2>
              <p className="text-gray-600 mt-1">طلبات إجازة تحتاج إلى مراجعة وموافقة</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-8 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                      الموظف
                    </th>
                    <th className="px-8 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                      نوع الإجازة
                    </th>
                    <th className="px-8 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                      المدة
                    </th>
                    <th className="px-8 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-8 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                      السبب
                    </th>
                    <th className="px-8 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-300">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                              <User className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div className="mr-4">
                            <div className="text-lg font-bold text-gray-900">
                              {request.name || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                          {request.leaveType}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatDate(request.fromDate)} - {formatDate(request.toDate)}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <StatusBadge status={request.status} size="lg" />
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm text-gray-900 max-w-xs" title={request.reason}>
                          {request.reason.length > 50 ? `${request.reason.substring(0, 50)}...` : request.reason}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApprove(request.id)}
                            disabled={actionLoading === request.id}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-2xl text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            موافقة
                          </button>
                          <button
                            onClick={() => openRejectionModal(request)}
                            disabled={actionLoading === request.id}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-2xl text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            رفض
                          </button>
                          <button
                            onClick={() => handleCancel(request.id)}
                            disabled={actionLoading === request.id}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-2xl text-white bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            إلغاء
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={rejectionModal.isOpen}
        onClose={() => setRejectionModal({ isOpen: false, request: null })}
        onConfirm={handleReject}
        employeeName={rejectionModal.request?.employeeName || ''}
        leaveType={rejectionModal.request?.leaveType || ''}
        loading={actionLoading === rejectionModal.request?.id}
      />
    </div>
  );
};

export default PendingApprovals;