import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, XCircle, Clock, Filter, User, Ban } from 'lucide-react';
import { apiService } from '../services/api';
import type { ManagerApprovedItem } from '../types';
import StatusBadge from '../components/UI/StatusBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import RejectionModal from '../components/UI/RejectionModal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const HRApprovals: React.FC = () => {
  const [requests, setRequests] = useState<ManagerApprovedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  const [reasonModal, setReasonModal] = useState<{
    isOpen: boolean;
    mode: 'approve' | 'reject';
    request: ManagerApprovedItem | null;
  }>({
    isOpen: false,
    mode: 'reject',
    request: null,
  });

  useEffect(() => {
    fetchHrPending();
  }, []);

  const fetchHrPending = async () => {
    setLoading(true);
    try {
      const res = await apiService.getHRPending2();
      setRequests(res.data.leaveRequests || []);
    } catch (error) {
      console.error('Error fetching HR pending requests:', error);
      toast.error('فشل في تحميل طلبات الموافقة النهائية');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    let list = [...requests];

    if (leaveTypeFilter !== 'all') {
      list = list.filter((req) => req.leaveType === leaveTypeFilter);
    }

    switch (sortBy) {
      case 'recent':
        list.sort(
          (a, b) =>
            new Date((b.createdAt ?? '').replace(' ', 'T')).getTime() -
            new Date((a.createdAt ?? '').replace(' ', 'T')).getTime()
        );
        break;
      case 'oldest':
        list.sort(
          (a, b) =>
            new Date((a.createdAt ?? '').replace(' ', 'T')).getTime() -
            new Date((b.createdAt ?? '').replace(' ', 'T')).getTime()
        );
        break;
      case 'name':
        list.sort((a, b) => (a.userName || '').localeCompare(b.userName || ''));
        break;
    }

    return list;
  }, [requests, leaveTypeFilter, sortBy]);

  const openApproveModal = (request: ManagerApprovedItem) => {
    setReasonModal({ isOpen: true, mode: 'approve', request });
  };
  const openRejectModal = (request: ManagerApprovedItem) => {
    setReasonModal({ isOpen: true, mode: 'reject', request });
  };

  const confirmWithReason = async (reason: string) => {
    if (!reasonModal.request) return;
    const { id } = reasonModal.request;

    setActionLoading(id);
    try {
      if (reasonModal.mode === 'approve') {
        await apiService.hrApprove2(String(id), reason || '');
        toast.success('تمت الموافقة النهائية على الطلب');
      } else {
        await apiService.hrReject2(String(id), reason || '');
        toast.success('تم رفض الطلب');
      }
      setReasonModal({ isOpen: false, mode: 'reject', request: null });
      await fetchHrPending();
    } catch (error) {
      console.error('Error in confirmWithReason:', error);
      toast.error('حدث خطأ أثناء تنفيذ العملية');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (leave_id: number) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) return;
    setActionLoading(leave_id);
    try {
      // await apiService.hrCancel(String(leave_id));
      toast.success('تم إلغاء الطلب (محليًا). أضف نقطة نهاية الإلغاء إن وُجدت.');
      await fetchHrPending();
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error('فشل في إلغاء الطلب');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    try {
      const normalized = dateString.replace(' ', 'T');
      return format(new Date(normalized.split('T')[0]), 'MMM dd, yyyy');
    } catch {
      return (dateString.split('T')[0] || dateString).trim();
    }
  };

  const uniqueLeaveTypes = useMemo(
    () => Array.from(new Set(requests.map((req) => req.leaveType))).filter(Boolean),
    [requests]
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl p-2">
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
                className="rounded-xl border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm px-4 py-2"
              >
                <option value="all">جميع الأنواع</option>
                {uniqueLeaveTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
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
                className="rounded-xl border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm px-4 py-2"
              >
                <option value="recent">الأحدث أولاً</option>
                <option value="oldest">الأقدم أولاً</option>
                <option value="name">حسب الاسم</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="mx-auto h-20 w-20 text-gray-300" />
            <h3 className="mt-6 text-2xl font-semibold text-gray-900">لا توجد طلبات في انتظار الموافقة</h3>
            <p className="mt-3 text-gray-500 text-lg">جميع الطلبات المعتمدة من المدير تم معالجتها.</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">الطلبات المعلقة ({filteredRequests.length})</h2>
              <p className="text-gray-600 mt-1">طلبات معتمدة من المدير تحتاج موافقة نهائية</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-8 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">الموظف</th>
                    <th className="px-8 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">نوع الإجازة</th>
                    <th className="px-8 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">من تاريخ</th>
                    <th className="px-8 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">إلى تاريخ</th>
                    <th className="px-8 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">الحالة</th>
                    <th className="px-8 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">السبب</th>
                    <th className="px-8 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-300">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
                              <User className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div className="mr-4">
                            <div className="text-lg font-bold text-gray-900">
                              {request.userName || `مستخدم #${request.userId}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                          {request.leaveType}
                        </span>
                      </td>

                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{formatDate(request.fromDate)}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{formatDate(request.toDate)}</div>
                      </td>

                      <td className="px-8 py-6 whitespace-nowrap">
                        <StatusBadge status={request.status} size="lg" />
                      </td>

                      <td className="px-8 py-6">
                        <div className="text-sm text-gray-900 max-w-xs" title={request.reason ?? ''}>
                          {request.reason && request.reason.length > 50
                            ? `${request.reason.substring(0, 50)}...`
                            : (request.reason ?? '')}
                        </div>
                      </td>

                      <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openApproveModal(request)}
                            disabled={actionLoading === request.id}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-2xl text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            موافقة نهائية
                          </button>

                          <button
                            onClick={() => openRejectModal(request)}
                            disabled={actionLoading === request.id}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-2xl text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            رفض
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

      {/* Modal */}
      <RejectionModal
        isOpen={reasonModal.isOpen}
        onClose={() => setReasonModal({ isOpen: false, mode: 'reject', request: null })}
        onConfirm={confirmWithReason}
        employeeName={reasonModal.request?.userName || ''}
        leaveType={reasonModal.request?.leaveType || ''}
        loading={actionLoading === reasonModal.request?.id}
        mode={reasonModal.mode}
      />
    </div>
  );
};

export default HRApprovals;
