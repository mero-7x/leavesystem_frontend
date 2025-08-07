import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Ban } from 'lucide-react';

interface StatusBadgeProps {
  status: 'Pending' | 'Manager_Approved' | 'HR_Approved' | 'Rejected' | 'Cancelled';
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Pending':
        return { 
          bg: 'bg-gradient-to-r from-yellow-100 to-yellow-200', 
          text: 'text-yellow-800', 
          border: 'border-yellow-300',
          icon: Clock,
          label: 'Pending Review' 
        };
      case 'Manager_Approved':
        return { 
          bg: 'bg-gradient-to-r from-blue-100 to-blue-200', 
          text: 'text-blue-800', 
          border: 'border-blue-300',
          icon: AlertCircle,
          label: 'Manager Approved' 
        };
      case 'HRA_pproved':
        return { 
          bg: 'bg-gradient-to-r from-green-100 to-green-200', 
          text: 'text-green-800', 
          border: 'border-green-300',
          icon: CheckCircle,
          label: 'Approved' 
        };
      case 'Rejected':
        return { 
          bg: 'bg-gradient-to-r from-red-100 to-red-200', 
          text: 'text-red-800', 
          border: 'border-red-300',
          icon: XCircle,
          label: 'Rejected' 
        };
      case 'Cancelled':
        return { 
          bg: 'bg-gradient-to-r from-gray-100 to-gray-200', 
          text: 'text-gray-800', 
          border: 'border-gray-300',
          icon: Ban,
          label: 'Cancelled' 
        };
      default:
        return { 
          bg: 'bg-gradient-to-r from-gray-100 to-gray-200', 
          text: 'text-gray-800', 
          border: 'border-gray-300',
          icon: AlertCircle,
          label: status 
        };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-sm';
      default:
        return 'px-3 py-1.5 text-xs';
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center ${sizeClasses} rounded-full font-medium border ${config.bg} ${config.text} ${config.border} shadow-sm`}>
      <IconComponent className="w-3 h-3 mr-1.5" />
      {config.label}
    </span>
  );
};

export default StatusBadge;