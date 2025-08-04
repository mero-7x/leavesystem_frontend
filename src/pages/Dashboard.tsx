import React, { useState, useEffect } from 'react';
import { Calendar, FileText, CheckCircle, Clock, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { LeaveRequest } from '../types';
import StatusBadge from '../components/UI/StatusBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requests = await apiService.getMyLeaveRequests();
        setMyRequests(requests);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusCount = (status: string) => {
    return myRequests.filter(req => req.status === status).length;
  };

  const stats = [
    { title: 'Total Requests', value: myRequests.length, icon: FileText, color: 'bg-blue-500' },
    { title: 'Pending', value: getStatusCount('Pending'), icon: Clock, color: 'bg-yellow-500' },
    { title: 'Approved', value: getStatusCount('HRApproved'), icon: CheckCircle, color: 'bg-green-500' },
    { title: 'Rejected', value: getStatusCount('Rejected'), icon: FileText, color: 'bg-red-500' },
  ];

  const recentRequests = myRequests.slice(0, 5);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">Here's an overview of your leave requests</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3 mr-4`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Leave Requests</h2>
        </div>
        <div className="p-6">
          {recentRequests.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-sm font-medium text-gray-900">No leave requests</h3>
              <p className="mt-2 text-sm text-gray-500">
                You haven't submitted any leave requests yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-medium text-gray-900">{request.leaveType}</h3>
                      <StatusBadge status={request.status} />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;