import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  FileText, 
  Users, 
  CheckCircle, 
  LogOut, 
  Home,
  Clock,
  UserCheck,
  Building2,
  Shield,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'EMPLOYEE':
        return {
          color: 'from-green-500 to-emerald-600',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          icon: Briefcase,
          title: 'Employee Portal'
        };
      case 'MANAGER':
        return {
          color: 'from-blue-500 to-indigo-600',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          icon: UserCheck,
          title: 'Manager Dashboard'
        };
      case 'HR':
        return {
          color: 'from-purple-500 to-violet-600',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700',
          icon: Shield,
          title: 'HR Management'
        };
      default:
        return {
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          icon: Building2,
          title: 'Portal'
        };
    }
  };

  const getNavItems = (role: string) => {
    const baseItems = [
      { to: '/dashboard', icon: Home, label: 'Dashboard' }
    ];

    switch (role) {
      case 'EMPLOYEE':
        return [
          ...baseItems,
          { to: '/my-requests', icon: FileText, label: 'My Leave Requests' },
          { to: '/new-request', icon: Calendar, label: 'Request Leave' }
        ];
      case 'MANAGER':
        return [
          ...baseItems,
          { to: '/new-request', icon: Calendar, label: 'New Request' },
          { to: '/pending-approvals', icon: Clock, label: 'Team Approvals' },
          { to: '/history', icon: FileText, label: 'Approval History' }
        ];
      case 'HR':
        return [
          ...baseItems,
          { to: '/new-request', icon: Calendar, label: 'New Request' },
          { to: '/hr-approvals', icon: CheckCircle, label: 'Final Approvals' },
          { to: '/history', icon: FileText, label: 'Approval History' },
          { to: '/users', icon: Users, label: 'User Management' }
        ];
      default:
        return baseItems;
    }
  };

  if (!user) return null;

  const roleConfig = getRoleConfig(user.role);
  const navItems = getNavItems(user.role);
  const RoleIcon = roleConfig.icon;

  return (
    <div className="bg-white shadow-xl h-screen w-72 fixed left-0 top-0 z-10 border-r border-gray-100">
      {/* Header */}
      <div className={`bg-gradient-to-r ${roleConfig.color} p-6 text-white`}>
        <div className="flex items-center space-x-3 mb-4">
          <RoleIcon className="w-8 h-8" />
          <h1 className="text-xl font-bold">{roleConfig.title}</h1>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold">
                {user.username}
              </span>
            </div>
            <div>
              <p className="font-semibold text-sm">{user.username} </p>
              <p className="text-xs opacity-90">{user.department}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? `${roleConfig.bgColor} ${roleConfig.textColor} shadow-sm font-medium` 
                    : 'hover:shadow-sm'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Role-specific info */}
      <div className="absolute bottom-20 left-4 right-4">
        <div className={`${roleConfig.bgColor} rounded-xl p-4 border border-gray-100`}>
          <div className="flex items-center space-x-2 mb-2">
            <RoleIcon className={`w-4 h-4 ${roleConfig.textColor}`} />
            <span className={`text-sm font-semibold ${roleConfig.textColor}`}>
              {user.role} Access
            </span>
          </div>
          <p className="text-xs text-gray-600">
            {user.role === 'EMPLOYEE' && 'Submit and track your leave requests'}
            {user.role === 'MANAGER' && 'Approve team leave requests'}
            {user.role === 'HR' && 'Manage users and final approvals'}
          </p>
        </div>
      </div>

      {/* Logout */}
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;