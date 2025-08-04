import React from 'react';

interface StatusBadgeProps {
  status: 'Pending' | 'ManagerApproved' | 'HRApproved' | 'Rejected' | 'Cancelled';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' };
      case 'ManagerApproved':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Manager Approved' };
      case 'HRApproved':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' };
      case 'Rejected':
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' };
      case 'Cancelled':
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelled' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;