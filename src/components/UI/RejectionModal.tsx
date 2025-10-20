import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  employeeName: string;
  leaveType: string;
  loading?: boolean;

  /** 'approve' to use it as an approval popup, 'reject' (default) for rejection */
  mode?: 'approve' | 'reject';
}

/**
 * Reason Modal Component (Approve / Reject)
 * Prompts for a reason, used for final approval or rejection
 */
const RejectionModal: React.FC<RejectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  employeeName,
  leaveType,
  loading = false,
  mode = 'reject',
}) => {
  const [reason, setReason] = useState('');

  const isApprove = mode === 'approve';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason.trim());
      setReason('');
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
        {/* Header */}
        <div
          className={
            'rounded-t-3xl p-6 text-white bg-gradient-to-r ' +
            (isApprove ? 'from-green-500 to-emerald-600' : 'from-red-500 to-pink-600')
          }
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-2xl p-2">
                {isApprove ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <AlertTriangle className="h-6 w-6" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {isApprove ? 'الموافقة النهائية على الطلب' : 'رفض طلب الإجازة'}
                </h3>
                <p className="text-sm opacity-90">
                  {isApprove ? 'يرجى تقديم سبب الموافقة' : 'يرجى تقديم سبب الرفض'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="bg-white/20 hover:bg-white/30 rounded-xl p-2 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div
            className={
              'rounded-2xl p-4 mb-6 border ' +
              (isApprove
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200')
            }
          >
            <div className={'text-sm ' + (isApprove ? 'text-green-800' : 'text-red-800')}>
              <p className="font-semibold mb-1">الموظف: {employeeName}</p>
              <p>نوع الإجازة: {leaveType}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="reasonInput"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                {isApprove ? 'سبب الموافقة *' : 'سبب الرفض *'}
              </label>
              <textarea
                id="reasonInput"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  isApprove
                    ? 'يرجى توضيح سبب الموافقة النهائية...'
                    : 'يرجى توضيح سبب رفض طلب الإجازة...'
                }
                rows={4}
                required
                className={
                  'w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:border-transparent resize-none transition-all duration-200 ' +
                  (isApprove ? 'focus:ring-green-500' : 'focus:ring-red-500')
                }
              />
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors duration-200 disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading || !reason.trim()}
                className={
                  'px-6 py-3 text-sm font-semibold text-white rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl bg-gradient-to-r ' +
                  (isApprove
                    ? 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                    : 'from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700')
                }
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{isApprove ? 'جاري الموافقة...' : 'جاري الرفض...'}</span>
                  </div>
                ) : (
                  (isApprove ? 'تأكيد الموافقة' : 'تأكيد الرفض')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RejectionModal;
