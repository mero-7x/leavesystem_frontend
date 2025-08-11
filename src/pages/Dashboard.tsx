import React, { useState, useEffect } from 'react';
import { Calendar, FileText, CheckCircle, Clock, Users, Award, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { LeaveRequest } from '../types';
import StatusBadge from '../components/UI/StatusBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
// import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [hrRequests, setHrRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requests = await apiService.getMyLeaveRequests();
        setMyRequests(requests);

        if (user?.role === 'MANAGER') {
          const pending = await apiService.getPendingRequests();
          setPendingRequests(pending);
        }

        if (user?.role === 'HR') {
          const hrApprovals = await apiService.getManagerApprovedRequests();
          setHrRequests(hrApprovals);
        }
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.role]);

  const getStatusCount = (status: string) => {
    return myRequests.filter(req => req.status === status).length;
  };

  const getRoleSpecificStats = () => {
    switch (user?.role) {
      case 'EMPLOYEE':
        return [
          { title: 'Total Requests', value: myRequests.length, icon: FileText, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50' },
          { title: 'Pending', value: getStatusCount('Pending'), icon: Clock, color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-50' },
          { title: 'Approved', value: getStatusCount('HR_Approved'), icon: CheckCircle, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50' },
          { title: 'This Month', value: myRequests.filter(req => new Date(req.createdAt).getMonth() === new Date().getMonth()).length, icon: Calendar, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50' },
        ];
      case 'MANAGER':
        return [
          { title: 'My Requests', value: myRequests.length, icon: FileText, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50' },
          { title: 'Team Pending', value: pendingRequests.length, icon: Clock, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50' },
          { title: 'Processed', value: pendingRequests.length + 8, icon: CheckCircle, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50' },
          { title: 'Team Requests', value: pendingRequests.length + 5, icon: Users, color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-50' },
        ];
      case 'HR':
        return [
          { title: 'My Requests', value: myRequests.length, icon: FileText, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50' },
          { title: 'Awaiting Final', value: hrRequests.length, icon: AlertCircle, color: 'from-red-500 to-red-600', bgColor: 'bg-red-50' },
          { title: 'Total Processed', value: hrRequests.length + 15, icon: Award, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50' },
          { title: 'System Users', value: 10, icon: Users, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50' },
        ];
      default:
        return [];
    }
  };

  const getRoleWelcomeMessage = () => {
    switch (user?.role) {
      case 'EMPLOYEE':
        return {
          title: `Welcome back, ${user?.name}!`,
          subtitle: 'Manage your leave requests and track their status',
          color: 'from-green-500 to-emerald-600'
        };
      case 'MANAGER':
        return {
          title: `Good day, ${user?.name}!`,
          subtitle: 'Review team requests and manage your own leave',
          color: 'from-blue-500 to-indigo-600'
        };
      case 'HR':
        return {
          title: `Hello, ${user?.name}!`,
          subtitle: 'Oversee all leave requests and manage system users',
          color: 'from-purple-500 to-violet-600'
        };
      default:
        return {
          title: `Welcome, ${user?.name}!`,
          subtitle: 'Your dashboard overview',
          color: 'from-gray-500 to-gray-600'
        };
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
              <span>Department: {user?.department}</span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold">
                {user?.name }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`bg-gradient-to-r ${stat.color} rounded-xl p-3 shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className={`mt-4 h-2 ${stat.bgColor} rounded-full`}>
              <div className={`h-2 bg-gradient-to-r ${stat.color} rounded-full`} style={{ width: '70%' }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Role-specific content */}
      {user?.role === 'MANAGER' && pendingRequests.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-2">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Team Requests Awaiting Approval</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {pendingRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">{request.name}</h3>
                      <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                        {request.leaveType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {/* {format(new Date(request.FromDate), 'MMM dd')} - {format(new Date(request.ToDate), 'MMM dd, yyyy')} */}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {/* {format(new Date(request.createdAt), 'MMM dd')} */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {user?.role === 'HR' && hrRequests.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-2">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Requests Awaiting Final Approval</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {hrRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">{request.name}</h3>
                      <span className="text-sm text-red-600 bg-red-100 px-2 py-1 rounded-full">
                        {request.leaveType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {/* {format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd, yyyy')} */}
                    </p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Requests */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-2">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">My Recent Leave Requests</h2>
          </div>
        </div>
        <div className="p-6">
          {recentRequests.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No leave requests yet</h3>
              <p className="mt-2 text-gray-500">
                You haven't submitted any leave requests. Start by creating your first request.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">{request.leaveType}</h3>
                      <StatusBadge status={request.status} />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {/* {format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd, yyyy')} */}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {/* {format(new Date(request.createdAt), 'MMM dd, yyyy')} */}
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